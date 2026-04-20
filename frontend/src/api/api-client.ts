import {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  PnlReport,
  ReportItem,
  UserListItem,
  Restaurant,
  CreateRestaurantRequest,
  UpdateRestaurantRequest,
} from './contracts/api-contracts';

const API_URL = import.meta.env.VITE_API_URL || '';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  // Гарантируем, что путь начинается с /api, если это не полный URL
  const targetUrl = url.startsWith('http') ? url : `${API_URL}/api${url}`;
  
  const response = await fetch(targetUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      statusCode: response.status,
      message: response.statusText,
    }));
    throw new Error(error.message || 'Ошибка запроса');
  }

  return response.json();
}

// ─────────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────────

export const authApi = {
  register: (data: RegisterRequest) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: LoginRequest) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  me: () => request<User>('/auth/me'),
};

// ─────────────────────────────────────────────────────────────
// P&L Reports
// ─────────────────────────────────────────────────────────────

export const reportsApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const error = await res.json().catch(() => ({
          statusCode: res.status,
          message: res.statusText,
        }));
        throw new Error(error.message || 'Ошибка загрузки');
      }
      return res.json();
    });
  },

  list: () => request<ReportItem[]>('/reports'),

  sample: () =>
    request<{ success: boolean; pnl: PnlReport }>('/pnl/sample'),
};

// ─────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────

export const healthApi = {
  check: () =>
    request<{ status: string; timestamp: string }>('/health'),
};

// ─────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  list: () => request<Transaction[]>('/transactions'),

  create: (data: CreateTransactionRequest) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTransactionRequest) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ success: boolean; id: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  exportExcel: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/transactions/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Export error');
    return await response.blob();
  },
};


// ─────────────────────────────────────────────────────────────
// Health
// ─────────────────────────────────────────────────────────────

export const healthApi = {
  check: () =>
    request<{ status: string; timestamp: string }>('/health'),
};

// ─────────────────────────────────────────────────────────────
// Transactions
// ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  paymentMethod: 'card' | 'cash' | 'invoice';
  description: string | null;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  paymentMethod: 'card' | 'cash' | 'invoice';
  description?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  restaurantId: string;
}

export interface UpdateTransactionRequest {
  type?: 'income' | 'expense';
  category?: string;
  amount?: number;
  paymentMethod?: 'card' | 'cash' | 'invoice';
  description?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
}

export const transactionsApi = {
  list: () => request<Transaction[]>('/transactions'),

  create: (data: CreateTransactionRequest) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateTransactionRequest) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ success: boolean; id: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    }),

  exportExcel: async () => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/transactions/export`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Export error');
    return await response.blob();
  },
};

// ─────────────────────────────────────────────────────────────
// Users (Admin/Moderator)
// ─────────────────────────────────────────────────────────────

export const usersApi = {
  list: () => request<UserListItem[]>('/users/all'),

  updateRole: (id: string, role: 'ADMIN' | 'MODERATOR' | 'USER') =>
    request<UserListItem>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),

  remove: (id: string) =>
    request<{ id: string; email: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),
};

// ─────────────────────────────────────────────────────────────
// Restaurants (Admin only)
// ─────────────────────────────────────────────────────────────

export const restaurantsApi = {
  list: () => request<Restaurant[]>('/restaurants'),

  create: (data: CreateRestaurantRequest) =>
    request<Restaurant>('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateRestaurantRequest) =>
    request<Restaurant>(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    request<{ id: string; name: string }>(`/restaurants/${id}`, {
      method: 'DELETE',
    }),
};
