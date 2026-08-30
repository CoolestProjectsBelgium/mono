import {
    Column,
    Table,
    DataType,
} from 'sequelize-typescript';
import { BaseEventModel } from './base_event.model.js';

@Table
export class Municipality extends BaseEventModel {

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1000,
            max: 9999,
        },
    })
    postalcode!: number;

    @Column(DataType.STRING(30))
    municipality_name!: string;
}
