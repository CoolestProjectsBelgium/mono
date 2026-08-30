export class SettingDto {
    startDateEvent!: Date;
    maxAge!: number;
    minAge!: number;
    guardianAge!: number;
    tshirtDate!: Date;
    enviroment!: string;
    waitingListActive!: boolean;
    maxUploadSize!: number;
    isActive!: boolean;
    eventBeginDate!: Date; 
    registrationOpenDate!: Date;
    registrationClosedDate!: Date;
    projectClosedDate!: Date;
    officialStartDate!: Date;
    eventEndDate!: Date;
    eventTitle!: string;
    isRegistrationOpen!: boolean;
    isProjectClosed!: boolean;
    maxRegistration!: number;
    maxParticipants!: number;
    /** Client upload cap; not stored on Event (matches registration MAX_PROJECT_ATTACHMENTS). */
    maxAttachments!: number;
}