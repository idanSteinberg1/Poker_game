import sqlite3 from 'sqlite3';
import { SCHEMA } from './schema.js';
import path from 'path';

// Enable verbose mode for debugging
const sqlite = sqlite3.verbose();

const DB_PATH = path.resolve(process.cwd(), 'pokerclub.db');

export const db = new sqlite.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database at', DB_PATH);
        initDb();
    }
});

function initDb() {
    db.exec(SCHEMA, (err) => {
        if (err) {
            console.error('Error initializing database schema:', err.message);
        } else {
            console.log('Database schema initialized.');
        }
    });
}

// Promisified helpers
export function run(sql: string, params: any[] = []): Promise<{ id: number; changes: number }> {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}

export function get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row as T);
        });
    });
}

export function all<T>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows as T[]);
        });
    });
}
