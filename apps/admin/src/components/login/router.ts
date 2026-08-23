import express, { type Request, type Response, type NextFunction } from 'express';
import {
    sequelize,
} from '../../database.js'
import { Event } from '@coolestprojects/database';

interface EventList {
    value: string,
    label: string,
    isCurrent: boolean
}

const router = express.Router();

router.get('/events', async (req, res) => {
    try {
        const events = await sequelize.models.Event.findAll({
            attributes: ['id', 'eventTitle', 'current'],
            order: [['eventTitle', 'ASC']],
        }) as Event[]

        const eventList: EventList[] = events.map((e) => ({
            value: String(e.id),
            label: e.eventTitle,
            isCurrent: e.current,
        }))

        res.json(eventList)

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' })
    }
})

export default router;