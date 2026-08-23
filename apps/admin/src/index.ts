import AdminJSExpress from '@adminjs/express'
import passwordsFeature from '@adminjs/passwords'
import * as AdminJSSequelize from '@adminjs/sequelize'
import AdminJS from 'adminjs'
import express from 'express'
import { componentLoader, Components, Handlers } from './components/index.js'

import { Account } from '@coolestprojects/database'
import { andAccess, canAccessResourceFieldFilter, canAccessResourceRoleFilter, filterEventId } from './authorisations.js'
import { Authenticate } from './components/login/authenticate.js'
import {
  sequelize,
} from './database.js'

const PORT: number = parseInt(process.env.ADMINJS_PORT || '3000')

const start = async () => {
  const app = express()

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  })

  const admin = new AdminJS({
    dashboard: {
      component: Components.Dashboard,
      handler: Handlers.Dashboard,
    },
    pages: {
      PictureSelector: {
        component: Components.PictureSelector,
        handler: Handlers.PictureSelector,
        icon: 'Image',
      },
    },
    //componentLoader,
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
      {
        resource: sequelize.models.Attachment,
        options: {
          listProperties: ['id', 'projectId', 'confirmed', 'internal', 'size', 'mimetype'],
          filterProperties: ['id', 'projectId', 'eventId'],
          showProperties: [
            'id',
            'projectId',
            'confirmed',
            'internal',
            'size',
            'mimetype',
            'filepath',
            'thumbnailPath',
            'name',
            'type',
            'internalInformation',
            'language',
            'maxVoucher',
            'eventId',
            'deletedAt',
          ],
          editProperties: [
            'projectId',
            'confirmed',
            'internal',
            'mimetype',
            'filepath',
            'thumbnailPath',
            'name',
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
    authenticate: Authenticate,
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
  // get all the events for the login page
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
