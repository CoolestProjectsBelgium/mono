import { Model } from 'sequelize-typescript';
export declare class Account extends Model {
    email: string;
    password: string;
    account_type: string;
    verifyPassword(password: string): boolean;
}
