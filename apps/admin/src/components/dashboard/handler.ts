
import {
  sequelize,
} from '../../database.js'

export const Handler = async (request: any, response: any, context: any) => {
  console.log(context)

  // 1. Geselecteerd eventId ophalen
  const eventId = context.currentAdmin?.eventId
  console.log('--- DASHBOARD DEBUG --- Geselecteerd Event ID:', eventId)

  if (!eventId) {
    return {
      event_title: 'Geen evenement geselecteerd',
      questions: [],
      tshirts: []
    }
  }

  // 2. Event ophalen (met extra foutcontrole)
  let currentEvent: any = null
  try {
    currentEvent = await sequelize.models.Event.findByPk(eventId)
  } catch (err) {
    console.error('Sequelize Fout bij Event model:', err.message)
  }

  // 3. Dagen berekenen
  let daysRemaining = 0
  if (currentEvent?.officialStartDate) {
    const diffTime = new Date(currentEvent.officialStartDate).getTime() - new Date().getTime()
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  // Helper functie om veilig te tellen zonder dat de hele boel crasht
  const safeCount = async (modelName: string, whereClause: any) => {
    try {
      if (!sequelize.models[modelName]) {
        console.warn(`Model "${modelName}" bestaat niet in sequelize.models!`)
        return 0
      }
      return await sequelize.models[modelName].count({ where: whereClause })
    } catch (err) {
      console.error(`Sequelize Fout bij ${modelName}.count met criteria:`, whereClause, '-> Fout:', err.message)
      return 0
    }
  }

  // 4. Voer de tellingen veilig uit (Als een kolom niet bestaat, geeft hij nu 0 i.p.v. een crash)
  const pendingUsers = await safeCount('Registration', { eventId })
  const overdueRegistration = await safeCount('User', { eventId, status: 'overdue' })
  const waitingList = await safeCount('Registration', { eventId, waiting_list: true })
  const totalUnusedVouchers = await safeCount('UserProject', { eventId, userId: null })

  const totalProjects = await safeCount('Project', { eventId })
  const totalUsedVouchers = await safeCount('UserProject', { eventId, deletedAt: { [Op.ne]: null }, voucherGuid: { [Op.ne]: null }, userId: { [Op.ne]: null } })
  const totalUsers = await safeCount('User', { eventId })
  const totalVideos = await safeCount('Attachment', { eventId, confirmed: true })

  const tlangNl = await safeCount('User', { eventId, language: 'nl' })
  const tlangFr = await safeCount('User', { eventId, language: 'fr' })
  const tlangEn = await safeCount('User', { eventId, language: 'en' })

  const totalFemales = await safeCount('User', { eventId, sex: 'f' })
  const totalMales = await safeCount('User', { eventId, sex: 'm' })
  const totalX = await safeCount('User', { eventId, sex: 'X' })

  // Get questions data from QuestionUser model
  let questionsData: Array<{
    id: string | number
    total: number
    short: string
    description: string
  }> = []

  try {
    if (sequelize.models.QuestionUser && sequelize.models.QuestionTranslation && sequelize.models.Question) {

      const { QuestionUser, Question, QuestionTranslation } = sequelize.models;

      // Runtime fallback mocht de @BelongsTo decorator nog niet in het model staan
      if (!QuestionUser.associations.question) {
        QuestionUser.belongsTo(Question, { as: 'question', foreignKey: 'questionId' });
      }
      if (!Question.associations.translations) {
        Question.hasMany(QuestionTranslation, { as: 'translations', foreignKey: 'questionId' });
      }

      const questionCounts = await QuestionUser.findAll({
        attributes: [
          'questionId',
          // Let op de exacte hoofdletters: 'QuestionUser.questionId'
          [sequelize.fn('COUNT', sequelize.col('QuestionUser.questionId')), 'total']
        ],
        where: {
          eventId // Komt uit je BaseEventModel
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
            where: { language: 'nl' }
          }],
        }],
        raw: true,
        nest: true
      })

      // Transformeer de data naar de interface (TableItem) die je React dashboard verwacht
      questionsData = questionCounts.map((item: any) => {
        // Sequelize TypeScript stopt geneste hasMany resultaten soms in een array
        const translation = Array.isArray(item.question?.translations)
          ? item.question.translations[0]
          : item.question?.translations;

        return {
          // Bij raw+nest in sequelize-typescript zit het attribuut direct op de root
          id: item.questionId || item.QuestionUser?.questionId,
          total: parseInt(item.total, 10) || 0,
          short: item.question?.name || '',
          description: translation?.description || '',
        }
      })

    } else {
      console.warn('User of question model ontbreekt in sequelize.models!')
    }
  } catch (err: any) {
    console.error('Sequelize Fout bij het ophalen van question statistieken:', err.message)
  }

  // Get tshirt data from Users model
  let tshirtsData: Array<{
    id: string | number
    total: number
    short: string
    description: string
  }> = []
  try {
    if (sequelize.models.User && sequelize.models.Tshirt) {
      const tshirtCounts = await sequelize.models.User.findAll({
        attributes: [
          'tshirt.id',
          // Tel het aantal users per tshirtId
          [sequelize.fn('COUNT', sequelize.col('User.id')), 'total'],
          'tshirt.name', // Voeg de beschrijving van de T-shirt toe
          'tshirt.translations.description'
        ],
        where: {
          eventId
        },
        group: ['User.tshirtId', 'tshirt.id', 'tshirt.name', 'tshirt.translations.id', 'tshirt.translations.description'], // Groeperen op ID's voor accurate tellingen
        include: [{
          model: sequelize.models.Tshirt,
          as: 'tshirt', // Pas dit aan naar jouw Sequelize relatie-alias als deze anders is gedefinieerd
          attributes: ['name'],
          include: [{
            model: sequelize.models.TshirtTranslation,
            as: 'translations',
            attributes: ['description'],
            where: { language: 'en' } // Alleen Engelse beschrijving ophalen
          }],
        }],
        raw: true,
        nest: true
      })

      // Transformeer de data naar de interface (TableItem) die je React dashboard verwacht
      tshirtsData = tshirtCounts.map((item: any) => ({
        id: item.tshirt.name,
        total: parseInt(item.total, 10) || 0,
        short: item.tshirt.name,
        description: item.tshirt.translations?.description,
      }))
    } else {
      console.warn('User of question model ontbreekt in sequelize.models!')
    }
  } catch (err: any) {
    console.error('Sequelize Fout bij het ophalen van question statistieken:', err.message)
  }

  return {
    event_title: currentEvent?.eventTitle || 'Coolest Project 2027',
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