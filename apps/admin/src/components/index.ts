import { ComponentLoader } from 'adminjs'
import { Handler as DashboardHandler } from './dashboard/handler.js'
import { Handler as PictureHandler } from './pictures/handler.js'
import { Handler as VotingHandler } from './voting/handler.js'
import { Handler as TablesHandler } from './tables/handler.js'

const componentLoader = new ComponentLoader()

componentLoader.override('Login', './login/Login');

const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard/Dashboard'),
  PictureSelector: componentLoader.add('PictureSelector', './pictures/PictureSelector'),
  VotingOverview: componentLoader.add('VotingOverview', './voting/Voting'),
  Tables: componentLoader.add('Tables', './tables/Tables'),
}

const Handlers = {
  Dashboard: DashboardHandler,
  PictureSelector: PictureHandler,
  VotingOverview: VotingHandler,
  Tables: TablesHandler,
}

export { componentLoader, Components, Handlers }