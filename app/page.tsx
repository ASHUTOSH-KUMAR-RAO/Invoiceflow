"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FileText, TrendingUp, Shield, Zap, Users, Bell, ChevronDown, Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// ==========================================
// ANIMATION VARIANTS
// ==========================================
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerFast = {
  visible: { transition: { staggerChildren: 0.07 } },
};

function useScrollInView(threshold = 0.15) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: threshold });
  return { ref, inView };
}

// ==========================================
// ANIMATED GLOBE
// ==========================================
function AnimatedGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = canvas.width;
    const cx = size / 2, cy = size / 2;
    const r = size * 0.38;
    let angle = 0, animId: number;

    function drawGlobe() {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);

      const glow = ctx.createRadialGradient(cx, cy, r * 0.6, cx, cy, r * 1.4);
      glow.addColorStop(0, "rgba(34,197,94,0.08)");
      glow.addColorStop(0.5, "rgba(34,197,94,0.04)");
      glow.addColorStop(1, "rgba(34,197,94,0)");
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.4, 0, Math.PI * 2);
      ctx.fillStyle = glow; ctx.fill();

      const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
      grad.addColorStop(0, "rgba(22,101,52,0.9)");
      grad.addColorStop(0.5, "rgba(15,68,35,0.85)");
      grad.addColorStop(1, "rgba(5,30,15,0.95)");
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();

      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      ctx.strokeStyle = "rgba(34,197,94,0.15)"; ctx.lineWidth = 0.8;

      for (let lat = -80; lat <= 80; lat += 20) {
        const y = cy + r * Math.sin((lat * Math.PI) / 180);
        const rLat = r * Math.cos((lat * Math.PI) / 180);
        if (rLat > 0) { ctx.beginPath(); ctx.ellipse(cx, y, rLat, rLat * 0.15, 0, 0, Math.PI * 2); ctx.stroke(); }
      }
      for (let lon = 0; lon < 180; lon += 20) {
        const a = ((lon + angle) * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * Math.abs(Math.cos(a)), r, a > Math.PI / 2 && a < (3 * Math.PI) / 2 ? Math.PI / 2 : -Math.PI / 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34,197,94,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();

      // Orbit 1
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((angle * Math.PI) / 180 * 0.5); ctx.scale(1, 0.35);
      ctx.beginPath(); ctx.arc(0, 0, r * 1.3, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34,197,94,0.25)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 1.3, 0, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(34,197,94,0.9)"; ctx.fill(); ctx.restore();

      // Orbit 2
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((-angle * Math.PI) / 180 * 0.7 + 1); ctx.scale(0.4, 1);
      ctx.beginPath(); ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(201,168,76,0.2)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(r * 1.5, 0, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(201,168,76,0.9)"; ctx.fill(); ctx.restore();

      const highlight = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.2, cy - r * 0.2, r * 0.6);
      highlight.addColorStop(0, "rgba(255,255,255,0.08)"); highlight.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = highlight; ctx.fill();

      angle += 0.3;
      animId = requestAnimationFrame(drawGlobe);
    }
    drawGlobe();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas ref={canvasRef} width={420} height={420}
      className="w-full max-w-[420px] mx-auto"
      style={{ filter: "drop-shadow(0 0 60px rgba(34,197,94,0.2))" }}
    />
  );
}

