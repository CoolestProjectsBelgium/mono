import { Injectable } from '@nestjs/common';
import { TshirtGroupDto } from './dto/tshirt-group.dto';
import { QuestionDto } from './dto/question.dto';
import { InjectModel } from '@nestjs/sequelize';
import { TshirtGroup } from '@coolestprojects/database';
import { Question } from '@coolestprojects/database';
import { Event } from '@coolestprojects/database';
import { QuestionTranslation } from '@coolestprojects/database';
import { Tshirt } from '@coolestprojects/database';
import { TshirtTranslation } from '@coolestprojects/database';
import { TshirtGroupTranslation } from '@coolestprojects/database';
import { InfoDto } from './dto/info.dto';
import { Op } from 'sequelize';
import { ApprovalDto } from './dto/approval.dto';
import { SettingDto } from './dto/setting.dto';
import { Registration } from '@coolestprojects/database';
import { User } from '@coolestprojects/database';
import { Project } from '@coolestprojects/database';

@Injectable()
export class AppService {
  constructor(
    @InjectModel(TshirtGroup)
    private readonly tshirtGroupModel: typeof TshirtGroup,
    @InjectModel(Question)
    private readonly questionModel: typeof Question,
    @InjectModel(Event)
    private readonly eventModel: typeof Event,
    @InjectModel(Registration)
    private readonly registrationModel: typeof Registration,
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Project)
    private readonly projectModel: typeof Project,
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

    if (!event) {
      throw new Error('Event not found');
    }

    const projectCount = await this.projectModel.count({
      where: { eventId: event.id },
    });

    //keep in sync with registration validation logic
    let waitingListActive = false;
    const registrationProjectCount = await this.registrationModel.count({
      where: { eventId: event.id, project_code: null },
    });

    const maxRegistration = event.getDataValue('maxRegistration') as number;
    if (projectCount + registrationProjectCount >= maxRegistration) {
      waitingListActive = true;
    }

    const maxFileSize = event.getDataValue('maxFileSize') as number | null;

    return {
      maxAge: event.getDataValue('maxAge') as number,
      minAge: event.getDataValue('minAge') as number,

      guardianAge: event.getDataValue('minGuardianAge') as number,
      enviroment: process.env.NODE_ENV,
      waitingListActive,
      maxUploadSize: maxFileSize || 1024 * 1024 * 1024 * 5, // 5 gigs in bytes

      startDateEvent: event.getDataValue('eventBeginDate') as Date,
      tshirtDate: event.getDataValue('registrationClosedDate') as Date,

      eventBeginDate: event.getDataValue('eventBeginDate') as Date,
      registrationOpenDate: event.getDataValue('registrationOpenDate') as Date,
      registrationClosedDate: event.getDataValue(
        'registrationClosedDate',
      ) as Date,
      projectClosedDate: event.getDataValue('projectClosedDate') as Date,
      officialStartDate: event.getDataValue('officialStartDate') as Date,
      eventEndDate: event.getDataValue('eventEndDate') as Date,
      eventTitle: event.getDataValue('event_title') as string,

      maxRegistration,
      maxParticipants: event.getDataValue('maxVoucher') as number,

      // info object
      isRegistrationOpen: info.registrationOpen,
      isProjectClosed: info.projectClosed,
      isActive: info.current,
    };
  }
}
