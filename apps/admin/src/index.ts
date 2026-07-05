import AdminJSExpress from '@adminjs/express'
import AdminJS, { ComponentLoader } from 'adminjs'
import type { Request } from 'express'
import express from 'express'
import * as AdminJSSequelize from '@adminjs/sequelize'

import {
  sequelize,
} from './database.js'

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

  const dashboardHandler = async () => {
    return { message: 'Hello World' }
  }

  const admin = new AdminJS({
    dashboard: {
      component: Components.Dashboard,
      handler: dashboardHandler,
    },
    resources: [
      { resource: sequelize.models.Account },
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
      { resource: sequelize.models.Project },
      { resource: sequelize.models.VoteCategory },
      { resource: sequelize.models.EventTable },
      { resource: sequelize.models.User },
      { resource: sequelize.models.Voucher },
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
    cookiePassword: process.env.ADMINJS_COOKIE_SECRET || 'default-secret-password',
    cookieName: 'adminjs',
    authenticate: async (email, password, context) => {
      const eventId = ((context?.req as unknown) as Request & { fields?: Record<string, any> })?.fields?.event
      if (email === 'admin' && password === 'admin') {
        return { email: 'admin', eventId, role: 'admin' }
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
        attributes: ['id', 'event_title', 'current'],
        order: [['event_title', 'ASC']],
      })
      res.json(
        events.map((e: any) => ({
          value: String(e.id),
          label: e.event_title,
          isCurrent: e.current,
        }))
      )
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch events' })
    }
  })

  app.use(admin.options.rootPath, adminRouter)

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`AdminJS started on http://0.0.0.0:${PORT}${admin.options.rootPath}`)
  })

  admin.watch()
}

start()
