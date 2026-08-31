import 'dotenv/config'
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
import { sequelize, } from './database.js'

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
  // TLS is terminated in front of Node (Dev Container proxy and Level27). Without this,
  // express-session sees HTTP and will not Set-Cookie when cookie.secure is true.
  app.set('trust proxy', 1)

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  })

  const configNavigation = {
    name: 'Configuration',
    icon: 'CheckSquare',
  }

  const configReporting = {
    name: 'Reporting',
    icon: 'Grid',
  }

  const configEvents = {
    name: 'Reporting',
    icon: 'Users',
  }

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
          navigation: configNavigation,
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
          navigation: configNavigation,
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
      {
        resource: sequelize.models.Award, options: {
          actions: {
            list: {
              before: filterEventId("id"),
            },
            search: {
              before: filterEventId("id"),
            },
          },
          navigation: configEvents, properties: {
            text: {
              type: 'textarea',
              props: {
                rows: 20,
              },
            },
          },
        }
      },
      {
        resource: sequelize.models.Project,
        features: [importExportFeature({ componentLoader })],
        options: {
          navigation: configEvents,
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
        features: [importExportFeature({ componentLoader })],
        options: {
          navigation: configEvents,
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
      { resource: sequelize.models.VoteCategory, options: { navigation: configEvents } },
      {
        resource: sequelize.models.EventTable,
        features: [importExportFeature({ componentLoader })],
        options: {
          navigation: configNavigation,
        }
      },
      {
        resource: sequelize.models.EmailTemplate,
        features: [importExportFeature({ componentLoader })],
        options: {
          navigation: configNavigation,
        }
      },
      {
        resource: sequelize.models.User,
        features: [importExportFeature({ componentLoader })],
        options: { navigation: configEvents }
      },

      { resource: sequelize.models.UserProject, options: { navigation: configEvents } },
      {
        resource: sequelize.models.Tshirt,
        options: {
          navigation: configNavigation,
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
      { resource: sequelize.models.QuestionUser, options: { navigation: configEvents } },
      { resource: sequelize.models.Question, options: { navigation: configNavigation, } },
      { resource: sequelize.models.TshirtGroup, options: { navigation: configNavigation, } },
      { resource: sequelize.models.TshirtTranslation, options: { navigation: configNavigation, } },
      { resource: sequelize.models.QuestionTranslation, options: { navigation: configNavigation, } },
      { resource: sequelize.models.QuestionRegistration },
      {
        resource: sequelize.models.Registration,
        features: [importExportFeature({ componentLoader })],
      },
      { resource: sequelize.models.TshirtGroupTranslation, options: { navigation: configNavigation, } },
      {
        resource: sequelize.models.Affiliation,
        options: {
          navigation: configNavigation,
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
        resource: sequelize.define('view_Export_all', {
          id: { type: DataTypes.INTEGER, primaryKey: true }, // u.id AS id
          user_event_id: { type: DataTypes.STRING },                   // u.eventId AS user_event_id
          email: { type: DataTypes.STRING },                   // u.email
          lastname: { type: DataTypes.STRING },                   // u.lastname
          firstname: { type: DataTypes.STRING },                   // u.firstname
          user_language: { type: DataTypes.STRING },                  // u.language AS user_language
          isOwner: { type: DataTypes.BOOLEAN },                 // up.isOwner
          photo: { type: DataTypes.STRING },                  // CASE ... AS photo
          contact: { type: DataTypes.STRING },                  // CASE ... AS contact
          approved: { type: DataTypes.STRING },                  // CASE ... AS approved
          tshirt_name: { type: DataTypes.STRING },                 // t.name AS tshirt_name
          postalcode: { type: DataTypes.STRING },                 // u.postalcode
          municipality_name: { type: DataTypes.STRING },             // u.municipality_name
          sex: { type: DataTypes.STRING },                  // u.sex
          birthmonth: { type: DataTypes.STRING },                // u.birthmonth
          via_Coderdojo: { type: DataTypes.STRING },               // u.via AS via_Coderdojo
          gsm: { type: DataTypes.STRING },                 // u.gsm
          gsm_guardian: { type: DataTypes.STRING },                // u.gsm_guardian
          user_internal_info: { type: DataTypes.STRING },             // u.internalinfo AS user_internal_info
          email_guardian: { type: DataTypes.STRING },               // u.email_guardian
          tshirtId: { type: DataTypes.STRING },                // u.tshirtId
          medical: { type: DataTypes.STRING },                // u.medical
          last_token: { type: DataTypes.STRING },                // u.last_token
          project_id: { type: DataTypes.STRING },               // p.id AS project_id
          project_event_id: { type: DataTypes.STRING },              // p.eventId AS project_event_id
          description: { type: DataTypes.STRING },               // p.description
          project_type: { type: DataTypes.STRING },               // p.type AS project_type
          project_internal_info: { type: DataTypes.STRING },         // p.internalInformation AS project_internal_info
          project_language: { type: DataTypes.STRING },              // p.language AS project_language
          maxVoucher: { type: DataTypes.STRING },               // p.maxVoucher
          voucherGuid: { type: DataTypes.STRING },               // up.voucherGuid
          projectId: { type: DataTypes.STRING },               // up.projectId
          userId: { type: DataTypes.STRING }                 // up.userId
        }, {
          tableName: 'view_Export_all',
          timestamps: false,
          freezeTableName: true
        }),
        features: [importExportFeature({ componentLoader })],
        options: {
          navigation: configReporting,
          label: 'Export full User, Project, Questions report',
          // VERPLICHT IN v7: Dit bepaalt exact welke kolommen in de 'list' tabel staan én de volgorde ervan
          listProperties: [
            'email', 'lastname', 'firstname', 'user_language', 'isOwner', 'photo',
            'contact', 'approved', 'tshirt_name', 'postalcode', 'municipality_name', 'sex', 'birthmonth',
            'via_Coderdojo', 'gsm', 'gsm_guardian', 'user_internal_info', 'email_guardian', 'tshirtId',
            'medical', 'last_token', 'project_id', 'project_event_id', 'description', 'project_type',
            'project_internal_info', 'project_language', 'maxVoucher', 'voucherGuid', 'projectId', 'userId', 'id', 'user_event_id'
          ],
          actions: {
            // Verberg en blokkeer de standaard CRUD-acties
            new: { isVisible: false, isAccessible: false },
            edit: { isVisible: false, isAccessible: false },
            delete: { isVisible: false, isAccessible: false },
            show: { isVisible: false, isAccessible: false },
            // Verberg de bulk-verwijderoptie waardoor de selectievakjes in de 'list' verdwijnen
            bulkDelete: { isVisible: false, isAccessible: false },
          },

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
        features: [importExportFeature({ componentLoader })],
        options: {
          navigation: configReporting,
          label: 'User Project Overzicht gebruikt voor export',
          actions: {
            // Verberg en blokkeer de standaard CRUD-acties
            new: { isVisible: false, isAccessible: false },
            edit: { isVisible: false, isAccessible: false },
            delete: { isVisible: false, isAccessible: false },
            show: { isVisible: false, isAccessible: false },
            // Verberg de bulk-verwijderoptie waardoor de selectievakjes in de 'list' verdwijnen
            bulkDelete: { isVisible: false, isAccessible: false },
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
      // 'auto' + trust proxy: Secure on HTTPS (dest / local proxy), not on direct HTTP.
      secure: 'auto',
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
