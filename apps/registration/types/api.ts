export interface AddressDto {
  street: string
  house_number: string
  municipality_name: string
  box_number: string
  postalcode: number
}

export interface UserDto {
  id?: number
  language: 'nl' | 'fr' | 'en'
  email: string
  firstname: string
  lastname: string
  sex: 'm' | 'f' | 'x'
  gsm: string
  general_questions: string[]
  mandatory_approvals: string[]
  year: number
  month: number
  t_size: number
  gsm_guardian: string
  email_guardian: string
  via: string
  medical: string
  delete_possible?: boolean
  address: AddressDto
}

export interface ParticipantDto {
  id: number
  name: string
  self: boolean
  is_owner?: boolean
  status?: 'registered' | 'pending'
  token?: string
}

export interface AttachmentDto {
  id: string
  name: string
  thumbnailUrl: string
}

export interface OwnProjectDto {
  project_id?: string
  project_name: string
  project_descr: string
  project_type: string
  project_lang: 'nl' | 'fr' | 'en'
  participants?: ParticipantDto[]
  attachments?: AttachmentDto[]
  delete_possible?: boolean
  is_owner?: boolean
}

export interface OtherProjectDto {
  project_code: string
}

export interface ProjectDto {
  /** True when the logged-in user created this project (not a voucher co-worker). */
  is_owner?: boolean
  own_project?: OwnProjectDto
  other_project?: OtherProjectDto
  attachments?: AttachmentDto[]
}

export interface RegistrationDto {
  user: UserDto
  project: ProjectDto
}

export interface SettingDto {
  startDateEvent: string
  maxAge: number
  minAge: number
  guardianAge: number
  tshirtDate: string
  enviroment: string
  waitingListActive: boolean
  maxUploadSize: number
  isActive: boolean
  eventBeginDate: string
  registrationOpenDate: string
  registrationClosedDate: string
  projectClosedDate: string
  officialStartDate: string
  eventEndDate: string
  eventTitle: string
  isRegistrationOpen: boolean
  isProjectClosed: boolean
  maxRegistration: number
  maxParticipants: number
  maxAttachments: number
}

export interface TshirtDto {
  id: number
  name: string
}

export interface TshirtGroupDto {
  group: string
  items: TshirtDto[]
}

export interface QuestionDto {
  id: number
  name: string
  description: string
  positive: string
  negative: string
}

export interface ApprovalDto {
  id: number
  name: string
  description: string
}

export interface LoginDto {
  api_key: string
  expires: string
  language: 'nl' | 'fr' | 'en'
}

export interface LoginMailDto {
  email: string
}

export interface LoginActivateDto {
  jwt: string
}

export interface SASToken {
  url: string
  expiresOn: string
  startsOn: string
}

export interface CreateAttachmentDto {
  name: string
  filename: string
  size: number
}
