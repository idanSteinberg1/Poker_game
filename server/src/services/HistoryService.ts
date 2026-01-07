import { run, get, all } from '../db/index.js';

export interface GameRecord {
    id?: number;
    table_id: number;
    club_id: number;
    start_time?: string;
    end_time?: string;
    result_json: string;
}

export class HistoryService {
    static async saveGame(gameData: GameRecord): Promise<number> {
        const sql = `
            INSERT INTO games (table_id, club_id, result_json, end_time)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        const result = await run(sql, [
            gameData.table_id,
            gameData.club_id,
            gameData.result_json
        ]);
        return result.id;
    }

    static async getHistoryByTable(tableId: number, limit: number = 20): Promise<GameRecord[]> {
        const sql = `
            SELECT * FROM games 
            WHERE table_id = ? 
            ORDER BY id DESC 
            LIMIT ?
        `;
        return all<GameRecord>(sql, [tableId, limit]);
    }

    static async getHistoryByClub(clubId: number, limit: number = 50): Promise<GameRecord[]> {
        const sql = `
            SELECT * FROM games 
            WHERE club_id = ? 
            ORDER BY id DESC 
            LIMIT ?
        `;
        return all<GameRecord>(sql, [clubId, limit]);
    }

    static async getHandDetails(gameId: number): Promise<GameRecord | undefined> {
        const sql = `SELECT * FROM games WHERE id = ?`;
        return get<GameRecord>(sql, [gameId]);
    }
}
