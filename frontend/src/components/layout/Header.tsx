// Komponen Header - Header halaman dengan judul dan tanggal
import React from 'react';
import { Menu } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Menu button & Title */}
        <div className="flex items-center gap-3">
          {/* Hamburger menu untuk mobile */}
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <Menu size={24} className="text-gray-600" />
          </button>
          
          <div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 mb-1">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-gray-600">{title}</span>
            </div>
            <h1 className="text-lg sm:text-2xl font-bold text-gray-800">{title}</h1>
          </div>
        </div>

        {/* Date - hidden on small mobile */}
        <div className="text-right hidden sm:block">
          <p className="text-xs text-gray-400">Hari Ini</p>
          <p className="text-sm font-semibold text-gray-700">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>
    </header>
  );
};
