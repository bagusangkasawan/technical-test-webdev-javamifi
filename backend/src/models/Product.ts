// Model Product - Skema data produk untuk inventory
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  sku: string;
  description?: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  category: string;
  supplier?: string;
  location?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String },
    stock: { type: Number, default: 0 },
    minStock: { type: Number, default: 10 },
    price: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    category: { type: String, required: true },
    supplier: { type: String },
    location: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
