import express from 'express'
import { Event } from '../models/event.model'
import { sequelize } from './database'

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

  const admin = new AdminJS({
    resources: [
      { resource: Event, options: {} }
    ],
  })

  const adminRouter = AdminJSExpress.default.buildRouter(admin)
  app.use(admin.options.rootPath, adminRouter)

  app.listen(PORT, () => {
    console.log(`AdminJS started on http://localhost:${PORT}${admin.options.rootPath}`)
  })
}

start()