// Komponen Sidebar - Navigasi samping dengan menu dan profil pengguna
import React from 'react';
import {
  LayoutDashboard,
  Users,
  Package,
  DollarSign,
  Briefcase,
  LogOut,
  User,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: { name: string; role: string } | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

type UserRole = 'admin' | 'manager' | 'staff';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Ringkasan & Analitik', roles: ['admin', 'manager', 'staff'] as UserRole[] },
  { id: 'users', icon: Users, label: 'Manajemen Pengguna', description: 'Role & Hak Akses', roles: ['admin'] as UserRole[] },
  { id: 'inventory', icon: Package, label: 'Inventaris', description: 'Stok & Produk', roles: ['admin', 'manager', 'staff'] as UserRole[] },
  { id: 'finance', icon: DollarSign, label: 'Keuangan', description: 'Transaksi & Laporan', roles: ['admin', 'manager'] as UserRole[] },
  { id: 'projects', icon: Briefcase, label: 'Proyek', description: 'Tugas & Timeline', roles: ['admin', 'manager', 'staff'] as UserRole[] },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  isOpen,
  onClose,
}) => {
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onClose();
  };

  return (
    <>
      {/* Overlay untuk mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-gray-300 flex flex-col shadow-2xl z-50 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2.5 rounded-xl shadow-lg shadow-blue-500/25">
                  <LayoutDashboard size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">ERP-Mate</h1>
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Enterprise Suite
                </p>
              </div>
            </div>
            {/* Close button untuk mobile */}
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">
          Menu Utama
        </p>
        {navItems.filter(item => item.roles.includes((user?.role || 'staff') as UserRole)).map((item, index) => (
          <button
            key={item.id}
            onClick={() => handleTabChange(item.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 group relative overflow-hidden cursor-pointer ${
              activeTab === item.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {activeTab === item.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent" />
            )}
            <div className={`p-2 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-white/20' 
                : 'bg-slate-800 group-hover:bg-slate-700'
            }`}>
              <item.icon size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">{item.label}</p>
              <p className={`text-[10px] ${
                activeTab === item.id ? 'text-blue-100' : 'text-slate-500'
              }`}>
                {item.description}
              </p>
            </div>
            {activeTab === item.id && (
              <ChevronRight size={16} className="text-white/70" />
            )}
          </button>
        ))}
      </nav>

      {/* User Card */}
      <div className="p-4 bg-slate-800/50 m-4 mt-0 rounded-xl border border-slate-700/50 backdrop-blur">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-0.5 rounded-full">
              <div className="bg-slate-800 p-2 rounded-full">
                <User size={20} className="text-white" />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {user?.name || 'User'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide ${
                user?.role === 'admin' 
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : user?.role === 'manager'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-700 text-slate-300 border border-slate-600'
              }`}>
                {user?.role || 'Staff'}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-all duration-300 text-sm font-semibold group cursor-pointer"
        >
          <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
          Keluar
        </button>
      </div>
    </aside>
    </>
  );
};
