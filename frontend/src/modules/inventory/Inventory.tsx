// Halaman Inventory - Manajemen produk dan stok barang
import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  AlertTriangle,
  Filter,
} from 'lucide-react';
import { inventoryApi } from '../../services/api';
import {
  Button,
  Input,
  Select,
  Modal,
  Table,
  Badge,
  Card,
  StatCard,
  ConfirmDialog,
  InputDialog,
} from '../../components/ui';

interface InventoryProps {
  token: string;
  userRole: string;
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const Inventory: React.FC<InventoryProps> = ({ userRole, showToast }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stats, setStats] = useState({ totalProducts: 0, lowStockProducts: 0, totalValue: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null }>({
    isOpen: false,
    productId: null,
  });
  const [stockDialog, setStockDialog] = useState<{ isOpen: boolean; productId: string | null; type: 'add' | 'subtract' }>({
    isOpen: false,
    productId: null,
    type: 'add',
  });
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    stock: 0,
    minStock: 10,
    price: 0,
    cost: 0,
    category: '',
    supplier: '',
    location: '',
  });

  useEffect(() => {
    fetchData();
  }, [categoryFilter, lowStockFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsData, categoriesData, statsData] = await Promise.all([
        inventoryApi.getAll({
          category: categoryFilter || undefined,
          lowStock: lowStockFilter || undefined,
        }),
        inventoryApi.getCategories(),
        inventoryApi.getStats(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await inventoryApi.update(editingProduct._id, formData);
        showToast('Produk berhasil diperbarui', 'success');
      } else {
        await inventoryApi.create(formData);
        showToast('Produk berhasil ditambahkan', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Operasi gagal', 'error');
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      description: product.description || '',
      stock: product.stock,
      minStock: product.minStock,
      price: product.price,
      cost: product.cost || 0,
      category: product.category,
      supplier: product.supplier || '',
      location: product.location || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ isOpen: true, productId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.productId) return;
    try {
      await inventoryApi.delete(deleteConfirm.productId);
      showToast('Produk berhasil dihapus', 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Gagal menghapus produk', 'error');
    } finally {
      setDeleteConfirm({ isOpen: false, productId: null });
    }
  };

  const handleStockUpdate = (id: string, type: 'add' | 'subtract') => {
    setStockDialog({ isOpen: true, productId: id, type });
  };

  const confirmStockUpdate = async (quantity: number) => {
    if (!stockDialog.productId || quantity <= 0) return;
    try {
      await inventoryApi.updateStock(stockDialog.productId, quantity, stockDialog.type);
      showToast(`Stok berhasil ${stockDialog.type === 'add' ? 'ditambahkan' : 'dikurangi'}`, 'success');
      fetchData();
    } catch (error: any) {
      showToast(error.message || 'Gagal memperbarui stok', 'error');
    } finally {
      setStockDialog({ isOpen: false, productId: null, type: 'add' });
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: '',
      description: '',
      stock: 0,
      minStock: 10,
      price: 0,
      cost: 0,
      category: '',
      supplier: '',
      location: '',
    });
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase())
  );

  const canEdit = userRole === 'admin' || userRole === 'manager';
  const isStaff = userRole === 'staff';

  const columns = [
    {
      key: 'name',
      header: 'Produk',
      render: (item: any) => (
        <div>
          <p className="font-medium text-gray-900">{item.name}</p>
          <p className="text-sm text-gray-500">SKU: {item.sku}</p>
        </div>
      ),
    },
    { key: 'category', header: 'Kategori' },
    {
      key: 'stock',
      header: 'Stok',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={item.stock <= item.minStock ? 'danger' : 'success'}
          >
            {item.stock} unit
          </Badge>
          {item.stock <= item.minStock && (
            <AlertTriangle size={16} className="text-yellow-500" />
          )}
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Harga',
      render: (item: any) => (
        <span className="font-mono">Rp {item.price.toLocaleString('id-ID')}</span>
      ),
    },
    {
      key: 'value',
      header: 'Total Nilai',
      render: (item: any) => (
        <span className="font-mono text-gray-600">
          Rp {(item.stock * item.price).toLocaleString('id-ID')}
        </span>
      ),
    },
    ...(!isStaff ? [{
      key: 'actions',
      header: 'Aksi',
      render: (item: any) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStockUpdate(item._id, 'add')}
          >
            +Stok
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleStockUpdate(item._id, 'subtract')}
          >
            -Stok
          </Button>
          {canEdit && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(item)}
                icon={<Edit2 size={14} />}
              />
              {userRole === 'admin' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(item._id)}
                  icon={<Trash2 size={14} />}
                  className="text-red-600 hover:bg-red-50"
                />
              )}
            </>
          )}
        </div>
      ),
    }] : []),
  ];

  return (
    <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Package className="text-green-600" /> Manajemen Inventaris
          </h2>
          {isStaff && (
            <Badge variant="info">Hanya Lihat</Badge>
          )}
        </div>
        {canEdit && (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            icon={<Plus size={18} />}
            variant="success"
            className="w-full sm:w-auto"
          >
            Tambah Produk
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Total Produk"
          value={stats.totalProducts}
          icon={<Package size={24} />}
          color="blue"
        />
        <StatCard
          title="Stok Rendah"
          value={stats.lowStockProducts}
          icon={<AlertTriangle size={24} />}
          color="yellow"
        />
        <StatCard
          title="Total Nilai"
          value={`Rp ${stats.totalValue.toLocaleString('id-ID')}`}
          icon={<Package size={24} />}
          color="green"
        />
      </div>

      {/* Filters */}
      <Card className="mb-6" padding="sm">
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 sm:items-center">
          <div className="flex-1 min-w-0 sm:min-w-[200px]">
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search size={18} />}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: '', label: 'Semua Kategori' },
                ...categories.map((c) => ({ value: c, label: c })),
              ]}
              className="w-full sm:w-48"
            />
            <Button
              variant={lowStockFilter ? 'danger' : 'secondary'}
              onClick={() => setLowStockFilter(!lowStockFilter)}
              icon={<Filter size={16} />}
              className="w-full sm:w-auto"
            >
              Stok Rendah
            </Button>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <Table
        columns={columns}
        data={filteredProducts}
        keyExtractor={(item) => item._id}
        loading={loading}
        emptyMessage="Tidak ada produk ditemukan."
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nama Produk"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="SKU"
              placeholder="Otomatis jika kosong"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <Input
            label="Deskripsi"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kategori"
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            />
            <Input
              label="Supplier"
              value={formData.supplier}
              onChange={(e) =>
                setFormData({ ...formData, supplier: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input
              label="Stok"
              type="number"
              min={0}
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
              }
            />
            <Input
              label="Min Stok"
              type="number"
              min={0}
              value={formData.minStock}
              onChange={(e) =>
                setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })
              }
            />
            <Input
              label="Harga (Rp)"
              type="number"
              step="0.01"
              min={0}
              required
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
            />
            <Input
              label="Biaya (Rp)"
              type="number"
              step="0.01"
              min={0}
              value={formData.cost}
              onChange={(e) =>
                setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <Input
            label="Lokasi Penyimpanan"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
          />
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="success" className="flex-1">
              {editingProduct ? 'Perbarui Produk' : 'Tambah Produk'}
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

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, productId: null })}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini? Data produk yang dihapus tidak dapat dikembalikan."
        type="danger"
        confirmText="Hapus"
        cancelText="Batal"
      />

      {/* Stock Update Input Dialog */}
      <InputDialog
        isOpen={stockDialog.isOpen}
        onClose={() => setStockDialog({ isOpen: false, productId: null, type: 'add' })}
        onSubmit={confirmStockUpdate}
        title={stockDialog.type === 'add' ? 'Tambah Stok' : 'Kurangi Stok'}
        message={stockDialog.type === 'add' ? 'Masukkan jumlah stok yang akan ditambahkan:' : 'Masukkan jumlah stok yang akan dikurangi:'}
        inputLabel="Jumlah"
        inputPlaceholder="Masukkan jumlah..."
        min={1}
        submitText={stockDialog.type === 'add' ? 'Tambah' : 'Kurangi'}
        cancelText="Batal"
      />
    </div>
  );
};
