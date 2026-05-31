import { Sequelize } from 'sequelize-typescript'
import { ConfigService } from '@nestjs/config'
import { Event } from '@coolestprojects/database'
import { Award } from '@coolestprojects/database'
import { Location } from '@coolestprojects/database'
import { Project } from '@coolestprojects/database'
import { VoteCategory } from '@coolestprojects/database'
import { Account } from '@coolestprojects/database'
import { EventTable } from '@coolestprojects/database'
import { User } from '@coolestprojects/database'
import { Voucher } from '@coolestprojects/database'
import { ProjectTable } from '@coolestprojects/database'
import { Tshirt } from '@coolestprojects/database'
import { QuestionUser } from '@coolestprojects/database'
import { Question } from '@coolestprojects/database'
import { TshirtGroup } from '@coolestprojects/database'
import { TshirtTranslation } from '@coolestprojects/database'
import { QuestionTranslation } from '@coolestprojects/database'
import { QuestionRegistration } from '@coolestprojects/database'
import { Registration } from '@coolestprojects/database'
import { TshirtGroupTranslation } from '@coolestprojects/database'

const configService = new ConfigService()

export const sequelize = new Sequelize({
    dialect: configService.get('DB_DIALECT'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    username: configService.get('DB_USER'),
    password: configService.get('DB_PASS'),
    database: configService.get('DB_NAME'),
    models: [Event, Award, Location, Project, VoteCategory, Account, EventTable, User, Voucher, ProjectTable, Tshirt, QuestionUser, Question, TshirtGroup, TshirtTranslation, QuestionTranslation, QuestionRegistration, Registration, TshirtGroupTranslation],
    logging: true,
})

