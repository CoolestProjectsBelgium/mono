export interface PostalCodeEntry {
  postalcode: number
  municipality_nl: string
  municipality_fr: string
}

export type PostalCodeLocale = 'nl' | 'fr' | 'en'
