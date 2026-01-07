import { motion, AnimatePresence } from 'framer-motion';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-neutral-800 rounded-xl shadow-2xl border border-neutral-700 w-full max-w-md pointer-events-auto flex flex-col max-h-[90vh]">
                            <div className="flex justify-between items-center p-6 border-b border-neutral-700">
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                                <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
