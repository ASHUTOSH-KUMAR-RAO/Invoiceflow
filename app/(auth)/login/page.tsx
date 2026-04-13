"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, } from "framer-motion";
import {
  Loader2,
  FileText,
  TrendingUp,
  Shield,
  Eye,
  EyeOff,
} from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

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

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password!");
        return;
      }
      toast.success("Welcome back! 🎉");
      router.push("/dashboard");
      router.refresh();
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
    <div className="relative min-h-screen w-full overflow-hidden pt-28">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a472a]/60 via-[#0a0a0a]/80 to-[#0a0a0a]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1a472a]/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c9a84c]/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-5xl flex items-center gap-16">

          {/* Left Side */}
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
              <span className="text-white">Create professional</span>
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #22c55e, #c9a84c)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                invoices
              </span>
              <br />
              <span className="text-white">effortlessly</span>
            </motion.h1>

            <motion.p
              variants={slideLeft}
              transition={{ duration: 0.6 }}
              className="text-white/50 text-lg font-light leading-relaxed mb-10 max-w-md"
            >
              GST-ready invoices, UPI QR codes, and WhatsApp sharing — all in
              one place.
            </motion.p>

            <motion.div variants={stagger} className="flex flex-col gap-4">
              {[
                { icon: FileText, text: "GST + UPI ready invoices" },
                { icon: TrendingUp, text: "Earnings dashboard with graphs" },
                { icon: Shield, text: "Secure and reliable platform" },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={slideLeft}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0"
                  >
                    <item.icon className="w-4 h-4 text-[#c9a84c]" />
                  </motion.div>
                  <span className="text-white/70 text-sm">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex gap-8 mt-12 pt-8 border-t border-white/10"
            >
              {[
                { num: "50K+", label: "Freelancers" },
                { num: "₹2.4Cr+", label: "Invoices sent" },
                { num: "4.9★", label: "Rating" },
              ].map((stat, i) => (
                <motion.div key={i} whileHover={{ y: -2 }}>
                  <div className="text-2xl font-bold text-white">{stat.num}</div>
                  <div className="text-white/40 text-xs mt-1">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Login Form */}
          <motion.div
            variants={slideIn}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full lg:w-[420px] flex-shrink-0"
          >
            <div className="bg-white/[0.06] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">

              

              <motion.div variants={stagger} initial="hidden" animate="visible">
                <motion.div variants={fadeUp} className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-2xl font-bold text-white">Log In</h2>
                    <div className="flex gap-3 text-sm">
                      <span className="text-white font-medium border-b-2 border-[#1a472a] pb-0.5">
                        Log In
                      </span>
                      <span className="text-white/30">/</span>
                      <Link
                        href="/register"
                        className="text-white/40 hover:text-white transition-colors"
                      >
                        Sign Up
                      </Link>
                    </div>
                  </div>
                  <p className="text-white/40 text-sm">Welcome back</p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <motion.div variants={fadeUp}>
                    <Label className="text-white/70 text-sm mb-1.5 block">
                      Email
                    </Label>
                    <Input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className="bg-white/5 border-white/10 text-white
                      placeholder:text-white/20 focus:border-[#1a472a]
                      focus:ring-[#1a472a]/20 rounded-lg h-10"
                    />
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={fadeUp}>
                    <Label className="text-white/70 text-sm mb-1.5 block">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white
                        placeholder:text-white/20 focus:border-[#1a472a]
                        focus:ring-[#1a472a]/20 rounded-lg h-10 pr-10"
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

                    {errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-xs mt-1"
                      >
                        {errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div variants={fadeUp} className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-xs text-white/30 hover:text-[#22c55e] transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </motion.div>

                  <motion.div variants={fadeUp} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg h-10 font-medium"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Logging in...
                        </span>
                      ) : (
                        "Log In"
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div
                  variants={fadeUp}
                  className="flex items-center gap-3 my-5"
                >
                  <Separator className="flex-1 bg-white/10" />
                  <span className="text-xs text-white/20">OR</span>
                  <Separator className="flex-1 bg-white/10" />
                </motion.div>

                {/* GitHub Login */}
                <motion.div variants={fadeUp} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={handleGithubLogin}
                    disabled={isGithubLoading}
                    className="w-full border-white/10 hover:border-white/20
                    bg-white/5 hover:bg-white/10 text-white rounded-lg h-10"
                  >
                    {isGithubLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="white">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                        </svg>
                        Continue with GitHub
                      </>
                    )}
                  </Button>
                </motion.div>

                <motion.p
                  variants={fadeUp}
                  className="text-center text-xs text-white/30 mt-5"
                >
                  Don't have an account?{" "}
                  <Link href="/register" className="text-[#22c55e] font-medium hover:underline">
                    Sign up
                  </Link>
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
