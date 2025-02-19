import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { compareSync } from 'bcrypt';

@Table
export class Account extends Model {
  @Column
  email: string;

  @Column
  password: string;

  @Column(DataType.ENUM('super_admin', 'admin', 'jury'))
  account_type: string;

  verifyPassword(password: string) {
    return compareSync(password, this.password);
  }
}
