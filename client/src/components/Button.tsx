import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    disabled,
    ...props
}) => {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20',
        secondary: 'bg-neutral-700 hover:bg-neutral-600 text-white',
        outline: 'border-2 border-neutral-600 hover:border-neutral-500 text-neutral-300 hover:text-white bg-transparent',
        ghost: 'hover:bg-neutral-800 text-neutral-400 hover:text-white'
    };

    const sizes = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    return (
        <button
            disabled={disabled || isLoading}
            className={cn(
                'rounded-lg font-medium transition-all flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
                className
            )}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {children}
        </button>
    );
}
