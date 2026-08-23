import express, { type Request, type Response, type NextFunction } from 'express';
import {
    sequelize,
} from '../../database.js'
import { Event as EventModel } from '@coolestprojects/database';

interface EventList {
    value: string,
    label: string,
    isCurrent: boolean
}

const Event = sequelize.models.Event as typeof EventModel

const router = express.Router();

router.get('/events', async (_req, res) => {
    try {
        const events = await Event.findAll({
            attributes: ['id', 'eventTitle', 'current'],
            order: [['eventTitle', 'ASC']],
        })

        const eventList: EventList[] = events.map((e) => ({
            value: e.id + "",
            label: e.eventTitle,
            isCurrent: e.current,
        }))

        res.json(eventList)

    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' })
    }
})

export default router;