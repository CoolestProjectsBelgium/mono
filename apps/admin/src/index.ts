import AdminJSExpress from '@adminjs/express'
import AdminJS, { ComponentLoader } from 'adminjs'
import type { Request } from 'express'
import express from 'express'
import * as AdminJSSequelize from '@adminjs/sequelize'
import passwordsFeature from '@adminjs/passwords'

import {
  sequelize,
} from './database.js'
import { Account } from '@coolestprojects/database'

// roles: superadmin (can access everything), 
// admin (can access resources of the selected event), can update their own password
// judge (can access the voting dashboard and their own votes)

const componentLoader = new ComponentLoader()
componentLoader.override('Login', './components/Login');

const Components = {
  Dashboard: componentLoader.add('Dashboard', './components/Dashboard'),
  // other custom components
}

const addEventFilter = async (filterName: string = "id", request: any, context: any) => {
  const eventId = context.currentAdmin?.eventId
  if (!eventId) return request

  return {
    ...request,
    query: {
      ...request.query,
      filters: {
        ...request.query?.filters,
        filterName: eventId,
      },
    },
    payload: request.payload
      ? { ...request.payload, eventId }
      : request.payload,
  }
}

const canCreate = ({ currentAdmin, resource }: any) => {
  if (currentAdmin.role === 'superadmin') return true
  if (currentAdmin?.role !== 'admin' || !currentAdmin?.eventId) return false
  if (resource?.id === 'Account') return false
  return true
}

const canAccessResourceFieldFilter =
  (fieldName: string) =>
    ({ currentAdmin, record }: any) => {
      const adminValue = currentAdmin?.eventId
      return record?.params?.[fieldName] === adminValue
    }

type AccessHandler = (args: any) => boolean

export const andAccess =
  (...filters: AccessHandler[]): AccessHandler =>
    (args) =>
      filters.every((filter) => filter(args))

export const orAccess =
  (...filters: AccessHandler[]): AccessHandler =>
    (args) =>
      filters.some((filter) => filter(args))

const canAccessResourceRoleFilter =
  (roleName: string) => ({ currentAdmin }: any) => currentAdmin.role === roleName

const PORT: number = parseInt(process.env.ADMINJS_PORT || '3000')

const filterEventId =
  (filterName: string) =>
    async (request: any, context: any) => {
      const eventId = context.currentAdmin?.eventId

      return {
        ...request,
        query: {
          ...request.query,
          filters: {
            ...request.query?.filters,
            [filterName]: eventId,
          },
        },
        payload: request.payload
          ? {
            ...request.payload,
            [filterName]: eventId,
          }
          : request.payload,
      }
    }

