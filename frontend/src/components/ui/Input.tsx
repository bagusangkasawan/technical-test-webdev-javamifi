// Komponen Input, Select, dan Textarea - Form controls yang dapat dikustomisasi
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`w-full p-3 ${icon ? 'pl-10' : ''} bg-white border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition ${
            error ? 'border-red-500' : 'border-gray-200'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase">
          {label}
        </label>
      )}
      <select
        className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition cursor-pointer ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-bold text-gray-500 uppercase">
          {label}
        </label>
      )}
      <textarea
        className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 focus:outline-none transition resize-none ${
          error ? 'border-red-500' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};
