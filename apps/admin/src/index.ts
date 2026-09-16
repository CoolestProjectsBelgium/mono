import 'dotenv/config';
import { APP_DIR } from './adminjs-env.js';
import path from 'node:path';
import AdminJSExpress from '@adminjs/express';
import passwordsFeature from '@adminjs/passwords';
import * as AdminJSSequelize from '@adminjs/sequelize';
import { Account, type Event as EventModel } from '@coolestprojects/database';
import AdminJS from 'adminjs';
import connectSessionSequelize from 'connect-session-sequelize';
import express from 'express';
import session from 'express-session';
import {
  canAccessResourceFieldFilter,
  canAccessResourceFieldMatch,
  canAccessResourceRoleFilter,
  filterEventId,
  filterUnlessRole,
  orAccess,
} from './authorisations.js';
import { componentLoader, Components, Handlers } from './components/index.js';
import { Authenticate } from './components/login/authenticate.js';
import eventLoginRouter from './components/login/router.js';
import { restrictPropertiesToRoleFeature } from './features/restrict-properties-to-role/index.js';
import {
  exportOnlyFeature,
  exportOnlyActions,
} from './features/export-only/index.js';
import { registerUserHandler } from './components/registration/handler.js';
import importExportFeature from '@adminjs/import-export';
import loggerFeature, { createLoggerResource } from '@adminjs/logger';
import { sequelize } from './database.js';
import {
  exportAllResource,
  userProjectSummaryResource,
} from './reporting/reports/index.js';

// ADMINJS_COOKIE_SECRET signs both the AdminJS auth cookie and the express-session
// cookie. A missing value would previously fall through to `undefined` (cookiePassword)
// or the literal string "undefined" (session secret via `+ ""`), making sessions
// forgeable. Fail fast instead of starting with a broken/empty secret.
const ADMINJS_COOKIE_SECRET = process.env.ADMINJS_COOKIE_SECRET;
if (!ADMINJS_COOKIE_SECRET || ADMINJS_COOKIE_SECRET.trim() === '') {
  throw new Error(
    'Refusing to start: ADMINJS_COOKIE_SECRET is missing or empty. This secret signs admin session cookies.',
  );
}

const SequelizeStore = connectSessionSequelize(session.Store);

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: 'admin_sessions',
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 8 * 60 * 60 * 1000,
});

sessionStore.sync();

const PORT: number = parseInt(process.env.ADMINJS_PORT || '3000');

