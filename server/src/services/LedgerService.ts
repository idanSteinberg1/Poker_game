import { run, get } from '../db/index.js';

export const LedgerService = {
    /**
     * Deducts chips from a user's wallet in a specific club.
     * Returns true if successful, false if insufficient funds.
     */
    async deductChips(userId: number, clubId: number, amount: number, description: string): Promise<boolean> {
        if (amount < 0) return false;

        // Check balance
        const member = await get<{ balance: number }>(
            'SELECT balance FROM club_members WHERE user_id = ? AND club_id = ?',
            [userId, clubId]
        );

        if (!member || member.balance < amount) {
            return false;
        }

        // Update balance
        await run(
            'UPDATE club_members SET balance = balance - ? WHERE user_id = ? AND club_id = ?',
            [amount, userId, clubId]
        );

        // Record transaction
        await run(
            'INSERT INTO transactions (user_id, club_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [userId, clubId, -amount, 'game_fee', description]
        );

        return true;
    },

    /**
     * Adds chips to a user's wallet.
     */
    async addChips(userId: number, clubId: number, amount: number, description: string): Promise<void> {
        if (amount < 0) return;

        await run(
            'UPDATE club_members SET balance = balance + ? WHERE user_id = ? AND club_id = ?',
            [amount, userId, clubId]
        );

        await run(
            'INSERT INTO transactions (user_id, club_id, amount, type, description) VALUES (?, ?, ?, ?, ?)',
            [userId, clubId, amount, 'game_win', description]
        );
    },

    /**
     * Get current balance
     */
    async getBalance(userId: number, clubId: number): Promise<number> {
        const member = await get<{ balance: number }>(
            'SELECT balance FROM club_members WHERE user_id = ? AND club_id = ?',
            [userId, clubId]
        );
        return member ? member.balance : 0;
    }
};
