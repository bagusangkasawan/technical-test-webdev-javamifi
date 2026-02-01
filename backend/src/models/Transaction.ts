// Model Transaction - Skema data transaksi keuangan
import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: Date;
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    type: { type: String, enum: ['income', 'expense'], required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    reference: { type: String },
    paymentMethod: { type: String, default: 'cash' },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'completed' },
    date: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
