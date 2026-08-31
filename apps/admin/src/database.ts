import 'dotenv/config'
import {
    Account,
    Award,
    Event,
    EventTable,
    EmailTemplate,
    Project,
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
    UserProject,
    Attachment,
    Vote,
    Affiliation,
} from '@coolestprojects/database'

import { ConfigService } from '@nestjs/config'
import { Sequelize } from 'sequelize-typescript'

const configService = new ConfigService()

export const sequelize = new Sequelize({
    dialect: configService.get('DB_DIALECT') as string,
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    models: [
        Event,
        Award,
        Project,
        VoteCategory,
        Account,
        EventTable,
        User,
        UserProject,
        Tshirt,
        QuestionUser,
        Question,
        TshirtGroup,
        TshirtTranslation,
        QuestionTranslation,
        QuestionRegistration,
        Registration,
        TshirtGroupTranslation,
        Attachment,
        Vote,
        Affiliation,
        EmailTemplate,
        Vote
    ],
    logging: process.env.NODE_ENV === 'production' ? false : console.log,
} as any)

await sequelize.authenticate()