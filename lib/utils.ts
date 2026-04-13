
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency
export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format date
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

// Format date for input fields
export function formatDateInput(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0]
}

// Generate invoice number
export function generateInvoiceNumber(prefix: string, number: number): string {
  return `${prefix}-${new Date().getFullYear()}-${String(number).padStart(4, "0")}`
}

// Calculate GST
export function calculateGST(amount: number, rate: number) {
  const taxAmount = (amount * rate) / 100
  const cgst = taxAmount / 2
  const sgst = taxAmount / 2
  const igst = taxAmount
  return { taxAmount, cgst, sgst, igst }
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  items: { rate: number; quantity: number; taxRate: number }[],
  discountType: "PERCENTAGE" | "FIXED",
  discountValue: number,
  gstType: "CGST_SGST" | "IGST" | "NONE"
) {
  const subtotal = items.reduce((sum, item) => sum + item.rate * item.quantity, 0)

  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * discountValue) / 100
      : discountValue

  const taxableAmount = subtotal - discountAmount

  let cgst = 0
  let sgst = 0
  let igst = 0
  let totalTax = 0

  if (gstType === "CGST_SGST") {
    const avgTaxRate =
      items.reduce((sum, item) => sum + item.taxRate, 0) / items.length
    totalTax = (taxableAmount * avgTaxRate) / 100
    cgst = totalTax / 2
    sgst = totalTax / 2
  } else if (gstType === "IGST") {
    const avgTaxRate =
      items.reduce((sum, item) => sum + item.taxRate, 0) / items.length
    totalTax = (taxableAmount * avgTaxRate) / 100
    igst = totalTax
  }

  const total = taxableAmount + totalTax

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    cgst,
    sgst,
    igst,
    totalTax,
    total,
  }
}

// Get invoice status color
export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-700",
    SENT: "bg-blue-100 text-blue-700",
    VIEWED: "bg-purple-100 text-purple-700",
    PARTIAL: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    OVERDUE: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  }
  return colors[status] || "bg-gray-100 text-gray-700"
}

// Get invoice status label
export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    SENT: "Sent",
    VIEWED: "Viewed",
    PARTIAL: "Partial",
    PAID: "Paid",
    OVERDUE: "Overdue",
    CANCELLED: "Cancelled",
  }
  return labels[status] || status
}

// Truncate text
export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

// Indian states list
export const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry",
]

// GST rates
export const GST_RATES = [0, 5, 12, 18, 28]

// Units
export const UNITS = ["nos", "hrs", "days", "kg", "ltr", "mtr", "sqft", "piece"]
