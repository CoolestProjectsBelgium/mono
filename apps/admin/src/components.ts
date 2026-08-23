import { ComponentLoader } from 'adminjs'

const componentLoader = new ComponentLoader()

componentLoader.override('Login', './components/Login');

const Components = {
  Dashboard: componentLoader.add('Dashboard', './components/Dashboard'),
  PictureSelector: componentLoader.add('PictureSelector', './components/PictureSelector'),
}
export { componentLoader, Components }