import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Card = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("bg-neutral-800 border border-neutral-700 rounded-xl p-6 shadow-xl", className)} {...props}>
        {children}
    </div>
);
