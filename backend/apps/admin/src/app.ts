//import express from 'express'
import { Event } from '@coolestprojects/database'
import { Project } from '@coolestprojects/database'
import { sequelize } from './database'
import { Award } from '@coolestprojects/database'
import { Location } from '@coolestprojects/database'
import { VoteCategory } from '@coolestprojects/database'
import { Account } from '@coolestprojects/database'
import { EventTable } from '@coolestprojects/database'
import { User } from '@coolestprojects/database'
import { Voucher } from '@coolestprojects/database'
import { ProjectTable } from '@coolestprojects/database'
import { Tshirt } from '@coolestprojects/database'
import { QuestionUser } from '@coolestprojects/database'
import { Question } from '@coolestprojects/database'
import { TshirtGroup } from '@coolestprojects/database'
import { TshirtTranslation } from '@coolestprojects/database'
import { QuestionTranslation } from '@coolestprojects/database'
import { QuestionRegistration } from '@coolestprojects/database'
import { Registration } from '@coolestprojects/database'
import { TshirtGroupTranslation } from '@coolestprojects/database'

/*
const PORT = 3000

const start = async () => {
  const AdminJSModule = await import('adminjs')
  const AdminJS = AdminJSModule.default
  const AdminJSExpress = await import('@adminjs/express')
  const app = express()
  

  await sequelize.authenticate()


  const AdminJSSequelizeModule = await import('@adminjs/sequelize')
  const AdminJSSequelize = AdminJSSequelizeModule.default
  

  AdminJS.registerAdapter({
    Resource: AdminJSSequelize.Resource,
    Database: AdminJSSequelize.Database,
  })

  const componentLoader = new AdminJSModule.ComponentLoader()
  componentLoader.override('Login', path.join(__dirname, './login-component'))

  const admin = new AdminJS({
    componentLoader,
    resources: [
      { resource: Event, options: {} },
      { resource: Project, options: {} },
      { resource: Award, options: {} },
      {
        resource: Location, options: {
          actions: {
            list: {
              before: async (request: any, context: any) => {
                console.log('Before list action', context)
                request.query['filters.eventId'] = context.currentAdmin.currentEventId
                return request
              }
            },
          }
        }
      },
      { resource: VoteCategory, options: {} },
      //{ resource: Account, options: {} },
      { resource: EventTable, options: {} },
      { resource: User, options: {} },
      { resource: Voucher, options: {} },
      { resource: ProjectTable, options: {} },
      { resource: Tshirt, options: {} },
      { resource: QuestionUser, options: {} },
      { resource: Question, options: {} },
      { resource: TshirtGroup, options: {} },
      { resource: TshirtTranslation, options: {} },
      { resource: QuestionTranslation, options: {} },
      { resource: QuestionRegistration, options: {} },
      { resource: Registration, options: {} },
      { resource: TshirtGroupTranslation, options: {} },
    ],
  })



  const adminRouter = AdminJSExpress.buildAuthenticatedRouter(admin, {
    authenticate: async (email, password) => {
      if (email === 'test' && password === 'test') {
        return { email: 'test', currentEventId: 1 }
      }
      return null
    },
    cookieName: 'adminjs',
    cookiePassword: 'somepassword',
  })

  app.use('/admin', adminRouter)

  app.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
  })
}

start()
*/

import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import express from 'express'

const PORT = 3000

const start = async () => {
  const app = express()

  const admin = new AdminJS({})

  const adminRouter = AdminJSExpress.buildRouter(admin)
  app.use(admin.options.rootPath, adminRouter)

  app.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
  })
}

start()