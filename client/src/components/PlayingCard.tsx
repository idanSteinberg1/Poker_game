import React from 'react';
import { motion } from 'framer-motion';

interface PlayingCardProps {
    rank?: string;
    suit?: string;
    hidden?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ rank, suit, hidden = false, className = '', size = 'md' }) => {
    const isRed = suit === '♥' || suit === '♦' || suit === 'Hearts' || suit === 'Diamonds' || (suit && ['h', 'd'].includes(suit.toLowerCase()));

    // Normalize suits to symbols if passed as text
    const getSuitSymbol = (s: string) => {
        if (!s) return '';
        const lower = s.toLowerCase();
        if (lower.startsWith('h') || s === '♥') return '♥';
        if (lower.startsWith('d') || s === '♦') return '♦';
        if (lower.startsWith('c') || s === '♣') return '♣';
        if (lower.startsWith('s') || s === '♠') return '♠';
        return s;
    };

    const displaySuit = getSuitSymbol(suit || '');
    const displayRank = rank === 'T' ? '10' : rank;

    const sizeClasses = {
        sm: 'w-12 h-16 text-xs',
        md: 'w-20 h-28 text-lg',
        lg: 'w-24 h-36 text-xl'
    };

    return (
        <div className={`relative perspective-1000 ${sizeClasses[size]} ${className}`}>
            <motion.div
                initial={false}
                animate={{ rotateY: hidden ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full h-full relative"
            >
                {/* FRONT FACE (0deg) */}
                <div
                    className={`absolute inset-0 backface-hidden bg-white rounded-lg border border-gray-300 shadow-xl flex flex-col items-center justify-between p-2 select-none`}
                    style={{ backfaceVisibility: 'hidden' }}
                >
                    <div className={`absolute top-1 left-1 flex flex-col items-center leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                        <span className="font-bold">{displayRank}</span>
                        <span className="text-[0.8em]">{displaySuit}</span>
                    </div>

                    <div className={`text-4xl ${isRed ? 'text-red-600' : 'text-slate-900'} absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}>
                        {displaySuit}
                    </div>

                    <div className={`absolute bottom-1 right-1 flex flex-col items-center leading-none transform rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                        <span className="font-bold">{displayRank}</span>
                        <span className="text-[0.8em]">{displaySuit}</span>
                    </div>
                </div>

                {/* BACK FACE (180deg) */}
                <div
                    className={`absolute inset-0 backface-hidden bg-blue-900 rounded-lg border-2 border-white/20 shadow-xl overflow-hidden`}
                    style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)'
                    }}
                >
                    <div className="absolute inset-1 border border-dashed border-blue-400/30 rounded opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-800 to-blue-950 flex items-center justify-center">
                        <div className="text-blue-400/20 text-4xl font-black">♠</div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
