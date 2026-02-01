// User Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  department?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department?: string;
  };
}

// Product Types
export interface Product {
  _id: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalProducts: number;
  lowStockProducts: number;
  totalValue: number;
}

// Transaction Types
export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  reference?: string;
  paymentMethod?: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  profitMargin: number;
}

export interface MonthlyReport {
  month: number;
  income: number;
  expense: number;
}

// Project Types
export interface Task {
  _id: string;
  title: string;
  description?: string;
  assignee?: User;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in-progress' | 'review' | 'done';
  dueDate?: string;
  done: boolean;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description?: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  budget?: number;
  manager?: User;
  team: User[];
  tasks: Task[];
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStats {
  totalProjects: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  taskStats: {
    total: number;
    completed: number;
  };
}

// Chat Types
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  _id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Types
export interface DashboardStats {
  inventory: InventoryStats;
  finance: FinanceSummary;
  projects: ProjectStats;
}
