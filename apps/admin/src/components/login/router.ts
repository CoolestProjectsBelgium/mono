import express, { type Request, type Response, type NextFunction } from 'express';
import {
    sequelize,
} from '../../database.js'

const router = express.Router();

router.get('/events', async (req, res) => {
    try {
        const events = await sequelize.models.Event.findAll({
            attributes: ['id', 'eventTitle', 'current'],
            order: [['eventTitle', 'ASC']],
        })
        res.json(
            events.map((e: any) => ({
                value: String(e.id),
                label: e.eventTitle,
                isCurrent: e.current,
            }))
        )
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' })
    }
})

export default router;