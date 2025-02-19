import { Module, DynamicModule } from '@nestjs/common';
import { MultipleAdminLoaderPromise } from '../express-custom.loader';

@Module({})
export class AdminModule {
  static async register(eventId: number): Promise<DynamicModule> {
    console.log('register %d', eventId);
    const { AdminModule } = await import('@adminjs/nestjs');

    const { Database, Resource } = await import('@adminjs/sequelize');
    const { AdminJS } = await import('adminjs');

    AdminJS.registerAdapter({ Database, Resource });

    return AdminModule.createAdmin({
      adminJsOptions: {
        rootPath: `/admin/${eventId}`,
        resources: [],
      },
      customLoader: await MultipleAdminLoaderPromise,
    });
    /*
    return AdminModule.createAdminAsync({
      useFactory: async () => {
        const { Database, Resource } = await import('@adminjs/sequelize');
        const { AdminJS } = await import('adminjs');

        AdminJS.registerAdapter({ Database, Resource });

        console.log("init my")

        return {
          adminJsOptions: {
            rootPath: `/admin/${eventId}`,
            resources: [],
          },
        };
      },
    });
  }*/
  }
}

/*
import('@adminjs/nestjs').then(({ AdminModule }) =>
    AdminModule.createAdminAsync({
      useFactory: async () => {
        const { Database, Resource } = await import('@adminjs/sequelize');
        const { AdminJS } = await import('adminjs');

        AdminJS.registerAdapter({ Database, Resource });

        //setup event scopes for adminJs
        const models: (typeof BaseEventModel)[] = [
          User,
          Tshirt,
          TshirtGroup,
          EventTable,
          ProjectTable,
          Question,
          QuestionUser,
          QuestionRegistration,
          Project,
          Location,
          Registration,
          TshirtGroupTranslation,
          TshirtTranslation,
          QuestionTranslation,
          Voucher,
          AzureBlob,
          Attachment,
          Hyperlink,
          Certificate,
          Message,
          Vote,
          VoteCategory,
          Award,
        ];

        for (const model of models) {
          model.setAdminEventScopes('event', [1]); // I'm not sure what the scoping is of the Sequelize models, for multiple adminJS instances My assumption is that Models are shared
        }

        return {
          adminJsOptions: {
            rootPath: '/admin', // TODO introduce event variable
            resources: [
              {
                resource: Event,
                options: {},
              },
              {
                resource: User.scope('event1'),
                options: {},
              },
              {
                resource: Tshirt.scope('event1'),
                options: {},
              },
              {
                resource: TshirtGroup.scope('event1'),
                options: {},
              },
            ],
          },
          auth: {
            authenticate,
            cookieName: 'adminjs',
            cookiePassword: 'secret',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        };
      },
    }),
  ),
*/
