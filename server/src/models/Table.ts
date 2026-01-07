import { run, get, all } from '../db/index.js';

export interface Table {
    id: number;
    club_id: number;
    name: string;
    status: 'active' | 'closed';
    config_json: string;
    created_at: string;
}

export const TableModel = {
    async create(clubId: number, name: string): Promise<number> {
        const result = await run(
            'INSERT INTO tables (club_id, name) VALUES (?, ?)',
            [clubId, name]
        );
        return result.id;
    },

    async getByClubId(clubId: number): Promise<Table[]> {
        return all<Table>('SELECT * FROM tables WHERE club_id = ? AND status = "active"', [clubId]);
    },

    async getById(id: number): Promise<Table | undefined> {
        return get<Table>('SELECT * FROM tables WHERE id = ?', [id]);
    }
};
