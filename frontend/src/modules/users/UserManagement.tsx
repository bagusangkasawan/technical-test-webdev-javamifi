// Halaman UserManagement - Manajemen pengguna dan hak akses
import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Shield, Search } from 'lucide-react';
import { usersApi, authApi } from '../../services/api';
import { Button, Input, Select, Modal, Table, Badge, Card } from '../../components/ui';

interface UserManagementProps {
  token: string;
  currentUser: { _id: string; role: string };
}

export const UserManagement: React.FC<UserManagementProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    department: '',
    isActive: true,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await usersApi.update(editingUser._id, formData);
      } else {
        await authApi.register(formData);
      }
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Operasi gagal');
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      department: user.department || '',
      isActive: user.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
    try {
      await usersApi.delete(id);
      fetchUsers();
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus pengguna');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff',
      department: '',
      isActive: true,
    });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors: Record<string, 'danger' | 'warning' | 'info'> = {
    admin: 'danger',
    manager: 'warning',
    staff: 'info',
  };

  const columns = [
    {
      key: 'name',
      header: 'Nama',
      render: (user: any) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Peran',
      render: (user: any) => (
        <Badge variant={roleColors[user.role] || 'default'}>
          <Shield size={12} className="mr-1" />
          {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Manajer' : 'Staf'}
        </Badge>
      ),
    },
    {
      key: 'department',
      header: 'Departemen',
      render: (user: any) => user.department || '-',
    },
    {
      key: 'status',
      header: 'Status',
      render: (user: any) => (
        <Badge variant={user.isActive ? 'success' : 'danger'}>
          {user.isActive ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Login Terakhir',
      render: (user: any) =>
        user.lastLogin
          ? new Date(user.lastLogin).toLocaleDateString('id-ID')
          : 'Belum pernah',
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (user: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(user)}
            icon={<Edit2 size={14} />}
          >
            Ubah
          </Button>
          {user._id !== currentUser._id && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDelete(user._id)}
              icon={<Trash2 size={14} />}
              className="text-red-600 hover:bg-red-50"
            >
              Hapus
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (currentUser.role !== 'admin') {
    return (
      <div className="p-4 sm:p-6">
        <Card className="text-center py-8 sm:py-12 px-4">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg sm:text-xl font-bold text-gray-700 mb-2">Akses Terbatas</h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Hanya administrator yang dapat mengelola pengguna dan peran.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <Users className="text-purple-600" /> Manajemen Pengguna & Peran
        </h2>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={<Plus size={18} />}
          className="w-full sm:w-auto"
        >
          Tambah Pengguna
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={18} />}
          className="w-full sm:max-w-md"
        />
      </div>

      {/* Users Table */}
      <Table
        columns={columns}
        data={filteredUsers}
        keyExtractor={(user) => user._id}
        loading={loading}
        emptyMessage="Tidak ada pengguna ditemukan."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingUser ? 'Ubah Pengguna' : 'Tambah Pengguna Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Lengkap"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          {!editingUser && (
            <Input
              label="Kata Sandi"
              type="password"
              required
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          )}
          <Select
            label="Peran"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={[
              { value: 'staff', label: 'Staf' },
              { value: 'manager', label: 'Manajer' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Input
            label="Departemen"
            value={formData.department}
            onChange={(e) =>
              setFormData({ ...formData, department: e.target.value })
            }
          />
          {editingUser && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4"
              />
              <label htmlFor="isActive" className="text-sm font-medium">
                Akun Aktif
              </label>
            </div>
          )}
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingUser ? 'Perbarui Pengguna' : 'Buat Pengguna'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
