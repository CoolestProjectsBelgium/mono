import { Model } from 'sequelize-typescript';
export declare class Event extends Model {
    azure_storage_container: string;
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
    current: boolean;
    closed: boolean;
    registrationClosed: boolean;
    registrationOpen: boolean;
    projectClosed: boolean;
    maxFileSize: number;
    event_title: string;
}