const start = async () => {
  const app = express()

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  })

 // const dashboardHandler = async () => {
 //   return { message: 'Hello World' }
 // }

 const dashboardHandler = async (request: any, response: any, context: any) => {
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
  const waitingList = await safeCount('Registration', { eventId, waiting_list: true})
  const totalUnusedVouchers = await safeCount('User', { eventId, status: 'unused_voucher' })
  
  const totalProjects = await safeCount('Project', { eventId })
  const totalUsedVouchers = await safeCount('User', { eventId, status: 'used_voucher' })
  const totalUsers = await safeCount('User', { eventId })
  const totalVideos = await safeCount('Project', { eventId, videoLoaded: true })

  const tlangNl = await safeCount('User', { eventId, language: 'nl' })
  const tlangFr = await safeCount('User', { eventId, language: 'fr' })
  const tlangEn = await safeCount('User', { eventId, language: 'en' })

  const totalFemales = await safeCount('User', { eventId, sex: 'f' })
  const totalMales = await safeCount('User', { eventId, sex: 'm' })
  const totalX = await safeCount('User', { eventId, sex: 'X' })

  // Tijdelijke mockdata voor tabellen om fouten te voorkomen
  const questionsData = []
  const tshirtsData = []

  // 5. Return de data (Zelfs bij kolomfouten werkt je dashboard nu, de foute cijfers worden gewoon 0)
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


  const admin = new AdminJS({
    dashboard: {
      component: Components.Dashboard,
      handler: dashboardHandler,
    },
    resources: [
      {
        resource: sequelize.models.Account,
        options: {
          properties: { encryptedPassword: { isVisible: false } },
        },
        features: [
          passwordsFeature({
            componentLoader,
            hash: Account.hashPassword,
          })
        ]
      },
      {
        resource: sequelize.models.Event, options: {
          actions: {
            list: {
              before: filterEventId("id"),
            },
            search: {
              before: filterEventId("id"),
            },
          },
          edit: { isAccessible: andAccess(canAccessResourceFieldFilter("id"), canAccessResourceRoleFilter("admin")) },
          show: { isAccessible: andAccess(canAccessResourceFieldFilter("id"), canAccessResourceRoleFilter("admin")) },
          delete: { isAccessible: andAccess(canAccessResourceFieldFilter("id"), canAccessResourceRoleFilter("admin")) },
        }
      },
      { resource: sequelize.models.Award },
      {
        resource: sequelize.models.Project,
        options: {
          listProperties: ['id', 'name', 'type', 'language', 'eventId', 'deletedAt'],
          filterProperties: ['id', 'name', 'type', 'language', 'eventId', 'deletedAt'],
          showProperties: [
            'id',
            'name',
            'description',
            'type',
            'internalInformation',
            'language',
            'maxVoucher',
            'eventId',
            'deletedAt',
          ],
          editProperties: [
            'name',
            'description',
            'type',
            'internalInformation',
            'language',
            'maxVoucher',
            'eventId',
            'deletedAt',
          ],
          properties: {
            deletedAt: {
              type: 'datetime',
              label: 'Deleted At',
              isVisible: { list: true, filter: true, show: true, edit: true },
            },
          },
        },
      },
      { resource: sequelize.models.VoteCategory },
      { resource: sequelize.models.EventTable },
      { resource: sequelize.models.User },
      { resource: sequelize.models.UserProject },
      {
        resource: sequelize.models.Tshirt, options: {
          properties: {
            eventId: { isVisible: false },
          },
          actions: {
            list: {
              before: filterEventId("eventId")
            },
            search: {
              before: filterEventId("eventId")
            },
            edit: { isAccessible: canAccessResourceFieldFilter("eventId") },
            show: { isAccessible: canAccessResourceFieldFilter("eventId") },
            delete: { isAccessible: canAccessResourceFieldFilter("eventId") },
          }
        }
      },
      { resource: sequelize.models.QuestionUser },
      { resource: sequelize.models.Question },
      { resource: sequelize.models.TshirtGroup },
      { resource: sequelize.models.TshirtTranslation },
      { resource: sequelize.models.QuestionTranslation },
      { resource: sequelize.models.QuestionRegistration },
      { resource: sequelize.models.Registration },
      { resource: sequelize.models.TshirtGroupTranslation },
    ],
    componentLoader,
  })


  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    cookiePassword: process.env.ADMINJS_COOKIE_SECRET!,
    cookieName: 'adminjs',
    authenticate: async (email, password, context) => {
      const eventId = ((context?.req as unknown) as Request & { fields?: Record<string, any> })?.fields?.event
      const account = await sequelize.models.Account.findOne({ where: { email } }) as Account | null;

      if (account) {
        const isPasswordValid = account.verifyPassword(password)
        if (isPasswordValid) {
          return { email: account.email, eventId, role: account.account_type }
        }
      }
      return null
    },
  }, null, {
    resave: true,
    saveUninitialized: true,
    secret: process.env.ADMINJS_COOKIE_SECRET,
    cookie: {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
    },
    name: 'adminjs',
  })
  app.get('/api/events', async (req, res) => {
    try {
      const events = await sequelize.models.Event.findAll({
        attributes: ['id', 'eventTitle', 'current'],
        order: [['eventTitle', 'ASC']],
      })
      res.json(
        events.map((e: any) => ({
          value: String(e.id),
          label: e.eventTitle,
          isCurrent: e.current,
        }))
      )
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' })
    }
  })

  app.get('/', (_req, res) => {
    res.redirect(admin.options.rootPath)
  })

  app.use(admin.options.rootPath, adminRouter)

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdminJS started on http://0.0.0.0:${PORT}${admin.options.rootPath}`)
  })

  admin.watch()
}

start()
