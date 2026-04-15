"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Receipt,
  TrendingDown,
  FileCheck,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const CATEGORIES = [
  "ALL",
  "SOFTWARE",
  "HARDWARE",
  "TRAVEL",
  "FOOD",
  "MARKETING",
  "OFFICE",
  "TAX",
  "OTHER",
];

const CATEGORY_COLORS: Record<string, string> = {
  SOFTWARE: "bg-blue-500/20 text-blue-400",
  HARDWARE: "bg-purple-500/20 text-purple-400",
  TRAVEL: "bg-yellow-500/20 text-yellow-400",
  FOOD: "bg-orange-500/20 text-orange-400",
  MARKETING: "bg-pink-500/20 text-pink-400",
  OFFICE: "bg-cyan-500/20 text-cyan-400",
  TAX: "bg-red-500/20 text-red-400",
  OTHER: "bg-gray-500/20 text-gray-400",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  isDeductible: boolean;
}

const emptyForm = {
  title: "",
  amount: "",
  category: "OTHER",
  date: new Date().toISOString().split("T")[0],
  description: "",
  isDeductible: false,
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("ALL");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // ✅ Fix 2: useCallback to stabilize fetchExpenses
  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category !== "ALL") params.set("category", category);
      if (month) params.set("month", month);
      if (year) params.set("year", year);
      if (search) params.set("search", search);

      const res = await fetch(`/api/expenses?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setExpenses(data.expenses || []);
      setTotal(data.total || 0);
    } catch {
      // ✅ Fix 5: Error handling with toast
      toast.error("Failed to load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [category, month, year, search]);

  useEffect(() => {
    const timeout = setTimeout(() => fetchExpenses(), search ? 400 : 0);
    return () => clearTimeout(timeout);
  }, [fetchExpenses, search]);

  // ✅ Fix 3: thisMonthTotal always shows current month regardless of filter
  const now = new Date();
  const thisMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, e) => sum + e.amount, 0);

  const deductibleTotal = expenses
    .filter((e) => e.isDeductible)
    .reduce((sum, e) => sum + e.amount, 0);

  const openAdd = () => {
    setEditExpense(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (expense: Expense) => {
    setEditExpense(expense);
    setForm({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split("T")[0],
      description: expense.description || "",
      isDeductible: expense.isDeductible,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title || !form.amount) return;
    setSubmitting(true);
    try {
      const url = editExpense ? `/api/expenses/${editExpense.id}` : "/api/expenses";
      const method = editExpense ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        // ✅ Fix 1: Convert amount to number before sending
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      });

      if (!res.ok) throw new Error("Failed to save");
      toast.success(editExpense ? "Expense updated successfully" : "Expense added successfully");
      setShowModal(false);
      fetchExpenses();
    } catch {
      // ✅ Fix 5: Error handling
      toast.error("Failed to save expense. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Expense deleted successfully");
      fetchExpenses();
    } catch {
      toast.error("Failed to delete expense. Please try again.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white">Expenses</h1>
          <p className="text-white/40 text-sm mt-1">
            {expenses.length} expense{expenses.length !== 1 ? "s" : ""} total
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button
            onClick={openAdd}
            className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Expense
          </Button>
        </motion.div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Total Expenses",
            value: `₹${total.toLocaleString("en-IN")}`,
            icon: TrendingDown,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
          {
            label: "This Month",
            value: `₹${thisMonthTotal.toLocaleString("en-IN")}`,
            icon: Receipt,
            color: "text-yellow-400",
            bg: "bg-yellow-500/10",
          },
          {
            label: "Tax Deductible",
            value: `₹${deductibleTotal.toLocaleString("en-IN")}`,
            icon: FileCheck,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
        ].map((stat, i) => (
          <Card key={i} className="border border-white/5 bg-white/[0.02] rounded-2xl">
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`${stat.bg} p-2.5 rounded-xl flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-white/40 text-xs">{stat.label}</p>
                <p className={`font-bold text-xl ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search + Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-3"
      >
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search expenses..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl h-11"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11"
            >
              {category === "ALL" ? "All Categories" : category}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0f1f14] border-white/10 w-44">
            {CATEGORIES.map((c) => (
              <DropdownMenuItem
                key={c}
                onClick={() => setCategory(c)}
                className={`cursor-pointer text-white/70 hover:text-white ${category === c ? "text-[#22c55e]" : ""}`}
              >
                {c === "ALL" ? "All Categories" : c}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11"
            >
              {month ? MONTHS[parseInt(month) - 1] : "All Months"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0f1f14] border-white/10 w-40">
            <DropdownMenuItem onClick={() => setMonth("")} className="text-white/70 hover:text-white cursor-pointer">
              All Months
            </DropdownMenuItem>
            {MONTHS.map((m, i) => (
              <DropdownMenuItem
                key={m}
                onClick={() => setMonth(String(i + 1))}
                className={`cursor-pointer text-white/70 hover:text-white ${month === String(i + 1) ? "text-[#22c55e]" : ""}`}
              >
                {m}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl h-11"
            >
              {year || "All Years"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#0f1f14] border-white/10 w-32">
            <DropdownMenuItem onClick={() => setYear("")} className="text-white/70 hover:text-white cursor-pointer">
              All Years
            </DropdownMenuItem>
            {[2024, 2025, 2026].map((y) => (
              <DropdownMenuItem
                key={y}
                onClick={() => setYear(String(y))}
                className={`cursor-pointer text-white/70 hover:text-white ${year === String(y) ? "text-[#22c55e]" : ""}`}
              >
                {y}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && expenses.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1a472a]/20 flex items-center justify-center mb-4">
            <Receipt className="w-8 h-8 text-[#22c55e]/50" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No expenses found</h3>
          <p className="text-white/30 text-sm mb-6 max-w-xs">
            Add your first expense to start tracking your spending.
          </p>
          <Button
            onClick={openAdd}
            className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Add Expense
          </Button>
        </motion.div>
      )}

      {/* Expense List */}
      {!loading && expenses.length > 0 && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {expenses.map((expense) => (
              <motion.div key={expense.id} variants={fadeUp} layout>
                <Card className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#1a472a]/30 transition-all rounded-2xl group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#1a472a]/20 flex items-center justify-center flex-shrink-0">
                          <Receipt className="w-5 h-5 text-[#22c55e]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold text-sm">{expense.title}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[expense.category]}`}>
                              {expense.category}
                            </span>
                            <span className="text-white/40 text-xs">
                              {new Date(expense.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                            {expense.isDeductible && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                                Tax Deductible
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-red-400 font-bold text-sm">
                          − ₹{expense.amount.toLocaleString("en-IN")}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(expense)}
                          className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(expense.id)}
                          disabled={deleteId === expense.id}
                          className="w-7 h-7 rounded-lg hover:bg-red-500/10 flex items-center justify-center text-white/30 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#0f1f14] border border-white/10 rounded-2xl w-full max-w-md p-6 space-y-4"
            >
              <h2 className="text-lg font-bold text-white">
                {editExpense ? "Edit Expense" : "Add New Expense"}
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Title *</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="e.g. Figma Subscription"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1 block">Amount (₹) *</label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-[#1a472a]"
                  >
                    {CATEGORIES.filter((c) => c !== "ALL").map((c) => (
                      <option key={c} value={c} className="bg-[#0f1f14]">{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1 block">Date</label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-xl"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/40 mb-1 block">Description (optional)</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Add a note..."
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#1a472a] resize-none"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="deductible"
                    checked={form.isDeductible}
                    onChange={(e) => setForm({ ...form, isDeductible: e.target.checked })}
                    className="w-4 h-4 accent-green-500"
                  />
                  <label htmlFor="deductible" className="text-sm text-white/60">
                    Mark as tax deductible
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !form.title || !form.amount}
                  className="flex-1 bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-xl disabled:opacity-50"
                >
                  {submitting ? "Saving..." : editExpense ? "Update Expense" : "Add Expense"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}
      >
        <AlertDialogContent className="bg-[#0f1f14] border border-white/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Expense</AlertDialogTitle>
            <AlertDialogDescription className="text-white/40">
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (confirmDeleteId) { handleDelete(confirmDeleteId); setConfirmDeleteId(null); } }}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
