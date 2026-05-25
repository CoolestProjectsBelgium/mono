import { Sequelize } from 'sequelize-typescript'
import { ConfigService } from '@nestjs/config'
import { Event } from '../models/event.model'

const configService = new ConfigService()

export const sequelize = new Sequelize({
    dialect: configService.get('DB_DIALECT'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    models: [Event],
    logging: false,
})

