import { ComponentLoader } from 'adminjs';

const componentLoader = new ComponentLoader();

componentLoader.override('Login', './login/Login.tsx');

const Components = {
  Dashboard: componentLoader.add('Dashboard', './dashboard/Dashboard.tsx'),
  PictureSelector: componentLoader.add(
    'PictureSelector',
    './pictures/PictureSelector.tsx',
  ),
  VotingOverview: componentLoader.add('VotingOverview', './voting/Voting.tsx'),
  Tables: componentLoader.add('Tables', './tables/Tables.tsx'),
  EmailTemplates: componentLoader.add(
    'EmailTemplates',
    './email-templates/EmailTemplates.tsx',
  ),
  Floorplans: componentLoader.add('Floorplans', './floorplans/Floorplans.tsx'),
  Presentation: componentLoader.add(
    'Presentation',
    './presentation/Presentation.tsx',
  ),
  PresentationAssets: componentLoader.add(
    'PresentationAssets',
    './presentation-assets/PresentationAssets.tsx',
  ),
  Certificates: componentLoader.add(
    'Certificates',
    './certificates/Certificates.tsx',
  ),
  Archiving: componentLoader.add('Archiving', './archiving/Archiving.tsx'),
  TwoFactorSetup: componentLoader.add(
    'TwoFactorSetup',
    './two-factor/TwoFactorSetup.tsx',
  ),
  RegisterUser: componentLoader.add(
    'RegisterUser',
    './registration/RegisterUser.tsx',
  ),
};

export { componentLoader, Components };
