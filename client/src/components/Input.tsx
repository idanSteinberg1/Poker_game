import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    registration?: UseFormRegisterReturn;
}

export const Input: React.FC<InputProps> = ({ label, error, registration, className, ...props }) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-yellow-500/80 uppercase tracking-wider text-xs ml-1">{label}</label>}
            <input
                {...registration}
                {...props}
                className={`bg-black/50 border ${error ? 'border-red-500' : 'border-yellow-600/30'} text-white placeholder-neutral-500 rounded-xl px-5 py-4 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500/50 transition-all duration-300 backdrop-blur-sm ${className}`}
            />
            {error && <span className="text-xs text-red-400 ml-1">{error}</span>}
        </div>
    );
};
