// Komponen Toast - Notifikasi popup dengan animasi
import React from 'react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const config = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
      border: 'border-emerald-500',
      text: 'text-emerald-800',
      icon: <CheckCircle size={20} className="text-emerald-500" />,
    },
    error: {
      bg: 'bg-gradient-to-r from-red-50 to-rose-50',
      border: 'border-red-500',
      text: 'text-red-800',
      icon: <AlertCircle size={20} className="text-red-500" />,
    },
    info: {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-500',
      text: 'text-blue-800',
      icon: <Info size={20} className="text-blue-500" />,
    },
  };

  const { bg, border, text, icon } = config[type];

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border-l-4 shadow-xl backdrop-blur-sm animate-slide-in-right ${bg} ${border} ${text}`}
    >
      <div className="flex-shrink-0">{icon}</div>
      <p className="flex-1 font-medium text-sm">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 hover:bg-black/5 rounded-lg transition cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>;
  onRemove: (id: number) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] space-y-3 max-w-md">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};
