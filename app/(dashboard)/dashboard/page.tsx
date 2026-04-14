"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  FileText,
  Users,
  TrendingUp,
  Clock,
  Plus,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useSession } from "next-auth/react";

// ==========================================
// MOCK DATA (API se replace ho jayega)
// ==========================================
const earningsData = [
  { month: "Sep", revenue: 18000, paid: 15000 },
  { month: "Oct", revenue: 24000, paid: 20000 },
  { month: "Nov", revenue: 19000, paid: 17000 },
  { month: "Dec", revenue: 31000, paid: 28000 },
  { month: "Jan", revenue: 27000, paid: 22000 },
  { month: "Feb", revenue: 35000, paid: 30000 },
  { month: "Mar", revenue: 42000, paid: 38000 },
];

const recentInvoices = [
  {
    id: "INV-0042",
    client: "Rahul Sharma",
    amount: 24500,
    status: "PAID",
    date: new Date("2026-04-10"),
  },
  {
    id: "INV-0041",
    client: "Priya Mehta",
    amount: 15000,
    status: "SENT",
    date: new Date("2026-04-08"),
  },
  {
    id: "INV-0040",
    client: "Amit Gupta",
    amount: 38000,
    status: "OVERDUE",
    date: new Date("2026-03-28"),
  },
  {
    id: "INV-0039",
    client: "Sneha Verma",
    amount: 12000,
    status: "PAID",
    date: new Date("2026-04-05"),
  },
  {
    id: "INV-0038",
    client: "Vikram Singh",
    amount: 9500,
    status: "DRAFT",
    date: new Date("2026-04-12"),
  },
];

