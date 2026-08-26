import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirm', onConfirm, onCancel, isLoading = false, variant = 'danger' }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} className="absolute inset-0 bg-dark-900/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-md bg-white rounded-2xl shadow-premium-xl p-7"
          >
            <button onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg hover:bg-gray-100 text-gray-400"><X size={16} /></button>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${variant === 'danger' ? 'bg-red-50' : 'bg-yellow-50'}`}>
              <AlertTriangle size={28} className={variant === 'danger' ? 'text-red-500' : 'text-yellow-500'} />
            </div>
            <h3 className="font-heading font-bold text-xl text-dark-900 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-7">{message}</p>
            <div className="flex gap-3">
              <button onClick={onCancel} disabled={isLoading} className="btn-ghost btn-md rounded-lg flex-1 border border-gray-200">Cancel</button>
              <button onClick={onConfirm} disabled={isLoading}
                className={`btn btn-md rounded-lg flex-1 text-white font-semibold disabled:opacity-60 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
