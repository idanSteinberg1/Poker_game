import type { Request, Response } from 'express';
import { ClubModel } from '../models/Club.js';

// Helper to generate a random code
const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

export const createClub = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        // @ts-ignore - set by auth middleware (to be implemented better later)
        const userId = req.user?.userId;

        if (!name) {
            res.status(400).json({ error: 'Club name is required' });
            return;
        }

        const code = generateCode();
        const clubId = await ClubModel.create(name, code, userId);

        // Add owner as manager/admin
        await ClubModel.addMember(clubId, userId, 'manager');

        res.status(201).json({ message: 'Club created', club: { id: clubId, name, code } });
    } catch (error) {
        console.error('Create club error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const joinClub = async (req: Request, res: Response) => {
    try {
        const { code } = req.body;
        // @ts-ignore
        const userId = req.user?.userId;

        const club = await ClubModel.findByCode(code);
        if (!club) {
            res.status(404).json({ error: 'Club not found' });
            return;
        }

        try {
            await ClubModel.addMember(club.id, userId, 'member');
            res.json({ message: 'Joined club successfully', club });
        } catch (err: any) {
            if (err.message.includes('UNIQUE constraint failed')) {
                res.status(409).json({ error: 'Already a member' });
            } else {
                throw err;
            }
        }
    } catch (error) {
        console.error('Join club error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMyClubs = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        const userId = req.user?.userId;
        const clubs = await ClubModel.getUserClubs(userId);
        res.json(clubs);
    } catch (error) {
        console.error('Get clubs error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
