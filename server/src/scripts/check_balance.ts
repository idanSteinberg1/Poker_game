import { all } from '../db/index.js';

const check = async () => {
    try {
        const users = await all('SELECT * FROM users');
        console.log('Users:', users);

        const members = await all('SELECT * FROM club_members');
        console.log('Club Members:', members);
    } catch (error) {
        console.error(error);
    }
};

check();
