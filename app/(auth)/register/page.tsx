"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  FileText,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import { registerSchema, type RegisterInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { signIn } from "next-auth/react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const slideIn = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0 },
};
const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: { opacity: 1, x: 0 },
};

const perks = [
  "Free forever plan — no credit card needed",
  "GST-compliant invoices in 60 seconds",
  "UPI QR code auto-generated on every invoice",
  "WhatsApp & email sharing built-in",
  "Trusted by 50,000+ Indian freelancers",
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Registration failed");
        return;
      }
      toast.success("Account created! Welcome to InvoiceFlow 🎉");
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl: "/dashboard",
      });
    } catch {
      toast.error("Something went wrong, please try again");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Google sign up failed, please try again");
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#1a472a]/50 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#1a472a]/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.12, 0.05] }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 3,
          }}
          className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-[#c9a84c]/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-5xl flex items-center gap-16">
          {/* Left — Register Form */}
          <motion.div
            variants={slideIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full lg:w-[440px] flex-shrink-0"
          >
            <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
              {/* Mobile logo */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-6 lg:hidden"
              >
                <div className="w-8 h-8 bg-[#1a472a] rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-lg text-white">
                  Invoice<span className="text-[#c9a84c]">Flow</span>
                </span>
              </motion.div>

              <motion.div variants={stagger} initial="hidden" animate="visible">
                {/* Header */}
                <motion.div variants={fadeUp} className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-2xl font-bold text-white">Sign Up</h2>
                    <div className="flex gap-3 text-sm">
                      <Link
                        href="/login"
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        Log In
                      </Link>
                      <span className="text-white/30">/</span>
                      <span className="text-white font-medium border-b-2 border-[#1a472a] pb-0.5">
                        Sign Up
                      </span>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm">
                    Create your free account
                  </p>
                </motion.div>

                {/* Google First */}
                <motion.div
                  variants={fadeUp}
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ y: -1 }}
                  className="mb-5"
                >
                  <Button
                    variant="outline"
                    onClick={handleGoogleLogin}
                    disabled={isGoogleLoading}
                    className="w-full border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-lg h-10"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div
                  variants={fadeUp}
                  className="flex items-center gap-3 mb-5"
                >
                  <Separator className="flex-1 bg-white/10" />
                  <span className="text-xs text-white/20">
                    or sign up with email
                  </span>
                  <Separator className="flex-1 bg-white/10" />
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div variants={fadeUp}>
                    <Label className="text-white/70 text-sm mb-1.5 block">
                      Full Name
                    </Label>
                    <Input
                      {...register("name")}
                      type="text"
                      placeholder="Rahul Sharma"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10"
                    />
                    <AnimatePresence>
                      {errors.name && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.name.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Label className="text-white/70 text-sm mb-1.5 block">
                      Email
                    </Label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10"
                    />
                    <AnimatePresence>
                      {errors.email && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.email.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Label className="text-white/70 text-sm mb-1.5 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 characters"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.password && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.password.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Label className="text-white/70 text-sm mb-1.5 block">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("confirmPassword")}
                        type={showConfirm ? "text" : "password"}
                        placeholder="Re-enter password"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                      >
                        {showConfirm ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <AnimatePresence>
                      {errors.confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.confirmPassword.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  <motion.div variants={fadeUp} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg h-10 font-medium"
                    >
                      {isLoading ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Loader2 className="w-4 h-4 animate-spin" /> Creating
                          account...
                        </motion.span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Create Free Account
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.p
                  variants={fadeUp}
                  className="text-center text-xs text-white/30 mt-5"
                >
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="text-[#22c55e] font-medium hover:underline"
                  >
                    Log in
                  </Link>
                </motion.p>

                <motion.p
                  variants={fadeUp}
                  className="text-center text-xs text-white/20 mt-3"
                >
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="hover:text-white/40 underline">
                    Terms
                  </Link>{" "}
                  &{" "}
                  <Link
                    href="/privacy"
                    className="hover:text-white/40 underline"
                  >
                    Privacy Policy
                  </Link>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>

          {/* Right — Perks */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="hidden lg:flex flex-col flex-1"
          >
            <motion.div
              variants={slideLeft}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-10 h-10 bg-[#1a472a] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-xl tracking-tight">
                Invoice<span className="text-[#c9a84c]">Flow</span>
              </span>
            </motion.div>

            <motion.h1
              variants={slideLeft}
              transition={{ duration: 0.6 }}
              className="text-5xl font-bold leading-tight mb-4"
            >
              <span className="text-white">Start invoicing</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #22c55e, #c9a84c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                for free
              </span>
              <br />
              <span className="text-white">today</span>
            </motion.h1>

            <motion.p
              variants={slideLeft}
              transition={{ duration: 0.6 }}
              className="text-white/50 text-lg leading-relaxed mb-10 max-w-md"
            >
              Everything you need to run your freelance business like a pro —
              completely free to start.
            </motion.p>

            <motion.div variants={stagger} className="flex flex-col gap-4">
              {perks.map((perk, i) => (
                <motion.div
                  key={i}
                  variants={slideLeft}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, type: "spring" }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-[#22c55e] flex-shrink-0" />
                  </motion.div>
                  <span className="text-white/70 text-sm">{perk}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Floating card */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.5 }}
              animate={{ y: [0, -6, 0] }}
              style={{
                animationDuration: "4s",
                animationTimingFunction: "ease-in-out",
                animationIterationCount: "infinite",
              }}
              className="mt-12 p-5 rounded-2xl border border-[#1a472a]/40 bg-[#1a472a]/10"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-white/50 text-xs font-medium">
                  Invoice #INV-0042
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#22c55e]/10 text-[#22c55e] text-xs">
                  Paid ✓
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-white text-2xl font-bold">₹24,500</span>
                <span className="text-white/30 text-sm">+ GST</span>
              </div>
              <div className="text-white/30 text-xs">
                Website redesign — Rahul Sharma
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
