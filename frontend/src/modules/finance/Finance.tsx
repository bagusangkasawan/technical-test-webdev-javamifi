// Halaman Finance - Manajemen transaksi dan laporan keuangan
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Trash2,
} from 'lucide-react';
import { financeApi } from '../../services/api';
import {
  Button,
  Input,
  Select,
  Modal,
  Card,
  StatCard,
  Badge,
} from '../../components/ui';

interface FinanceProps {
  token: string;
  userRole: string;
}

export const Finance: React.FC<FinanceProps> = ({ userRole }) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netProfit: 0,
    profitMargin: 0,
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: '',
    amount: 0,
    description: '',
    paymentMethod: 'cash',
    reference: '',
  });

  const incomeCategories = ['Penjualan', 'Jasa', 'Investasi', 'Refund', 'Pendapatan Lain'];
  const expenseCategories = ['Operasional', 'Gaji', 'Marketing', 'Utilitas', 'Peralatan', 'Perlengkapan Kantor', 'Perjalanan', 'Pengeluaran Lain'];

  useEffect(() => {
    fetchData();
  }, [typeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [txData, summaryData, monthlyReport] = await Promise.all([
        financeApi.getAll({ type: typeFilter || undefined }),
        financeApi.getSummary(),
        financeApi.getMonthlyReport(),
      ]);
      setTransactions(txData);
      setSummary(summaryData);
      setMonthlyData(monthlyReport);
    } catch (error) {
      console.error('Failed to fetch finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeApi.create(formData);
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Operasi gagal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    try {
      await financeApi.delete(id);
      fetchData();
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus transaksi');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'income',
      category: '',
      amount: 0,
      description: '',
      paymentMethod: 'cash',
      reference: '',
    });
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <DollarSign className="text-blue-600" /> Keuangan & Arus Kas
        </h2>
        <Button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={<Plus size={18} />}
          className="w-full sm:w-auto"
        >
          Catat Transaksi
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Pemasukan"
          value={`Rp ${summary.totalIncome.toLocaleString('id-ID')}`}
          icon={<TrendingUp size={24} />}
          color="green"
        />
        <StatCard
          title="Total Pengeluaran"
          value={`Rp ${summary.totalExpense.toLocaleString('id-ID')}`}
          icon={<TrendingDown size={24} />}
          color="red"
        />
        <StatCard
          title="Laba Bersih"
          value={`Rp ${summary.netProfit.toLocaleString('id-ID')}`}
          icon={<DollarSign size={24} />}
          color={summary.netProfit >= 0 ? 'green' : 'red'}
        />
        <StatCard
          title="Margin Laba"
          value={`${summary.profitMargin}%`}
          icon={<TrendingUp size={24} />}
          color="blue"
        />
      </div>

      {/* Monthly Chart */}
      <Card className="mb-6 overflow-x-auto">
        <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar size={18} /> Ringkasan Bulanan
        </h3>
        <div className="flex gap-2 h-48 items-end min-w-[500px] sm:min-w-0">
          {monthlyData.map((m, i) => {
            const maxVal = Math.max(...monthlyData.map(d => Math.max(d.income, d.expense))) || 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex gap-1 h-40 items-end justify-center">
                  <div
                    className="w-3 bg-green-500 rounded-t transition-all"
                    style={{ height: `${(m.income / maxVal) * 100}%` }}
                    title={`Pemasukan: Rp ${m.income.toLocaleString('id-ID')}`}
                  />
                  <div
                    className="w-3 bg-red-500 rounded-t transition-all"
                    style={{ height: `${(m.expense / maxVal) * 100}%` }}
                    title={`Pengeluaran: Rp ${m.expense.toLocaleString('id-ID')}`}
                  />
                </div>
                <span className="text-xs text-gray-500">{monthNames[m.month - 1]}</span>
              </div>
            );
          })}
        </div>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded" />
            <span>Pemasukan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span>Pengeluaran</span>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-3">
              <h3 className="font-bold text-gray-700">Transaksi Terbaru</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={typeFilter === '' ? 'primary' : 'secondary'}
                  onClick={() => setTypeFilter('')}
                >
                  Semua
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'income' ? 'success' : 'secondary'}
                  onClick={() => setTypeFilter('income')}
                >
                  Pemasukan
                </Button>
                <Button
                  size="sm"
                  variant={typeFilter === 'expense' ? 'danger' : 'secondary'}
                  onClick={() => setTypeFilter('expense')}
                >
                  Pengeluaran
                </Button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {transactions.map((tx) => (
                  <div
                    key={tx._id}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 border border-gray-100 rounded-lg hover:shadow-sm transition bg-white"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-full ${
                          tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}
                      >
                        {tx.type === 'income' ? (
                          <TrendingUp className="text-green-600" size={20} />
                        ) : (
                          <TrendingDown className="text-red-600" size={20} />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{tx.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={tx.type === 'income' ? 'success' : 'danger'} size="sm">
                            {tx.category}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(tx.date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-lg font-bold ${
                          tx.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}Rp {tx.amount.toLocaleString('id-ID')}
                      </span>
                      {userRole === 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(tx._id)}
                          icon={<Trash2 size={14} />}
                          className="text-red-600"
                        />
                      )}
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-center text-gray-400 py-10">
                    Belum ada transaksi tercatat.
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Add Form */}
        <div>
          <Card className="bg-gray-50">
            <h3 className="font-bold text-gray-800 mb-4">Tambah Cepat</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase block mb-1">
                  Tipe
                </label>
                <div className="flex bg-gray-200 p-1 rounded">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
                    className={`flex-1 py-2 text-sm font-bold rounded shadow-sm transition ${
                      formData.type === 'income'
                        ? 'bg-white text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Pemasukan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
                    className={`flex-1 py-2 text-sm font-bold rounded shadow-sm transition ${
                      formData.type === 'expense'
                        ? 'bg-white text-red-600'
                        : 'text-gray-500'
                    }`}
                  >
                    Pengeluaran
                  </button>
                </div>
              </div>

              <Select
                label="Kategori"
                required
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                options={[
                  { value: '', label: 'Pilih kategori' },
                  ...(formData.type === 'income' ? incomeCategories : expenseCategories).map(
                    (c) => ({ value: c, label: c })
                  ),
                ]}
              />

              <Input
                label="Deskripsi"
                required
                placeholder="cth. Penjualan Q1 atau Sewa Kantor"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />

              <Input
                label="Jumlah (Rp)"
                type="number"
                step="0.01"
                min={0}
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                }
              />

              <Select
                label="Metode Pembayaran"
                value={formData.paymentMethod}
                onChange={(e) =>
                  setFormData({ ...formData, paymentMethod: e.target.value })
                }
                options={[
                  { value: 'cash', label: 'Tunai' },
                  { value: 'bank_transfer', label: 'Transfer Bank' },
                  { value: 'credit_card', label: 'Kartu Kredit' },
                  { value: 'check', label: 'Cek' },
                  { value: 'other', label: 'Lainnya' },
                ]}
              />

              <Button
                type="submit"
                className="w-full"
                variant={formData.type === 'income' ? 'success' : 'danger'}
              >
                Catat {formData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
              </Button>
            </form>
          </Card>
        </div>
      </div>

      {/* Full Modal for detailed entry */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Catat Transaksi"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex bg-gray-100 p-1 rounded">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'income', category: '' })}
              className={`flex-1 py-2 text-sm font-bold rounded transition ${
                formData.type === 'income'
                  ? 'bg-green-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense', category: '' })}
              className={`flex-1 py-2 text-sm font-bold rounded transition ${
                formData.type === 'expense'
                  ? 'bg-red-500 text-white'
                  : 'text-gray-500'
              }`}
            >
              Pengeluaran
            </button>
          </div>

          <Select
            label="Kategori"
            required
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            options={[
              { value: '', label: 'Pilih kategori' },
              ...(formData.type === 'income' ? incomeCategories : expenseCategories).map(
                (c) => ({ value: c, label: c })
              ),
            ]}
          />

          <Input
            label="Deskripsi"
            required
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jumlah (Rp)"
              type="number"
              step="0.01"
              min={0}
              required
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
              }
            />
            <Select
              label="Metode Pembayaran"
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({ ...formData, paymentMethod: e.target.value })
              }
              options={[
                { value: 'cash', label: 'Tunai' },
                { value: 'bank_transfer', label: 'Transfer Bank' },
                { value: 'credit_card', label: 'Kartu Kredit' },
                { value: 'check', label: 'Cek' },
                { value: 'other', label: 'Lainnya' },
              ]}
            />
          </div>

          <Input
            label="Referensi (Opsional)"
            placeholder="No. Invoice, No. Kwitansi, dll."
            value={formData.reference}
            onChange={(e) =>
              setFormData({ ...formData, reference: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Simpan Transaksi
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
