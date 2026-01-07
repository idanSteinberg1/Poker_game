import { Deck, type Card } from './Deck.js';
import { HandEvaluator } from './HandEvaluator.js';
import { LedgerService } from '../services/LedgerService.js';
import { HistoryService } from '../services/HistoryService.js';

export interface Player {
    id: number;
    username: string;
    avatar?: string;
    seatId: number; // 0-4
    chips: number;
    ready: boolean;
    cards: Card[];
    roundWins: number; // 0-3
    currentBet: number; // For tracking Pot contributions if needed
}

export type GamePhase = 'waiting' | 'dealing' | 'revealing' | 'payout' | 'ended';

interface RoundResult {
    round: number;
    winners: number[];
    payout: number;
}

export class GameState {
    tableId: number;
    clubId: number;
    players: Player[] = [];
    deck: Deck;
    phase: GamePhase = 'waiting';
    pot: number = 0;

    // Config
    ante: number = 10;
    currentRound: number = 0;

    MAX_SEATS = 5;
    ROUNDS_COUNT = 3;

    lastRoundResult: RoundResult | null = null;
    onStateChange: ((state: any) => void) | null = null;

    constructor(tableId: number, clubId: number, config: any = {}) {
        this.tableId = tableId;
        this.clubId = clubId;
        this.ante = config.ante || 10;
        this.deck = new Deck();
    }

    async addPlayer(player: Partial<Player>): Promise<{ success: boolean; error?: string }> {
        if (this.players.length >= this.MAX_SEATS) return { success: false, error: 'Table is full' };

        // Ensure ID is a number
        const playerId = Number(player.id);
        if (isNaN(playerId)) return { success: false, error: 'Invalid User ID' };

        if (this.players.find(p => p.id === playerId)) return { success: false, error: 'Player already at table' };

        // Check Ledger Balance
        const balance = await LedgerService.getBalance(playerId, this.clubId);
        if (balance < this.ante) return { success: false, error: `Insufficient funds. Need $${this.ante}, have $${balance}` };

        // Find first empty seat
        const takenSeats = this.players.map(p => p.seatId);
        let seatId = 0;
        while (takenSeats.includes(seatId)) seatId++;

        this.players.push({
            id: playerId,
            username: player.username!,
            ...(player.avatar ? { avatar: player.avatar } : {}),
            seatId,
            chips: balance,
            ready: false,
            cards: [],
            roundWins: 0,
            currentBet: 0
        });
        this.notify();
        return { success: true };
    }

    removePlayer(userId: number) {
        this.players = this.players.filter(p => p.id !== userId);
        if (this.players.length < 2) {
            this.phase = 'waiting';
            this.currentRound = 0;
            this.pot = 0;
        }
        this.notify();
    }

    setReady(userId: number, ready: boolean) {
        const player = this.players.find(p => p.id === userId);
        if (player) player.ready = ready;
        this.notify();
        this.checkAutoStart();
    }

    checkAutoStart() {
        if (this.phase !== 'waiting') return;
        if (this.players.length > 1 && this.players.every(p => p.ready)) {
            this.startGame();
        }
    }

    async startGame() {
        this.phase = 'dealing';
        this.deck.reset();
        this.currentRound = 0;
        this.pot = 0;
        this.lastRoundResult = null;

        // Collect Ante Transactionally
        const activePlayers: Player[] = [];

        for (const p of this.players) {
            const success = await LedgerService.deductChips(p.id, this.clubId, this.ante, `Ante for Game ${this.tableId}`);
            if (success) {
                p.chips -= this.ante;
                this.pot += this.ante;
                activePlayers.push(p);
            } else {
                p.ready = false; // Sit out if cannot pay
            }
        }

        // Deal only to those who paid
        activePlayers.forEach(p => {
            p.cards = this.deck.deal(6);
            p.roundWins = 0;
            p.ready = false;
        });

        this.notify();

        // Delay to show dealing animation
        setTimeout(() => {
            this.startRound(1);
        }, 2000);
    }

