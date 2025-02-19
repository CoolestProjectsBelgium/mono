import { Injectable } from '@nestjs/common';
import { TshirtGroupDto } from './dto/tshirt-group.dto';
import { QuestionDto } from './dto/question.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TshirtGroup } from './models/tshirt_group.model';
import { Question } from './models/question.model';
import { Event } from './models/event.model';
import { QuestionTranslation } from './models/question_translation.model';
import { Tshirt } from './models/tshirt.model';
import { TshirtTranslation } from './models/tshirt_translation.model';
import { TshirtGroupTranslation } from './models/tshirt_group_translation.model';
import { InfoDto } from './dto/info.dto';
import { Op } from 'sequelize';
import { ApprovalDto } from './dto/approval.dto';
import { SettingDto } from './dto/setting.dto';
import { Registration } from './models/registration.model';
import { User } from './models/user.model';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(TshirtGroup)
    private tshirtGroupModel: typeof TshirtGroup,
    @InjectModel(Question)
    private questionModel: typeof Question,
    @InjectModel(Event)
    private eventModel: typeof Event,
    @InjectModel(Registration)
    private registrationModel: typeof Registration,
    @InjectModel(User)
    private userModel: typeof User,
  ) {}
  async findAllQuestions(info: InfoDto): Promise<QuestionDto[]> {
    const questions = await this.questionModel.findAll({
      include: [
        {
          model: QuestionTranslation,
          where: { language: info.language },
          attributes: ['description', 'positive', 'negative'],
        },
      ],
      attributes: ['id', 'name'],
      where: { eventId: info.currentEvent, mandatory: { [Op.not]: true } },
    });
    return questions.map((question) => {
      return {
        id: question.id,
        name: question.name,
        description: question.translations[0].description,
        positive: question.translations[0].positive,
        negative: question.translations[0].negative,
      };
    });
  }

  async findAllApprovals(info: InfoDto): Promise<ApprovalDto[]> {
    const approvals = await this.questionModel.findAll({
      include: [
        {
          model: QuestionTranslation,
          where: { language: info.language },
          attributes: ['description'],
        },
      ],
      attributes: ['id', 'name'],
      where: { eventId: info.currentEvent, mandatory: true },
    });
    return approvals.map((question) => {
      return {
        id: question.id,
        name: question.name,
        description: question.translations[0].description,
      };
    });
  }

  async findAllTshirts(info: InfoDto): Promise<TshirtGroupDto[]> {
    const groups = await this.tshirtGroupModel.findAll({
      include: [
        {
          model: Tshirt,
          include: [
            {
              model: TshirtTranslation,
              where: { language: info.language },
              attributes: ['description'],
            },
          ],
          attributes: ['id'],
        },
        {
          model: TshirtGroupTranslation,
          where: { language: info.language },
          attributes: ['description'],
        },
      ],
      attributes: [],
      where: { eventId: info.currentEvent },
    });
    return groups.map((group) => {
      return {
        group: group.translations[0].description,
        items: group.tshirts.map((tshirt) => {
          return {
            id: tshirt.id,
            name: tshirt.translations[0].description,
          };
        }),
      };
    });
  }

  async getSettings(info: InfoDto): Promise<SettingDto> {
    const event = await this.eventModel.findOne({
      where: { id: info.currentEvent },
    });

    const registration_count = await this.registrationModel.count({
      where: { eventId: info.currentEvent },
    });

    const user_count = await this.userModel.count({
      where: { eventId: info.currentEvent },
    });

    return {
      maxAge: event.maxAge,
      minAge: event.minAge,

      guardianAge: event.minGuardianAge,
      enviroment: process.env.NODE_ENV,
      waitingListActive:
        registration_count + user_count >= event.maxRegistration,
      maxUploadSize: event.maxFileSize || 1024 * 1024 * 1024 * 5, // 5 gigs in bytes

      startDateEvent: event.eventBeginDate,
      tshirtDate: event.registrationClosedDate,

      isActive: event.current,

      eventBeginDate: event.eventBeginDate,
      registrationOpenDate: event.registrationOpenDate,
      registrationClosedDate: event.registrationClosedDate,
      projectClosedDate: event.projectClosedDate,
      officialStartDate: event.officialStartDate,
      eventEndDate: event.eventEndDate,
      eventTitle: event.event_title,

      isRegistrationOpen: event.registrationOpen,

      isProjectClosed: event.projectClosed,

      maxRegistration: event.maxRegistration,
      maxParticipants: event.maxVoucher,
    };
  }
}
