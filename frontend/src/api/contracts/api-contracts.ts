// ============================================================
// API CONTRACT — Frontend ↔ Backend
// ============================================================
// Этот файл описывает все эндпоинты, их запросы и ответы.
// Является единым источником правды для фронтенд-разработчика.
// ============================================================

// ─────────────────────────────────────────────────────────────
// BASE URL
// ─────────────────────────────────────────────────────────────
// Development: http://localhost:4000
// Production:  определяется через REACT_APP_API_URL

// ─────────────────────────────────────────────────────────────
// ОБЩИЕ ТИПЫ
// ─────────────────────────────────────────────────────────────

export type UserRole = 'ADMIN' | 'MODERATOR' | 'USER';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse extends User {
  token: string;
}

export interface PnlSummary {
  totalIncome: number;
  totalExpense: number;
  netProfit: number;
  margin: number;
}

export interface PnlByCategory {
  category: string;
  total: number;
  type: 'income' | 'expense';
}

export interface PnlMonthly {
  month: string;
  income: number;
  expense: number;
  profit: number;
}

export interface PnlReport {
  summary: PnlSummary;
  byCategory: PnlByCategory[];
  monthly: PnlMonthly[];
  raw: any[];
}

export interface ReportItem {
  id: string;
  filename: string;
  createdAt: string;
}

export interface ApiError {
  statusCode: number;
  message: string;
}

// ─────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────

// POST /auth/register
export interface RegisterRequest {
  email: string;
  password: string;   // мин. 6 символов
  name?: string;
}
// → 200: AuthResponse
// → 409: { statusCode: 409, message: "Пользователь с таким email уже существует" }

// POST /auth/login
export interface LoginRequest {
  email: string;
  password: string;
}
// → 200: AuthResponse
// → 401: { statusCode: 401, message: "Неверный email или пароль" }

// GET /auth/me
// Headers: Authorization: Bearer <token>
// → 200: User
// → 401: Unauthorized

// ─────────────────────────────────────────────────────────────
// P&L REPORTS
// ─────────────────────────────────────────────────────────────

// POST /api/upload
// Headers: Authorization: Bearer <token>
// Body: multipart/form-data, поле "file"
// → 200: { success: true, message: string, pnl: PnlReport }
// → 400: { statusCode: 400, message: string }
// → 401: Unauthorized

// GET /api/reports
// Headers: Authorization: Bearer <token>
// → 200: ReportItem[]
// → 401: Unauthorized

// GET /api/pnl/sample
// → 200: { success: true, pnl: PnlReport }

// GET /api/health
// → 200: { status: "ok", timestamp: string }

// ─────────────────────────────────────────────────────────────
// USER MANAGEMENT (Admin only)
// ─────────────────────────────────────────────────────────────

// GET /users
// Headers: Authorization: Bearer <token>
// Role: ADMIN
// → 200: UserListItem[]
// → 403: Forbidden

// GET /users/all
// Headers: Authorization: Bearer <token>
// Role: ADMIN, MODERATOR
// → 200: UserListItem[]

// PATCH /users/:id/role
// Headers: Authorization: Bearer <token>
// Role: ADMIN
// Body: { role: UserRole }
// → 200: UserListItem

// DELETE /users/:id
// Headers: Authorization: Bearer <token>
// Role: ADMIN
// → 200: { id: string, email: string }

export interface UserListItem {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────
// RESTAURANTS (Admin only)
// ─────────────────────────────────────────────────────────────

export interface RestaurantOwner {
  id: string;
  email: string;
  name?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  ownerId?: string;
  owner?: RestaurantOwner;
  createdAt: string;
  updatedAt: string;
  _count?: {
    transactions: number;
    reports: number;
  };
}

export interface CreateRestaurantRequest {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  ownerId?: string;
}

export interface UpdateRestaurantRequest {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  imageUrl?: string;
  isActive?: boolean;
  ownerId?: string;
}
