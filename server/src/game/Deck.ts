export interface Card {
    suit: 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
    rank: string; // 2-10, J, Q, K, A
    value: number;
}

const SUITS: ('H' | 'D' | 'C' | 'S')[] = ['H', 'D', 'C', 'S'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export class Deck {
    private cards: Card[] = [];

    constructor() {
        this.reset();
    }

    reset() {
        this.cards = [];
        for (const suit of SUITS) {
            for (let i = 0; i < RANKS.length; i++) {
                this.cards.push({
                    suit,
                    rank: RANKS[i]!,
                    value: i + 2 // 2=2, ..., 10=10, J=11, Q=12, K=13, A=14
                });
            }
        }
        this.shuffle();
    }

    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const cardI = this.cards[i];
            const cardJ = this.cards[j];
            if (cardI && cardJ) {
                this.cards[i] = cardJ;
                this.cards[j] = cardI;
            }
        }
    }

    deal(count: number): Card[] {
        return this.cards.splice(0, count);
    }
}
