import { z } from "zod"

// ==========================================
// AUTH
// ==========================================
export const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Valid email required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// ==========================================
// CLIENT
// ==========================================
export const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().default("India"),
  notes: z.string().optional(),
})

// ==========================================
// INVOICE ITEM
// ==========================================
export const invoiceItemSchema = z.object({
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  hsnCode: z.string().optional(),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().default("nos"),
  rate: z.number().min(0, "Rate must be greater than 0"),
  taxRate: z.number().default(18),
})

// ==========================================
// INVOICE
// ==========================================
export const invoiceSchema = z.object({
  clientId: z.string().min(1, "Please select a client"),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string(),
  dueDate: z.string(),
  items: z.array(invoiceItemSchema).min(1, "Add at least one item"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discountValue: z.number().min(0).default(0),
  isGst: z.boolean().default(true),
  gstType: z.enum(["CGST_SGST", "IGST", "NONE"]).default("CGST_SGST"),
  notes: z.string().optional(),
  terms: z.string().optional(),
  currency: z.string().default("INR"),
  templateId: z.string().default("default"),
  isRecurring: z.boolean().default(false),
  recurringType: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
})

// ==========================================
// EXPENSE
// ==========================================
export const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0, "Amount must be greater than 0"),
  category: z.enum([
    "SOFTWARE", "HARDWARE", "TRAVEL", "FOOD",
    "MARKETING", "OFFICE", "TAX", "OTHER",
  ]).default("OTHER"),
  date: z.string(),
  description: z.string().optional(),
  isDeductible: z.boolean().default(false),
})

// ==========================================
// SETTINGS
// ==========================================
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  businessName: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  currency: z.string().default("INR"),
  invoicePrefix: z.string().default("INV"),
})

// ==========================================
// TYPES FROM SCHEMAS
// ==========================================
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type InvoiceInput = z.infer<typeof invoiceSchema>
export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type ProfileInput = z.infer<typeof profileSchema>
