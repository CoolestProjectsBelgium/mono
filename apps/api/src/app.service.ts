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
          as: 'translations',
          where: { language: info.language },
          attributes: ['description', 'positive', 'negative'],
        },
      ],
      attributes: ['id', 'name'],
      where: { eventId: info.currentEvent, mandatory: { [Op.not]: true } },
    });
    return questions.map((question) => {
      const q = question.get({ plain: true }) as {
        id: number;
        name: string;
        translations: { description: string; positive: string; negative: string }[];
      };
      const translation = q.translations[0];
      return {
        id: q.id,
        name: q.name,
        description: translation.description,
        positive: translation.positive,
        negative: translation.negative,
      };
    });
  }

  async findAllApprovals(info: InfoDto): Promise<ApprovalDto[]> {
    const approvals = await this.questionModel.findAll({
      include: [
        {
          model: QuestionTranslation,
          as: 'translations',
          where: { language: info.language },
          attributes: ['description'],
        },
      ],
      attributes: ['id', 'name'],
      where: { eventId: info.currentEvent, mandatory: true },
    });
    return approvals.map((question) => {
      const q = question.get({ plain: true }) as {
        id: number;
        name: string;
        translations: { description: string }[];
      };
      const translation = q.translations[0];
      return {
        id: q.id,
        name: q.name,
        description: translation.description,
      };
    });
  }

  async findAllTshirts(info: InfoDto): Promise<TshirtGroupDto[]> {
    const groups = await this.tshirtGroupModel.findAll({
      include: [
        {
          model: Tshirt,
          as: 'tshirts',
          include: [
            {
              model: TshirtTranslation,
              as: 'translations',
              where: { language: info.language },
              attributes: ['description'],
            },
          ],
          attributes: ['id'],
        },
        {
          model: TshirtGroupTranslation,
          as: 'translations',
          where: { language: info.language },
          attributes: ['description'],
        },
      ],
      attributes: ['id', 'name'],
      where: { eventId: info.currentEvent },
    });
    return groups.map((group) => {
      const g = group.get({ plain: true }) as {
        translations: { description: string }[];
        tshirts: { id: number; translations: { description: string }[] }[];
      };
      return {
        group: g.translations[0].description,
        items: g.tshirts.map((tshirt) => {
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

    if (projectCount + registrationProjectCount >= event.maxRegistration) {
      waitingListActive = true;
    }

    return {
      maxAge: event.maxAge,
      minAge: event.minAge,

      guardianAge: event.minGuardianAge,
      enviroment: process.env.NODE_ENV || 'production',
      waitingListActive,
      maxUploadSize: event.maxFileSize || 1024 * 1024 * 1024 * 5, // 5 gigs in bytes

      startDateEvent: event.eventBeginDate,
      tshirtDate: event.registrationClosedDate,

      eventBeginDate: event.eventBeginDate,
      registrationOpenDate: event.registrationOpenDate,
      registrationClosedDate: event.registrationClosedDate,
      projectClosedDate: event.projectClosedDate,
      officialStartDate: event.officialStartDate,
      eventEndDate: event.eventEndDate,
      eventTitle: event.event_title,

      maxRegistration: event.maxRegistration,
      maxParticipants: event.maxVoucher,

      // info object
      isRegistrationOpen: info.registrationOpen,
      isProjectClosed: info.projectClosed,
      isActive: info.current,
    };
  }
}
