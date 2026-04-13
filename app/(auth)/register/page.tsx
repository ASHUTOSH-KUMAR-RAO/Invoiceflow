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
import Image from "next/image";

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
  const [isGithubLoading, setIsGithubLoading] = useState(false);
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

  async function handleGithubLogin() {
    setIsGithubLoading(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("GitHub login failed, please try again");
      setIsGithubLoading(false);
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
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 py-32">
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
              {/* <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 mb-6 lg:hidden"
              >
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
              </motion.div> */}

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
                    onClick={handleGithubLogin}
                    disabled={isGithubLoading}
                    className="w-full border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-lg h-10"
                  >
                    {isGithubLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 mr-2"
                          viewBox="0 0 24 24"
                          fill="white"
                        >
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        Continue with GitHub
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
