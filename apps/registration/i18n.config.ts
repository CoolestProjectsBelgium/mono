import nl from './locales/nl.json'
import fr from './locales/fr.json'
import en from './locales/en.json'
import { longDateFormat } from './composables/useLongDate'

export default defineI18nConfig(() => ({
  legacy: false,
  messages: {
    nl,
    fr,
    en,
  },
  datetimeFormats: {
    nl: { long: longDateFormat },
    fr: { long: longDateFormat },
    en: { long: longDateFormat },
  },
}))
