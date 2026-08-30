import { APP_DIR } from './adminjs-env.js'
import path from 'node:path'
import AdminJSExpress from '@adminjs/express'
import passwordsFeature from '@adminjs/passwords'
import * as AdminJSSequelize from '@adminjs/sequelize'
import { Account } from '@coolestprojects/database'
import AdminJS from 'adminjs'
import connectSessionSequelize from 'connect-session-sequelize'
import express from 'express'
import { DataTypes } from 'sequelize';
import session from 'express-session'
import { andAccess, canAccessResourceFieldFilter, canAccessResourceRoleFilter, filterEventId } from './authorisations.js'
import { componentLoader, Components, Handlers } from './components/index.js'
import { Authenticate } from './components/login/authenticate.js'
import eventLoginRouter from './components/login/router.js'
import importExportFeature from '@adminjs/import-export';
import {  sequelize,} from './database.js'

const SequelizeStore = connectSessionSequelize(session.Store)

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'admin_sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 8 * 60 * 60 * 1000,
})

sessionStore.sync()

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
      VotingOverview: {
        component: Components.VotingOverview,
        handler: Handlers.VotingOverview,
        icon: 'BarChart',
      },
      Tables: {
        component: Components.Tables,
        handler: Handlers.Tables,
        icon: 'Table',
      },
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
        features: [  importExportFeature({ componentLoader })],
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
        features: [  importExportFeature({ componentLoader })],
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
      { resource: sequelize.models.EventTable, 
        features: [  importExportFeature({ componentLoader })]  
      },
      { resource: sequelize.models.User,
        features: [  importExportFeature({ componentLoader })],
       },
      { resource: sequelize.models.UserProject },
      {
        resource: sequelize.models.Tshirt, 
          options: {
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
      {
        resource: sequelize.models.Affiliation,
        options: {
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
      {
        resource: sequelize.define('view_user_project_summary', {
          id: { type: DataTypes.INTEGER, primaryKey: true }, 
          firstname: { type: DataTypes.STRING },
          lastname: { type: DataTypes.STRING },
          email: { type: DataTypes.STRING },
          tshirt_name: { type: DataTypes.STRING },
          project_name: { type: DataTypes.STRING },
          isOwner: { type: DataTypes.BOOLEAN },
          photo: { type: DataTypes.STRING },
          contact: { type: DataTypes.STRING },
          approved: { type: DataTypes.STRING }
        }, { 
          tableName: 'view_user_project_summary',
          timestamps: false,
          freezeTableName: true
        }),
        features: [ importExportFeature({ componentLoader }) ],
        options: {
          label: 'User Project Overzicht gebruikt voor export',
          actions: {
            // We verwijderen de acties die je niet wilt zien
            new: { isRemoved: true },
            edit: { isRemoved: true },
            delete: { isRemoved: true },
        // We zetten de selectie uit op het hoogste niveau van de lijst-actie
            list: {
              options: {
                isSelectionEnabled: false, // Voor v7 moet dit vaak hier staan
              }
            }
          },
        }
      },
    ],
    componentLoader,
  })

  if (process.env.NODE_ENV !== 'production') {
    await admin.watch()
  }

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    cookiePassword: process.env.ADMINJS_COOKIE_SECRET!,
    cookieName: 'adminjs',
    authenticate: Authenticate,
  }, null, {
    resave: true,
    store: sessionStore,
    saveUninitialized: true,
    secret: process.env.ADMINJS_COOKIE_SECRET + "",
    cookie: {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN,
    },
    name: 'adminjs',
  })


  app.use('/api', eventLoginRouter);

  app.get('/', (_req, res) => {
    res.redirect(admin.options.rootPath)
  })

  app.use(
    `${admin.options.rootPath}/frontend/assets`,
    express.static(path.join(APP_DIR, 'frontend', 'assets')),
  )

  app.use(admin.options.rootPath, adminRouter)

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`AdminJS started on http://0.0.0.0:${PORT}${admin.options.rootPath}`)
      resolve()
    })
    server.on('error', reject)
  })
}

start().catch((error) => {
  console.error(error)
  process.exit(1)
})
