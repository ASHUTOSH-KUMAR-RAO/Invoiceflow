// ==========================================
// ENUMS
// ==========================================
export type Plan = "FREE" | "PRO" | "AGENCY";
export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PARTIAL"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";
export type GstType = "CGST_SGST" | "IGST" | "NONE";
export type DiscountType = "PERCENTAGE" | "FIXED";
export type RecurringType = "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type PaymentMethod =
  | "UPI"
  | "BANK_TRANSFER"
  | "CASH"
  | "CHEQUE"
  | "CARD"
  | "RAZORPAY"
  | "OTHER";
export type ExpenseCategory =
  | "SOFTWARE"
  | "HARDWARE"
  | "TRAVEL"
  | "FOOD"
  | "MARKETING"
  | "OFFICE"
  | "TAX"
  | "OTHER";

// ==========================================
// USER
// ==========================================
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  businessName?: string | null;
  gstin?: string | null;
  pan?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  logoUrl?: string | null;
  currency: string;
  invoicePrefix: string;
  nextInvoiceNo: number;
  plan: Plan;
  planExpiresAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// CLIENT
// ==========================================
export interface Client {
  id: string;
  userId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  gstin?: string | null;
  pan?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country: string;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  invoices?: Invoice[];
  _count?: { invoices: number };
}

// ==========================================
// INVOICE ITEM
// ==========================================
export interface InvoiceItem {
  id: string;
  invoiceId: string;
  name: string;
  description?: string | null;
  hsnCode?: string | null;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
}

// ==========================================
// PAYMENT
// ==========================================
export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  transactionId?: string | null;
  notes?: string | null;
  paidAt: Date;
}

// ==========================================
// INVOICE
// ==========================================
export interface Invoice {
  id: string;
  userId: string;
  clientId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  paidAt?: Date | null;
  subtotal: number;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  isGst: boolean;
  gstType: GstType;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes?: string | null;
  terms?: string | null;
  currency: string;
  templateId: string;
  isRecurring: boolean;
  recurringType?: RecurringType | null;
  nextDueDate?: Date | null;
  reminderSent: boolean;
  reminderCount: number;
  lastReminderAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  client?: Client;
  items?: InvoiceItem[];
  payments?: Payment[];
}

// ==========================================
// EXPENSE
// ==========================================
export interface Expense {
  id: string;
  userId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: Date;
  description?: string | null;
  receiptUrl?: string | null;
  isDeductible: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==========================================
// DASHBOARD
// ==========================================
export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalClients: number;
  monthlyRevenue: MonthlyRevenue[];
  topClients: TopClient[];
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  invoices: number;
}

export interface TopClient {
  id: string;
  name: string;
  totalRevenue: number;
  invoiceCount: number;
}

// ==========================================
// API RESPONSE
// ==========================================
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ==========================================
// PAGINATION
// ==========================================
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