const start = async () => {
  const app = express();
  // TLS is terminated in front of Node (Dev Container proxy and Level27). Without this,
  // express-session sees HTTP and will not Set-Cookie when cookie.secure is true.
  app.set('trust proxy', 1);

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  });

  const navSystem = {
    name: 'System',
    icon: 'Lock',
  };

  const navEventSetup = {
    name: 'Event setup',
    icon: 'Settings',
  };

  const navTranslations = {
    name: 'Translations',
    icon: 'Globe',
  };

  const navRegistration = {
    name: 'Registration',
    icon: 'Clipboard',
  };

  const navProjects = {
    name: 'Projects & participants',
    icon: 'Users',
  };

  const navVenue = {
    name: 'Venue & seating',
    icon: 'Map',
  };

  const navVoting = {
    name: 'Voting & awards',
    icon: 'Award',
  };

  const navCommunication = {
    name: 'Communication',
    icon: 'Mail',
  };

  const navPresentation = {
    name: 'Presentation',
    icon: 'Monitor',
  };

  const navReporting = {
    name: 'Reporting',
    icon: 'Grid',
  };

  const auditLog = () =>
    loggerFeature({
      componentLoader,
      propertiesMapping: { user: 'accountId' },
      userIdAttribute: 'id',
    });

  // Named explicitly (rather than left to AdminJS's own '/admin' default) so the
  // branding favicon URL below can reference it without a circular type reference
  // through `admin.options.rootPath`.
  const rootPath = '/admin';

  const admin = new AdminJS({
    rootPath,
    branding: async (currentAdmin: any) => {
      const eventId = currentAdmin?.eventId;
      const currentEvent = eventId
        ? await (sequelize.models.Event as typeof EventModel).findByPk(eventId)
        : null;
      return {
        companyName: currentEvent?.eventTitle || 'Coolest Projects',
        favicon: `${rootPath}/frontend/assets/coderdojo-icon.png`,
      };
    },
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
      EmailTemplates: {
        component: Components.EmailTemplates,
        handler: Handlers.EmailTemplates,
        icon: 'Mail',
        // @ts-expect-error AdminJS supports label on pages at runtime
        label: 'Email templates',
      },
      Floorplans: {
        component: Components.Floorplans,
        handler: Handlers.Floorplans,
        icon: 'Map',
        // @ts-expect-error AdminJS supports label on pages at runtime
        label: 'Floor plans',
      },
      Presentation: {
        component: Components.Presentation,
        handler: Handlers.Presentation,
        icon: 'Play',
        // @ts-expect-error AdminJS supports label on pages at runtime
        label: 'Presentation preview',
      },
      PresentationAssets: {
        component: Components.PresentationAssets,
        handler: Handlers.PresentationAssets,
        icon: 'Image',
        // @ts-expect-error AdminJS supports label on pages at runtime
        label: 'Presentation assets',
      },
      Certificates: {
        component: Components.Certificates,
        handler: Handlers.Certificates,
        icon: 'Award',
        // @ts-expect-error AdminJS supports label on pages at runtime
        label: 'Certificates',
      },
    },
    resources: [
      // --- System: global, not event-scoped, super_admin-only writes ---
      {
        resource: sequelize.models.Account,
        options: {
          properties: {
            encryptedPassword: { isVisible: false },
            // Self-edit is allowed (see the `edit` action below), but only a super_admin
            // may change account_type — prevents an admin from escalating their own
            // privileges. Enforced by restrictPropertiesToRoleFeature (see features below).
            account_type: { custom: { role: 'super_admin' } },
          },
          navigation: navSystem,
          actions: {
            // Everyone sees only their own account (e.g. to change their password);
            // only a super_admin sees the full list.
            list: {
              before: filterUnlessRole(
                'id',
                (currentAdmin) => currentAdmin?.id,
              ),
            },
            search: {
              before: filterUnlessRole(
                'id',
                (currentAdmin) => currentAdmin?.id,
              ),
            },
            show: {
              isAccessible: orAccess(
                canAccessResourceRoleFilter('super_admin'),
                canAccessResourceFieldMatch('id', 'id'),
              ),
            },
            edit: {
              isAccessible: orAccess(
                canAccessResourceRoleFilter('super_admin'),
                canAccessResourceFieldMatch('id', 'id'),
              ),
            },
            new: { isAccessible: canAccessResourceRoleFilter('super_admin') },
            delete: {
              isAccessible: canAccessResourceRoleFilter('super_admin'),
            },
          },
        },
        features: [
          passwordsFeature({
            componentLoader,
            hash: Account.hashPassword,
          }),
          restrictPropertiesToRoleFeature,
          auditLog(),
        ],
      },
      createLoggerResource({
        componentLoader,
        resource: sequelize.models.Log,
        featureOptions: {
          componentLoader,
          propertiesMapping: { user: 'accountId' },
          userIdAttribute: 'id',
          resourceOptions: {
            navigation: navSystem,
          },
        },
      }),
      {
        resource: sequelize.models.Event,
        features: [auditLog()],
        options: {
          navigation: navSystem,
          actions: {
            // A super_admin sees and manages every event; every other role only sees the
            // event tied to their session, and cannot create/edit/delete it (read-only).
            list: {
              before: filterUnlessRole(
                'id',
                (currentAdmin) => currentAdmin?.eventId,
              ),
            },
            search: {
              before: filterUnlessRole(
                'id',
                (currentAdmin) => currentAdmin?.eventId,
              ),
            },
            show: {
              isAccessible: orAccess(
                canAccessResourceRoleFilter('super_admin'),
                canAccessResourceFieldMatch('id', 'eventId'),
              ),
            },
            new: { isAccessible: canAccessResourceRoleFilter('super_admin') },
            edit: { isAccessible: canAccessResourceRoleFilter('super_admin') },
            delete: {
              isAccessible: canAccessResourceRoleFilter('super_admin'),
            },
          },
        },
      },

      // --- Event setup ---
      {
        resource: sequelize.models.Tshirt,
        features: [auditLog()],
        options: {
          navigation: navEventSetup,
          properties: {
            eventId: { isVisible: false },
          },
          actions: {
            new: {
              before: filterEventId('eventId'),
            },
            list: {
              before: filterEventId('eventId'),
            },
            search: {
              before: filterEventId('eventId'),
            },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },
      {
        resource: sequelize.models.TshirtGroup,
        features: [auditLog()],
        options: { navigation: navEventSetup },
      },

      // --- Translations ---
      {
        resource: sequelize.models.TshirtTranslation,
        features: [auditLog()],
        options: { navigation: navTranslations },
      },
      {
        resource: sequelize.models.TshirtGroupTranslation,
        features: [auditLog()],
        options: { navigation: navTranslations },
      },
      {
        resource: sequelize.models.QuestionTranslation,
        features: [auditLog()],
        options: { navigation: navTranslations },
      },

      // --- Registration ---
      {
        resource: sequelize.models.Question,
        features: [auditLog()],
        options: { navigation: navRegistration },
      },
      {
        resource: sequelize.models.QuestionRegistration,
        features: [auditLog()],
        options: { navigation: navRegistration },
      },
      {
        resource: sequelize.models.Registration,
        features: [importExportFeature({ componentLoader }), auditLog()],
        options: {
          navigation: navRegistration,
          actions: {
            // Separate, additional action — the default "new" stays exactly
            // as-is (still AdminJS's raw auto-generated form against this
            // resource's own columns). This one instead proxies to the real
            // POST /registration (apps/api/src/registration/registration.controller.ts),
            // so it gets the same validation and — recognized via the
            // AdminJS session cookie already forwarded by NestApiClient —
            // immediate activation into a User instead of the normal
            // email/token flow.
            registerUser: {
              actionType: 'resource',
              icon: 'UserPlus',
              component: Components.RegisterUser,
              handler: registerUserHandler,
            },
          },
        },
      },
      {
        resource: sequelize.models.Affiliation,
        features: [auditLog()],
        options: {
          navigation: navRegistration,
          properties: {
            eventId: { isVisible: false },
          },
          actions: {
            new: {
              before: filterEventId('eventId'),
            },
            list: {
              before: filterEventId('eventId'),
            },
            search: {
              before: filterEventId('eventId'),
            },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },
      {
        resource: sequelize.models.Municipality,
        features: [auditLog()],
        options: {
          navigation: navRegistration,
          properties: {
            eventId: { isVisible: false },
          },
          actions: {
            new: {
              before: filterEventId('eventId'),
            },
            list: {
              before: filterEventId('eventId'),
            },
            search: {
              before: filterEventId('eventId'),
            },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },

      // --- Projects & participants ---
      {
        resource: sequelize.models.Project,
        features: [importExportFeature({ componentLoader }), auditLog()],
        options: {
          navigation: navProjects,
          listProperties: [
            'id',
            'name',
            'type',
            'language',
            'eventId',
            'deletedAt',
          ],
          filterProperties: [
            'id',
            'name',
            'type',
            'language',
            'eventId',
            'deletedAt',
          ],
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
        features: [importExportFeature({ componentLoader }), auditLog()],
        options: {
          navigation: navProjects,
          listProperties: [
            'id',
            'projectId',
            'confirmed',
            'internal',
            'size',
            'mimetype',
          ],
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
      {
        resource: sequelize.models.User,
        features: [importExportFeature({ componentLoader }), auditLog()],
        options: { navigation: navProjects },
      },
      {
        resource: sequelize.models.UserProject,
        features: [auditLog()],
        options: { navigation: navProjects },
      },
      {
        resource: sequelize.models.QuestionUser,
        features: [auditLog()],
        options: { navigation: navProjects },
      },

      // --- Venue & seating ---
      {
        resource: sequelize.models.EventTable,
        features: [importExportFeature({ componentLoader }), auditLog()],
        options: {
          navigation: navVenue,
        },
      },

      // --- Voting & awards ---
      {
        resource: sequelize.models.Award,
        features: [auditLog()],
        options: {
          actions: {
            list: {
              before: filterEventId('id'),
            },
            search: {
              before: filterEventId('id'),
            },
          },
          navigation: navVoting,
          properties: {
            text: {
              type: 'textarea',
              props: {
                rows: 20,
              },
            },
          },
        },
      },
      {
        resource: sequelize.models.VoteCategory,
        features: [auditLog()],
        options: { navigation: navVoting },
      },
      {
        resource: sequelize.models.Certificate,
        features: [auditLog()],
        options: {
          navigation: navVoting,
          properties: {
            eventId: { isVisible: false },
            text: { type: 'textarea', props: { rows: 12 } },
          },
          actions: {
            new: { before: filterEventId('eventId') },
            list: { before: filterEventId('eventId') },
            search: { before: filterEventId('eventId') },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },
      {
        resource: sequelize.models.CertificateTemplate,
        features: [auditLog()],
        options: {
          navigation: navVoting,
          properties: {
            eventId: { isVisible: false },
            bodyHtml: { type: 'textarea', props: { rows: 20 } },
          },
          actions: {
            new: { before: filterEventId('eventId') },
            list: { before: filterEventId('eventId') },
            search: { before: filterEventId('eventId') },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },

      // --- Communication ---
      {
        resource: sequelize.models.EmailTemplate,
        features: [importExportFeature({ componentLoader }), auditLog()],
        options: {
          navigation: navCommunication,
          actions: {
            new: {
              before: filterEventId('eventId'),
            },
            list: {
              before: filterEventId('eventId'),
            },
            search: {
              before: filterEventId('eventId'),
            },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },

      // --- Presentation ---
      // dataSource/cardinality decide how a row expands into the deck (see
      // apps/api/src/presentation/presentation.service.ts): 'projects' +
      // 'perRecord' is one slide per visible (table-assigned) project,
      // 'projects' + 'single' is one overview slide listing them all,
      // 'none' is a static/custom slide (title is admin-facing only).
      // `imagePath` (optional static art for a 'none' slide) is uploaded via
      // `POST /admin/presentation-slides/:id/image`, not through this form —
      // it's a plain filename on disk, no dedicated upload widget yet.
      {
        resource: sequelize.models.PresentationSlide,
        features: [auditLog()],
        options: {
          navigation: navPresentation,
          properties: {
            eventId: { isVisible: false },
            body: { type: 'textarea', props: { rows: 12 } },
            imagePath: {
              isVisible: { list: false, filter: false, show: true, edit: true },
            },
          },
          actions: {
            new: { before: filterEventId('eventId') },
            list: { before: filterEventId('eventId') },
            search: { before: filterEventId('eventId') },
            edit: { isAccessible: canAccessResourceFieldFilter('eventId') },
            show: { isAccessible: canAccessResourceFieldFilter('eventId') },
            delete: { isAccessible: canAccessResourceFieldFilter('eventId') },
          },
        },
      },

      // --- Reporting ---
      {
        resource: exportAllResource,
        features: [exportOnlyFeature({ componentLoader })],
        options: {
          navigation: navReporting,
          label: 'Export full User, Project, Questions report',
          // This determines exactly which columns show up in the 'list' table, and in which order.
          listProperties: [
            'email',
            'lastname',
            'firstname',
            'user_language',
            'isOwner',
            'photo',
            'contact',
            'approved',
            'tshirt_name',
            'postalcode',
            'municipality_name',
            'sex',
            'birthmonth',
            'via_Coderdojo',
            'gsm',
            'gsm_guardian',
            'user_internal_info',
            'email_guardian',
            'tshirtId',
            'medical',
            'last_token',
            'project_id',
            'project_event_id',
            'description',
            'project_type',
            'project_internal_info',
            'project_language',
            'maxVoucher',
            'voucherGuid',
            'projectId',
            'userId',
            'id',
            'user_event_id',
          ],
          actions: {
            // Hide and block the standard CRUD actions: this resource is read-only.
            new: { isVisible: false, isAccessible: false },
            edit: { isVisible: false, isAccessible: false },
            delete: { isVisible: false, isAccessible: false },
            show: { isVisible: false, isAccessible: false },
            // Hide the bulk-delete option, which also removes the list's selection checkboxes.
            bulkDelete: { isVisible: false, isAccessible: false },
            ...exportOnlyActions,
          },
        },
      },
      {
        resource: userProjectSummaryResource,
        features: [exportOnlyFeature({ componentLoader })],
        options: {
          navigation: navReporting,
          label: 'User Project Overzicht gebruikt voor export',
          actions: {
            // Hide and block the standard CRUD actions: this resource is read-only.
            new: { isVisible: false, isAccessible: false },
            edit: { isVisible: false, isAccessible: false },
            delete: { isVisible: false, isAccessible: false },
            show: { isVisible: false, isAccessible: false },
            // Hide the bulk-delete option, which also removes the list's selection checkboxes.
            bulkDelete: { isVisible: false, isAccessible: false },
            ...exportOnlyActions,
          },
        },
      },
    ],
    componentLoader,
  });

  if (process.env.NODE_ENV !== 'production') {
    await admin.watch();
  }

  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
    admin,
    {
      cookiePassword: ADMINJS_COOKIE_SECRET,
      cookieName: 'adminjs',
      authenticate: Authenticate,
    },
    null,
    {
      resave: true,
      store: sessionStore,
      saveUninitialized: true,
      secret: ADMINJS_COOKIE_SECRET,
      cookie: {
        httpOnly: process.env.NODE_ENV === 'production',
        // 'auto' + trust proxy: Secure on HTTPS (dest / local proxy), not on direct HTTP.
        secure: 'auto',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000,
        domain: process.env.COOKIE_DOMAIN,
      },
      name: 'adminjs',
    },
    // Admin file uploads (floorplans, presentation assets/slide images) are
    // gated by admin/super_admin auth, not by size — express-formidable's
    // default cap (200MB) would otherwise apply to every page-handler POST.
    { maxFileSize: Infinity },
  );

  app.use('/api', eventLoginRouter);

  app.get('/', (_req, res) => {
    res.redirect(admin.options.rootPath);
  });

  app.use(
    `${admin.options.rootPath}/frontend/assets`,
    express.static(path.join(APP_DIR, 'frontend', 'assets')),
  );

  app.use(admin.options.rootPath, adminRouter);

  await new Promise<void>((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(
        `AdminJS started on http://0.0.0.0:${PORT}${admin.options.rootPath}`,
      );
      resolve();
    });
    server.on('error', reject);
  });
};

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
