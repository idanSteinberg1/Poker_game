import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black p-4 relative overflow-hidden">

            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-yellow-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-yellow-600/5 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, type: "spring" }}
                className="text-center relative z-10 max-w-2xl px-6"
            >
                <motion.img
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    src="/poker-logo.png"
                    alt="Poker Club Logo"
                    className="w-48 h-48 object-contain mx-auto mb-6 drop-shadow-[0_0_30px_rgba(234,179,8,0.4)]"
                />

                <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 mb-6 drop-shadow-lg tracking-tighter">
                    POKER CLUB
                </h1>

                <p className="text-2xl text-yellow-100/80 mb-12 font-light leading-relaxed tracking-wide">
                    The ultimate premium experience for <b className="text-yellow-400 font-bold">Flips</b>. <br />
                    <span className="text-lg opacity-70 mt-2 block">Private Clubs • High Stakes • Real Thrill</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(234,179,8,0.6)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/login')}
                        className="px-10 py-4 bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-xl font-extrabold text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all uppercase tracking-widest text-lg min-w-[200px]"
                    >
                        Login
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/register')}
                        className="px-10 py-4 bg-white/5 border border-yellow-500/30 rounded-xl font-bold text-yellow-100 shadow-lg hover:border-yellow-400/60 transition-all backdrop-blur-md uppercase tracking-widest text-lg min-w-[200px]"
                    >
                        Join Now
                    </motion.button>
                </div>
            </motion.div>

            <div className="absolute bottom-10 text-yellow-500/30 text-xs tracking-[0.3em] font-mono">
                EST. 2026 • POKER CLUB ELITE
            </div>
        </div>
    );
};

export default LandingPage;
