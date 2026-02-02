// Halaman Login - Autentikasi pengguna dengan form login dan register
import React, { useState } from 'react';
import { LayoutDashboard, Mail, Lock, User, Building2, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { authApi } from '../../services/api';

interface LoginProps {
  onLogin: (token: string, user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'staff',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const year = new Date().getFullYear();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      if (isRegister) {
        await authApi.register(formData);
        setIsRegister(false);
        setError('');
        setSuccessMessage('Pendaftaran berhasil! Silakan masuk dengan akun Anda.');
        setFormData({ ...formData, password: '' });
      } else {
        const data = await authApi.login(formData.email, formData.password);
        onLogin(data.token, data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Operasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
        
        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-3 rounded-xl shadow-lg shadow-blue-500/25">
              <LayoutDashboard size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ERP-Mate</h1>
              <p className="text-xs text-blue-300">Enterprise Suite</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-bold text-white leading-tight">
            Sederhanakan<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Operasi Bisnis Anda
            </span>
          </h2>
          <p className="text-blue-200 text-lg max-w-md">
            Solusi perencanaan sumber daya perusahaan lengkap dengan wawasan bertenaga AI untuk bisnis modern.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { icon: '📊', title: 'Analitik Real-time' },
              { icon: '📦', title: 'Kontrol Inventaris' },
              { icon: '💰', title: 'Pelacakan Keuangan' },
              { icon: '🤖', title: 'Asisten AI' },
            ].map((feature) => (
              <div key={feature.title} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-sm text-white font-medium">{feature.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-300 text-sm">
          © {year} ERP-Mate. Sistem Manajemen Perusahaan.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-600 to-blue-500 p-2.5 rounded-xl">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">ERP-Mate</h1>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {isRegister ? 'Buat Akun' : 'Selamat Datang Kembali'}
              </h2>
              <p className="text-gray-500 mt-2">
                {isRegister 
                  ? 'Isi data Anda untuk memulai' 
                  : 'Masuk untuk mengakses dashboard Anda'}
              </p>
            </div>

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {isRegister && (
                <>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Nama Lengkap"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="relative">
                    {/* Icon */}
                    <Shield
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    {/* Role Selector */}
                    <div className="flex gap-2 w-full pl-12 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl">
                      {/* Staff */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "staff" })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            formData.role === "staff"
                              ? "bg-blue-500 text-white shadow-sm"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        Staf
                      </button>

                      {/* Manager */}
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: "manager" })}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            formData.role === "manager"
                              ? "bg-blue-500 text-white shadow-sm"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-100"
                          }`}
                      >
                        Manajer
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <Building2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Departemen (Opsional)"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </>
              )}

              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Alamat Email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  placeholder="Kata Sandi"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {isRegister ? 'Buat Akun' : 'Masuk'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="text-sm text-gray-500 hover:text-blue-600 transition-colors cursor-pointer"
              >
                {isRegister ? (
                  <>Sudah punya akun? <span className="font-semibold text-blue-600">Masuk</span></>
                ) : (
                  <>Belum punya akun? <span className="font-semibold text-blue-600">Daftar</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
