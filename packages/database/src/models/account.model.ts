import { Column, Model, Table, DataType } from 'sequelize-typescript';
import {
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize';
import { compareSync, hashSync } from 'bcrypt';

@Table
export class Account extends Model<InferAttributes<Account>, InferCreationAttributes<Account>> {
  @Column
  declare email: string;

  @Column
  declare encryptedPassword: string;

  @Column(DataType.ENUM('super_admin', 'admin', 'jury', 'presentation'))
  declare account_type: 'super_admin' | 'admin' | 'jury' | 'presentation';

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare twoFactorSecret: string | null;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare twoFactorEnabled: CreationOptional<boolean>;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare twoFactorRequired: CreationOptional<boolean>;

  verifyPassword(password: string) {
    return compareSync(password, this.encryptedPassword);
  }

  static hashPassword(password: string) {
    const hashedPassword = hashSync(password, 12);
    return hashedPassword;
  }
}
