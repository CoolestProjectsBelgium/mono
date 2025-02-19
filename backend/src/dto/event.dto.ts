export class EventDto {
  azureStorageContainer: string;
  minAge: number;
  maxAge: number;
  minGuardianAge: number;
  maxRegistration: number;
  maxVoucher: number;
  eventBeginDate: Date;
  registrationOpenDate: Date;
  registrationClosedDate: Date;
  projectClosedDate: Date;
  officialStartDate: Date;
  eventEndDate: Date;
  event_title: string;
  maxFileSize: number;
}
