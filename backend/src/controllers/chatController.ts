// Controller Chat - Handler untuk AI chatbot dengan Google Gemini
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { aiModel } from '../config/gemini';
import { ChatHistory, Product, Transaction, Project, User } from '../models';
import { AuthRequest } from '../middleware';

// Format IDR currency
const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getSystemContext = async (userRole?: string) => {
  // Get real-time data from database for context
  const [productCount, transactionCount, projectCount, userCount] = await Promise.all([
    Product.countDocuments(),
    Transaction.countDocuments(),
    Project.countDocuments(),
    User.countDocuments(),
  ]);

  const lowStockProducts = await Product.find({
    $expr: { $lte: ['$stock', '$minStock'] },
  }).limit(5);

  const recentTransactions = await Transaction.find()
    .sort({ date: -1 })
    .limit(5);

  const activeProjects = await Project.find({ status: 'active' }).limit(5);

  // Get all transactions for accurate financial summary
  const allTransactions = await Transaction.find({ status: 'completed' });
  
  // Calculate financial summary from all completed transactions
  const totalIncome = allTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = allTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Get categories for products
  const productCategories = await Product.distinct('category');
  
  // Get high priority projects
  const highPriorityProjects = await Project.find({ priority: 'high', status: { $ne: 'completed' } }).limit(5);
  
  // Get top products by price
  const topProducts = await Product.find().sort({ price: -1 }).limit(5);
  
  // Get transaction categories summary
  const incomeByCategory = await Transaction.aggregate([
    { $match: { type: 'income', status: 'completed' } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]);
  
  const expenseByCategory = await Transaction.aggregate([
    { $match: { type: 'expense', status: 'completed' } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 }
  ]);

  return `
Kamu adalah Asisten ERP-Mate, AI assistant pintar untuk perencanaan sumber daya perusahaan.
Kamu memiliki akses ke data bisnis real-time berikut:

STATISTIK SAAT INI:
- Total Produk di Inventaris: ${productCount}
- Total Transaksi: ${transactionCount}
- Total Proyek: ${projectCount}
- Total Pengguna: ${userCount}

RINGKASAN KEUANGAN:
- Total Pemasukan: ${formatIDR(totalIncome)}
- Total Pengeluaran: ${formatIDR(totalExpense)}
- Laba Bersih: ${formatIDR(totalIncome - totalExpense)}

PEMASUKAN PER KATEGORI:
${incomeByCategory.length > 0 
  ? incomeByCategory.map(c => `- ${c._id}: ${formatIDR(c.total)}`).join('\n')
  : '- Belum ada data pemasukan'}

PENGELUARAN PER KATEGORI:
${expenseByCategory.length > 0 
  ? expenseByCategory.map(c => `- ${c._id}: ${formatIDR(c.total)}`).join('\n')
  : '- Belum ada data pengeluaran'}

PERINGATAN STOK RENDAH:
${lowStockProducts.length > 0 
  ? lowStockProducts.map(p => `- ${p.name}: ${p.stock} unit (min: ${p.minStock}), Harga: ${formatIDR(p.price)}`).join('\n')
  : '- Tidak ada peringatan stok rendah'}

KATEGORI PRODUK: ${productCategories.join(', ') || 'Belum ada kategori'}

PRODUK TERMAHAL:
${topProducts.length > 0 
  ? topProducts.map(p => `- ${p.name}: ${formatIDR(p.price)} (Stok: ${p.stock})`).join('\n')
  : '- Belum ada data produk'}

TRANSAKSI TERBARU:
${recentTransactions.length > 0
  ? recentTransactions.map(t => `- ${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${formatIDR(t.amount)} - ${t.description} (${t.category})`).join('\n')
  : '- Belum ada transaksi'}

PROYEK AKTIF:
${activeProjects.length > 0
  ? activeProjects.map(p => `- ${p.title} (${p.progress}% selesai, Prioritas: ${p.priority}${p.budget ? `, Budget: ${formatIDR(p.budget)}` : ''})`).join('\n')
  : '- Tidak ada proyek aktif'}

PROYEK PRIORITAS TINGGI:
${highPriorityProjects.length > 0
  ? highPriorityProjects.map(p => `- ${p.title} (Status: ${p.status}, Progress: ${p.progress}%)`).join('\n')
  : '- Tidak ada proyek prioritas tinggi'}

KEMAMPUAN:
1. Menjawab pertanyaan tentang inventaris, produk, dan stok
2. Memberikan ringkasan dan analisis keuangan (pemasukan, pengeluaran, laba)
3. Menampilkan informasi proyek dan progress
4. Menyarankan tindakan berdasarkan data saat ini

PETUNJUK RESPONS:
- Format semua nilai uang dalam Rupiah (Rp)
- Gunakan markdown untuk format yang lebih baik (gunakan ## untuk header, - untuk list, **bold** untuk penting)
- Berikan jawaban yang ringkas namun informatif
- GUNAKAN DATA REAL-TIME yang disediakan di atas untuk menjawab
- Jika data tidak tersedia, katakan dengan jelas bahwa data tersebut belum ada di sistem
- Jangan mengarang data yang tidak ada

Role Pengguna: ${userRole || 'user'}

Pertanyaan pengguna:
`;
};

// Chat with AI
export const chat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { prompt, sessionId } = req.body;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Get or create chat session
    const chatSessionId = sessionId || uuidv4();
    
    // Get system context with real data and user role
    const systemContext = await getSystemContext(userRole);
    
    // Generate AI response
    const result = await aiModel.generateContent(`${systemContext} ${prompt}`);
    const response = await result.response;
    const reply = response.text();

    // Save chat history
    if (userId) {
      await ChatHistory.findOneAndUpdate(
        { userId, sessionId: chatSessionId },
        {
          $push: {
            messages: [
              { role: 'user', content: prompt, timestamp: new Date() },
              { role: 'assistant', content: reply, timestamp: new Date() },
            ],
          },
        },
        { upsert: true, new: true }
      );
    }

    res.json({ 
      reply, 
      sessionId: chatSessionId 
    });
  } catch (error) {
    console.error('Gemini AI Error:', error);
    res.status(500).json({ error: 'AI Service Unavailable' });
  }
};