const stats = [
  {
    title: "Total Revenue",
    value: "₹2,45,000",
    change: "+12.5%",
    positive: true,
    icon: IndianRupee,
    color: "text-[#22c55e]",
    bg: "bg-[#22c55e]/10",
  },
  {
    title: "Paid Invoices",
    value: "₹1,89,000",
    change: "+8.2%",
    positive: true,
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  {
    title: "Pending Amount",
    value: "₹56,000",
    change: "-3.1%",
    positive: false,
    icon: Clock,
    color: "text-[#c9a84c]",
    bg: "bg-[#c9a84c]/10",
  },
  {
    title: "Total Clients",
    value: "24",
    change: "+2 this month",
    positive: true,
    icon: Users,
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
];

// ==========================================
// STATUS BADGE
// ==========================================
function StatusBadge({ status }: { status: string }) {
  const config: Record<
    string,
    { label: string; className: string; icon: React.ReactNode }
  > = {
    PAID: {
      label: "Paid",
      className: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20",
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    SENT: {
      label: "Sent",
      className: "bg-blue-400/10 text-blue-400 border-blue-400/20",
      icon: <ArrowUpRight className="w-3 h-3" />,
    },
    OVERDUE: {
      label: "Overdue",
      className: "bg-red-400/10 text-red-400 border-red-400/20",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    DRAFT: {
      label: "Draft",
      className: "bg-white/5 text-white/40 border-white/10",
      icon: <XCircle className="w-3 h-3" />,
    },
    PARTIAL: {
      label: "Partial",
      className: "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const c = config[status] ?? config.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.className}`}
    >
      {c.icon} {c.label}
    </span>
  );
}

// ==========================================
// ANIMATED COUNTER
// ==========================================
function AnimatedCounter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  useEffect(() => {
    const timeout = setTimeout(() => setDisplay(value), 100);
    return () => clearTimeout(timeout);
  }, [value]);
  return <span>{display}</span>;
}

// ==========================================
// CUSTOM TOOLTIP
// ==========================================
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f1f14] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white/50 text-xs mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}: ₹{p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

// ==========================================
// MAIN DASHBOARD PAGE
// ==========================================
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
export default function DashboardPage() {
  const { data: session } = useSession();
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
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
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, {session?.user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-white/40 text-sm mt-1">
            Here's what's happening with your business today.
          </p>
        </motion.div>
        <motion.div variants={fadeUp} className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/10 hover:border-white/20 text-white/70 hover:text-white bg-transparent hover:bg-white/5 rounded-lg"
          >
            <Link href="/dashboard/clients/new">
              <Users className="w-4 h-4 mr-1.5" /> Add Client
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg"
          >
            <Link href="/dashboard/invoices/new">
              <Plus className="w-4 h-4 mr-1.5" /> New Invoice
            </Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            variants={fadeUp}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
          >
            <Card className="border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-2xl">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white/50 text-sm">{stat.title}</p>
                  <div
                    className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mb-1">
                  <AnimatedCounter value={stat.value} />
                </p>
                <p
                  className={`text-xs font-medium ${stat.positive ? "text-[#22c55e]" : "text-red-400"}`}
                >
                  {stat.change}{" "}
                  <span className="text-white/30 font-normal">
                    vs last month
                  </span>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart + Quick Stats */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Earnings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <Card className="border border-white/5 bg-white/[0.02] rounded-2xl h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white font-semibold text-base">
                    Earnings Overview
                  </CardTitle>
                  <p className="text-white/40 text-xs mt-0.5">
                    Last 7 months revenue vs paid
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5 text-white/40">
                    <span className="w-2 h-2 rounded-full bg-[#22c55e]" />{" "}
                    Revenue
                  </span>
                  <span className="flex items-center gap-1.5 text-white/40">
                    <span className="w-2 h-2 rounded-full bg-[#c9a84c]" /> Paid
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart
                  data={earningsData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#22c55e"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#c9a84c"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#c9a84c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#22c55e" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="paid"
                    name="Paid"
                    stroke="#c9a84c"
                    strokeWidth={2}
                    fill="url(#colorPaid)"
                    dot={false}
                    activeDot={{ r: 4, fill: "#c9a84c" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-4"
        >
          {/* Invoice Stats */}
          <Card className="border border-white/5 bg-white/[0.02] rounded-2xl flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-white font-semibold text-base">
                Invoice Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Paid", count: 18, color: "bg-[#22c55e]", pct: 60 },
                { label: "Pending", count: 6, color: "bg-[#c9a84c]", pct: 20 },
                { label: "Overdue", count: 3, color: "bg-red-400", pct: 10 },
                { label: "Draft", count: 3, color: "bg-white/20", pct: 10 },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/50 text-xs">{item.label}</span>
                    <span className="text-white text-xs font-medium">
                      {item.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.pct}%` }}
                      transition={{
                        delay: 0.5,
                        duration: 0.8,
                        ease: "easeOut",
                      }}
                      className={`h-full rounded-full ${item.color}`}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="border border-[#1a472a]/40 bg-[#1a472a]/5 rounded-2xl">
            <CardContent className="p-5">
              <p className="text-white/50 text-xs mb-1">This Month</p>
              <p className="text-2xl font-bold text-white mb-1">₹42,000</p>
              <p className="text-[#22c55e] text-xs font-medium">
                +20% vs last month
              </p>
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-white/30 text-xs">Target: ₹50,000</span>
                <span className="text-[#c9a84c] text-xs font-medium">84%</span>
              </div>
              <div className="mt-2 w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-[#c9a84c]"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Invoices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white font-semibold text-base">
                Recent Invoices
              </CardTitle>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white hover:bg-white/5 text-xs gap-1"
              >
                <Link href="/dashboard/invoices">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs text-white/30 font-medium px-6 py-3">
                      Invoice
                    </th>
                    <th className="text-left text-xs text-white/30 font-medium px-6 py-3">
                      Client
                    </th>
                    <th className="text-left text-xs text-white/30 font-medium px-6 py-3 hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-left text-xs text-white/30 font-medium px-6 py-3">
                      Amount
                    </th>
                    <th className="text-left text-xs text-white/30 font-medium px-6 py-3">
                      Status
                    </th>
                    <th className="text-right text-xs text-white/30 font-medium px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice, i) => (
                    <motion.tr
                      key={invoice.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.07 }}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#1a472a]/30 flex items-center justify-center">
                            <FileText className="w-4 h-4 text-[#22c55e]" />
                          </div>
                          <span className="text-white text-sm font-medium">
                            {invoice.id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/70 text-sm">
                          {invoice.client}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span className="text-white/40 text-sm">
                          {format(invoice.date, "dd MMM yyyy")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-medium text-sm">
                          ₹{invoice.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-white/40 hover:text-white hover:bg-white/5 text-xs"
                        >
                          <Link href={`/dashboard/invoices/${invoice.id}`}>
                            View <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
