"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft, Edit2, Trash2, Download,
  Send, CheckCircle, Clock, AlertCircle,
  Plus, CreditCard, FileText, User,
  Calendar, Hash, Smartphone, Landmark,
  Banknote, Copy, Check, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

type PaymentMethod = "UPI" | "BANK_TRANSFER" | "CASH" | "CHEQUE" | "CARD" | "OTHER";

type Payment = {
  id: string;
  amount: number;
  method: string;
  transactionId?: string;
  notes?: string;
  paidAt: string;
};

type InvoiceItem = {
  id: string;
  name: string;
  description?: string;
  hsnCode?: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  taxRate: number;
  taxAmount: number;
};

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  subtotal: number;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  isGst: boolean;
  gstType: string;
  cgst: number;
  sgst: number;
  igst: number;
  totalTax: number;
  total: number;
  amountPaid: number;
  amountDue: number;
  notes?: string;
  terms?: string;
  currency: string;
  items: InvoiceItem[];
  payments: Payment[];
  client: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
  };
  user: {
    name?: string;
    businessName?: string;
    email?: string;
    phone?: string;
    gstin?: string;
    address?: string;
    city?: string;
    state?: string;
    upiId?: string;
    bankName?: string;
    bankAccount?: string;
    bankIfsc?: string;
    bankBranch?: string;
  };
};

