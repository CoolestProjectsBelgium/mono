import {
    sequelize,
} from '../../database.js'
import { Account } from '@coolestprojects/database'
import { Op } from 'sequelize'

export const Authenticate = async (email: string, password: string, context: any) => {
    const eventId = ((context?.req as unknown) as Request & { fields?: Record<string, any> })?.fields?.event
    const account = await sequelize.models.Account.findOne({ where: { email, account_type: { [Op.in]: ['admin', 'super_admin'] } } }) as Account | null;

    if (account) {
        const isPasswordValid = account.verifyPassword(password)
        if (isPasswordValid) {
            return { id: account.id, email: account.email, eventId, role: account.account_type }
        }
    }
    return null
}