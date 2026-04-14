"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  total: number;
  amountDue: number;
  amountPaid: number;
  client: {
    id: string;
    name: string;
    email?: string;
    city?: string;
  };
};

const STATUS_FILTERS = [
  { label: "All", value: "" },
  { label: "Draft", value: "DRAFT" },
  { label: "Sent", value: "SENT" },
  { label: "Paid", value: "PAID" },
  { label: "Overdue", value: "OVERDUE" },
  { label: "Partial", value: "PARTIAL" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchInvoices = async (q = "", status = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      if (status) params.set("status", status);
      const res = await fetch(`/api/invoices?${params.toString()}`);
      const data = await res.json();
      setInvoices(data.data || []);
    } catch {
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchInvoices(search, statusFilter), 400);
    return () => clearTimeout(timeout);
  }, [search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Invoice deleted successfully");
      fetchInvoices(search, statusFilter);
    } catch {
      toast.error("Failed to delete invoice");
    } finally {
      setDeleting(null);
    }
  };

  // Summary stats
  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);
  const totalPending = invoices
    .filter((inv) =>
      ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(inv.status),
    )
    .reduce((sum, inv) => sum + inv.amountDue, 0);
  const overdueCount = invoices.filter(
    (inv) => inv.status === "OVERDUE",
  ).length;
  const draftCount = invoices.filter((inv) => inv.status === "DRAFT").length;

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
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-white/40 text-sm mt-1">
            {invoices.length} invoice{invoices.length !== 1 ? "s" : ""} total
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button
            asChild
            className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg"
          >
            <Link href="/dashboard/invoices/new">
              <Plus className="w-4 h-4 mr-1.5" /> New Invoice
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          {
            label: "Total Paid",
            value: formatCurrency(totalRevenue),
            icon: CheckCircle,
            color: "text-green-400",
          },
          {
            label: "Pending",
            value: formatCurrency(totalPending),
            icon: Clock,
            color: "text-yellow-400",
          },
          {
            label: "Overdue",
            value: `${overdueCount} invoices`,
            icon: AlertCircle,
            color: "text-red-400",
          },
          {
            label: "Drafts",
            value: `${draftCount} invoices`,
            icon: FileText,
            color: "text-white/40",
          },
        ].map((stat, i) => (
          <Card
            key={i}
            className="border border-white/5 bg-white/[0.02] rounded-2xl"
          >
            <CardContent className="p-4 flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color} flex-shrink-0`} />
              <div>
                <p className="text-white/40 text-xs">{stat.label}</p>
                <p className={`font-semibold text-sm ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice number or client..."
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl h-11"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2 rounded-xl h-11"
            >
              <Filter className="w-4 h-4" />
              {statusFilter ? getStatusLabel(statusFilter) : "All Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-[#0f1f14] border-white/10 w-40"
          >
            {STATUS_FILTERS.map((f) => (
              <DropdownMenuItem
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`text-white/70 hover:text-white cursor-pointer ${statusFilter === f.value ? "text-[#22c55e]" : ""}`}
              >
                {f.label}
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
      {!loading && invoices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#1a472a]/20 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-[#22c55e]/50" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No invoices yet
          </h3>
          <p className="text-white/30 text-sm mb-6 max-w-xs">
            Create your first invoice to get started.
          </p>
          <Button
            asChild
            className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg"
          >
            <Link href="/dashboard/invoices/new">
              <Plus className="w-4 h-4 mr-1.5" /> Create Invoice
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Invoice List */}
      {!loading && invoices.length > 0 && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {invoices.map((invoice) => (
              <motion.div key={invoice.id} variants={fadeUp} layout>
                <Card className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#1a472a]/30 transition-all rounded-2xl group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* Left */}
                      <Link
                        href={`/dashboard/invoices/${invoice.id}`}
                        className="flex items-center gap-4 flex-1 min-w-0"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1a472a]/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#22c55e]" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-semibold text-sm">
                              {invoice.invoiceNumber}
                            </p>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(invoice.status)}`}
                            >
                              {getStatusLabel(invoice.status)}
                            </span>
                          </div>
                          <p className="text-white/40 text-xs mt-0.5 truncate">
                            {invoice.client.name}
                            {invoice.client.city
                              ? ` • ${invoice.client.city}`
                              : ""}
                          </p>
                        </div>
                      </Link>

                      {/* Middle — Dates */}
                      <div className="hidden md:block text-center">
                        <p className="text-white/40 text-xs">Issue Date</p>
                        <p className="text-white/70 text-sm">
                          {formatDate(invoice.issueDate)}
                        </p>
                      </div>
                      <div className="hidden md:block text-center">
                        <p className="text-white/40 text-xs">Due Date</p>
                        <p
                          className={`text-sm ${invoice.status === "OVERDUE" ? "text-red-400" : "text-white/70"}`}
                        >
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>

                      {/* Right — Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-sm">
                          {formatCurrency(invoice.total)}
                        </p>
                        {invoice.amountDue > 0 && invoice.status !== "PAID" && (
                          <p className="text-yellow-400 text-xs">
                            Due: {formatCurrency(invoice.amountDue)}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="bg-[#0f1f14] border-white/10 w-40"
                        >
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/invoices/${invoice.id}`}
                              className="text-white/70 hover:text-white cursor-pointer gap-2"
                            >
                              <Eye className="w-4 h-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/dashboard/invoices/${invoice.id}/edit`}
                              className="text-white/70 hover:text-white cursor-pointer gap-2"
                            >
                              <Edit className="w-4 h-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/10" />
                          <DropdownMenuItem
                            onClick={() => handleDelete(invoice.id)}
                            disabled={deleting === invoice.id}
                            className="text-red-400 hover:text-red-300 cursor-pointer gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            {deleting === invoice.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
