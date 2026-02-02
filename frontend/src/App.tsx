// App - Komponen utama aplikasi dengan routing dan layout
import React from 'react';
import { useAuth, useToast } from './hooks';
import { Sidebar, Header } from './components/layout';
import { ToastContainer } from './components/ui';
import {
  Login,
  Dashboard,
  UserManagement,
  Inventory,
  Finance,
  Projects,
  Chatbot,
} from './modules';

type ActiveModule = 'dashboard' | 'inventory' | 'finance' | 'projects' | 'users';

const App: React.FC = () => {
  const { user, token, login, logout } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [activeModule, setActiveModule] = React.useState<ActiveModule>('dashboard');
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // Show login if not authenticated
  if (!token || !user) {
    return (
      <Login
        onLogin={(t, u) => {
          login(t, u);
          addToast('Selamat datang kembali, ' + u.name + '!', 'success');
        }}
      />
    );
  }

  // Module titles for header
  const moduleTitles: Record<ActiveModule, string> = {
    dashboard: 'Dashboard',
    inventory: 'Manajemen Inventaris',
    finance: 'Keuangan & Transaksi',
    projects: 'Proyek & Tugas',
    users: 'Manajemen Pengguna',
  };

  // Render active module content
  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard token={token} userRole={user.role} onNavigate={(page) => setActiveModule(page as ActiveModule)} />;
      case 'inventory':
        return <Inventory token={token} userRole={user.role} showToast={addToast} />;
      case 'finance':
        return <Finance token={token} userRole={user.role} showToast={addToast} />;
      case 'projects':
        return <Projects token={token} userRole={user.role} showToast={addToast} />;
      case 'users':
        return <UserManagement token={token} currentUser={user} showToast={addToast} />;
      default:
        return <Dashboard token={token} userRole={user.role} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeModule}
        onTabChange={(module: string) => setActiveModule(module as ActiveModule)}
        user={user}
        onLogout={() => {
          logout();
          addToast('Berhasil keluar dari sistem', 'info');
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
        {/* Header */}
        <Header 
          title={moduleTitles[activeModule]} 
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Module Content */}
        <main className="flex-1 overflow-auto bg-transparent">{renderModule()}</main>
      </div>

      {/* Floating Chatbot */}
      <Chatbot token={token} />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
};

export default App;
