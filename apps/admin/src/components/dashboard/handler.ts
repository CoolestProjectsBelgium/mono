
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
        'tshirtId',
        // Tel het aantal users per tshirtId
        [sequelize.fn('COUNT', sequelize.col('User.tshirtId')), 'total'],
        'tshirt.name',
        'tshirt.translations.description'
      ],
      where: {
        eventId
      },
      // Groeperen op ID's voor accurate tellingen
      group: ['User.tshirtId', 'tshirt.name',  'tshirt.translations.id', 'tshirt.translations.description', 'User.id'],
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

    console.log('Tshirt counts:', tshirtCounts.map(item => ({
      tshirtId: item.tshirtId,
      total: item.total ||0,
      name: item.tshirt?.name,
      description: item.tshirt?.translations?.[0]?.description
    })))

    tshirtsData = tshirtCounts.map((item) => ({
      id: item.tshirt.name,
      total: Number(item.total) || 0,
      short: item.tshirt.name,
      description: item.tshirt.translations?.[0]?.description || '',
    }))
  } catch (err: any) {
    console.error('Sequelize Fout bij het ophalen van tshirt statistieken:', err.message)
  }
  return tshirtsData;
}
/*
SELECT 
    q.id AS question_id,
    q.name, 
    COUNT(uq.questionId) AS total_answers
FROM 
     `Questions` q
LEFT JOIN 
   `QuestionUsers` uq ON q.id = uq.questionId
GROUP BY 
    q.id;

*/

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
        'questionId',
        'question.name',
        'question.translations.id',
        'question.translations.description'
      //  'userId'

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

   console.log('Question counts:', questionCounts.map(item => ({
      questionId: item.questionId,
      total: item.get('total'),
      name: item.question?.name,
      description: item.question?.translations?.[0]?.description
    }))) 
    
    
    questionsData = questionCounts.map((item) => {
      const translation = item.question?.translations?.[0]
      return {
        id: item.questionId,
        total: Number(item.get('total')) || 0,
        short: item.question?.name || '',
        description: translation?.description || '',
      }
    })
  } catch (err: any) {
    console.error('Sequelize Fout bij het ophalen van question statistieken:', err.message)
  }

  return questionsData;
}
/*
const privacyComplianceAction = {
  resource: User, 
  options: {
    actions: {
      check_missing_responses: { // Naam aangepast naar "Ontbrekende Antwoorden"
        actionType: 'list',
        handler: async (request, context) => {
          const { sequelize } = context;

          // De definitieve query die alle combinaties vindt waarbij de koppeling ontbreekt.
          // Dit geeft exact weer welke vragen een gebruiker NIET heeft bevestigd als 'Ja'.
          const rawQuery = `
            SELECT 
                u.email AS user_email,
                q.id AS question_id,
                'has not' AS exeptions,
                q.name AS q_name,
                qt.description AS missing_desc
            FROM 
                \`Users\` u
            CROSS JOIN 
                \`Questions\` q
            LEFT JOIN 
                \`QuestionUsers\` uq ON (u.id = uq.userId AND q.id = uq.questionId)
            INNER JOIN 
                \`QuestionTranslations\` qt ON (q.id = qt.questionId AND qt.language = 'nl')
            WHERE 
                uq.userId IS NULL;
          `;

          try {
            const results = await sequelize.query(rawQuery, {
              type: context.sequelize.QueryTypes.SELECT
            });

            return {
              records: results.map((row) => ({
                // Unieke ID voor AdminJS lijstweergave (Email + QuestionID)
                id: `${row.user_email}-${row.question_id}`, 
                data: {
                  email: row.user_email,
                  status: row.exeptions,       // 'has not'
                  questionName: row.q_name,    // De naam van de vraag (bijv. "Foto")
                  description: row.missing_desc // De beschrijving/uitleg van die vraag
                },
              })),
            };
          } catch (error) {
            console.error("CRITICAL ERROR - Missing Responses Query:", error);
            throw new Error("Kon de lijst met ontbrekende vragen niet ophalen.");
          }
        },
        options: {
          // De kolommen die je ziet in het AdminJS dashboard
          listProperties: ['email', 'status', 'questionName', 'description'],
        },
      },
    },
  },
};

// Voeg dit toe aan je modules array
//
*/


export const Handler = async (_request: any, _response: any, context: any): Promise<DashboardResponse> => {

  const eventId = context.currentAdmin?.eventId

  if (!eventId) {
    throw Error("Event is missing in user")
  }

  const currentEvent = await Event.findByPk(eventId)

  // days remaining
  let daysRemaining = 0
  if (currentEvent?.officialStartDate) {
    const diffTime = new Date(currentEvent.officialStartDate).getTime() - new Date().getTime()
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  const [pendingUsers, waitingList, totalUnusedVouchers, totalProjects, totalUsedVouchers, totalUsers, totalVideos, tlangNl, tlangFr, tlangEn, totalFemales, totalMales, totalX, overdue_registration] = await Promise.all([
    Registration.count({ where: { eventId } }),
    Registration.count({ where: { eventId, waiting_list: true } }),
    UserProject.count({ where: { eventId, userId: null } }),
    Project.count({ where: { eventId, deletedAt: { [Op.eq]: null } } }),
    UserProject.count({ where: { eventId, deletedAt: { [Op.eq]: null }, voucherGuid: { [Op.ne]: null }, userId: { [Op.ne]: null } } }),
    User.count({ where: { eventId } }),
    Attachment.count({ where: { eventId, confirmed: true } }),
    User.count({ where: { eventId, language: 'nl' } }),
    User.count({ where: { eventId, language: 'fr' } }),
    User.count({ where: { eventId, language: 'en' } }),
    User.count({ where: { eventId, sex: 'f' } }),
    User.count({ where: { eventId, sex: 'm' } }),
    User.count({ where: { eventId, sex: 'X' } }),
    Registration.findAll({ attributes: ['createdAt'], where: { eventId } })
  ])

  const questionsData = await getQuestions(eventId);
  const tshirtsData = await getTshirts(eventId);

  return {
    event_title: currentEvent?.eventTitle || 'Coolest Projects',
    officialStartDate: currentEvent?.officialStartDate,
    days_remaining: daysRemaining,

    pending_users: pendingUsers,
    overdue_registration: overdue_registration.filter((registration) => registration.overdue).length,
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