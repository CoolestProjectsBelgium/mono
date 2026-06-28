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

const addEventFilter = async (request: any, context: any) => {
  const eventId = context.currentAdmin?.eventId
  if (!eventId) return request

  return {
    ...request,
    query: {
      ...request.query,
      filters: {
        ...request.query?.filters,
        eventId,
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

const canAccessResource = ({ currentAdmin, record }: any) => {
  if (!currentAdmin) return false
  if (currentAdmin.role === 'superadmin') return true
  return (currentAdmin.eventId && String(record?.param('eventId')) === String(currentAdmin.eventId)) || (record?.name() === 'Event' && currentAdmin.eventId === String(record?.param('id')))
}


const eventScopedResource = (resource: any, options: { properties?: Record<string, any> } = {},) => ({
  resource,
  options: {
    actions: {
      list: { before: addEventFilter, isAccessible: canAccessResource },
      search: { before: addEventFilter, isAccessible: canAccessResource },
      new: { before: addEventFilter, isAccessible: canCreate },
      edit: { isAccessible: canAccessResource },
      show: { isAccessible: canAccessResource },
      delete: { isAccessible: canAccessResource },
    },
    properties: {
      eventId: { isVisible: false },
      ...options.properties,
    },
  },
})

const PORT: number = parseInt(process.env.ADMINJS_PORT || '3000')

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
      { resource: sequelize.models.Event },
      { resource: sequelize.models.Award },
      { resource: sequelize.models.Location },
      { resource: sequelize.models.Project },
      { resource: sequelize.models.VoteCategory },
      { resource: sequelize.models.EventTable },
      { resource: sequelize.models.User },
      { resource: sequelize.models.Voucher },
      { resource: sequelize.models.ProjectTable },
      { resource: sequelize.models.Tshirt },
      { resource: sequelize.models.QuestionUser },
      { resource: sequelize.models.Question },
      { resource: sequelize.models.TshirtGroup },
      { resource: sequelize.models.TshirtTranslation },
      { resource: sequelize.models.QuestionTranslation },
      { resource: sequelize.models.QuestionRegistration },
      { resource: sequelize.models.Registration },
      { resource: sequelize.models.TshirtGroupTranslation },
      /* TODO filter by eventID
      eventScopedResource(sequelize.models.Event),
      eventScopedResource(sequelize.models.Award),
      eventScopedResource(sequelize.models.Location),
      eventScopedResource(sequelize.models.Project),
      eventScopedResource(sequelize.models.VoteCategory),
      eventScopedResource(sequelize.models.EventTable),
      eventScopedResource(sequelize.models.User),
      eventScopedResource(sequelize.models.Voucher),
      eventScopedResource(sequelize.models.ProjectTable),
      eventScopedResource(sequelize.models.Tshirt),
      eventScopedResource(sequelize.models.QuestionUser),
      eventScopedResource(sequelize.models.Question),
      eventScopedResource(sequelize.models.TshirtGroup),
      eventScopedResource(sequelize.models.TshirtTranslation),
      eventScopedResource(sequelize.models.QuestionTranslation),
      eventScopedResource(sequelize.models.QuestionRegistration),
      eventScopedResource(sequelize.models.Registration),
      eventScopedResource(sequelize.models.TshirtGroupTranslation),*/
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
