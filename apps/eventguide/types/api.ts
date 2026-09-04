export interface EventguideEvent {
  id: number
  title: string
  officialStartDate: string
  floorplanPath: string
}

export interface EventguideProject {
  id: number
  name: string
  description: string
  language: 'nl' | 'fr' | 'en'
  tableNumber: number | null
  tableName: string | null
  participants: string[]
  agreedToPhoto: boolean
  thumbnailUrl: string | null
}

export interface EventguideProjectsResponse {
  event: EventguideEvent
  projects: EventguideProject[]
}
