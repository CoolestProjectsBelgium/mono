export interface VotingUser {
  id: number
  email: string
  eventId: number
  votingStartDate: string
  votingEndDate: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  jwt: string
}

export interface LanguageOption {
  id: string
  text: string
}

export interface VoteCategory {
  id: number
  name: string
  max: number
  optional: boolean
  value?: number
}

export interface ProjectVote {
  project_id: number
  title: string
  description: string
  language: string
  categories: VoteCategory[]
  location: string
}

export interface FinishedResponse {
  message: 'finished'
}

export type ProjectsResponse = ProjectVote | FinishedResponse

export type VotingSseEventType = 'message' | 'timer'

export interface VotingSseEvent {
  type: VotingSseEventType
  message: string
  startDate?: string
  endDate?: string
}