    startRound(roundNumber: number) {
        if (roundNumber > this.ROUNDS_COUNT) {
            this.endGame();
            return;
        }

        this.phase = 'revealing';
        this.currentRound = roundNumber;
        this.notify();

        // Allow some time for reveal animation
        setTimeout(() => {
            this.evaluateRound(roundNumber);
        }, 3000);
    }

    async evaluateRound(roundNumber: number) {
        this.phase = 'payout';

        // Cards indices for this round: 
        // Round 1: 0, 1
        // Round 2: 2, 3
        // Round 3: 4, 5
        const startIndex = (roundNumber - 1) * 2;

        const playersHands = this.players.map(p => ({
            playerId: p.id,
            cards: p.cards.slice(startIndex, startIndex + 2)
        }));

        const winnerIds = HandEvaluator.getWinner(playersHands);

        // Payout logic: 1/3 of TOTAL pot per round? 
        // Or accumulated pot?
        // Flips usually splits the pot into 3 equal parts initially?
        // Let's assume Pot is total collected ante. We distribute Pot / 3 each round.
        // We need to be careful with divisions. 
        // Safer: Distribute Math.floor(Pot / 3). Remainder usually goes to last round or High chip.
        // For simplicity: We calculate "Round Pot" as TotalPot / 3.

        const roundPot = Math.floor(this.pot / this.ROUNDS_COUNT); // This might leave remainder
        // To handle remainder, maybe add it to last round? 
        // For now, simple floor.

        const winAmount = Math.floor(roundPot / winnerIds.length);

        for (const id of winnerIds) {
            const p = this.players.find(pl => pl.id === id);
            if (p) {
                p.chips += winAmount;
                p.roundWins++;
                await LedgerService.addChips(p.id, this.clubId, winAmount, `Win Round ${roundNumber}`);
            }
        }

        this.lastRoundResult = {
            round: roundNumber,
            winners: winnerIds,
            payout: winAmount
        };

        this.notify();

        setTimeout(() => {
            this.startRound(roundNumber + 1);
        }, 3000);
    }

    async endGame() {
        this.phase = 'ended';
        // Handle remainder of pot if any? 
        // (pot - (pot/3)*3)
        // For now ignore small change.

        // Save Game History
        try {
            const resultJson = JSON.stringify({
                pot: this.pot,
                winners: this.lastRoundResult?.winners || [],
                payout: this.lastRoundResult?.payout || 0,
                players: this.players.map(p => ({
                    id: p.id,
                    username: p.username,
                    cards: p.cards,
                    chips: p.chips, // Logic for net profit can be added here if we tracked start chips
                    roundWins: p.roundWins
                }))
            });

            await HistoryService.saveGame({
                table_id: this.tableId,
                club_id: this.clubId,
                result_json: resultJson
            });
            console.log(`[GameState] Game saved to history for table ${this.tableId}`);
        } catch (err) {
            console.error('[GameState] Failed to save game history:', err);
        }

        this.notify();

        // Reset to waiting after delay
        setTimeout(() => {
            this.phase = 'waiting';
            this.currentRound = 0;
            this.players.forEach(p => p.cards = []); // clear cards
            this.notify();
        }, 5000);
    }

    notify() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }

    getState() {
        return {
            tableId: this.tableId,
            phase: this.phase,
            pot: this.pot,
            currentRound: this.currentRound,
            lastRoundResult: this.lastRoundResult,
            players: this.players.map(p => ({
                ...p,
                // Only show cards relevant to CURRENT or PAST rounds
                // If round 1 (revealing), show 0-1.
                // If round 2, show 0-3.
                cards: p.cards.map((c, idx) => {
                    const roundOfCard = Math.floor(idx / 2) + 1;
                    // If Phase is revealing, we verify if this card belongs to current or previous round
                    // If Phase is waiting/dealing, hide all.
                    // If ended, show all.

                    if (this.phase === 'ended') return c;
                    if (this.phase === 'waiting' || this.phase === 'dealing') return 'back';

                    // In revealing/payout:
                    // If this card is from a future round, hide it.
                    if (roundOfCard > this.currentRound) return 'back';

                    return c;
                })
            }))
        };
    }
}
