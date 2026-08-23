// src/theme.ts
import type Theme from 'adminjs'
export const myCustomTheme = {
  colors: {
    primary: '#FF0000',
  },
  
  navigation: [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: 'Home',
      route: '/dashboard',
    },
    // HIER MAAK JE DE "EXTENTIES" GROEP
    {
      id: 'extensions_group', // De unieke ID van de groep
      name: 'EXTENTIES',     // Dit is het label dat je in de sidebar ziet staan
      icon: 'Extensions',    // Het icoon voor de hoofdgroep (indien gewenst)
      children: [            // DIT zorgt voor het in- en uitklappen!
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
  ],
} satisfies Theme