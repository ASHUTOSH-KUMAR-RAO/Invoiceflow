"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Clock, IndianRupee,
  FileText, PiggyBank, Receipt
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CATEGORY_COLORS: Record<string, string> = {
  SOFTWARE: "#3b82f6",
  HARDWARE: "#a855f7",
  TRAVEL: "#eab308",
  FOOD: "#f97316",
  MARKETING: "#ec4899",
  OFFICE: "#06b6d4",
  TAX: "#ef4444",
  OTHER: "#6b7280",
};

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchReports = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?year=${year}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, [year]);

  const chartData = data?.monthlyData?.map((d: any) => ({
    month: MONTHS[d.month],
    Revenue: d.revenue,
    Paid: d.paid,
    Expenses: d.expenses,
  })) || [];

  const expenseCategories = Object.entries(data?.expenseByCategory || {}).map(
    ([category, amount]) => ({ category, amount })
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        Loading reports...
      </div>
    );
  }

  const { summary, topClients } = data;

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-gray-400 text-sm mt-1">Apne business ka full overview</p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="bg-[#1a1a1a] border border-white/10 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:border-green-500"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Total Revenue</span>
            <IndianRupee size={16} className="text-green-400" />
          </div>
          <p className="text-xl font-bold text-green-400">
            ₹{summary.totalRevenue.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Amount Paid</span>
            <TrendingUp size={16} className="text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-400">
            ₹{summary.totalPaid.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Pending</span>
            <Clock size={16} className="text-yellow-400" />
          </div>
          <p className="text-xl font-bold text-yellow-400">
            ₹{summary.totalPending.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Net Profit</span>
            <PiggyBank size={16} className={summary.netProfit >= 0 ? "text-green-400" : "text-red-400"} />
          </div>
          <p className={`text-xl font-bold ${summary.netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
            ₹{summary.netProfit.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Second Row Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Total Expenses</span>
            <TrendingDown size={16} className="text-red-400" />
          </div>
          <p className="text-xl font-bold text-red-400">
            ₹{summary.totalExpenses.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">GST Collected</span>
            <FileText size={16} className="text-purple-400" />
          </div>
          <p className="text-xl font-bold text-purple-400">
            ₹{summary.totalGst.toLocaleString("en-IN")}
          </p>
        </div>

        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-xs">Tax Deductible</span>
            <Receipt size={16} className="text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-cyan-400">
            ₹{summary.deductibleExpenses.toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
        <h2 className="font-semibold mb-4">Monthly Overview</h2>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
            <YAxis stroke="#6b7280" tick={{ fontSize: 12 }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #ffffff20", borderRadius: "8px" }}
              labelStyle={{ color: "#fff" }}
              formatter={(value: any) => [`₹${value.toLocaleString("en-IN")}`, ""]}
            />
            <Legend />
            <Area type="monotone" dataKey="Revenue" stroke="#22c55e" fill="url(#colorRevenue)" strokeWidth={2} />
            <Area type="monotone" dataKey="Paid" stroke="#3b82f6" fill="url(#colorPaid)" strokeWidth={2} />
            <Area type="monotone" dataKey="Expenses" stroke="#ef4444" fill="url(#colorExpenses)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Expense by Category */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h2 className="font-semibold mb-4">Expenses by Category</h2>
          {expenseCategories.length === 0 ? (
            <p className="text-gray-500 text-sm">Koi expense nahi hai</p>
          ) : (
            <div className="space-y-3">
              {expenseCategories.map(({ category, amount }: any) => {
                const total = expenseCategories.reduce((s: number, e: any) => s + (e.amount as number), 0);
                const percent = Math.round((amount as number / total) * 100);
                return (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: CATEGORY_COLORS[category] || "#6b7280" }}>
                        {category}
                      </span>
                      <span className="text-gray-400">
                        ₹{(amount as number).toLocaleString("en-IN")} ({percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full">
                      <div
                        className="h-1.5 rounded-full"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: CATEGORY_COLORS[category] || "#6b7280",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Top Clients */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
          <h2 className="font-semibold mb-4">Top Clients</h2>
          {topClients.length === 0 ? (
            <p className="text-gray-500 text-sm">Koi client nahi hai</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((client: any, i: number) => (
                <div key={client.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-xs font-bold">
                      {i + 1}
                    </div>
                    <span className="text-sm">{client.name}</span>
                  </div>
                  <span className="text-green-400 font-medium text-sm">
                    ₹{(client.revenue as number).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
