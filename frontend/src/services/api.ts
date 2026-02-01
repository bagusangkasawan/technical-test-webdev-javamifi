// API Service - Fungsi untuk komunikasi dengan backend REST API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('erp_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiRequest<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => apiRequest<any>('/auth/profile'),

  updatePassword: (currentPassword: string, newPassword: string) =>
    apiRequest<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Users API
export const usersApi = {
  getAll: () => apiRequest<any[]>('/users'),
  getById: (id: string) => apiRequest<any>(`/users/${id}`),
  update: (id: string, data: any) =>
    apiRequest<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// Inventory API
export const inventoryApi = {
  getAll: (params?: { category?: string; search?: string; lowStock?: boolean }) => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.lowStock) queryParams.append('lowStock', 'true');
    const query = queryParams.toString();
    return apiRequest<any[]>(`/inventory${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest<any>(`/inventory/${id}`),

  getStats: () => apiRequest<any>('/inventory/stats'),

  getCategories: () => apiRequest<string[]>('/inventory/categories'),

  create: (data: any) =>
    apiRequest<any>('/inventory', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/inventory/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateStock: (id: string, quantity: number, type: 'add' | 'subtract') =>
    apiRequest<any>(`/inventory/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ quantity, type }),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/inventory/${id}`, {
      method: 'DELETE',
    }),
};

// Finance API
export const financeApi = {
  getAll: (params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);
    const query = queryParams.toString();
    return apiRequest<any[]>(`/finance${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest<any>(`/finance/${id}`),

  getSummary: (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    const query = queryParams.toString();
    return apiRequest<any>(`/finance/summary${query ? `?${query}` : ''}`);
  },

  getByCategory: (type?: string) => {
    const query = type ? `?type=${type}` : '';
    return apiRequest<any[]>(`/finance/categories${query}`);
  },

  getMonthlyReport: () => apiRequest<any[]>('/finance/monthly'),

  create: (data: any) =>
    apiRequest<any>('/finance', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/finance/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/finance/${id}`, {
      method: 'DELETE',
    }),
};

// Projects API
export const projectsApi = {
  getAll: (params?: { status?: string; priority?: string; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.priority) queryParams.append('priority', params.priority);
    if (params?.search) queryParams.append('search', params.search);
    const query = queryParams.toString();
    return apiRequest<any[]>(`/projects${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest<any>(`/projects/${id}`),

  getStats: () => apiRequest<any>('/projects/stats'),

  create: (data: any) =>
    apiRequest<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    apiRequest<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    }),

  // Task operations
  addTask: (projectId: string, data: any) =>
    apiRequest<any>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTask: (projectId: string, taskId: string, data: any) =>
    apiRequest<any>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  toggleTask: (projectId: string, taskId: string) =>
    apiRequest<any>(`/projects/${projectId}/tasks/${taskId}/toggle`, {
      method: 'PATCH',
    }),

  deleteTask: (projectId: string, taskId: string) =>
    apiRequest<any>(`/projects/${projectId}/tasks/${taskId}`, {
      method: 'DELETE',
    }),
};

// Chat API
export const chatApi = {
  send: (prompt: string, sessionId?: string) =>
    apiRequest<{ reply: string; sessionId: string }>('/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt, sessionId }),
    }),

  analyze: (type: 'inventory' | 'finance' | 'projects') =>
    apiRequest<{ analysis: string }>(`/chat/analyze?type=${type}`),

  getSessions: () => apiRequest<any[]>('/chat/sessions'),

  getHistory: (sessionId: string) => apiRequest<any[]>(`/chat/history/${sessionId}`),

  deleteSession: (sessionId: string) =>
    apiRequest<{ message: string }>(`/chat/sessions/${sessionId}`, {
      method: 'DELETE',
    }),
};

export default {
  auth: authApi,
  users: usersApi,
  inventory: inventoryApi,
  finance: financeApi,
  projects: projectsApi,
  chat: chatApi,
};
