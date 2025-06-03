import { Injectable } from '@nestjs/common';
import { RegistrationDto } from '../dto/registration.dto';
import { Registration } from '../models/registration.model';
import { InfoDto } from '../dto/info.dto';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { MailerService } from '../mailer/mailer.service';
import { Question } from 'src/models/question.model';
import { TokensService } from '../tokens/tokens.service';
import { Project } from 'src/models/project.model';
import { QuestionRegistration } from 'src/models/question_registration.model';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';


@Injectable()
export class RegistrationService {
  constructor(
    private mailerService: MailerService,
    private tokenService: TokensService,
    private readonly sequelize: Sequelize,
    @InjectModel(Event)
    private eventModel: typeof Event,
    @InjectModel(Project)
    private projectModel: typeof Project,
    @InjectModel(Registration)
    private registrationModel: typeof Registration,
    @InjectModel(User)
    private userModel: typeof User,
    @InjectModel(Question)
    private questionModel: typeof Question,
    @InjectModel(QuestionRegistration)
    private questionRegistrationModel: typeof QuestionRegistration,
  ) { }

  async create(info: InfoDto, createRegistrationDto: RegistrationDto): Promise<void> {
    const emailUserFound = await this.userModel.count({
      where: {
        email: createRegistrationDto.user.email,
        eventId: info.currentEvent,
      },
    });
    if (emailUserFound > 0) {
      this.mailerService.emailExistsMail(createRegistrationDto.user);
      return;
    }

    const emailRegistrationFound = await this.registrationModel.count({
      where: {
        email: createRegistrationDto.user.email,
        eventId: info.currentEvent,
      },
    });
    if (emailRegistrationFound > 0) {
      this.mailerService.emailExistsMail(createRegistrationDto.user);
      return;
    }

    // intermidiate formation for registration, used for validation & model creation
    const registration = {
      eventId: info.currentEvent,
      //project info
      project_name: createRegistrationDto.project.own_project.project_name,
      project_descr: createRegistrationDto.project.own_project.project_descr,
      project_type: createRegistrationDto.project.own_project.project_type,
      project_lang: createRegistrationDto.project.own_project.project_lang,
      // other project
      project_code: createRegistrationDto.project.other_project.project_code || null,
      // user info
      language: createRegistrationDto.user.language,
      email: createRegistrationDto.user.email,
      firstname: createRegistrationDto.user.firstname,
      lastname: createRegistrationDto.user.lastname,
      sex: createRegistrationDto.user.sex,
      gsm: createRegistrationDto.user.gsm,
      gsm_guardian: createRegistrationDto.user.gsm_guardian,
      email_guardian: createRegistrationDto.user.email_guardian,
      via: createRegistrationDto.user.via,
      medical: createRegistrationDto.user.medical,
      tshirt: createRegistrationDto.user.t_size,
      birthmonth: new Date(
        createRegistrationDto.user.year,
        createRegistrationDto.user.month,
        1
      ),
      //address
      postalcode: createRegistrationDto.user.address.postalcode,
      municipality_name: createRegistrationDto.user.address.municipality_name,
      street: createRegistrationDto.user.address.street,
      house_number: createRegistrationDto.user.address.house_number,
      box_number: createRegistrationDto.user.address.box_number,
      // map to questions
      questions: [
        ...createRegistrationDto.user.general_questions.map((questionId) => {
          return { questionId: questionId, eventId: info.currentEvent };
        }),
        ...createRegistrationDto.user.mandatory_approvals.map((questionId) => {
          return { questionId: questionId, eventId: info.currentEvent };
        }),
      ],
      waiting_list: false,
      internalinfo: null,
    };

    const event = await this.eventModel.findByPk(info.currentEvent, {
      attributes: ['id', 'minAge', 'maxAge', 'maxRegistration', 'officialStartDate', 'minGuardianAge'],
    });
    if (!event) {
      throw new Error('Event not found');
    }

    await this.validate(event, registration);

    // we want to make sure that the count, insert & waiting list logic is atomic
    const transaction = await this.sequelize.transaction();

    // lock registrations for the current event
    await this.eventModel.findAll({
      where: {
        eventId: info.currentEvent,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // count the projects in the event
    const projectCount = await this.projectModel.count({
      where: { eventId: event.id }, transaction,
    });

    // count the projects in the registration
    const registrationProjectCount = await this.registrationModel.count({
      where: { eventId: event.id, project_code: null }, transaction,
    });

    // check waiting list if project code is not filled, participant can always register
    if (!registration.project_code && (projectCount + registrationProjectCount >= event.maxRegistration)) {
      registration.waiting_list = true;
    }

    const r = await this.registrationModel.create(registration, { transaction });

    // map the questions to the registration (verify if questions exist for the event)
    const questions = await this.questionModel.findAll({
      where: { id: registration.questions.map(q => q.questionId), eventId: info.currentEvent },
    });
    await this.questionRegistrationModel.bulkCreate(questions.map((q) => {
      return {
        questionId: q.id,
        registrationId: r.id,
        eventId: q.eventId,
      };
    }), { transaction });

    try {
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error('Transaction commit failed: ' + error);
    }

    // send mails
    if (registration.waiting_list) {
      await this.mailerService.waitingListMail(r);
    } else {
      const token = this.tokenService.generateRegistrationToken(r.id);
      await this.mailerService.registrationMail(
        r,
        token,
      );
    }

    return;
  }

  private async validate(event: Event, registration: any) {
    console.log(registration)

    // check if all mandatory questions are answered
    const mandatoryQuestions = await this.questionModel.findAll({
      attributes: ['id'],
      where: {
        EventId: event.id,
        mandatory: true,
      },
    });

    const answeredQuestionIds = registration.questions.map(q => q.questionId);
    const missingMandatory = mandatoryQuestions.filter(
      (q) => !answeredQuestionIds.includes(q.id)
    );

    if (missingMandatory.length > 0) {
      throw new Error('Not all mandatory questions have been answered.');
    }

    // check date of birth
    const minBirthDate = new Date(event.officialStartDate);
    const maxBirthDate = new Date(event.officialStartDate);

    minBirthDate.setFullYear(minBirthDate.getFullYear() - event.minAge);
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - event.maxAge - 1);

    if (registration.birthmonth > minBirthDate || registration.birthmonth < maxBirthDate) {
      throw new Error(
        `User does not meet the age requirements for this event. Minimum age: ${event.minAge}, Maximum age: ${event.maxAge}`
      );
    }

    // check guardian age
    const guardianRequiredDate = event.officialStartDate;
    guardianRequiredDate.setFullYear(guardianRequiredDate.getFullYear() - event.minGuardianAge);
    const guardianRequired = (guardianRequiredDate < registration.birthmonth);

    //guardian is required
    if (guardianRequired && (!registration.email_guardian || !registration.gsm_guardian)) {
      throw new Error(
        'Guardian email and phone number are required for participants under ' +
        event.minGuardianAge +
        ' years old.'
      );
    }

    //guardian is not allowed
    if (!guardianRequired && (registration.email_guardian || registration.gsm_guardian)) {
      throw new Error(
        'Guardian cannot be filled when participant is over ' +
        event.minGuardianAge +
        ' years old.'
      );
    }

    // check if project code is filled and project details are empty
    if (registration.project_code && (registration.project_name || registration.project_descr || registration.project_type || registration.project_lang)) {
      throw new Error(
        'Project cannot be filled when project code is provided.'
      );
    }

    // check if project code is empty and project details are filled
    if (!registration.project_code && (!registration.project_name || !registration.project_descr || !registration.project_type || !registration.project_lang)) {
      throw new Error(
        'Project name, description, type and language are required when no project code is provided.'
      );
    }
  }
}
