"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Users,
  TrendingUp,
  LogOut,
  ChevronDown
} from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5" : ""
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.jpeg"
            alt="InvoiceFlow"
            width={48}
            height={48}
            className="object-contain rounded-xl"
          />
          <span className="text-white font-bold text-xl tracking-tight">
            Invoice<span className="text-[#c9a84c]">Flow</span>
          </span>
        </Link>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-8">
          {isLoggedIn ? (
            // Logged in links
            <>
              <Link href="/dashboard" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link href="/invoices" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
                <FileText className="w-3.5 h-3.5" />
                Invoices
              </Link>
              <Link href="/clients" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
                <Users className="w-3.5 h-3.5" />
                Clients
              </Link>
              <Link href="/expenses" className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
                <TrendingUp className="w-3.5 h-3.5" />
                Expenses
              </Link>
            </>
          ) : (
            // Logged out links
            <>
              {["Features", "Pricing", "FAQ"].map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`}
                  className="text-white/50 hover:text-white text-sm transition-colors">
                  {item}
                </a>
              ))}
            </>
          )}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            // User dropdown
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                  <div className="w-7 h-7 rounded-full bg-[#1a472a] flex items-center justify-center text-white text-xs font-bold">
                    {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <span className="text-white/70 text-sm hidden sm:block">
                    {session?.user?.name?.split(" ")[0] ?? "User"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#0f1f14] border-white/10">
                <div className="px-3 py-2">
                  <p className="text-white text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-white/40 text-xs truncate">{session?.user?.email}</p>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="text-white/70 hover:text-white cursor-pointer">
                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="text-white/70 hover:text-white cursor-pointer">
                    <FileText className="w-4 h-4 mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-red-400 hover:text-red-300 cursor-pointer">
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            // Auth buttons
            <>
              <Button variant="ghost" asChild className="text-white/70 hover:text-white hover:bg-white/5">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
