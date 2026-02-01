// Komponen Badge - Label status dan prioritas dengan ikon
import React from 'react';
import { CheckCircle, Clock, AlertCircle, XCircle, Info, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-700 ring-gray-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-700 ring-amber-200',
    danger: 'bg-red-50 text-red-700 ring-red-200',
    info: 'bg-blue-50 text-blue-700 ring-blue-200',
  };

  const dotColors = {
    default: 'bg-gray-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full ring-1 ring-inset ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};

// Status badge helper with icons
export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info' | 'default', icon: React.ReactNode }> = {
    active: { variant: 'success', icon: <CheckCircle size={12} /> },
    completed: { variant: 'success', icon: <CheckCircle size={12} /> },
    done: { variant: 'success', icon: <CheckCircle size={12} /> },
    planning: { variant: 'info', icon: <Info size={12} /> },
    'in-progress': { variant: 'warning', icon: <Clock size={12} /> },
    'on-hold': { variant: 'warning', icon: <Clock size={12} /> },
    pending: { variant: 'warning', icon: <Clock size={12} /> },
    cancelled: { variant: 'danger', icon: <XCircle size={12} /> },
    todo: { variant: 'default', icon: <AlertCircle size={12} /> },
    review: { variant: 'info', icon: <Info size={12} /> },
  };

  const config = statusConfig[status.toLowerCase()] || { variant: 'default' as const, icon: null };

  return (
    <Badge variant={config.variant}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </Badge>
  );
};

// Priority badge helper with arrows
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const priorityConfig: Record<string, { variant: 'success' | 'warning' | 'danger', icon: React.ReactNode }> = {
    low: { variant: 'success', icon: <ArrowDown size={12} /> },
    medium: { variant: 'warning', icon: <Minus size={12} /> },
    high: { variant: 'danger', icon: <ArrowUp size={12} /> },
  };

  const config = priorityConfig[priority.toLowerCase()] || { variant: 'warning' as const, icon: null };

  return (
    <Badge variant={config.variant}>
      {config.icon}
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
};
