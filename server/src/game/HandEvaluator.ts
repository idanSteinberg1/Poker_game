import type { Card } from './Deck.js';

// Simple evaluator for 2 cards (Pair > High Card)
// Returns a numeric score for comparison
export class HandEvaluator {
    static getScore(cards: Card[]): number {
        if (cards.length !== 2) return 0;

        const c1 = cards[0];
        const c2 = cards[1];

        if (!c1 || !c2) return 0;

        // Check Pair
        if (c1.rank === c2.rank) {
            // Pair score: 1000 + card value
            return 1000 + c1.value;
        }

        // High Card
        // Score: HighValue * 10 + LowValue
        // This ensures Aces (14) beat Kings (13) etc.
        const high = Math.max(c1.value, c2.value);
        const low = Math.min(c1.value, c2.value);
        return high * 14 + low;
    }

    static getWinner(playersCards: { playerId: number, cards: Card[] }[]): number[] {
        let bestScore = -1;
        let winners: number[] = [];

        for (const p of playersCards) {
            const score = this.getScore(p.cards);
            if (score > bestScore) {
                bestScore = score;
                winners = [p.playerId];
            } else if (score === bestScore) {
                winners.push(p.playerId);
            }
        }

        return winners;
    }
}
