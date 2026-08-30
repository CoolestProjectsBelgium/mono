import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

componentLoader.override('Login', './login/Login.tsx');

const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard/Dashboard.tsx'),
  PictureSelector: componentLoader.add('PictureSelector', './pictures/PictureSelector.tsx'),
  VotingOverview: componentLoader.add('VotingOverview', './voting/Voting.tsx'),
  Tables: componentLoader.add('Tables', './tables/Tables.tsx'),
}

export { componentLoader, Components }
