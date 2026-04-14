"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogOut,
  ChevronDown,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ==========================================
// NAV ITEMS
// ==========================================
const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { href: "/dashboard/clients", icon: Users, label: "Clients" },
  { href: "/dashboard/expenses", icon: TrendingUp, label: "Expenses" },
  { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
];

const bottomItems = [
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

// ==========================================
// SIDEBAR
// ==========================================
function Sidebar({ collapsed, setCollapsed }: { collapsed: boolean; setCollapsed: (v: boolean) => void }) {
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 h-full z-40 flex flex-col border-r border-white/5 bg-[#0a0a0a]"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-white/5 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <Image src="/logo.jpeg" alt="InvoiceFlow" width={36} height={36} className="object-contain rounded-lg flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }} className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
                Invoice<span className="text-[#c9a84c]">Flow</span>
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative",
                  isActive
                    ? "bg-[#1a472a] text-white"
                    : "text-white/40 hover:text-white hover:bg-white/5"
                )}>
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-white" : "text-white/40 group-hover:text-white")} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.2 }} className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#22c55e] rounded-l-full" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Items */}
      <div className="py-4 px-2 border-t border-white/5 space-y-1">
        {bottomItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.15 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                  isActive ? "bg-[#1a472a] text-white" : "text-white/40 hover:text-white hover:bg-white/5"
                )}>
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.2 }} className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <button onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1a472a] border border-white/10 flex items-center justify-center text-white hover:bg-[#1a472a]/80 transition-colors z-50">
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}

// ==========================================
// TOP BAR
// ==========================================
function TopBar({ collapsed }: { collapsed: boolean }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard";
    if (pathname.startsWith("/dashboard/invoices")) return "Invoices";
    if (pathname.startsWith("/dashboard/clients")) return "Clients";
    if (pathname.startsWith("/dashboard/expenses")) return "Expenses";
    if (pathname.startsWith("/dashboard/reports")) return "Reports";
    if (pathname.startsWith("/dashboard/settings")) return "Settings";
    return "Dashboard";
  };

  return (
    <motion.header
      animate={{ paddingLeft: collapsed ? 88 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-6 border-b border-white/5 bg-[#0a0a0a]/95 backdrop-blur-md"
      style={{ left: 0 }}
    >
      <div style={{ marginLeft: collapsed ? 72 : 240 }} className="transition-all duration-300">
        <h1 className="text-white font-semibold text-lg">{getPageTitle()}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* New Invoice Button */}
        <Button asChild size="sm" className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg gap-1.5">
          <Link href="/dashboard/invoices/new">
            <Plus className="w-4 h-4" /> New Invoice
          </Link>
        </Button>

        {/* Notifications */}
        <button className="w-9 h-9 rounded-lg border border-white/10 hover:border-white/20 flex items-center justify-center text-white/50 hover:text-white transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#22c55e]" />
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#1a472a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span className="text-white/70 text-sm hidden sm:block">
                {session?.user?.name?.split(" ")[0] ?? "User"}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-white/30" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-[#0f1f14] border-white/10">
            <div className="px-3 py-2.5">
              <p className="text-white text-sm font-medium">{session?.user?.name}</p>
              <p className="text-white/40 text-xs truncate mt-0.5">{session?.user?.email}</p>
            </div>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="text-white/70 hover:text-white cursor-pointer gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="text-white/70 hover:text-white cursor-pointer gap-2">
                <Settings className="w-4 h-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 hover:text-red-300 cursor-pointer gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

// ==========================================
// DASHBOARD LAYOUT
// ==========================================
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Background subtle pattern */}
      <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
        <div className="absolute inset-0 opacity-[0.02]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
        />
      </div>

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <TopBar collapsed={collapsed} />

      {/* Main Content */}
      <motion.main
        animate={{ marginLeft: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen pt-16 p-6">
        {children}
      </motion.main>
    </div>
  );
}
