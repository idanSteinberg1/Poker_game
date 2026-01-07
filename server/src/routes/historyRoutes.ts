import express from 'express';
import { HistoryService } from '../services/HistoryService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/table/:tableId', authenticateToken, async (req, res) => {
    try {
        const { tableId } = req.params;
        const history = await HistoryService.getHistoryByTable(Number(tableId));
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch table history' });
    }
});

router.get('/club/:clubId', authenticateToken, async (req, res) => {
    try {
        const { clubId } = req.params;
        const history = await HistoryService.getHistoryByClub(Number(clubId));
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch club history' });
    }
});

export default router;
