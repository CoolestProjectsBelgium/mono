import { ComponentLoader } from 'adminjs'
import { Handler as DashboardHandler } from './dashboard/handler.js'
import { Handler as PictureHandler } from './pictures/handler.js'

const componentLoader = new ComponentLoader()

componentLoader.override('Login', './components/login/Login');

const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard/Dashboard'),
  PictureSelector: componentLoader.add('PictureSelector', './picture/PictureSelector'),
}

const Handlers = {
  Dashboard: DashboardHandler,
  PictureSelector: PictureHandler
}

export { componentLoader, Components, Handlers }