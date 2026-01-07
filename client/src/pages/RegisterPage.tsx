import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../components/Input';
import { motion } from 'framer-motion';
import api from '../services/api';

const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

const RegisterPage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });



    const onSubmit = async (data: RegisterForm) => {
        try {
            const response = await api.post('/auth/register', {
                username: data.username,
                password: data.password
            });
            console.log('Registration success', response.data);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (error: any) {
            console.error('Registration failed', error.response?.data || error.message);
            // Ideally set form error here
            alert('Registration Failed: ' + (error.response?.data?.error || 'Unknown error'));
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
                        className="w-24 h-24 object-contain mb-4 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    />
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-sm tracking-tight">
                        BECOME A MEMBER
                    </h2>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Input
                        label=""
                        placeholder="Choose Username"
                        registration={register('username')}
                        error={errors.username?.message}
                    />
                    <Input
                        label=""
                        type="password"
                        placeholder="Choose Password"
                        registration={register('password')}
                        error={errors.password?.message}
                    />
                    <Input
                        label=""
                        type="password"
                        placeholder="Confirm Password"
                        registration={register('confirmPassword')}
                        error={errors.confirmPassword?.message}
                    />

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-gradient-to-b from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-extrabold py-4 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.3)] hover:shadow-[0_0_30px_rgba(22,163,74,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
                    >
                        {isSubmitting ? 'CREATING ACCOUNT...' : 'JOIN CLUB'}
                    </button>
                </form>

                <p className="mt-8 text-center text-neutral-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/login" className="text-yellow-400 hover:text-yellow-300 font-medium hover:underline transition-all">
                        Login
                    </Link>
                </p>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
