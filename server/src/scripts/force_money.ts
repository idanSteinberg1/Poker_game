import { run, all } from '../db/index.js';

const forceFix = async () => {
    try {
        console.log('Force updating ALL balances to 50000...');
        const result = await run('UPDATE club_members SET balance = 50000');
        console.log(`Update result:`, result);

        const members = await all('SELECT * FROM club_members');
        console.log('Current Members after update:', JSON.stringify(members, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

forceFix();
