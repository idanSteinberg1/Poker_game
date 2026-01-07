import type { Request, Response } from 'express';
import { run, all } from '../db/index.js';
import { LedgerService } from '../services/LedgerService.js';

export const adminController = {
    // Get all transactions
    async getLogs(req: Request, res: Response) {
        try {
            const logs = await all(
                `SELECT t.*, u.username 
         FROM transactions t 
         JOIN users u ON t.user_id = u.id 
         ORDER BY t.timestamp DESC 
         LIMIT 100`
            );
            res.json(logs);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch logs' });
        }
    },

    // Add chips to user (Deposit)
    async addChips(req: Request, res: Response) {
        const { userId, clubId, amount } = req.body;

        if (!userId || !clubId || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        try {
            await LedgerService.addChips(userId, clubId, amount, 'admin_deposit');
            res.json({ success: true, message: 'Chips added successfully' });
        } catch (err) {
            res.status(500).json({ error: 'Failed to add chips' });
        }
    },

    // Get all users for selection
    async getUsers(req: Request, res: Response) {
        try {
            const users = await all('SELECT id, username, role FROM users');
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
};
