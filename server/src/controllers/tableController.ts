import type { Request, Response } from 'express';
import { TableModel } from '../models/Table.js';

export const createTable = async (req: Request, res: Response) => {
    try {
        const { clubId, name } = req.body;

        if (!clubId || !name) {
            res.status(400).json({ error: 'Club ID and Name are required' });
            return;
        }

        // TODO: Verify user permission (is manager of club) before creating

        const tableId = await TableModel.create(clubId, name);
        res.status(201).json({ message: 'Table created', table: { id: tableId, name } });
    } catch (error) {
        console.error('Create table error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getClubTables = async (req: Request, res: Response) => {
    try {
        const { clubId } = req.params;
        const tables = await TableModel.getByClubId(Number(clubId));
        res.json(tables);
    } catch (error) {
        console.error('Get tables error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
