
import {
  sequelize,
} from '../../database.js'
import { Op } from 'sequelize'
import type {
  Attachment as AttachmentModel,
  Event as EventModel,
  Project as ProjectModel,
  Question as QuestionModel,
  QuestionTranslation as QuestionTranslationModel,
  QuestionUser as QuestionUserModel,
  Registration as RegistrationModel,
  Tshirt as TshirtModel,
  TshirtTranslation as TshirtTranslationModel,
  User as UserModel,
  UserProject as UserProjectModel,
} from '@coolestprojects/database'

const Attachment = sequelize.models.Attachment as typeof AttachmentModel
const Event = sequelize.models.Event as typeof EventModel
const Project = sequelize.models.Project as typeof ProjectModel
const Question = sequelize.models.Question as typeof QuestionModel
const QuestionTranslation = sequelize.models.QuestionTranslation as typeof QuestionTranslationModel
const QuestionUser = sequelize.models.QuestionUser as typeof QuestionUserModel
const Registration = sequelize.models.Registration as typeof RegistrationModel
const Tshirt = sequelize.models.Tshirt as typeof TshirtModel
const TshirtTranslation = sequelize.models.TshirtTranslation as typeof TshirtTranslationModel
const User = sequelize.models.User as typeof UserModel
const UserProject = sequelize.models.UserProject as typeof UserProjectModel

interface DashboardTableItem {
  id: string | number
  total: number
  short: string
  description: string
}

export interface DashboardResponse {
  event_title: string
  officialStartDate?: Date
  days_remaining: number
  pending_users: number
  overdue_registration: number
  waiting_list: number
  total_unusedVouchers: number
  total_projects: number
  maxRegistration: number
  total_usedVouchers: number
  total_users: number
  total_videos: number
  tlang_nl: number
  tlang_fr: number
  tlang_en: number
  total_females: number
  total_males: number
  total_X: number
  questions: DashboardTableItem[]
  tshirts: DashboardTableItem[]
}

async function getTshirts(eventId: number, language: string = 'nl'): Promise<DashboardTableItem[]> {
  // Tshirts
  let tshirtsData: DashboardTableItem[] = []
  try {
    const tshirtCounts = await User.findAll({
      attributes: [
        'tshirt.id',
        [sequelize.fn('COUNT', sequelize.col('User.id')), 'total'],
        'tshirt.name',
        'tshirt.translations.description'
      ],
      where: {
        eventId
      },
      group: ['User.tshirtId', 'tshirt.id', 'tshirt.name', 'tshirt.translations.id', 'tshirt.translations.description'], // Groeperen op ID's voor accurate tellingen
      include: [{
        model: Tshirt,
        as: 'tshirt',
        attributes: ['name'],
        include: [{
          model: TshirtTranslation,
          as: 'translations',
          attributes: ['description'],
          where: { language: language }
        }],
      }],
    }) as (UserModel & { total: number | string })[]

    tshirtsData = tshirtCounts.map((item) => ({
      id: item.tshirt.name,
      total: Number(item.total) || 0,
      short: item.tshirt.name,
      description: item.tshirt.translations?.[0]?.description || '',
    }))
  } catch (err: any) {
    console.error('Sequelize Fout bij het ophalen van question statistieken:', err.message)
  }
  return tshirtsData;
}

async function getQuestions(eventId: number, language: string = 'nl'): Promise<DashboardTableItem[]> {
  // Questions
  let questionsData: DashboardTableItem[] = []
  try {
    const questionCounts = await QuestionUser.findAll({
      attributes: [
        'questionId',
        [sequelize.fn('COUNT', sequelize.col('QuestionUser.questionId')), 'total']
      ],
      where: {
        eventId
      },
      group: [
        'QuestionUser.questionId',
        'question.id',
        'question.name',
        'question.translations.id',
        'question.translations.description'
      ],
      include: [{
        model: Question,
        as: 'question',
        attributes: ['id', 'name'],
        include: [{
          model: QuestionTranslation,
          as: 'translations',
          attributes: ['id', 'description'],
          where: { language: language }
        }],
      }]
    }) as (QuestionUserModel & { total: number | string; question: QuestionModel })[]

    questionsData = questionCounts.map((item) => {
      const translation = item.question?.translations?.[0]

      return {
        id: item.questionId,
        total: Number(item.total) || 0,
        short: item.question?.name || '',
        description: translation?.description || '',
      }
    })
  } catch (err: any) {
    console.error('Sequelize Fout bij het ophalen van question statistieken:', err.message)
  }

  return questionsData;
}

export const Handler = async (_request: any, _response: any, context: any): Promise<DashboardResponse> => {
  console.log(context)

  // 1. Geselecteerd eventId ophalen
  const eventId = context.currentAdmin?.eventId

  if (!eventId) {
    throw Error("Event is missing in user")
  }

  const currentEvent = await Event.findByPk(eventId)

  // 3. Dagen berekenen
  let daysRemaining = 0
  if (currentEvent?.officialStartDate) {
    const diffTime = new Date(currentEvent.officialStartDate).getTime() - new Date().getTime()
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  const [pendingUsers, overdueRegistration, waitingList, totalUnusedVouchers, totalProjects, totalUsedVouchers, totalUsers, totalVideos, tlangNl, tlangFr, tlangEn, totalFemales, totalMales, totalX] = await Promise.all([
    Registration.count({ where: { eventId } }),
    User.count({ where: { eventId, status: 'overdue' } }),
    Registration.count({ where: { eventId, waiting_list: true } }),
    UserProject.count({ where: { eventId, userId: null } }),
    Project.count({ where: { eventId } }),
    UserProject.count({ where: { eventId, deletedAt: { [Op.ne]: null }, voucherGuid: { [Op.ne]: null }, userId: { [Op.ne]: null } } }),
    User.count({ where: { eventId } }),
    Attachment.count({ where: { eventId, confirmed: true } }),
    User.count({ where: { eventId, language: 'nl' } }),
    User.count({ where: { eventId, language: 'fr' } }),
    User.count({ where: { eventId, language: 'en' } }),
    User.count({ where: { eventId, sex: 'f' } }),
    User.count({ where: { eventId, sex: 'm' } }),
    User.count({ where: { eventId, sex: 'X' } }),
  ])

  const questionsData = await getQuestions(eventId);
  const tshirtsData = await getTshirts(eventId);

  return {
    event_title: currentEvent?.eventTitle || 'Coolest Projects',
    officialStartDate: currentEvent?.officialStartDate,
    days_remaining: daysRemaining,

    pending_users: pendingUsers,
    overdue_registration: overdueRegistration,
    waiting_list: waitingList,
    total_unusedVouchers: totalUnusedVouchers,

    total_projects: totalProjects,
    maxRegistration: currentEvent?.maxRegistration || 64,
    total_usedVouchers: totalUsedVouchers,
    total_users: totalUsers,
    total_videos: totalVideos,

    tlang_nl: tlangNl,
    tlang_fr: tlangFr,
    tlang_en: tlangEn,

    total_females: totalFemales,
    total_males: totalMales,
    total_X: totalX,

    questions: questionsData,
    tshirts: tshirtsData
  }
}