import { Injectable } from '@nestjs/common';
import { RegistrationDto } from '../dto/registration.dto';
import { Registration } from '@coolestprojects/database';
import { InfoDto } from '../dto/info.dto';
import { User } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { MailerService } from '../mailer/mailer.service';
import { Question } from '@coolestprojects/database';
import { TokensService } from '../tokens/tokens.service';
import { Project } from '@coolestprojects/database';
import { QuestionRegistration } from '@coolestprojects/database';
import { Sequelize } from 'sequelize-typescript';
import { InjectModel } from '@nestjs/sequelize';
import { Voucher } from '@coolestprojects/database';
import { QuestionUser } from '@coolestprojects/database';

@Injectable()
export class RegistrationService {
  constructor(
    private mailerService: MailerService,
    private tokenService: TokensService,
    private readonly sequelize: Sequelize,
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
    @InjectModel(Registration)
    private readonly registrationModel: typeof Registration,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Voucher)
    private readonly voucherModel: typeof Voucher,
    @InjectModel(Question)
    private readonly questionModel: typeof Question,
    @InjectModel(QuestionUser)
    private readonly questionUser: typeof QuestionUser,
    @InjectModel(QuestionRegistration)
    private readonly questionRegistrationModel: typeof QuestionRegistration,
  ) { }

  async create(
    info: InfoDto,
    createRegistrationDto: RegistrationDto,
  ): Promise<Registration | undefined> {
    if (!info.registrationOpen) {
      throw new Error('Registration is not open for this event.');
    }

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
      //project info (optional)
      project_name: createRegistrationDto.project.own_project?.project_name,
      project_descr: createRegistrationDto.project.own_project?.project_descr,
      project_type: createRegistrationDto.project.own_project?.project_type,
      project_lang: createRegistrationDto.project.own_project?.project_lang,
      // other project (optional)
      project_code: createRegistrationDto.project.other_project?.project_code,
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
      tshirtId: createRegistrationDto.user.t_size,
      birthmonth: new Date(
        createRegistrationDto.user.year,
        createRegistrationDto.user.month,
        1,
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
      attributes: [
        'id',
        'minAge',
        'maxAge',
        'maxRegistration',
        'officialStartDate',
        'minGuardianAge',
      ],
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
        id: info.currentEvent,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    // count the projects in the event
    const projectCount = await this.projectModel.count({
      where: { eventId: event.id },
      transaction,
    });

    // count the projects in the registration
    const registrationProjectCount = await this.registrationModel.count({
      where: { eventId: event.id, project_code: null },
      transaction,
    });

    // check waiting list if project code is not filled, participant can always register
    if (
      !registration.project_code &&
      projectCount + registrationProjectCount >= event.maxRegistration
    ) {
      registration.waiting_list = true;
    }

    const { questions, ...registrationData } = registration;

    const r = await this.registrationModel.create(registrationData, {
      transaction,
    });

    // map the questions to the registration (verify if questions exist for the event)
    const questionRecords = await this.questionModel.findAll({
      where: {
        id: questions.map((q) => q.questionId),
        eventId: info.currentEvent,
      },
    });
    await this.questionRegistrationModel.bulkCreate(
      questionRecords.map((q) => {
        return {
          questionId: q.id,
          registrationId: r.id,
          eventId: q.eventId,
        };
      }),
      { transaction },
    );

    try {
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error('Transaction commit failed: ' + error);
    }

    const savedRegistration = await this.registrationModel.findByPk(r.id);
    if (!savedRegistration) {
      throw new Error('Registration not found after create');
    }

    // send mails
    if (registration.waiting_list) {
      await this.mailerService.waitingListMail(savedRegistration);
    } else {
      const token = this.tokenService.generateRegistrationToken(savedRegistration.id);
      await this.mailerService.registrationMail(savedRegistration, token);
    }

    return savedRegistration;
  }

  async activateRegistration(registrationID: number): Promise<User> {

    // update everything in a transaction
    const transaction = await this.sequelize.transaction();
    let user: User;
    let joinedViaVoucher = false;

    try {
      const r = await this.registrationModel.findOne({
        where: { id: registrationID },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (!r) {
        throw new Error('Registration not found');
      }

      const reg = r.get({ plain: true }) as Registration;

      const e = await this.eventModel.findByPk(reg.eventId, {
        attributes: ['id', 'maxVoucher'],
        transaction,
      });

      if (!e) {
        throw new Error('Event not found');
      }

      const q = await this.questionRegistrationModel.findAll({
        where: { registrationId: r.id },
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      user = await this.userModel.create(
        {
          eventId: reg.eventId,

          //user
          language: reg.language,
          email: reg.email,
          gsm: reg.gsm,
          firstname: reg.firstname,
          lastname: reg.lastname,
          sex: reg.sex,
          birthmonth: reg.birthmonth,
          tshirtId: reg.tshirtId,
          via: reg.via,
          medical: reg.medical,
          internalinfo: reg.internalinfo,

          //address
          postalcode: reg.postalcode,
          municipality_name: reg.municipality_name,
          street: reg.street,
          house_number: reg.house_number,
          box_number: reg.box_number,

          //guardian
          gsm_guardian: reg.gsm_guardian,
          email_guardian: reg.email_guardian,
        },
        { transaction },
      );

      if (reg.project_code) {
        joinedViaVoucher = true;
        // link user to project via voucher
        const voucher = await this.voucherModel.findOne({
          where: {
            eventId: reg.eventId,
            voucherGuid: reg.project_code,
            participantId: null,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!voucher) {
          throw new Error('Voucher not found or already used');
        }
        await voucher.update({ participantId: user.id }, { transaction });
      } else {
        // create project for user
        await this.projectModel.create(
          {
            name: reg.project_name,
            description: reg.project_descr,
            type: reg.project_type,
            language: reg.project_lang,
            eventId: reg.eventId,
            maxVoucher: e.maxVoucher,
            ownerId: user.id,
          },
          { transaction },
        );
      }

      await this.questionUser.bulkCreate(
        q.map((question) => {
          const qr = question.get({ plain: true });
          return {
            questionId: qr.questionId,
            userId: user.id,
            eventId: qr.eventId,
          };
        }),
        { transaction },
      );

      // remove registrations
      await this.registrationModel.destroy({
        where: { id: r.id },
        transaction,
      });

      await this.questionRegistrationModel.destroy({
        where: { registrationId: r.id },
        transaction,
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw new Error('Transaction commit failed: ' + error);
    }

    // send confirmation mail (outside transaction)
    if (joinedViaVoucher) {
      await this.mailerService.welcomeMailCoWorker();
      await this.mailerService.notifyProjectOwner();
    } else {
      await this.mailerService.welcomeMailOwner(user);
    }

    return user;
  }

  private async validate(event: Event, registration: any) {
    // check if all mandatory questions are answered
    const mandatoryQuestions = await this.questionModel.findAll({
      attributes: ['id'],
      where: {
        eventId: event.id,
        mandatory: true,
      },
    });

    const answeredQuestionIds = registration.questions.map(
      (q: { questionId: string | number }) => Number(q.questionId),
    );
    const missingMandatory = mandatoryQuestions.filter(
      (q) => !answeredQuestionIds.includes(q.id),
    );

    if (missingMandatory.length > 0) {
      throw new Error('Not all mandatory questions have been answered.');
    }

    // check date of birth
    const eventDate = new Date(event.officialStartDate);
    const minBirthDate = new Date(eventDate);
    const maxBirthDate = new Date(eventDate);

    minBirthDate.setFullYear(minBirthDate.getFullYear() - event.minAge);
    maxBirthDate.setFullYear(maxBirthDate.getFullYear() - event.maxAge - 1);

    if (
      registration.birthmonth > minBirthDate ||
      registration.birthmonth < maxBirthDate
    ) {
      throw new Error(
        `User does not meet the age requirements for this event. Minimum age: ${event.minAge}, Maximum age: ${event.maxAge}`,
      );
    }

    // check guardian age
    const guardianCutoff = new Date(eventDate);
    guardianCutoff.setFullYear(guardianCutoff.getFullYear() - event.minGuardianAge);
    const guardianRequired = guardianCutoff < registration.birthmonth;

    //guardian is required
    if (
      guardianRequired &&
      (!registration.email_guardian || !registration.gsm_guardian)
    ) {
      throw new Error(
        'Guardian email and phone number are required for participants under ' +
        event.minGuardianAge +
        ' years old.',
      );
    }

    //guardian is not allowed
    if (
      !guardianRequired &&
      (registration.email_guardian || registration.gsm_guardian)
    ) {
      throw new Error(
        'Guardian cannot be filled when participant is over ' +
        event.minGuardianAge +
        ' years old.',
      );
    }

    // check if project code is filled and project details are empty
    if (
      registration.project_code &&
      (registration.project_name ||
        registration.project_descr ||
        registration.project_type ||
        registration.project_lang)
    ) {
      throw new Error(
        'Project cannot be filled when project code is provided.',
      );
    }

    // check if project code is empty and project details are filled
    if (
      !registration.project_code &&
      (!registration.project_name ||
        !registration.project_descr ||
        !registration.project_type ||
        !registration.project_lang)
    ) {
      throw new Error(
        'Project name, description, type and language are required when no project code is provided.',
      );
    }
  }
}
