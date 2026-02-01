// Komponen Card dan StatCard - Kartu kontainer dan kartu statistik
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 ${paddingClasses[padding]} ${
        hover ? 'card-hover cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'cyan';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'blue',
  subtitle,
}) => {
  const colorConfig = {
    blue: {
      border: 'border-l-blue-500',
      bg: 'bg-blue-50',
      iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
      text: 'text-blue-600',
    },
    green: {
      border: 'border-l-emerald-500',
      bg: 'bg-emerald-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      text: 'text-emerald-600',
    },
    purple: {
      border: 'border-l-purple-500',
      bg: 'bg-purple-50',
      iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
      text: 'text-purple-600',
    },
    red: {
      border: 'border-l-red-500',
      bg: 'bg-red-50',
      iconBg: 'bg-gradient-to-br from-red-500 to-red-600',
      text: 'text-red-600',
    },
    yellow: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
      text: 'text-amber-600',
    },
    cyan: {
      border: 'border-l-cyan-500',
      bg: 'bg-cyan-50',
      iconBg: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
      text: 'text-cyan-600',
    },
  };

  const config = colorConfig[color];

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${config.border} p-6 card-hover`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${
              trend.isPositive ? 'text-emerald-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? (
                <TrendingUp size={16} />
              ) : (
                <TrendingDown size={16} />
              )}
              <span className="font-medium">{Math.abs(trend.value)}%</span>
              <span className="text-gray-400">vs last month</span>
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-gray-400 mt-2">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${config.iconBg} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
