// Controller Finance - Handler untuk manajemen transaksi keuangan
import { Response } from 'express';
import { Transaction } from '../models';
import { AuthRequest } from '../middleware';

export const getAllTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, startDate, endDate, status } = req.query;
    
    let query: any = {};
    
    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate as string);
      if (endDate) query.date.$lte = new Date(endDate as string);
    }
    
    const transactions = await Transaction.find(query)
      .populate('createdBy', 'name')
      .sort({ date: -1 });
    
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
};

// Get transaction by ID
export const getTransactionById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('createdBy', 'name');
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
};

// Create transaction
export const createTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, amount, description, reference, paymentMethod, status, date } = req.body;

    const transaction = new Transaction({
      type,
      category: category || (type === 'income' ? 'Sales' : 'Operations'),
      amount,
      description,
      reference: reference || `TXN-${Date.now()}`,
      paymentMethod: paymentMethod || 'cash',
      status: status || 'completed',
      date: date || new Date(),
      createdBy: req.user?._id,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create transaction' });
  }
};

// Update transaction
export const updateTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
};

// Delete transaction
export const deleteTransaction = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) {
      res.status(404).json({ error: 'Transaction not found' });
      return;
    }
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
};

// Get finance summary
export const getFinanceSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.date = {};
      if (startDate) dateFilter.date.$gte = new Date(startDate as string);
      if (endDate) dateFilter.date.$lte = new Date(endDate as string);
    }

    const [incomeResult, expenseResult] = await Promise.all([
      Transaction.aggregate([
        { $match: { type: 'income', status: 'completed', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { type: 'expense', status: 'completed', ...dateFilter } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const totalIncome = incomeResult[0]?.total || 0;
    const totalExpense = expenseResult[0]?.total || 0;
    const netProfit = totalIncome - totalExpense;

    res.json({
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin: totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(2) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch finance summary' });
  }
};

// Get transactions by category
export const getTransactionsByCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.query;
    
    let matchFilter: any = { status: 'completed' };
    if (type) matchFilter.type = type;

    const result = await Transaction.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { category: '$category', type: '$type' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch category summary' });
  }
};

// Get monthly report
export const getMonthlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const currentYear = new Date().getFullYear();
    
    const result = await Transaction.aggregate([
      {
        $match: {
          status: 'completed',
          date: {
            $gte: new Date(`${currentYear}-01-01`),
            $lte: new Date(`${currentYear}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);

    // Format result
    const months = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      income: 0,
      expense: 0,
    }));

    result.forEach((item) => {
      const monthIndex = item._id.month - 1;
      if (item._id.type === 'income') {
        months[monthIndex].income = item.total;
      } else {
        months[monthIndex].expense = item.total;
      }
    });

    res.json(months);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch monthly report' });
  }
};
