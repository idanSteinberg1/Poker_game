import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socketService } from '../services/socket';
import { Button } from '../components/Button';
import { Coins } from 'lucide-react';
import { PlayingCard } from '../components/PlayingCard';

// Types for Game State (mirroring backend)
interface Player {
    id: number;
    username: string;
    avatar?: string;
    seatId: number;
    chips: number;
    ready: boolean;
    cards: { suit: string; rank: string }[];
    roundWins: number;
}

interface GameState {
    tableId: number;
    phase: 'waiting' | 'dealing' | 'revealing' | 'payout';
    pot: number;
    currentRound: number;
    lastRoundResult?: {
        round: number;
        winners: number[];
        payout: number;
    };
    players: Player[];
}

const GamePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [myUserId, setMyUserId] = useState<number | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Simple JWT decode to get ID for rotation
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const payload = JSON.parse(jsonPayload);
            setMyUserId(Number(payload.userId));
        } catch (e) {
            console.error("Failed to decode token", e);
        }

        socketService.connect(token);

        if (id) {
            socketService.joinTable(Number(id));
        }

        socketService.onGameState((state) => {
            console.log('Game State Update:', state);
            setGameState(state);
        });

        socketService.onError((err) => {
            console.error('Socket Error:', err);
            alert(`Failed to join table: ${err.message}`);
            navigate(-1);
        });

        return () => {
            if (id) {
                socketService.leaveTable(Number(id));
            }
            socketService.offGameState();
            socketService.disconnect();
        };
    }, [id, navigate]);

    if (!gameState) return <div className="text-center text-white p-20">Connecting to table...</div>;

    const toggleReady = () => {
        socketService.setReady(Number(id), true);
    };

    const handleLeave = () => {
        if (id) {
            socketService.leaveTable(Number(id));
        }
        navigate(-1);
    };

    // Table Rotation Logic
    const myPlayer = gameState.players.find(p => p.id === myUserId);
    const mySeatId = myPlayer ? myPlayer.seatId : -1; // Default to 0 rotation if not seated

    // positions array defined below maps visual slots 0-4


    return (
        <div className="min-h-screen bg-[#0a1e11] p-4 relative overflow-hidden flex items-center justify-center font-sans selection:bg-yellow-500/30">
            {/* Background Texture - radiating green pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a4c28_0%,_#0d2e16_60%,_#05140a_100%)]"></div>
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-felt.png')]"></div>

            {/* Main Table Structure */}
            <div className="relative w-full max-w-[1400px] aspect-[2/1] md:aspect-[2.3/1] max-h-[85vh] flex items-center justify-center">

                {/* Wood Border (Rim) */}
                <div className="absolute inset-4 md:inset-10 rounded-[1000px] border-[24px] md:border-[40px] border-[#5d3a1a] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_5px_20px_rgba(255,255,255,0.1),inset_0_-5px_20px_rgba(0,0,0,0.5)] z-0 bg-[#3d2611]">
                    {/* Wood Grain Effect (Simulated) */}
                    <div className="absolute inset-0 rounded-[1000px] border-[2px] border-[#704823] opacity-50"></div>
                </div>

                {/* Green Felt Surface */}
                <div className="absolute inset-[30px] md:inset-[54px] rounded-[900px] bg-[#1a472a] shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] overflow-hidden z-0">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_20%,_rgba(0,0,0,0.4)_100%)]"></div>
                    {/* Optional: subtle felt texture overlay */}
                </div>

                {/* Center Graphics */}
                <div className="absolute top-[38%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-30 select-none pointer-events-none">
                    <img
                        src="/poker-logo.png"
                        alt="Poker Club"
                        className="w-40 h-40 md:w-64 md:h-64 object-contain drop-shadow-2xl filter brightness-0 invert opacity-80"
                    />
                    <div className="text-[#e2c08d] font-serif font-black text-3xl md:text-5xl tracking-[0.2em] mt-[-10px] drop-shadow-lg uppercase whitespace-nowrap opacity-60">
                        Poker Club
                    </div>
                </div>

                {/* Pot Display (Floating Center) */}
                <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center w-full pointer-events-none">
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#86cfa0] mb-1 drop-shadow-md">Total Pot</div>
                    <div className="flex items-center gap-2 bg-black/40 px-6 py-2 rounded-full border border-[#e2d098]/20 backdrop-blur-sm shadow-xl transition-all duration-300 hover:bg-black/50">
                        <Coins className="w-5 h-5 md:w-8 md:h-8 text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                        <span className="text-2xl md:text-4xl font-bold text-white tracking-wide font-mono shadow-black drop-shadow-md">
                            ${gameState.pot.toLocaleString()}
                        </span>
                    </div>

                    {/* Game Phase Indicator */}
                    <div className="mt-3 flex items-center gap-2">
                        <span className="px-3 py-1 bg-[#1a472a]/80 rounded text-[10px] md:text-xs text-green-200 font-bold uppercase border border-white/10 shadow-lg">
                            {gameState.phase === 'waiting' ? 'Waiting for Players' : gameState.phase}
                        </span>
                        {gameState.currentRound > 0 && (
                            <span className="px-3 py-1 bg-yellow-600/80 rounded text-[10px] md:text-xs text-white font-bold uppercase border border-white/10 shadow-lg">
                                Round {gameState.currentRound}/3
                            </span>
                        )}
                    </div>
                </div>

                {/* Seats & Players */}
                {/* We iterate fixed 5 slots (0 to 4) and find which player is in relative position */}
                {[0, 1, 2, 3, 4].map((relativePos) => {
                    // We need to find the player whose rotated position equals this relativePos
                    // relativePos = (seatId - mySeatId + 5) % 5
                    // seatId = (relativePos + mySeatId) % 5
                    const anchorSeat = mySeatId === -1 ? 0 : mySeatId;
                    const actualSeatId = (relativePos + anchorSeat) % 5;
                    const player = gameState.players.find(p => p.seatId === actualSeatId);

                    // Refined Positions matching the provided image style
                    // 0: Bottom Center (Me)
                    // 1: Bottom Right (slightly up)
                    // 2: Top Right
                    // 3: Top Left
                    // 4: Bottom Left
                    const positions = [
                        { bottom: '-5%', left: '50%', transform: 'translate(-50%, 0)' },   // Seat 0 (Me) - Pushed down
                        { top: '55%', left: '96%', transform: 'translate(-50%, -50%)' },   // Seat 1
                        { top: '15%', left: '80%', transform: 'translate(-50%, -50%)' },   // Seat 2
                        { top: '15%', left: '20%', transform: 'translate(-50%, -50%)' },   // Seat 3
                        { top: '55%', left: '4%', transform: 'translate(-50%, -50%)' },    // Seat 4
                    ];

                    const pos = positions[relativePos];
                    const isMe = player?.id === myUserId;

                    return (
                        <div
                            key={actualSeatId}
                            className={`absolute flex flex-col items-center z-20 transition-all duration-500`}
                            style={pos}
                        >
                            {player ? (
                                <div className="relative group flex flex-col items-center">
                                    {/* Avatar Glow Ring if Active/Winning */}
                                    <div className={`relative transition-all duration-300 ${player.ready ? 'scale-100' : 'scale-95 opacity-90'}`}>

                                        {/* Avatar Container */}
                                        <div className={`w-16 h-16 md:w-24 md:h-24 rounded-full border-[4px] ${isMe ? 'border-yellow-500 box-shadow-yellow' : 'border-[#2a2a2a]'} bg-[#1a1a1a] flex items-center justify-center overflow-hidden shadow-[0_10px_20px_rgba(0,0,0,0.8)] relative z-10`}>
                                            {player.avatar ? (
                                                <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isMe ? 'from-yellow-900 to-yellow-600' : 'from-gray-800 to-black'}`}>
                                                    <span className={`text-2xl md:text-3xl font-bold ${isMe ? 'text-yellow-100' : 'text-gray-400'}`}>
                                                        {player.username[0].toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status / Ready Indicator */}
                                        {!player.ready && gameState.phase === 'waiting' && (
                                            <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-[#1a1a1a] z-20 animate-pulse"></div>
                                        )}
                                    </div>

                                    {/* Info Pill (Name + Chips) */}
                                    <div className="mt-[-12px] relative z-20 flex flex-col items-center">
                                        <div className="bg-[#121212] px-3 py-1 rounded-t-lg border-x border-t border-white/10 w-[90px] md:w-[110px] flex justify-center">
                                            <span className="text-[10px] md:text-xs font-bold text-gray-300 truncate max-w-full">{player.username}</span>
                                        </div>
                                        <div className="bg-gradient-to-b from-[#1a1a1a] to-[#000] px-2 py-1 rounded-b-lg border border-white/10 shadow-lg w-[100px] md:w-[120px] flex items-center justify-center gap-1.5 transform hover:scale-105 transition-transform">
                                            <Coins className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs md:text-sm font-bold text-yellow-400 font-mono tracking-tight">${player.chips.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Cards Display */}
                                    {/* Position adjustment based on seat to push cards towards center */}
                                    <div className={`absolute flex -space-x-8 md:-space-x-10 transition-all duration-300 pointer-events-none
                                        ${relativePos === 0 ? 'bottom-full mb-4' : ''}
                                        ${relativePos === 1 ? 'right-full mr-2 -mt-10' : ''}
                                        ${relativePos === 2 ? 'right-full mr-2 mt-4' : ''}
                                        ${relativePos === 3 ? 'left-full ml-2 mt-4' : ''}
                                        ${relativePos === 4 ? 'left-full ml-2 -mt-10' : ''}
                                    `}>
                                        {player.cards.map((card, idx) => (
                                            <div key={idx} className={`transform transition-transform duration-500 ${isMe ? 'hover:-translate-y-6 hover:scale-110 z-20' : 'scale-90 opacity-90'}`} style={{ zIndex: idx }}>
                                                {typeof card === 'string' ? (
                                                    <PlayingCard hidden size={isMe ? 'lg' : 'sm'} className={`${isMe ? 'shadow-[0_10px_30px_rgba(0,0,0,0.8)]' : 'shadow-lg'}`} />
                                                ) : (
                                                    <PlayingCard rank={card.rank} suit={card.suit} size={isMe ? 'lg' : 'sm'} className={`${isMe ? 'shadow-[0_10px_30px_rgba(0,0,0,0.8)] border-yellow-500/30' : 'shadow-lg'}`} />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Win Amount Popup */}
                                    {gameState.lastRoundResult?.winners.includes(player.id) && gameState.phase === 'payout' && (
                                        <div className="absolute top-[-40px] animate-bounce bg-yellow-500 text-black font-black px-3 py-1 rounded-full shadow-xl border-2 border-white z-50 text-sm whitespace-nowrap">
                                            +${gameState.lastRoundResult.payout}
                                        </div>
                                    )}

                                </div>
                            ) : (
                                // Empty Seat
                                <div className="group relative w-16 h-16 md:w-24 md:h-24 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center bg-black/20 hover:bg-black/40 hover:border-yellow-500/40 cursor-pointer backdrop-blur-sm transition-all duration-300">
                                    <div className="flex flex-col items-center opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xl md:text-2xl text-white">+</span>
                                        <span className="text-[9px] uppercase font-bold tracking-widest text-white mt-[-2px]">Sit</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Bottom Controls (Fixed) */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-50">
                <Button onClick={toggleReady} size="lg" disabled={gameState.phase !== 'waiting'} className={`px-12 py-6 text-lg font-black uppercase tracking-widest border-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 active:scale-95
                     ${gameState.phase === 'waiting'
                        ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 border-yellow-300 text-black shadow-yellow-500/20'
                        : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed opacity-50'
                    }`}>
                    {gameState.phase === 'waiting' ? 'Deal Cards' : 'In Game'}
                </Button>
            </div>

            {/* Top Left Menu */}
            <div className="absolute top-6 left-6 z-50 flex gap-4">
                <Button variant="ghost" onClick={handleLeave} className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-red-900/40 border border-white/10 hover:border-red-500/50 backdrop-blur-md flex items-center justify-center transition-all group" title="Leave Table">
                    <span className="text-xl group-hover:scale-125 transition-transform text-gray-400 group-hover:text-red-400">×</span>
                </Button>
                <Button variant="ghost" onClick={() => navigate(`/history/${id}`)} className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-blue-900/40 border border-white/10 hover:border-blue-500/50 backdrop-blur-md flex items-center justify-center transition-all group" title="Hand History">
                    <span className="text-sm font-bold group-hover:scale-110 transition-transform text-gray-400 group-hover:text-blue-400">📜</span>
                </Button>
                <Button variant="ghost" onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Link copied to clipboard! Share it with friends.");
                }} className="h-10 w-10 p-0 rounded-full bg-black/40 hover:bg-green-900/40 border border-white/10 hover:border-green-500/50 backdrop-blur-md flex items-center justify-center transition-all group" title="Share Table Link">
                    <span className="text-sm font-bold group-hover:scale-110 transition-transform text-gray-400 group-hover:text-green-400">🔗</span>
                </Button>
            </div>
        </div>
    );
};

export default GamePage;
