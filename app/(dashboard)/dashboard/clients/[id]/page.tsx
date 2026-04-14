"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  FileText,
  Edit2,
  Trash2,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import type { Client, Invoice } from "@/types";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

interface ClientWithInvoices extends Client {
  invoices: Invoice[];
  _count: { invoices: number };
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;  // ✅ Promise banaya
}) {
  const { id } = use(params);        // ✅ use() se unwrap kiya
  const router = useRouter();
  const [client, setClient] = useState<ClientWithInvoices | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchClient();
  }, [id]);               // ✅ id use kiya

  async function fetchClient() {
    try {
      const res = await fetch(`/api/clients/${id}`);   // ✅
      if (!res.ok) throw new Error();
      const data = await res.json();
      setClient(data.data);
    } catch {
      toast.error("Failed to load client");
      router.push("/dashboard/clients");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {   // ✅
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("Client deleted successfully");
      router.push("/dashboard/clients");
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#1a472a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) return null;

  const totalRevenue = client.invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.total, 0);

  const pendingAmount = client.invoices
    .filter((inv) =>
      ["SENT", "VIEWED", "PARTIAL", "OVERDUE"].includes(inv.status),
    )
    .reduce((sum, inv) => sum + inv.amountDue, 0);

  const paidInvoices = client.invoices.filter(
    (inv) => inv.status === "PAID",
  ).length;
  const overdueInvoices = client.invoices.filter(
    (inv) => inv.status === "OVERDUE",
  ).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div variants={fadeUp}>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white hover:bg-white/5 gap-2"
            >
              <Link href="/dashboard/clients">
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </Button>
          </motion.div>
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold text-white">{client.name}</h1>
            <p className="text-white/40 text-sm mt-0.5">Client Details</p>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            className="border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white gap-2"
          >
            <Link href={`/dashboard/clients/${id}/edit`}>   {/* ✅ */}
              <Edit2 className="w-4 h-4" /> Edit
            </Link>
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400 gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#0f0f0f] border border-white/10">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete Client?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/50">
                  Are you sure you want to delete{" "}
                  <strong className="text-white">{client.name}</strong>? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-red-500/80 hover:bg-red-500 text-white"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Client Info */}
        <div className="lg:col-span-1 space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-[#1a472a]/30 border border-[#1a472a]/40 flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-[#22c55e]">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    {client.name}
                  </h2>
                  {client.gstin && (
                    <span className="text-xs text-white/30 mt-1 font-mono">
                      {client.gstin}
                    </span>
                  )}
                  <Badge
                    className={`mt-2 text-xs ${
                      client.isActive
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}
                  >
                    {client.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Separator className="bg-white/5 mb-4" />

                <div className="space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-sm text-white/60 truncate">
                        {client.email}
                      </span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-sm text-white/60">
                        {client.phone}
                      </span>
                    </div>
                  )}
                  {(client.city || client.state) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-sm text-white/60">
                        {[client.city, client.state].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {client.pan && (
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-white/30 flex-shrink-0" />
                      <span className="text-sm text-white/60 font-mono">
                        PAN: {client.pan}
                      </span>
                    </div>
                  )}
                </div>

                {client.notes && (
                  <>
                    <Separator className="bg-white/5 my-4" />
                    <p className="text-xs text-white/40 leading-relaxed">
                      {client.notes}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#22c55e]" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Total Revenue</span>
                  <span className="text-[#22c55e] font-bold">
                    {formatCurrency(totalRevenue)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Pending Amount</span>
                  <span className="text-yellow-400 font-medium">
                    {formatCurrency(pendingAmount)}
                  </span>
                </div>
                <Separator className="bg-white/5" />
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Total Invoices</span>
                  <span className="text-white font-medium">
                    {client._count.invoices}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Paid</span>
                  <span className="text-green-400 font-medium">
                    {paidInvoices}
                  </span>
                </div>
                {overdueInvoices > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 text-sm">Overdue</span>
                    <span className="text-red-400 font-medium">
                      {overdueInvoices}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-white/40 text-sm">Client since</span>
                  <span className="text-white/60 text-sm">
                    {formatDate(client.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right — Invoices */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-[#22c55e]" /> Invoices
                </CardTitle>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg"
                >
                  <Link href={`/dashboard/invoices/new?clientId=${id}`}>  {/* ✅ */}
                    + New Invoice
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {client.invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <Receipt className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No invoices yet</p>
                    <Button
                      asChild
                      size="sm"
                      className="mt-4 bg-[#1a472a] hover:bg-[#1a472a]/80 text-white"
                    >
                      <Link href={`/dashboard/invoices/new?clientId=${id}`}>  {/* ✅ */}
                        Create First Invoice
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {client.invoices.map((invoice, i) => (
                      <motion.div
                        key={invoice.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                      >
                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-[#1a472a]/20 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-4 h-4 text-[#22c55e]" />
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium group-hover:text-[#22c55e] transition-colors">
                                  {invoice.invoiceNumber}
                                </p>
                                <p className="text-white/30 text-xs">
                                  {formatDate(invoice.issueDate)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(invoice.status)}`}
                              >
                                {getStatusLabel(invoice.status)}
                              </span>
                              <span className="text-white font-medium text-sm">
                                {formatCurrency(invoice.total)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
