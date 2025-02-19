import { Injectable } from '@nestjs/common';
import { RegistrationDto } from '../dto/registration.dto';
import { Registration } from '../models/registration.model';
import { InfoDto } from '../dto/info.dto';
import { User } from '../models/user.model';
import { Event } from '../models/event.model';
import { MailerService } from '../mailer/mailer.service';
import { TokensService } from '../tokens/tokens.service';

@Injectable()
export class RegistrationService {
  constructor(
    private mailerService: MailerService,
    private tokenService: TokensService,
  ) {}

  async create(info: InfoDto, createRegistrationDto: RegistrationDto) {
    const emailUserFound = await User.count({
      where: {
        email: createRegistrationDto.user.email,
        eventId: info.currentEvent,
      },
    });
    if (emailUserFound > 0) {
      this.mailerService.emailExistsMail(createRegistrationDto.user);
      return;
    }

    const emailRegistrationFound = await Registration.count({
      where: {
        email: createRegistrationDto.user.email,
        eventId: info.currentEvent,
      },
    });
    if (emailRegistrationFound > 0) {
      this.mailerService.emailExistsMail(createRegistrationDto.user);
      return;
    }

    const registration = new Registration({
      //project info
      project_name: createRegistrationDto.project.own_project.project_name,
      project_descr: createRegistrationDto.project.own_project.project_descr,
      project_type: createRegistrationDto.project.own_project.project_type,
      project_lang: createRegistrationDto.project.own_project.project_lang,
      // other project
      project_code: createRegistrationDto.project.other_project.project_code,
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
      //address
      postalcode: createRegistrationDto.user.address.postalcode,
      municipality_name: createRegistrationDto.user.address.municipality_name,
      street: createRegistrationDto.user.address.street,
      house_number: createRegistrationDto.user.address.house_number,
      box_number: createRegistrationDto.user.address.box_number,
      // map to questions
      questions: [
        ...createRegistrationDto.user.general_questions.map((QuestionId) => {
          return { QuestionId: QuestionId + '', EventId: info.currentEvent };
        }),
        ...createRegistrationDto.user.mandatory_approvals.map((QuestionId) => {
          return { QuestionId: QuestionId + '', EventId: info.currentEvent };
        }),
      ],
    });

    //TODO validate record

    const userCount = await User.count({
      where: { eventId: info.currentEvent },
    });

    const registrationCount = await Registration.count({
      where: { eventId: info.currentEvent },
    });

    const event = await Event.findByPk(info.currentEvent, {
      attributes: ['maxRegistration'],
    });

    if (userCount + registrationCount >= event.maxRegistration) {
      registration.waiting_list = true;
    }
    const r = await registration.save();

    // send mails
    if (registration.waiting_list) {
      await this.mailerService.waitingListMail(createRegistrationDto.user);
    } else {
      const token = await this.tokenService.generateRegistrationToken(r.id);
      await this.mailerService.registrationMail(
        createRegistrationDto.user,
        token,
      );
    }

    return null;
  }
}
