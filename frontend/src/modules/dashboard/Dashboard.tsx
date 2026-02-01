// Halaman Dashboard - Ringkasan statistik dan overview bisnis
import React, { useEffect, useState } from 'react';
import {
  DollarSign,
  Package,
  Briefcase,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Zap,
} from 'lucide-react';
import { StatCard, Card } from '../../components/ui';
import { inventoryApi, financeApi, projectsApi, usersApi } from '../../services/api';

interface DashboardProps {
  token: string;
  userRole: string;
  onNavigate?: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole, onNavigate }) => {
  const [stats, setStats] = useState({
    inventory: { totalProducts: 0, lowStockProducts: 0, totalValue: 0 },
    finance: { totalIncome: 0, totalExpense: 0, netProfit: 0 },
    projects: { totalProjects: 0, statusCounts: {} as Record<string, number>, taskStats: { total: 0, completed: 0 } },
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const isStaff = userRole === 'staff';
        
        const [invStats, projStats] = await Promise.all([
          inventoryApi.getStats(),
          projectsApi.getStats(),
        ]);

        let finStats = { totalIncome: 0, totalExpense: 0, netProfit: 0 };
        if (!isStaff) {
          try {
            finStats = await financeApi.getSummary();
          } catch {
            finStats = { totalIncome: 0, totalExpense: 0, netProfit: 0 };
          }
        }

        let userCount = 0;
        if (userRole === 'admin') {
          try {
            const users = await usersApi.getAll();
            userCount = users.length;
          } catch {
            userCount = 0;
          }
        }

        setStats({
          inventory: invStats,
          finance: finStats,
          projects: projStats,
          users: userCount,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userRole]);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const taskCompletionRate = stats.projects.taskStats.total > 0 
    ? Math.round((stats.projects.taskStats.completed / stats.projects.taskStats.total) * 100)
    : 0;

  const isStaff = userRole === 'staff';
  const canViewFinance = userRole === 'admin' || userRole === 'manager';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Selamat datang! Berikut ringkasan bisnis Anda.
          {isStaff && <span className="ml-2 text-blue-600 font-medium">(Mode Terbatas)</span>}
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewFinance ? 'lg:grid-cols-4' : 'lg:grid-cols-2'} gap-4 sm:gap-6`}>
        {canViewFinance && (
          <>
            <StatCard
              title="Total Pendapatan"
              value={`Rp ${stats.finance.totalIncome.toLocaleString('id-ID')}`}
              icon={<DollarSign className="h-6 w-6" />}
              color="blue"
            />
            <StatCard
              title="Laba Bersih"
              value={`Rp ${stats.finance.netProfit.toLocaleString('id-ID')}`}
              icon={<TrendingUp className="h-6 w-6" />}
              color={stats.finance.netProfit >= 0 ? 'green' : 'red'}
            />
          </>
        )}
        <StatCard
          title="Proyek Aktif"
          value={stats.projects.statusCounts?.active || 0}
          icon={<Briefcase className="h-6 w-6" />}
          color="purple"
          subtitle={`${stats.projects.totalProjects} total proyek`}
        />
        <StatCard
          title="Item Inventaris"
          value={stats.inventory.totalProducts}
          icon={<Package className="h-6 w-6" />}
          color="cyan"
          subtitle={isStaff ? undefined : `Rp ${stats.inventory.totalValue.toLocaleString('id-ID')} nilai`}
        />
      </div>

      {/* Secondary Stats Row */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${canViewFinance ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-4 sm:gap-6`}>
        {/* Low Stock Alert */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-lg transition-shadow" hover>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="text-amber-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Peringatan Stok Rendah</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-amber-600">
            {stats.inventory.lowStockProducts}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Produk perlu di-restock</p>
        </Card>

        {/* Task Progress */}
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-lg transition-shadow" hover>
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <CheckCircle className="text-emerald-600" size={20} />
            </div>
            <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Progress Tugas</h3>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-emerald-600">
            {taskCompletionRate}%
          </p>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{stats.projects.taskStats.completed} selesai</span>
              <span>{stats.projects.taskStats.total} total</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${taskCompletionRate}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Expenses - Only for admin/manager */}
        {canViewFinance && (
          <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow" hover>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Activity className="text-red-600" size={20} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Total Pengeluaran</h3>
            </div>
            <p className="text-3xl sm:text-4xl font-bold text-red-600">
              Rp {stats.finance.totalExpense.toLocaleString('id-ID')}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Periode ini</p>
          </Card>
        )}
      </div>

      {/* Admin Only - User Stats */}
      {userRole === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <StatCard
            title="Total Pengguna"
            value={stats.users}
            icon={<Users className="h-6 w-6" />}
            color="purple"
            subtitle="Pengguna sistem aktif"
          />
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Zap className="text-amber-500" size={20} />
          Aksi Cepat
        </h3>
        <div className={`grid grid-cols-2 sm:grid-cols-3 ${userRole === 'admin' ? 'lg:grid-cols-4' : canViewFinance ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3`}>
          {[
            { icon: Package, label: 'Inventaris', color: 'bg-blue-500', page: 'inventory', roles: ['admin', 'manager', 'staff'] },
            { icon: DollarSign, label: 'Keuangan', color: 'bg-emerald-500', page: 'finance', roles: ['admin', 'manager'] },
            { icon: Briefcase, label: 'Proyek', color: 'bg-purple-500', page: 'projects', roles: ['admin', 'manager', 'staff'] },
            { icon: Users, label: 'Pengguna', color: 'bg-orange-500', page: 'users', roles: ['admin'] },
          ].filter(action => action.roles.includes(userRole)).map((action) => (
            <button
              key={action.label}
              onClick={() => onNavigate?.(action.page)}
              className="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group cursor-pointer"
            >
              <div className={`p-3 ${action.color} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                <action.icon size={20} />
              </div>
              <span className="text-sm font-medium text-gray-700">{action.label}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
