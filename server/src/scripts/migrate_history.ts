
import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.resolve(process.cwd(), 'pokerclub.db');
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
    console.log('Running migration: Add club_id to games table...');

    db.run("ALTER TABLE games ADD COLUMN club_id INTEGER", (err) => {
        if (err) {
            if (err.message.includes('duplicate column name')) {
                console.log('Column club_id already exists. Migration skipped.');
            } else {
                console.error('Error adding column:', err.message);
            }
        } else {
            console.log('Successfully added club_id column to games table.');
        }
    });
});

db.close();
