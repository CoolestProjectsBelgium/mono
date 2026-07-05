import { Column, Model, Table, DataType } from 'sequelize-typescript';
import { InferAttributes, InferCreationAttributes } from 'sequelize';
import { compareSync, hashSync } from 'bcrypt';

@Table
export class Account extends Model<InferAttributes<Account>, InferCreationAttributes<Account>> {
  @Column
  declare email: string;

  @Column
  declare password: string;

  @Column(DataType.ENUM('super_admin', 'admin', 'jury'))
  declare account_type: 'super_admin' | 'admin' | 'jury';

  verifyPassword(password: string) {
    return compareSync(password, this.password);
  }

  static hashPassword(password: string) {
    const hashedPassword = hashSync(password, 12);
    return hashedPassword;
  }
}
