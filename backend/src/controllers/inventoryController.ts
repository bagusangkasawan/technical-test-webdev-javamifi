// Controller Inventory - Handler untuk manajemen produk dan stok
import { Response } from 'express';
import { Product } from '../models';
import { AuthRequest } from '../middleware';

export const getAllProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, search, lowStock } = req.query;
    
    let query: any = {};
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$minStock'] };
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

// Get single product
export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

// Create product
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, sku, description, stock, minStock, price, cost, category, supplier, location } = req.body;

    // Generate SKU if not provided
    const productSku = sku || `SKU-${Date.now()}`;

    const existingProduct = await Product.findOne({ sku: productSku });
    if (existingProduct) {
      res.status(400).json({ error: 'SKU already exists' });
      return;
    }

    const product = new Product({
      name,
      sku: productSku,
      description,
      stock: stock || 0,
      minStock: minStock || 10,
      price,
      cost: cost || 0,
      category,
      supplier,
      location,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

// Update product
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

// Delete product
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

// Update stock
export const updateStock = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity, type } = req.body; // type: 'add' or 'subtract'
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (type === 'add') {
      product.stock += quantity;
    } else if (type === 'subtract') {
      if (product.stock < quantity) {
        res.status(400).json({ error: 'Insufficient stock' });
        return;
      }
      product.stock -= quantity;
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock' });
  }
};

// Get categories
export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Get inventory stats
export const getInventoryStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$minStock'] },
    });
    const totalValue = await Product.aggregate([
      { $group: { _id: null, total: { $sum: { $multiply: ['$stock', '$price'] } } } },
    ]);

    res.json({
      totalProducts,
      lowStockProducts,
      totalValue: totalValue[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory stats' });
  }
};