// ── Small copy button ──────────────────────────────────────────────────────────
function CopyBtn({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="ml-2 text-white/30 hover:text-white/70 transition-colors"
    >
      {copied
        ? <Check className="w-3.5 h-3.5 text-[#22c55e]" />
        : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ── Method tab button ──────────────────────────────────────────────────────────
const METHODS: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { id: "UPI",           label: "UPI",           icon: <Smartphone className="w-4 h-4" /> },
  { id: "BANK_TRANSFER", label: "Bank Transfer",  icon: <Landmark   className="w-4 h-4" /> },
  { id: "CASH",          label: "Cash",           icon: <Banknote   className="w-4 h-4" /> },
];

export default function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSavingPayment, setIsSavingPayment] = useState(false);

  const [payment, setPayment] = useState({
    amount: 0,
    method: "UPI" as PaymentMethod,
    transactionId: "",
    notes: "",
    paidAt: new Date().toISOString().split("T")[0],
  });

  const fetchInvoice = async () => {
    try {
      const res = await fetch(`/api/invoices/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInvoice(data.data);
      setPayment((prev) => ({ ...prev, amount: data.data.amountDue }));
    } catch {
      toast.error("Failed to load invoice");
      router.push("/dashboard/invoices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchInvoice(); }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Invoice deleted successfully");
      router.push("/dashboard/invoices");
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payment.amount || payment.amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (invoice && payment.amount > invoice.amountDue) {
      toast.error(`Amount cannot exceed due amount`);
      return;
    }
    setIsSavingPayment(true);
    try {
      const res = await fetch(`/api/invoices/${id}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payment,
          transactionId: payment.transactionId.trim() || null,
          notes: payment.notes.trim() || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Payment recorded successfully");
      setIsPaymentOpen(false);
      fetchInvoice();
    } catch {
      toast.error("Failed to record payment");
    } finally {
      setIsSavingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#1a472a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!invoice) return null;

  const isOverdue = invoice.status !== "PAID" && new Date(invoice.dueDate) < new Date();
  const user = invoice.user;

  const upiUrl = user.upiId
    ? `upi://pay?pa=${user.upiId}&pn=${encodeURIComponent(user.businessName || user.name || "")}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent("Invoice " + invoice.invoiceNumber)}`
    : "";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between flex-wrap gap-3"
      >
        <div className="flex items-center gap-4">
          <motion.div variants={fadeUp}>
            <Button asChild variant="ghost" size="sm"
              className="text-white/40 hover:text-white hover:bg-white/5 gap-2">
              <Link href="/dashboard/invoices">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </Button>
          </motion.div>
          <motion.div variants={fadeUp}>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{invoice.invoiceNumber}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full ${getStatusColor(invoice.status)}`}>
                {getStatusLabel(invoice.status)}
              </span>
            </div>
            <p className="text-white/40 text-sm mt-0.5">{invoice.client.name}</p>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className="flex items-center gap-2 flex-wrap">
          {/* Record Payment Dialog — triggered from sidebar button only */}
          {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
              {/* ── UPDATED MODAL ─────────────────────────────────────────── */}
              <DialogContent className="bg-[#0a1a0f] border border-white/10 text-white max-w-md p-0 overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                  <div>
                    <DialogTitle className="text-white font-semibold text-base">
                      Record Payment
                    </DialogTitle>
                    <p className="text-white/30 text-xs mt-0.5">{invoice.invoiceNumber}</p>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4 overflow-y-auto">
                  {/* Amount Due badge + Amount input */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-white/50 text-xs uppercase tracking-wide">Amount</Label>
                      <span className="text-yellow-400 text-xs font-semibold">
                        Due: {formatCurrency(invoice.amountDue)}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">₹</span>
                      <Input
                        type="number"
                        value={payment.amount}
                        onChange={(e) => setPayment((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))}
                        className="pl-7 bg-white/5 border-white/10 text-white text-lg font-semibold focus:border-[#22c55e]/50 rounded-xl h-12 placeholder:text-white/20"
                      />
                      {payment.amount > 0 && payment.amount < invoice.amountDue && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-amber-400/80">
                          Partial
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Method Tabs */}
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-xs uppercase tracking-wide">Payment Method</Label>
                    <div className="flex gap-2">
                      {METHODS.map((m) => (
                        <button key={m.id} onClick={() => setPayment((p) => ({ ...p, method: m.id }))}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-all
                            ${payment.method === m.id
                              ? "bg-[#1a472a] text-white border border-[#22c55e]/30"
                              : "bg-white/5 text-white/40 hover:bg-white/8 hover:text-white/60 border border-transparent"
                            }`}>
                          {m.icon}
                          <span className="hidden sm:inline text-xs">{m.label}</span>
                        </button>
                      ))}
                      {/* Other methods compact dropdown */}
                      <select
                        value={["UPI","BANK_TRANSFER","CASH"].includes(payment.method) ? "" : payment.method}
                        onChange={(e) => e.target.value && setPayment((p) => ({ ...p, method: e.target.value as PaymentMethod }))}
                        className={`flex-1 rounded-xl text-xs font-medium transition-all bg-white/5 border text-white/40 px-2
                          ${!["UPI","BANK_TRANSFER","CASH"].includes(payment.method)
                            ? "border-[#22c55e]/30 bg-[#1a472a] text-white"
                            : "border-transparent"}`}
                      >
                        <option value="" className="bg-[#0a1a0f]">More</option>
                        <option value="CHEQUE"  className="bg-[#0a1a0f]">Cheque</option>
                        <option value="CARD"    className="bg-[#0a1a0f]">Card</option>
                        <option value="OTHER"   className="bg-[#0a1a0f]">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Method-specific content */}
                  <AnimatePresence mode="wait">
                    {payment.method === "UPI" && (
                      <motion.div key="upi"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                      >
                        {user.upiId ? (
                          <div className="flex items-center gap-4 bg-white/[0.03] rounded-xl p-3 border border-white/5">
                            <div className="bg-white p-2 rounded-lg shadow-lg shrink-0">
                              <QRCodeSVG value={upiUrl} size={100} level="M" includeMargin={false} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/70 text-sm font-medium truncate">{user.upiId}</p>
                              <p className="text-white/30 text-xs mt-0.5">GPay · PhonePe · Paytm</p>
                              {payment.amount > 0 && (
                                <div className="mt-2 inline-flex bg-[#1a472a]/40 border border-[#22c55e]/20 rounded-lg px-2.5 py-1">
                                  <p className="text-[#22c55e] text-xs font-semibold">
                                    ₹{payment.amount.toLocaleString("en-IN")} pre-filled
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                            <p className="text-amber-400/80 text-sm">
                              UPI ID not set.{" "}
                              <Link href="/dashboard/settings" className="underline underline-offset-2">
                                Add in Settings →
                              </Link>
                            </p>
                          </div>
                        )}
                        {/* Transaction ID */}
                        <div className="mt-3 space-y-1.5">
                          <Label className="text-white/50 text-xs uppercase tracking-wide">
                            Transaction ID <span className="text-white/20 normal-case">(optional)</span>
                          </Label>
                          <Input value={payment.transactionId}
                            onChange={(e) => setPayment((p) => ({ ...p, transactionId: e.target.value }))}
                            placeholder="UPI reference number"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#22c55e]/50 rounded-xl font-mono text-sm" />
                        </div>
                      </motion.div>
                    )}

                    {payment.method === "BANK_TRANSFER" && (
                      <motion.div key="bank"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                        className="space-y-3"
                      >
                        {user.bankAccount ? (
                          <div className="bg-white/[0.03] border border-white/5 rounded-xl divide-y divide-white/5">
                            {[
                              { label: "Bank",       value: user.bankName    },
                              { label: "Account No", value: user.bankAccount },
                              { label: "IFSC",       value: user.bankIfsc    },
                              { label: "Branch",     value: user.bankBranch  },
                            ].map(({ label, value }) => (
                              <div key={label} className="flex items-center justify-between px-4 py-2.5">
                                <span className="text-white/35 text-xs">{label}</span>
                                <div className="flex items-center">
                                  <span className="text-white/80 text-sm font-mono">{value || "—"}</span>
                                  {value && <CopyBtn value={value} />}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                            <p className="text-amber-400/80 text-sm">
                              Bank details not set.{" "}
                              <Link href="/dashboard/settings" className="underline underline-offset-2">
                                Add in Settings →
                              </Link>
                            </p>
                          </div>
                        )}
                        <div className="space-y-1.5">
                          <Label className="text-white/50 text-xs uppercase tracking-wide">
                            UTR / Transaction ID <span className="text-white/20 normal-case">(optional)</span>
                          </Label>
                          <Input value={payment.transactionId}
                            onChange={(e) => setPayment((p) => ({ ...p, transactionId: e.target.value }))}
                            placeholder="NEFT/RTGS/IMPS reference"
                            className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#22c55e]/50 rounded-xl font-mono text-sm" />
                        </div>
                      </motion.div>
                    )}

                    {payment.method === "CASH" && (
                      <motion.div key="cash"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                        className="flex flex-col items-center gap-2 py-3 text-center"
                      >
                        <div className="w-10 h-10 rounded-full bg-[#1a472a]/40 border border-[#22c55e]/20 flex items-center justify-center">
                          <Banknote className="w-5 h-5 text-[#22c55e]/70" />
                        </div>
                        <p className="text-white/40 text-sm">Cash payment record ho jayega</p>
                      </motion.div>
                    )}

                    {/* Cheque / Card / Other — just transaction ID */}
                    {["CHEQUE","CARD","OTHER"].includes(payment.method) && (
                      <motion.div key="other"
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
                        className="space-y-1.5"
                      >
                        <Label className="text-white/50 text-xs uppercase tracking-wide">
                          Reference / Transaction ID <span className="text-white/20 normal-case">(optional)</span>
                        </Label>
                        <Input value={payment.transactionId}
                          onChange={(e) => setPayment((p) => ({ ...p, transactionId: e.target.value }))}
                          placeholder="Reference number"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#22c55e]/50 rounded-xl font-mono text-sm" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Payment Date */}
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-xs uppercase tracking-wide">Payment Date</Label>
                    <Input type="date" value={payment.paidAt}
                      onChange={(e) => setPayment((p) => ({ ...p, paidAt: e.target.value }))}
                      className="bg-white/5 border-white/10 text-white/80 focus:border-[#22c55e]/50 rounded-xl text-sm [color-scheme:dark]" />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <Label className="text-white/50 text-xs uppercase tracking-wide">
                      Notes <span className="text-white/20 normal-case">(optional)</span>
                    </Label>
                    <Input value={payment.notes}
                      onChange={(e) => setPayment((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="Any additional notes..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#22c55e]/50 rounded-xl text-sm" />
                  </div>
                </div>

                {/* Save Button — sticky bottom */}
                <div className="px-5 pb-4 pt-2 border-t border-white/5 shrink-0">
                  <Button onClick={handleRecordPayment} disabled={isSavingPayment || payment.amount <= 0}
                    className="w-full bg-[#1a472a] hover:bg-[#1a472a]/80 text-white h-11 rounded-xl font-medium disabled:opacity-40">
                    {isSavingPayment ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      `Mark as Paid · ₹${payment.amount > 0 ? payment.amount.toLocaleString("en-IN") : "0"}`
                    )}
                  </Button>
                </div>
              </DialogContent>
              {/* ── END MODAL ─────────────────────────────────────────────── */}
            </Dialog>
          )}

          {/* Download PDF */}
          <Button asChild variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
            <a href={`/api/invoices/${id}/pdf`} target="_blank" download>
              <Download className="w-4 h-4" /> Download PDF
            </a>
          </Button>

          {/* Edit */}
          <Button asChild variant="outline"
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2">
            <Link href={`/dashboard/invoices/${id}/edit`}>
              <Edit2 className="w-4 h-4" /> Edit
            </Link>
          </Button>

          {/* Delete */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline"
                className="border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0f0f0f] border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete Invoice?</AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  Are you sure you want to delete{" "}
                  <strong className="text-white">{invoice.invoiceNumber}</strong>? This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}
                  className="bg-red-500/80 hover:bg-red-500 text-white">
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Invoice Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client + Dates */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-white/40 text-xs mb-2 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Bill To
                    </p>
                    <Link href={`/dashboard/clients/${invoice.client.id}`}>
                      <p className="text-white font-semibold hover:text-[#22c55e] transition-colors">
                        {invoice.client.name}
                      </p>
                    </Link>
                    {invoice.client.email && <p className="text-white/40 text-sm mt-1">{invoice.client.email}</p>}
                    {invoice.client.gstin && <p className="text-white/40 text-sm font-mono">GSTIN: {invoice.client.gstin}</p>}
                    {(invoice.client.city || invoice.client.state) && (
                      <p className="text-white/40 text-sm">
                        {[invoice.client.city, invoice.client.state].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm flex items-center gap-1.5"><Hash className="w-3 h-3" /> Invoice No</span>
                      <span className="text-white font-mono text-sm">{invoice.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm flex items-center gap-1.5"><Calendar className="w-3 h-3" /> Issue Date</span>
                      <span className="text-white text-sm">{formatDate(invoice.issueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-sm flex items-center gap-1.5"><Clock className="w-3 h-3" /> Due Date</span>
                      <span className={`text-sm ${isOverdue ? "text-red-400" : "text-white"}`}>{formatDate(invoice.dueDate)}</span>
                    </div>
                    {invoice.paidAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/40 text-sm flex items-center gap-1.5"><CheckCircle className="w-3 h-3" /> Paid On</span>
                        <span className="text-green-400 text-sm">{formatDate(invoice.paidAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Items Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#22c55e]" /> Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left text-white/40 font-medium pb-3">Item</th>
                        <th className="text-right text-white/40 font-medium pb-3">Qty</th>
                        <th className="text-right text-white/40 font-medium pb-3">Rate</th>
                        <th className="text-right text-white/40 font-medium pb-3">GST</th>
                        <th className="text-right text-white/40 font-medium pb-3">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="py-3">
                            <p className="text-white font-medium">{item.name}</p>
                            {item.description && <p className="text-white/40 text-xs mt-0.5">{item.description}</p>}
                            {item.hsnCode && <p className="text-white/30 text-xs font-mono">HSN: {item.hsnCode}</p>}
                          </td>
                          <td className="py-3 text-right text-white/70">{item.quantity} {item.unit}</td>
                          <td className="py-3 text-right text-white/70">{formatCurrency(item.rate)}</td>
                          <td className="py-3 text-right text-white/70">{item.taxRate}%</td>
                          <td className="py-3 text-right text-white font-medium">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Subtotal</span>
                    <span className="text-white">{formatCurrency(invoice.subtotal)}</span>
                  </div>
                  {invoice.discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">
                        Discount {invoice.discountType === "PERCENTAGE" ? `(${invoice.discountValue}%)` : ""}
                      </span>
                      <span className="text-red-400">− {formatCurrency(invoice.discountAmount)}</span>
                    </div>
                  )}
                  {invoice.isGst && invoice.totalTax > 0 && (
                    <>
                      {invoice.gstType === "CGST_SGST" ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">CGST</span>
                            <span className="text-white">{formatCurrency(invoice.cgst)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/40">SGST</span>
                            <span className="text-white">{formatCurrency(invoice.sgst)}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">IGST</span>
                          <span className="text-white">{formatCurrency(invoice.igst)}</span>
                        </div>
                      )}
                    </>
                  )}
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-[#22c55e] font-bold text-lg">{formatCurrency(invoice.total)}</span>
                  </div>
                  {invoice.amountPaid > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Amount Paid</span>
                      <span className="text-green-400">{formatCurrency(invoice.amountPaid)}</span>
                    </div>
                  )}
                  {invoice.amountDue > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-white/40">Amount Due</span>
                      <span className="text-yellow-400 font-semibold">{formatCurrency(invoice.amountDue)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes + Terms */}
          {(invoice.notes || invoice.terms) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
                <CardContent className="pt-6 space-y-4">
                  {invoice.notes && (
                    <div>
                      <p className="text-white/40 text-xs mb-1">Notes</p>
                      <p className="text-white/70 text-sm">{invoice.notes}</p>
                    </div>
                  )}
                  {invoice.terms && (
                    <div>
                      <p className="text-white/40 text-xs mb-1">Terms & Conditions</p>
                      <p className="text-white/70 text-sm">{invoice.terms}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right — Payment Status + History */}
        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#22c55e]" /> Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/40 text-sm">Total</span>
                  <span className="text-white font-bold">{formatCurrency(invoice.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-sm">Paid</span>
                  <span className="text-green-400 font-medium">{formatCurrency(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/40 text-sm">Due</span>
                  <span className="text-yellow-400 font-medium">{formatCurrency(invoice.amountDue)}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="bg-[#22c55e] h-2 rounded-full transition-all"
                    style={{ width: `${Math.min((invoice.amountPaid / invoice.total) * 100, 100)}%` }} />
                </div>
                <p className="text-white/30 text-xs text-right">
                  {Math.round((invoice.amountPaid / invoice.total) * 100)}% paid
                </p>
                {invoice.status !== "PAID" && invoice.status !== "CANCELLED" && (
                  <Button className="w-full bg-[#1a472a] hover:bg-[#1a472a]/80 text-white gap-2 mt-2"
                    onClick={() => setIsPaymentOpen(true)}>
                    <Plus className="w-4 h-4" /> Record Payment
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {invoice.payments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-white text-sm">Payment History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {invoice.payments.map((p) => (
                    <div key={p.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div>
                        <p className="text-white text-sm font-medium">{formatCurrency(p.amount)}</p>
                        <p className="text-white/40 text-xs mt-0.5">
                          {p.method.replace("_", " ")} • {formatDate(p.paidAt)}
                        </p>
                        {p.transactionId && (
                          <p className="text-white/30 text-xs font-mono">{p.transactionId}</p>
                        )}
                      </div>
                      <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
