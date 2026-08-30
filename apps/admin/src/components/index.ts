export { componentLoader, Components } from './loader.js'
import { Handler as DashboardHandler } from './dashboard/handler.js'
import { Handler as PictureHandler } from './pictures/handler.js'
import { Handler as VotingHandler } from './voting/handler.js'
import { Handler as TablesHandler } from './tables/handler.js'

const Handlers = {
  Dashboard: DashboardHandler,
  PictureSelector: PictureHandler,
  VotingOverview: VotingHandler,
  Tables: TablesHandler,
}

export { Handlers }
