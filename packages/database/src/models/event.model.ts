import { Column, Model, Table, DataType } from 'sequelize-typescript';

@Table
export class Event extends Model {
  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare floorplanPath: string;
  @Column(DataType.STRING(200))
  declare folderName: string;
  @Column
  declare minAge: number;
  @Column
  declare maxAge: number;
  @Column
  declare minGuardianAge: number;
  @Column
  declare maxRegistration: number;
  @Column
  declare maxVoucher: number;
  @Column
  declare eventBeginDate: Date;
  @Column
  declare registrationOpenDate: Date;
  @Column
  declare registrationClosedDate: Date;
  @Column
  declare projectClosedDate: Date;
  @Column
  declare officialStartDate: Date;
  @Column
  declare eventEndDate: Date;

  @Column
  declare votingStartDate: Date;
  @Column 
  declare votingEndDate: Date;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        this.getDataValue('votingStartDate') > Date.now() &&
        this.getDataValue('votingEndDate') < Date.now()
      );
    },
  })
  declare votingOpen: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        this.getDataValue('eventBeginDate') < Date.now() &&
        this.getDataValue('eventEndDate') > Date.now()
      );
    },
  })
  declare current: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        Date.now() < this.getDataValue('eventBeginDate') ||
        Date.now() > this.getDataValue('eventEndDate')
      );
    },
  })
  declare closed: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return Date.now() > this.getDataValue('registrationClosedDate');
    },
  })
  declare registrationClosed: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return (
        this.getDataValue('registrationOpenDate') < Date.now() &&
        this.getDataValue('registrationClosedDate') > Date.now()
      );
    },
  })
  declare registrationOpen: boolean;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      return Date.now() > this.getDataValue('projectClosedDate');
    },
  })
  declare projectClosed: boolean;

  @Column
  declare maxFileSize: number;

  @Column
  declare eventTitle: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  declare allowedMimeTypes: string[];
}
