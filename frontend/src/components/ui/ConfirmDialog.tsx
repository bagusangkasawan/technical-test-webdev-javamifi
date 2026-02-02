// Komponen ConfirmDialog - Dialog konfirmasi profesional untuk menggantikan confirm() bawaan browser
import React from 'react';
import { AlertTriangle, Trash2, X, AlertCircle, HelpCircle } from 'lucide-react';

type ConfirmType = 'danger' | 'warning' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmType;
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  type = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const config = {
    danger: {
      icon: <Trash2 size={24} />,
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      iconShadow: 'shadow-red-500/30',
      confirmBg: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      confirmShadow: 'shadow-red-500/25',
    },
    warning: {
      icon: <AlertTriangle size={24} />,
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-500',
      iconShadow: 'shadow-amber-500/30',
      confirmBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
      confirmShadow: 'shadow-amber-500/25',
    },
    info: {
      icon: <HelpCircle size={24} />,
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconShadow: 'shadow-blue-500/30',
      confirmBg: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      confirmShadow: 'shadow-blue-500/25',
    },
  };

  const { icon, iconBg, iconShadow, confirmBg, confirmShadow } = config[type];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group cursor-pointer"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Content */}
        <div className="p-6 text-center">
          {/* Icon */}
          <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${iconBg} flex items-center justify-center text-white shadow-lg ${iconShadow}`}>
            {icon}
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">{message}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-3 ${confirmBg} text-white font-semibold rounded-xl shadow-lg ${confirmShadow} transition-all duration-200 disabled:opacity-50 cursor-pointer`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Komponen InputDialog - Dialog input profesional untuk menggantikan prompt() bawaan browser
interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: number) => void;
  title: string;
  message: string;
  inputLabel: string;
  inputPlaceholder?: string;
  submitText?: string;
  cancelText?: string;
  min?: number;
  max?: number;
}

export const InputDialog: React.FC<InputDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  message,
  inputLabel,
  inputPlaceholder = 'Masukkan jumlah',
  submitText = 'Konfirmasi',
  cancelText = 'Batal',
  min = 1,
  max,
}) => {
  const [value, setValue] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  React.useEffect(() => {
    if (isOpen) {
      setValue('');
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const numValue = parseInt(value);
    
    if (!value || isNaN(numValue)) {
      setError('Masukkan angka yang valid');
      return;
    }
    
    if (numValue < min) {
      setError(`Jumlah minimal adalah ${min}`);
      return;
    }
    
    if (max && numValue > max) {
      setError(`Jumlah maksimal adalah ${max}`);
      return;
    }

    onSubmit(numValue);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 fade-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 group cursor-pointer"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <AlertCircle size={24} />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">{title}</h3>

          {/* Message */}
          <p className="text-gray-500 text-sm mb-6 leading-relaxed text-center">{message}</p>

          {/* Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {inputLabel}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
              placeholder={inputPlaceholder}
              min={min}
              max={max}
              className={`w-full px-4 py-3 border-2 rounded-xl text-center text-lg font-semibold transition-all duration-200 focus:outline-none ${
                error 
                  ? 'border-red-300 bg-red-50 focus:border-red-500' 
                  : 'border-gray-200 bg-gray-50 focus:border-blue-500 focus:bg-white'
              }`}
              autoFocus
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {error}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 cursor-pointer"
            >
              {submitText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
