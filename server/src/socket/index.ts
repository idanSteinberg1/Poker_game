import { Server, Socket } from 'socket.io';
import { GameState } from '../game/GameState.js';
import jwt from 'jsonwebtoken';
import { TableModel } from '../models/Table.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// Store active games in memory
const games: Map<number, GameState> = new Map();

export const setupSocket = (io: Server) => {
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Authentication error'));

        jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
            if (err) return next(new Error('Authentication error'));
            // @ts-ignore
            socket.user = decoded;
            next();
        });
    });

    io.on('connection', (socket) => {
        // @ts-ignore
        const user = socket.user;
        console.log(`User connected: ${user.username} (${user.userId})`);



        socket.on('join_table', async (tableId: number) => {
            const room = `table_${tableId}`;
            socket.join(room);

            let game = games.get(tableId);
            if (!game) {
                const table = await TableModel.getById(tableId);
                if (!table) {
                    socket.emit('error', { message: 'Table not found' });
                    return;
                }
                game = new GameState(tableId, table.club_id);
                games.set(tableId, game);
            }

            // Robust ID handling due to potential string/number mismatch from JWT
            const userId = Number(user.userId);
            if (isNaN(userId)) {
                socket.emit('error', { message: 'Invalid User ID token' });
                return;
            }

            // Check if player is already in the game (Re-join)
            // Use loose comparison or casted ID
            const existingPlayer = game.players.find(p => p.id === userId);

            if (existingPlayer) {
                console.log(`User ${user.username} re-joining table ${tableId}`);
                // Ensure state hook is set (idempotent)
                if (!game.onStateChange) {
                    game.onStateChange = (state) => {
                        io.to(room).emit('game_state', state);
                    };
                }
                // Send state immediately to re-joining user
                socket.emit('game_state', game.getState());
                return;
            }

            // Add player to game logic
            const result = await game.addPlayer({
                id: userId,
                username: user.username,
                avatar: user.avatar
            });

            if (result.success) {
                // Hook state updates
                if (!game.onStateChange) {
                    game.onStateChange = (state) => {
                        io.to(room).emit('game_state', state);
                    };
                }
                io.to(room).emit('game_state', game.getState());
            } else {
                console.error(`Join failed for ${user.username}: ${result.error}`);
                socket.emit('error', { message: result.error || 'Failed to join table' });
            }
        });

        socket.on('player_ready', ({ tableId, ready }: { tableId: number, ready: boolean }) => {
            const game = games.get(tableId);
            if (game) {
                game.setReady(Number(user.userId), ready);
                io.to(`table_${tableId}`).emit('game_state', game.getState());
            }
        });

        socket.on('leave_table', (tableId: number) => {
            console.log(`[Socket] leave_table received for table ${tableId} from user ${user.username} (${user.userId})`);
            const game = games.get(tableId);
            if (game) {
                const userId = Number(user.userId);
                console.log(`[Socket] Removing player ${userId} from game players: ${game.players.map(p => p.id).join(',')}`);
                game.removePlayer(userId);
                socket.leave(`table_${tableId}`);
                io.to(`table_${tableId}`).emit('game_state', game.getState());
                console.log(`[Socket] User ${user.username} left table ${tableId} explicitly. New player count: ${game.players.length}`);
            } else {
                console.log(`[Socket] Game ${tableId} not found for leave_table request.`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${user.username} (${user.userId})`);

            // Find games where this player is present
            let removedCount = 0;
            games.forEach((game) => {
                // Ensure we compare numbers
                const userIdNum = Number(user.userId);
                const player = game.players.find(p => p.id === userIdNum);

                if (player) {
                    console.log(`[Socket] Found disconnected player ${user.username} in table ${game.tableId}. Removing...`);
                    game.removePlayer(userIdNum);
                    io.to(`table_${game.tableId}`).emit('game_state', game.getState());
                    console.log(`[Socket] Broadcasted new state for table ${game.tableId}. Players remaining: ${game.players.length}`);
                    removedCount++;
                }
            });

            if (removedCount === 0) {
                console.log(`[Socket] Disconnected user ${user.username} was not found in any active games.`);
            }
        });
    });
};
