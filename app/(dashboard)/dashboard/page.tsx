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
import { format } from "date-fns";
import { useSession } from "next-auth/react";

// ==========================================
// TYPES
// ==========================================
interface DashboardData {
  stats: {
    totalRevenue: number;
    totalPaid: number;
    totalPending: number;
    totalClients: number;
    statusCounts: {
      PAID: number;
      SENT: number;
      OVERDUE: number;
      DRAFT: number;
      PARTIAL: number;
    };
    thisMonth: {
      total: number;
      change: number;
    };
  };
  earningsData: { month: string; revenue: number; paid: number }[];
  recentInvoices: {
    id: string;
    realId: string;
    client: string;
    amount: number;
    status: string;
    date: string;
  }[];
}

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
// SKELETON LOADER
// ==========================================
function SkeletonCard() {
  return (
    <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
      <CardContent className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-white/10 rounded w-1/2" />
          <div className="h-8 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/3" />
        </div>
      </CardContent>
    </Card>
  );
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
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setDashData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // ==========================================
  // REAL STATS FROM API
  // ==========================================
  const stats = dashData
    ? [
        {
          title: "Total Revenue",
          value: `₹${dashData.stats.totalRevenue.toLocaleString()}`,
          change: `${dashData.stats.thisMonth.change >= 0 ? "+" : ""}${dashData.stats.thisMonth.change}%`,
          positive: dashData.stats.thisMonth.change >= 0,
          icon: IndianRupee,
          color: "text-[#22c55e]",
          bg: "bg-[#22c55e]/10",
        },
        {
          title: "Paid Invoices",
          value: `₹${dashData.stats.totalPaid.toLocaleString()}`,
          change: `${dashData.stats.statusCounts.PAID} invoices`,
          positive: true,
          icon: CheckCircle2,
          color: "text-blue-400",
          bg: "bg-blue-400/10",
        },
        {
          title: "Pending Amount",
          value: `₹${dashData.stats.totalPending.toLocaleString()}`,
          change: `${dashData.stats.statusCounts.SENT + dashData.stats.statusCounts.OVERDUE} invoices`,
          positive: false,
          icon: Clock,
          color: "text-[#c9a84c]",
          bg: "bg-[#c9a84c]/10",
        },
        {
          title: "Total Clients",
          value: `${dashData.stats.totalClients}`,
          change: "active clients",
          positive: true,
          icon: Users,
          color: "text-purple-400",
          bg: "bg-purple-400/10",
        },
      ]
    : [];

  // Invoice stats bar percentages
  const totalInvoices = dashData
    ? Object.values(dashData.stats.statusCounts).reduce((a, b) => a + b, 0)
    : 0;

  const getPct = (count: number) =>
    totalInvoices === 0 ? 0 : Math.round((count / totalInvoices) * 100);

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
            Here&apos;s what&apos;s happening with your business today.
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
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <motion.div key={i} variants={fadeUp}>
                <SkeletonCard />
              </motion.div>
            ))
          : stats.map((stat, i) => (
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
              {loading ? (
                <div className="animate-pulse h-[240px] bg-white/5 rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart
                    data={dashData?.earningsData ?? []}
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
                        <stop
                          offset="95%"
                          stopColor="#22c55e"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorPaid"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#c9a84c"
                          stopOpacity={0.15}
                        />
                        <stop
                          offset="95%"
                          stopColor="#c9a84c"
                          stopOpacity={0}
                        />
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
              )}
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
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="space-y-1">
                      <div className="h-3 bg-white/10 rounded w-1/2" />
                      <div className="h-1.5 bg-white/10 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                [
                  {
                    label: "Paid",
                    count: dashData?.stats.statusCounts.PAID ?? 0,
                    color: "bg-[#22c55e]",
                    pct: getPct(dashData?.stats.statusCounts.PAID ?? 0),
                  },
                  {
                    label: "Pending",
                    count: dashData?.stats.statusCounts.SENT ?? 0,
                    color: "bg-[#c9a84c]",
                    pct: getPct(dashData?.stats.statusCounts.SENT ?? 0),
                  },
                  {
                    label: "Overdue",
                    count: dashData?.stats.statusCounts.OVERDUE ?? 0,
                    color: "bg-red-400",
                    pct: getPct(dashData?.stats.statusCounts.OVERDUE ?? 0),
                  },
                  {
                    label: "Draft",
                    count: dashData?.stats.statusCounts.DRAFT ?? 0,
                    color: "bg-white/20",
                    pct: getPct(dashData?.stats.statusCounts.DRAFT ?? 0),
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white/50 text-xs">
                        {item.label}
                      </span>
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
                ))
              )}
            </CardContent>
          </Card>

          {/* This Month */}
          <Card className="border border-[#1a472a]/40 bg-[#1a472a]/5 rounded-2xl">
            <CardContent className="p-5">
              {loading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-3 bg-white/10 rounded w-1/3" />
                  <div className="h-8 bg-white/10 rounded w-2/3" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              ) : (
                <>
                  <p className="text-white/50 text-xs mb-1">This Month</p>
                  <p className="text-2xl font-bold text-white mb-1">
                    ₹{dashData?.stats.thisMonth.total.toLocaleString() ?? 0}
                  </p>
                  <p
                    className={`text-xs font-medium ${
                      (dashData?.stats.thisMonth.change ?? 0) >= 0
                        ? "text-[#22c55e]"
                        : "text-red-400"
                    }`}
                  >
                    {(dashData?.stats.thisMonth.change ?? 0) >= 0 ? "+" : ""}
                    {dashData?.stats.thisMonth.change ?? 0}% vs last month
                  </p>
                </>
              )}
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
            {loading ? (
              <div className="animate-pulse p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-8 w-8 bg-white/10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-white/10 rounded w-1/3" />
                      <div className="h-3 bg-white/10 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : dashData?.recentInvoices.length === 0 ? (
              <div className="text-center py-12 text-white/30 text-sm">
                No invoices yet. Create your first invoice!
              </div>
            ) : (
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
                    {dashData?.recentInvoices.map((invoice, i) => (
                      <motion.tr
                        key={invoice.realId}
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
                            {format(new Date(invoice.date), "dd MMM yyyy")}
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
                            <Link
                              href={`/dashboard/invoices/${invoice.realId}`}
                            >
                              View <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
