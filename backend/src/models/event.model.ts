import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Event extends Model {
  @Column(DataType.STRING(200))
  azure_storage_container: string;
  @Column
  minAge: number;
  @Column
  maxAge: number;
  @Column
  minGuardianAge: number;
  @Column
  maxRegistration: number;
  @Column
  maxVoucher: number;
  @Column
  eventBeginDate: Date;
  @Column
  registrationOpenDate: Date;
  @Column
  registrationClosedDate: Date;
  @Column
  projectClosedDate: Date;
  @Column
  officialStartDate: Date;
  @Column
  eventEndDate: Date;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        this.getDataValue('eventBeginDate') < Date.now() &&
        this.getDataValue('eventEndDate') > Date.now()
      );
    },
  })
  current: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        Date.now() < this.getDataValue('eventBeginDate') ||
        Date.now() > this.getDataValue('eventEndDate')
      );
    },
  })
  closed: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return Date.now() > this.getDataValue('registrationClosedDate');
    },
  })
  registrationClosed: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        this.getDataValue('registrationOpenDate') < Date.now() &&
        this.getDataValue('registrationClosedDate') > Date.now()
      );
    },
  })
  registrationOpen: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return Date.now() > this.getDataValue('projectClosedDate');
    },
  })
  projectClosed: boolean;

  @Column
  maxFileSize: number;

  @Column
  event_title: string;
}
