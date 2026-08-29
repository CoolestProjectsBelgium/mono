
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

/*
SELECT 
    COUNT(u.tshirtId) AS total, 
    u.tshirtId, 
    tt.description
FROM 
    `Users` u
JOIN 
    `TshirtTranslations` tt ON u.tshirtId = tt.tshirtId AND tt.language = 'nl'
GROUP BY 
    u.tshirtId, 
    tt.description;
*/
/* 
LOGICA:
1. We tellen (COUNT) het aantal gebruikers per unieke tshirtId uit de `Users` tabel.
2. We koppelen (`JOIN`) de `TshirtTranslations` tabel aan de `Users` tabel op basis van de overeenkomende tshirtId.
3. We filteren direct in de JOIN dat we alleen vertalingen willen die de taal 'nl' hebben.
4. De `GROUP BY` zorgt ervoor dat de telling wordt toegepast op elke unieke combinatie 
   van het shirt-ID en de bijbehorende Nederlandse beschrijving.
*/ 
// VOEG DEZE IMPORT TOE (meestal bovenaan je bestand)
import { QueryTypes } from 'sequelize'; 
async function getTshirts(eventId: number, language: string = 'nl'): Promise<DashboardTableItem[]> {
  let tshirtsData: DashboardTableItem[] = [];
  try {
    // We gebruiken een Raw Query om volledige controle te hebben over de aliassen en GROUP BY
    const results = await sequelize.query(
      `SELECT 
        COUNT(u.id) AS total, 
        u.tshirtId, 
        t.name AS tshirtName, 
        tt.description AS description
      FROM Users u
      INNER JOIN Tshirts t ON u.tshirtId = t.id
      INNER JOIN TshirtTranslations tt ON u.tshirtId = tt.tshirtId AND tt.language = :lang
      WHERE u.eventId = :eventId AND u.tshirtId IS NOT NULL
      GROUP BY u.tshirtId, t.name, tt.description`,
      {
        replacements: { eventId, lang: language }, // Veilig tegen SQL Injection
        type: QueryTypes.SELECT
      }
    );
    // Het resultaat van een raw query met type: QueryTypes.SELECT is al een array van platte objecten
    tshirtsData = results.map((row: any) => ({
      id: row.tshirtName,
      total: Number(row.total),
      short: row.tshirtName,
      description: row.description || '',
    }));
  } catch (err: any) {
    console.error('SQL Fout bij het ophalen van tshirt statistieken:', err.message);
  }
  return tshirtsData;
}


/*
SELECT 
    q.id AS question_id,
	  q.name AS name,
    COUNT(uq.questionId) AS total_answers,
    qt.description AS description
FROM 
     `Questions` q
LEFT JOIN  `QuestionTranslations` qt ON q.id = qt.questionId AND qt.language = 'nl'
LEFT JOIN `QuestionUsers` uq ON q.id = uq.questionId AND uq.eventId = 1
GROUP BY 
    q.id, qt.description;
*/

async function getQuestions(eventId: number, language: string = 'nl'): Promise<DashboardTableItem[]> {
  let questionsData: DashboardTableItem[] = [];
  try {
    // We gebruiken een RAW SQL query omdat dit exact doet wat je wilt: 
    // Een LEFT JOIN om vragen met 0 antwoorden mee te nemen.
    const sql = `
      SELECT 
          q.id AS question_id,
          q.name AS name,
          COUNT(uq.questionId) AS total_answers,
          qt.description AS description
      FROM Questions q
      LEFT JOIN QuestionTranslations qt ON q.id = qt.questionId AND qt.language = :language
      LEFT JOIN QuestionUsers uq ON q.id = uq.questionId AND uq.eventId = :eventId
      GROUP BY q.id, q.name, qt.description
      ORDER BY q.id;
    `;
    // Voer de query uit met bindings voor veiligheid tegen SQL-injectie
      const results: any[] = await sequelize.query(sql, {
        replacements: { eventId, language },
        type: (sequelize as any).QueryTypes.SELECT // <--- Dit omzeilt de import-eis
      });
    //console.log('Raw database result:', results);
    // Map de ruwe data naar jouw DashboardTableItem formaat
    questionsData = results.map((item) => ({
      id: item.question_id,
      total: Number(item.total_answers) || 0,
      short: item.name || '',
      description: item.description || '' // Als je de beschrijving ook nodig hebt, voeg deze toe aan de SELECT in SQL
    }));

  } catch (err: any) {
    console.error('Fout bij het ophalen van question statistieken:', err.message);
  }

  return questionsData;
}
/*
SELECT
    u.email AS user_email,
    q.id AS question_id,
    'has not' AS exeptions,
    q.name AS q_name,
    qt.description AS missing_desc
FROM
    `Users` u
CROSS JOIN `Questions` q LEFT JOIN `QuestionUsers` uq ON
    (
        u.id = uq.userId AND q.id = uq.questionId
    )
INNER JOIN `QuestionTranslations` qt ON
    (
        q.id = qt.questionId AND qt.language = 'nl'
    )
WHERE
    uq.userId IS NULL;

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