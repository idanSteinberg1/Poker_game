import { run, get, all } from '../db/index.js';

export interface Club {
    id: number;
    name: string;
    code: string;
    owner_id: number;
    created_at: string;
}

export interface ClubMember {
    club_id: number;
    user_id: number;
    role: 'member' | 'agent' | 'manager';
    balance: number;
}

export const ClubModel = {
    async create(name: string, code: string, ownerId: number): Promise<number> {
        const result = await run(
            'INSERT INTO clubs (name, code, owner_id) VALUES (?, ?, ?)',
            [name, code, ownerId]
        );
        return result.id;
    },

    async findByCode(code: string): Promise<Club | undefined> {
        return get<Club>('SELECT * FROM clubs WHERE code = ?', [code]);
    },

    async addMember(clubId: number, userId: number, role: string = 'member'): Promise<void> {
        await run(
            'INSERT INTO club_members (club_id, user_id, role, balance) VALUES (?, ?, ?, ?)',
            [clubId, userId, role, 20000]
        );
    },

    async getMembers(clubId: number): Promise<any[]> {
        return all(
            `SELECT u.id, u.username, u.avatar, cm.role, cm.balance 
       FROM club_members cm 
       JOIN users u ON cm.user_id = u.id 
       WHERE cm.club_id = ?`,
            [clubId]
        );
    },

    async getUserClubs(userId: number): Promise<Club[]> {
        return all<Club>(
            `SELECT c.*, cm.role, cm.balance 
       FROM clubs c 
       JOIN club_members cm ON c.id = cm.club_id 
       WHERE cm.user_id = ?`,
            [userId]
        );
    }
};
