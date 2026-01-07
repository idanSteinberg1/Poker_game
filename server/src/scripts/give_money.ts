import { run } from '../db/index.js';

const fixBalances = async () => {
    try {
        console.log('Updating balances...');
        const result = await run('UPDATE club_members SET balance = 20000 WHERE balance < 100;');
        console.log(`Updated ${result.changes} users with low balance to 20,000 chips.`);
    } catch (error) {
        console.error('Error updating balances:', error);
    }
};

fixBalances();
