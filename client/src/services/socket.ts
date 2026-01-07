import { io, Socket } from 'socket.io-client';

// Use same URL as API but base
const URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class SocketService {
    public socket: Socket | null = null;

    connect(token: string) {
        if (this.socket) return;

        this.socket = io(URL, {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Connected to Game Server');
        });

        this.socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinTable(tableId: number) {
        if (!this.socket) return;
        this.socket.emit('join_table', tableId);
    }

    leaveTable(tableId: number) {
        if (!this.socket) return;
        this.socket.emit('leave_table', tableId);
    }

    setReady(tableId: number, ready: boolean) {
        if (!this.socket) return;
        this.socket.emit('player_ready', { tableId, ready });
    }

    onGameState(callback: (state: any) => void) {
        if (!this.socket) return;
        this.socket.on('game_state', callback);
    }

    offGameState() {
        if (!this.socket) return;
        this.socket.off('game_state');
    }

    onError(callback: (err: any) => void) {
        if (!this.socket) return;
        this.socket.on('error', callback);
    }
}

export const socketService = new SocketService();
