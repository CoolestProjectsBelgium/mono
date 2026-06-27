import {
    Account,
    Award,
    Event,
    EventTable,
    Location,
    Project,
    ProjectTable,
    Question,
    QuestionRegistration,
    QuestionTranslation,
    QuestionUser,
    Registration,
    Tshirt,
    TshirtGroup,
    TshirtGroupTranslation,
    TshirtTranslation,
    User,
    VoteCategory,
    Voucher
} from '@coolestprojects/database'

import { ConfigService } from '@nestjs/config'
import { Sequelize } from 'sequelize-typescript'

const configService = new ConfigService()

export const sequelize = new Sequelize({
    dialect: configService.get('DB_DIALECT') as any,
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    models: [Event, Award, Location, Project, VoteCategory, Account, EventTable, User, Voucher, ProjectTable, Tshirt, QuestionUser, Question, TshirtGroup, TshirtTranslation, QuestionTranslation, QuestionRegistration, Registration, TshirtGroupTranslation],
    logging: true,
} as any)

await sequelize.authenticate()

export { Account, Award, Event, EventTable, Location, Project, ProjectTable, Question, QuestionRegistration, QuestionTranslation, QuestionUser, Registration, Tshirt, TshirtGroup, TshirtGroupTranslation, TshirtTranslation, User, VoteCategory, Voucher }

