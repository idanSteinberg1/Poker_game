import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { motion } from 'framer-motion';
import api from '../services/api';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });



    const onSubmit = async (data: LoginForm) => {
        try {
            const response = await api.post('/auth/login', {
                username: data.username,
                password: data.password
            });
            console.log('Login success', response.data);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Login failed', error.response?.data || error.message);
            alert('Login Failed: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-black p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/5 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-black/40 backdrop-blur-xl p-8 rounded-3xl shadow-2xl w-full max-w-md border border-white/5 relative z-10"
            >
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/poker-logo.png"
                        alt="Poker Club Logo"
                        className="w-32 h-32 object-contain mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    />
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm tracking-tight">
                        POKER CLUB
                    </h2>
                    <p className="text-yellow-500/60 text-sm tracking-[0.2em] font-medium mt-1">PREMIUM EXPERIENCE</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1">
                        <Input
                            label=""
                            placeholder="Username"
                            registration={register('username')}
                            error={errors.username?.message}
                        // Custom styling for input via class props if component supports (or modifying Input)
                        />
                    </div>
                    <div className="space-y-1">
                        <Input
                            label=""
                            type="password"
                            placeholder="Password"
                            registration={register('password')}
                            error={errors.password?.message}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.2)] hover:shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                        {isSubmitting ? 'AUTHENTICATING...' : 'ENTER CLUB'}
                    </button>
                </form>

                <p className="mt-8 text-center text-neutral-400 text-sm">
                    New Member?{' '}
                    <Link to="/register" className="text-yellow-400 hover:text-yellow-300 font-medium hover:underline transition-all">
                        Apply for Membership
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
