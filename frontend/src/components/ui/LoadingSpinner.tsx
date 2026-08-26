import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullscreen?: boolean;
  size?: number;
  message?: string;
}

export default function LoadingSpinner({ fullscreen = false, size = 32, message }: LoadingSpinnerProps) {
  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-DEFAULT to-primary-900 flex items-center justify-center mb-4 shadow-glow-blue animate-pulse">
          <Loader2 size={28} className="text-white animate-spin" />
        </div>
        {message && <p className="text-gray-500 text-sm">{message}</p>}
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 size={size} className="animate-spin text-primary-DEFAULT" />
    </div>
  );
}