// ==========================================
// NAVBAR
// ==========================================
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5" : ""}`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#1a472a] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Invoice<span className="text-[#c9a84c]">Flow</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {["Features", "Pricing", "FAQ"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}
              className="text-white/50 hover:text-white text-sm transition-colors">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-white/70 hover:text-white hover:bg-white/5">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg">
            <Link href="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

// ==========================================
// HERO SECTION
// ==========================================
function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 pb-16 px-6 text-center">
      <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">

        <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
          <Badge className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#1a472a]/60 bg-[#1a472a]/10 mb-8 text-[#22c55e] text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse inline-block" />
            Trusted by 50,000+ freelancers across India
          </Badge>
        </motion.div>

        <motion.h1 variants={fadeUp} transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-bold leading-tight mb-6 max-w-4xl">
          <span className="text-white">Get Paid Faster,</span>
          <br />
          <span style={{ background: "linear-gradient(135deg, #22c55e, #c9a84c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Invoice Smarter
          </span>
        </motion.h1>

        <motion.p variants={fadeUp} transition={{ duration: 0.6 }}
          className="text-white/50 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          GST-ready invoices, UPI QR codes, and WhatsApp sharing — built for Indian freelancers and agencies.
        </motion.p>

        <motion.div variants={fadeUp} transition={{ duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button asChild size="lg" className="px-8 bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-full font-semibold transition-all hover:scale-105">
            <Link href="/register">Start for Free →</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="px-8 border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-full bg-transparent hover:bg-white/5">
            <a href="#features">See Features</a>
          </Button>
        </motion.div>

        <motion.div variants={fadeIn} transition={{ duration: 1, delay: 0.3 }} className="w-full max-w-lg mx-auto mb-16">
          <AnimatedGlobe />
        </motion.div>

        <motion.div variants={fadeUp} transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-white/10 w-full max-w-2xl">
          {[
            { num: "50K+", label: "Freelancers" },
            { num: "₹2.4Cr+", label: "Invoices Sent" },
            { num: "4.9★", label: "Rating" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white">{s.num}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.a href="#features"
        animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/20 hover:text-white/40 transition-colors">
        <ChevronDown className="w-5 h-5" />
      </motion.a>
    </section>
  );
}

// ==========================================
// FEATURES SECTION
// ==========================================
const features = [
  { icon: FileText, title: "GST-Ready Invoices", desc: "CGST, SGST, IGST auto-calculated. Generate professional PDF invoices in seconds." },
  { icon: Zap, title: "UPI QR Codes", desc: "Auto-generate UPI QR codes on every invoice. Get paid instantly without chasing." },
  { icon: Users, title: "Client Management", desc: "Manage unlimited clients, track their payment history, and send reminders." },
  { icon: TrendingUp, title: "Earnings Dashboard", desc: "Visual graphs of your income, expenses, and outstanding payments at a glance." },
  { icon: Bell, title: "Payment Reminders", desc: "Automated WhatsApp & email reminders so you never have to follow up manually." },
  { icon: Shield, title: "Secure & Reliable", desc: "Bank-level encryption. Your data is safe, private, and always backed up." },
];

function FeaturesSection() {
  const { ref, inView } = useScrollInView();

  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[#22c55e] text-sm font-medium mb-3">Features</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4">Everything you need</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 text-lg max-w-xl mx-auto">
            Built specifically for Indian freelancers, consultants, and agencies.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerFast} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Card className="h-full p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-[#1a472a]/40 transition-colors group cursor-default rounded-2xl">
                <CardContent className="p-0">
                  <div className="w-10 h-10 rounded-xl bg-[#1a472a]/30 flex items-center justify-center mb-4 group-hover:bg-[#1a472a]/50 transition-colors">
                    <f.icon className="w-5 h-5 text-[#22c55e]" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// HOW IT WORKS
// ==========================================
const steps = [
  { num: "01", title: "Add Your Client", desc: "Add client details once — name, GSTIN, address. InvoiceFlow remembers everything." },
  { num: "02", title: "Create Invoice", desc: "Pick items, set rates, add GST. Invoice is ready in under 60 seconds." },
  { num: "03", title: "Share & Get Paid", desc: "Send via WhatsApp, email, or link. UPI QR code is auto-attached." },
];

function HowItWorksSection() {
  const { ref, inView } = useScrollInView();

  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[#22c55e] text-sm font-medium mb-3">How it works</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4">3 steps to get paid</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 text-lg">From zero to invoice in under 2 minutes.</motion.p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center relative">
              <motion.div
                whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}
                className="w-20 h-20 rounded-full border-2 border-[#1a472a]/60 bg-[#1a472a]/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-[#22c55e] text-2xl font-bold">{s.num}</span>
              </motion.div>
              <h3 className="text-white font-semibold text-xl mb-3">{s.title}</h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// PRICING SECTION
// ==========================================
const plans = [
  {
    name: "Free", price: "₹0", period: "/forever", desc: "Perfect to get started",
    features: ["5 invoices/month", "1 client", "PDF download", "Basic GST"],
    cta: "Get Started", href: "/register", highlight: false,
  },
  {
    name: "Pro", price: "₹299", period: "/month", desc: "For active freelancers",
    features: ["Unlimited invoices", "Unlimited clients", "UPI QR codes", "WhatsApp sharing", "Payment reminders", "Expense tracking"],
    cta: "Start Pro", href: "/register?plan=pro", highlight: true,
  },
  {
    name: "Agency", price: "₹799", period: "/month", desc: "For teams & agencies",
    features: ["Everything in Pro", "5 team members", "Multiple businesses", "Priority support", "Custom branding", "API access"],
    cta: "Start Agency", href: "/register?plan=agency", highlight: false,
  },
];

function PricingSection() {
  const { ref, inView } = useScrollInView();

  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[#22c55e] text-sm font-medium mb-3">Pricing</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, honest pricing</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 text-lg">No hidden fees. Cancel anytime.</motion.p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: plan.highlight ? -8 : -4, transition: { duration: 0.2 } }}>
              <Card className={`h-full p-8 rounded-2xl border transition-all relative ${plan.highlight ? "border-[#1a472a] bg-[#1a472a]/10" : "border-white/5 bg-white/[0.02]"}`}>
                {plan.highlight && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#1a472a] rounded-full text-white text-xs font-semibold whitespace-nowrap">
                    Most Popular
                  </motion.div>
                )}
                <CardContent className="p-0">
                  <div className="mb-6">
                    <p className="text-white/50 text-sm mb-1">{plan.name}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-white/30 text-sm">{plan.period}</span>
                    </div>
                    <p className="text-white/30 text-sm mt-1">{plan.desc}</p>
                  </div>
                  <Separator className="bg-white/5 mb-6" />
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-white/60">
                        <Check className="w-4 h-4 text-[#22c55e] flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full rounded-xl font-semibold ${plan.highlight ? "bg-[#1a472a] hover:bg-[#1a472a]/80 text-white" : "border border-white/10 hover:border-white/20 text-white/70 hover:text-white bg-transparent hover:bg-white/5"}`}>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// TESTIMONIALS
// ==========================================
const testimonials = [
  { name: "Rahul Sharma", role: "UI/UX Designer, Mumbai", text: "InvoiceFlow saved me 3 hours every week. My clients love the professional PDF invoices with UPI QR codes!", rating: 5 },
  { name: "Priya Mehta", role: "Freelance Developer, Bangalore", text: "Finally an Indian invoice tool that understands GST properly. CGST/SGST calculation is automatic. Incredible!", rating: 5 },
  { name: "Amit Gupta", role: "Digital Agency Owner, Delhi", text: "Managing 20+ clients was a nightmare before InvoiceFlow. Now it's effortless. WhatsApp sharing is a game changer.", rating: 5 },
];

function TestimonialsSection() {
  const { ref, inView } = useScrollInView();

  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[#22c55e] text-sm font-medium mb-3">Testimonials</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4">Loved by freelancers</motion.h2>
          <motion.p variants={fadeUp} className="text-white/40 text-lg">Join 50,000+ professionals who trust InvoiceFlow.</motion.p>
        </motion.div>

        <motion.div
          variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}>
              <Card className="h-full p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/10 transition-colors">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 text-[#c9a84c] fill-[#c9a84c]" />
                    ))}
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed mb-6">"{t.text}"</p>
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-white/30 text-xs mt-0.5">{t.role}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// FAQ SECTION
// ==========================================
const faqs = [
  { q: "Is InvoiceFlow free to use?", a: "Yes! Our free plan lets you create 5 invoices per month with 1 client. Upgrade to Pro for unlimited invoices and clients." },
  { q: "Does it support GST invoices?", a: "Absolutely. InvoiceFlow supports CGST, SGST, and IGST with auto-calculation. It's fully compliant with Indian GST rules." },
  { q: "Can I share invoices on WhatsApp?", a: "Yes! With one click, you can share a professional PDF invoice directly on WhatsApp with your client." },
  { q: "Is my data secure?", a: "Yes. We use bank-level encryption and your data is stored securely on Neon's servers. We never share your data." },
  { q: "Can I cancel anytime?", a: "Absolutely. No lock-in contracts. Cancel your subscription anytime from your dashboard." },
];

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);
  const { ref, inView } = useScrollInView();

  return (
    <section id="faq" className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div ref={ref} variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className="text-center mb-16">
          <motion.p variants={fadeUp} className="text-[#22c55e] text-sm font-medium mb-3">FAQ</motion.p>
          <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4">Common questions</motion.h2>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate={inView ? "visible" : "hidden"} className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} variants={fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}
              className="border border-white/5 rounded-xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-white/[0.02] transition-colors">
                <span className="text-white/80 font-medium text-sm">{faq.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="w-4 h-4 text-white/30 flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden">
                    <div className="px-6 pb-4">
                      <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// FINAL CTA
// ==========================================
function CTASection() {
  const { ref, inView } = useScrollInView();

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div ref={ref} variants={fadeUp} initial="hidden" animate={inView ? "visible" : "hidden"}
          transition={{ duration: 0.6 }}
          className="p-12 rounded-3xl border border-[#1a472a]/40 bg-[#1a472a]/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a472a]/10 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4">
              Ready to get paid faster?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-lg mb-8">
              Join 50,000+ freelancers. Start free, no credit card required.
            </motion.p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button asChild size="lg" className="px-10 bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-full font-semibold text-base">
                <Link href="/register">Create Free Account →</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ==========================================
// FOOTER
// ==========================================
function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/5">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1a472a] rounded-lg flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-bold">Invoice<span className="text-[#c9a84c]">Flow</span></span>
        </div>
        <p className="text-white/20 text-sm">© 2026 InvoiceFlow. Made with ❤️ in India.</p>
        <div className="flex gap-6">
          {["Privacy", "Terms", "Contact"].map((l) => (
            <a key={l} href="#" className="text-white/20 hover:text-white/50 text-sm transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

// ==========================================
// BACKGROUND
// ==========================================
function Background() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0a]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a472a]/40 via-[#0a0a0a]/80 to-[#0a0a0a]" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#1a472a]/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#c9a84c]/5 rounded-full blur-[100px]" />
    </div>
  );
}

// ==========================================
// MAIN PAGE
// ==========================================
export default function LandingPage() {
  return (
    <div className="relative min-h-screen font-sans">
      <Background />
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
