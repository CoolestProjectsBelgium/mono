import type { BrandingOptions } from 'adminjs'

export const myCustomTheme = {
  colors: {
    primary100: '#FF0000',
  },
} satisfies NonNullable<BrandingOptions['theme']>

export const myCustomNavigation = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: 'Home',
    route: '/dashboard',
  },
  {
    id: 'extensions_group',
    name: 'EXTENTIES',
    icon: 'Extensions',
    children: [
      {
        id: 'reporting',
        name: 'Reporting',
        icon: 'BarChart',
        route: '/admin/reporting',
      },
      {
        id: 'media',
        name: 'Media Management',
        icon: 'Image',
        route: '/admin/media-management',
      },
      {
        id: 'administratie',
        name: 'Administratie',
        icon: 'Settings',
        route: '/admin/administratie',
      },
    ],
  },
]
