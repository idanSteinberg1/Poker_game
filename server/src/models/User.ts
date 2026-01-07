import { run, get } from '../db/index.js';

export interface User {
    id: number;
    username: string;
    password_hash: string;
    avatar?: string;
    role: 'user' | 'superadmin';
    created_at: string;
}

export const UserModel = {
    async create(username: string, passwordHash: string): Promise<number> {
        const result = await run(
            'INSERT INTO users (username, password_hash) VALUES (?, ?)',
            [username, passwordHash]
        );
        return result.id;
    },

    async findByUsername(username: string): Promise<User | undefined> {
        return get<User>('SELECT * FROM users WHERE username = ?', [username]);
    },

    async findById(id: number): Promise<User | undefined> {
        return get<User>('SELECT * FROM users WHERE id = ?', [id]);
    }
};