// Get chat history
export const getChatHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    const history = await ChatHistory.findOne({ userId, sessionId });
    
    res.json(history?.messages || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

// Get all chat sessions for user
export const getChatSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const sessions = await ChatHistory.find({ userId })
      .select('sessionId createdAt updatedAt')
      .sort({ updatedAt: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch chat sessions' });
  }
};

// Delete chat session
export const deleteChatSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?._id;

    await ChatHistory.findOneAndDelete({ userId, sessionId });
    
    res.json({ message: 'Chat session deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete chat session' });
  }
};

// Quick analysis endpoint
export const analyzeData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query; // inventory, finance, projects
    const userRole = req.user?.role;
    
    let analysisPrompt = '';
    
    switch (type) {
      case 'inventory':
        const products = await Product.find().limit(20);
        analysisPrompt = `Analisis data inventaris ini dan berikan insights:\n${JSON.stringify(products)}`;
        break;
      case 'finance':
        const transactions = await Transaction.find().sort({ date: -1 }).limit(30);
        analysisPrompt = `Analisis transaksi keuangan ini dan berikan insights dengan format Rupiah (Rp):\n${JSON.stringify(transactions)}`;
        break;
      case 'projects':
        const projects = await Project.find().limit(10);
        analysisPrompt = `Analisis proyek-proyek ini dan berikan insights progress:\n${JSON.stringify(projects)}`;
        break;
      default:
        res.status(400).json({ error: 'Invalid analysis type' });
        return;
    }

    const systemContext = await getSystemContext(userRole);
    const result = await aiModel.generateContent(`${systemContext}\n\n${analysisPrompt}`);
    const response = await result.response;
    
    res.json({ analysis: response.text() });
  } catch (error) {
    console.error('Analysis Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
};
