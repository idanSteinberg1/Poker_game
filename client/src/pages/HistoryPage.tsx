import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HistoryService, type HandHistory } from '../services/history';
import { PlayingCard } from '../components/PlayingCard';
import { Button } from '../components/Button'; // Assuming we have a generic Button or use standard

interface ParsedResult {
    pot: number;
    winners: number[];
    payout: number;
    players: {
        id: number;
        username: string;
        cards: any[];
        chips: number;
        roundWins: number;
    }[];
}

const HistoryPage = () => {
    const { tableId } = useParams<{ tableId: string }>();
    const navigate = useNavigate();
    const [history, setHistory] = useState<HandHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (tableId) {
            loadHistory(Number(tableId));
        }
    }, [tableId]);

    const loadHistory = async (tid: number) => {
        try {
            const data = await HistoryService.getTableHistory(tid);
            setHistory(data);
        } catch (error) {
            console.error('Failed to load history', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-white text-center">Loading History...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-yellow-500">Hand History (Table #{tableId})</h1>
                    <Button onClick={() => navigate(-1)} variant="secondary">Back to Game</Button>
                </div>

                <div className="space-y-6">
                    {history.length === 0 ? (
                        <div className="text-gray-400 text-center py-10">No history found for this table yet.</div>
                    ) : (
                        history.map((hand) => {
                            let result: ParsedResult | null = null;
                            try {
                                result = JSON.parse(hand.result_json);
                            } catch (e) {
                                console.error('Error parsing hand result', e);
                            }

                            if (!result) return null;

                            return (
                                <div key={hand.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
                                    <div className="flex justify-between items-start mb-4 border-b border-gray-700 pb-2">
                                        <div>
                                            <span className="text-gray-400 text-sm">Hand #{hand.id}</span>
                                            <span className="mx-2 text-gray-600">|</span>
                                            <span className="text-gray-400 text-sm">{new Date(hand.end_time).toLocaleString()}</span>
                                        </div>
                                        <div className="text-green-400 font-bold">
                                            Pot: ${result.pot.toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="grid gap-4">
                                        {result.players.map((p) => {
                                            const isWinner = result?.winners.includes(p.id);
                                            return (
                                                <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg ${isWinner ? 'bg-yellow-900/20 border border-yellow-500/30' : 'bg-black/20'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className="font-bold w-24 truncate">{p.username}</div>
                                                        <div className="flex -space-x-2">
                                                            {p.cards.map((card, idx) => (
                                                                <div key={idx} className="scale-75 origin-left">
                                                                    {typeof card === 'string' ? (
                                                                        <PlayingCard hidden size="sm" />
                                                                    ) : (
                                                                        <PlayingCard rank={card.rank} suit={card.suit} size="sm" />
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {isWinner && (
                                                            <div className="text-yellow-400 font-bold text-sm">
                                                                WIN +${result?.payout.toLocaleString()}
                                                            </div>
                                                        )}
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Chips: ${p.chips.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;
