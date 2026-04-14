"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Plus, Search, FileText, TrendingUp,
  MoreHorizontal, Edit, Trash2, Phone, Mail, Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  city?: string;
  state?: string;
  totalInvoices: number;
  totalRevenue: number;
  paidRevenue: number;
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchClients = async (q = "") => {
    try {
      setLoading(true);
      const res = await fetch(`/api/clients?search=${q}`);
      const data = await res.json();

      const mapped = (data.data || []).map((client: any) => ({
        ...client,
        totalInvoices: client._count?.invoices || 0,
        totalRevenue: client.invoices?.reduce(
          (sum: number, inv: any) => sum + (inv.total || 0), 0) || 0,
        paidRevenue: client.invoices
          ?.filter((inv: any) => inv.status === "PAID")
          .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0) || 0,
      }));

      setClients(mapped);
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  useEffect(() => {
    const timeout = setTimeout(() => fetchClients(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Client deleted successfully");
      fetchClients(search);
    } catch {
      toast.error("Failed to delete client");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-white/40 text-sm mt-1">
            {clients.length} client{clients.length !== 1 ? "s" : ""} total
          </p>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Button asChild className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg">
            <Link href="/dashboard/clients/new">
              <Plus className="w-4 h-4 mr-1.5" /> Add Client
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone..."
          className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl h-11"
        />
      </motion.div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && clients.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#1a472a]/20 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-[#22c55e]/50" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">No clients yet</h3>
          <p className="text-white/30 text-sm mb-6 max-w-xs">
            Add your first client to start creating invoices.
          </p>
          <Button asChild className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg">
            <Link href="/dashboard/clients/new">
              <Plus className="w-4 h-4 mr-1.5" /> Add First Client
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Client Cards */}
      {!loading && clients.length > 0 && (
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {clients.map((client) => (
              <motion.div
                key={client.id} variants={fadeUp} transition={{ duration: 0.4 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }} layout>
                <Card className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#1a472a]/30 transition-all rounded-2xl group">
                  <CardContent className="p-5">
                    {/* Top */}
                    <div className="flex items-start justify-between mb-4">
                      <Link href={`/dashboard/clients/${client.id}`} className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-[#1a472a]/30 flex items-center justify-center text-[#22c55e] font-bold text-sm flex-shrink-0">
                          {client.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-sm hover:text-[#22c55e] transition-colors">
                            {client.name}
                          </h3>
                          {client.city && (
                            <p className="text-white/30 text-xs mt-0.5 flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {client.city}{client.state ? `, ${client.state}` : ""}
                            </p>
                          )}
                        </div>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#0f1f14] border-white/10 w-40">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}`}
                              className="text-white/70 hover:text-white cursor-pointer gap-2">
                              <FileText className="w-4 h-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}/edit`}
                              className="text-white/70 hover:text-white cursor-pointer gap-2">
                              <Edit className="w-4 h-4" /> Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(client.id)}
                            disabled={deleting === client.id}
                            className="text-red-400 hover:text-red-300 cursor-pointer gap-2">
                            <Trash2 className="w-4 h-4" />
                            {deleting === client.id ? "Deleting..." : "Delete"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Contact */}
                    <div className="space-y-1.5 mb-4">
                      {client.email && (
                        <p className="text-white/40 text-xs flex items-center gap-1.5">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </p>
                      )}
                      {client.phone && (
                        <p className="text-white/40 text-xs flex items-center gap-1.5">
                          <Phone className="w-3 h-3 flex-shrink-0" />{client.phone}
                        </p>
                      )}
                      {client.gstin && (
                        <p className="text-white/40 text-xs flex items-center gap-1.5">
                          <Building2 className="w-3 h-3 flex-shrink-0" />GST: {client.gstin}
                        </p>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="pt-4 border-t border-white/5 grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">{client.totalInvoices}</p>
                        <p className="text-white/30 text-xs mt-0.5 flex items-center justify-center gap-1">
                          <FileText className="w-3 h-3" /> Invoices
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-white font-semibold text-sm">
                          ₹{(client.totalRevenue / 1000).toFixed(0)}k
                        </p>
                        <p className="text-white/30 text-xs mt-0.5 flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Total
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[#22c55e] font-semibold text-sm">
                          ₹{(client.paidRevenue / 1000).toFixed(0)}k
                        </p>
                        <p className="text-white/30 text-xs mt-0.5">Paid</p>
                      </div>
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
