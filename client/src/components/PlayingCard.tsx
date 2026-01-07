import React from 'react';


interface PlayingCardProps {
    rank?: string;
    suit?: string;
    hidden?: boolean;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const PlayingCard: React.FC<PlayingCardProps> = ({ rank, suit, hidden = false, className, size = 'md' }) => {
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

    if (hidden) {
        return (
            <div className={`relative bg-blue-900 rounded-lg border-2 border-white/20 shadow-xl overflow-hidden ${sizeClasses[size]} ${className}`}>
                {/* Back Pattern */}
                <div className="absolute inset-1 border border-dashed border-blue-400/30 rounded opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-800 to-blue-950 flex items-center justify-center">
                    <div className="text-blue-400/20 text-4xl font-black">♠</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`relative bg-white rounded-lg border border-gray-300 shadow-xl flex flex-col items-center justify-between p-2 select-none transform transition-transform hover:-translate-y-1 ${sizeClasses[size]} ${className}`}>
            {/* Top Corner */}
            <div className={`absolute top-1 left-1 flex flex-col items-center leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                <span className="font-bold">{displayRank}</span>
                <span className="text-[0.8em]">{displaySuit}</span>
            </div>

            {/* Center */}
            <div className={`text-4xl ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                {displaySuit}
            </div>

            {/* Bottom Corner (Rotated) */}
            <div className={`absolute bottom-1 right-1 flex flex-col items-center leading-none transform rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
                <span className="font-bold">{displayRank}</span>
                <span className="text-[0.8em]">{displaySuit}</span>
            </div>
        </div>
    );
};
