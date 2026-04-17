"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Loader2, Upload, CheckCircle2, Clock, Trash2,
  User, Building2, CreditCard, Bell, Shield, AlertTriangle,
  Camera, IndianRupee, Lock, Mail,
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface Profile {
  id: string; name: string | null; email: string; phone: string | null;
  image: string | null; plan: string; planExpiresAt: string | null;
  businessName: string | null; gstin: string | null; pan: string | null;
  address: string | null; city: string | null; state: string | null;
  pincode: string | null; logoUrl: string | null; signature: string | null;
  currency: string | null; invoicePrefix: string | null;
  upiId: string | null; bankName: string | null; bankAccount: string | null;
  bankIfsc: string | null; bankBranch: string | null;
  notifyEmail: boolean; notifyWhatsapp: boolean;
  pendingEmail: string | null; createdAt: string;
}

// ── FIX 1: ease ko tuple as const se fix kiya ─────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    },
  },
};

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const planConfig: Record<string, { label: string; dot: string; badge: string }> = {
  FREE:     { label: "Free",     dot: "bg-white/30",    badge: "bg-white/5 text-white/40 border border-white/10" },
  PRO:      { label: "Pro",      dot: "bg-[#c9a84c]",   badge: "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/30" },
  BUSINESS: { label: "Business", dot: "bg-[#22c55e]",   badge: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/30" },
};

// ─── Gradient Border Card ─────────────────────────────────────────────────────
function GlowCard({ children, className = "", danger = false }: {
  children: React.ReactNode; className?: string; danger?: boolean;
}) {
  return (
    <div className={`relative rounded-2xl p-px ${danger ? "bg-gradient-to-br from-red-500/20 via-white/5 to-transparent" : "bg-gradient-to-br from-[#22c55e]/20 via-white/5 to-transparent"} ${className}`}>
      <div className="bg-[#060d09] rounded-2xl h-full">
        {children}
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
// ── FIX 2: w-4.5/h-4.5 → w-4/h-4 (invalid Tailwind class) ───────────────────
function SectionHeader({ icon: Icon, title, desc, danger = false }: {
  icon: React.ElementType; title: string; desc: string; danger?: boolean;
}) {
  return (
    <div className={`flex items-center gap-4 px-6 py-5 border-b ${danger ? "border-red-500/10" : "border-white/[0.06]"}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${danger ? "bg-red-500/10" : "bg-gradient-to-br from-[#22c55e]/20 to-[#22c55e]/5"}`}>
        <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-[#22c55e]"}`} strokeWidth={1.5} />
      </div>
      <div>
        <p className={`font-semibold text-sm tracking-tight ${danger ? "text-red-400" : "text-white"}`} style={{ fontFamily: "'Syne', sans-serif" }}>{title}</p>
        <p className="text-white/35 text-xs mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{desc}</p>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/40 text-[10px] font-semibold uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        {label}
      </Label>
      {children}
    </div>
  );
}

// ─── Styled Input ─────────────────────────────────────────────────────────────
function DarkInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className="bg-white/[0.025] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[#22c55e]/40 focus:bg-[#22c55e]/[0.03] focus:ring-0 rounded-xl h-10 transition-all duration-200"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    />
  );
}

// ─── Save Button ─────────────────────────────────────────────────────────────
function SaveButton({ onClick, disabled, saving }: { onClick: () => void; disabled?: boolean; saving: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled ?? saving}
      className="bg-[#22c55e]/10 hover:bg-[#22c55e]/20 text-[#22c55e] border border-[#22c55e]/20 hover:border-[#22c55e]/40 rounded-xl px-5 transition-all duration-200"
      style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, letterSpacing: "-0.01em" }}
    >
      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
      Save Changes
    </Button>
  );
}

// ─── Upload Card ──────────────────────────────────────────────────────────────
function UploadCard({
  label, preview, uploading, onFile, previewAlt,
}: {
  label: string; preview: string | null | undefined;
  uploading: boolean; onFile: (e: React.ChangeEvent<HTMLInputElement>) => void; previewAlt: string;
}) {
  return (
    <GlowCard>
      <div className="p-4 space-y-3">
        <p className="text-white/40 text-[10px] uppercase tracking-widest font-semibold" style={{ fontFamily: "'DM Sans', sans-serif" }}>{label}</p>
        {preview
          ? <img src={preview} alt={previewAlt} className="h-16 w-full object-contain rounded-xl border border-white/[0.06] bg-white/[0.02] p-2" />
          : (
            <div className="h-16 rounded-xl border border-dashed border-white/10 flex items-center justify-center">
              <p className="text-white/20 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>No file</p>
            </div>
          )
        }
        <label>
          <Button variant="ghost" size="sm" disabled={uploading} asChild
            className="w-full border border-white/[0.08] hover:border-[#22c55e]/30 text-white/40 hover:text-[#22c55e] hover:bg-[#22c55e]/5 rounded-xl transition-all duration-200">
            <span>
              {uploading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-2" />}
              Upload
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
    </GlowCard>
  );
}

// ─── Email Validator ──────────────────────────────────────────────────────────
// ── FIX 3: Proper email regex instead of just @ check ─────────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  // ── FIX 4: deleteDialogOpen state — manually control dialog ───────────────
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [f, setF] = useState({
    name: "", phone: "", newEmail: "",
    businessName: "", gstin: "", pan: "", address: "", city: "",
    state: "", pincode: "", currency: "INR", invoicePrefix: "INV-",
    upiId: "", bankName: "", bankAccount: "", bankIfsc: "", bankBranch: "",
    notifyEmail: true, notifyWhatsapp: false,
    currentPassword: "", newPassword: "", confirmPassword: "",
  });

  const set = (k: string, v: string | boolean) => setF((p) => ({ ...p, [k]: v }));

  const { startUpload: uploadAvatar, isUploading: uploadingAvatar } = useUploadThing("profileImage");
  const { startUpload: uploadLogo,   isUploading: uploadingLogo }   = useUploadThing("businessLogo");
  const { startUpload: uploadSig,    isUploading: uploadingSig }     = useUploadThing("signature");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status !== "authenticated") return;
    fetch("/api/profile").then((r) => r.json()).then((d: Profile) => {
      setProfile(d);
      setF((p) => ({
        ...p,
        name: d.name ?? "", phone: d.phone ?? "",
        businessName: d.businessName ?? "", gstin: d.gstin ?? "", pan: d.pan ?? "",
        address: d.address ?? "", city: d.city ?? "", state: d.state ?? "",
        pincode: d.pincode ?? "", currency: d.currency ?? "INR",
        invoicePrefix: d.invoicePrefix ?? "INV-", upiId: d.upiId ?? "",
        bankName: d.bankName ?? "", bankAccount: d.bankAccount ?? "",
        bankIfsc: d.bankIfsc ?? "", bankBranch: d.bankBranch ?? "",
        notifyEmail: d.notifyEmail, notifyWhatsapp: d.notifyWhatsapp,
      }));
    }).catch(() => toast.error("Failed to load profile"));
  }, [status, router]);

  async function patch(payload: Record<string, unknown>, msg?: string) {
    setSaving(true);
    try {
      const r = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success(msg ?? d.message ?? "Saved!");
      // ── FIX 5: PATCH response se hi profile update, extra fetch hataya ────
      if (d.profile) {
        setProfile(d.profile);
      } else {
        const fresh = await fetch("/api/profile");
        if (fresh.ok) setProfile(await fresh.json());
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally { setSaving(false); }
  }

  async function handleUpload(type: "avatar" | "logo" | "sig", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploadFn = type === "avatar" ? uploadAvatar : type === "logo" ? uploadLogo : uploadSig;
    const res = await uploadFn([file]);
    if (!res?.[0]?.url) return;
    const key = type === "avatar" ? "image" : type === "logo" ? "logoUrl" : "signature";
    patch({ [key]: res[0].url }, `${type === "avatar" ? "Profile photo" : type === "logo" ? "Logo" : "Signature"} updated!`);
  }

  // ── FIX 4: deleteAccount — dialog manually band karo success/fail dono pe ──
  async function deleteAccount() {
    setDeleting(true);
    try {
      const r = await fetch("/api/profile", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast.success("Account deleted");
      setDeleteDialogOpen(false);
      router.push("/");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete account");
      // Dialog open rehne do taaki user retry kar sake
    } finally { setDeleting(false); }
  }

  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border border-[#22c55e]/20 animate-ping absolute inset-0" />
          <Loader2 className="h-8 w-8 animate-spin text-[#22c55e]" />
        </div>
        <p className="text-white/25 text-sm tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading profile…</p>
      </div>
    </div>
  );

  const plan = planConfig[profile.plan] ?? planConfig.FREE;
  const initials = (profile.name ?? profile.email ?? "??").slice(0, 2).toUpperCase();

  const tabs = [
    { value: "personal",  label: "Personal",  icon: User },
    { value: "business",  label: "Business",  icon: Building2 },
    { value: "payment",   label: "Payment",   icon: CreditCard },
    { value: "alerts",    label: "Alerts",    icon: Bell },
    { value: "security",  label: "Security",  icon: Shield },
    { value: "danger",    label: "Danger",    icon: AlertTriangle },
  ];

  return (
    <>
      {/* Move to layout.tsx in production */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');`}</style>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-5 max-w-4xl mx-auto"
      >

        {/* ── HERO PROFILE CARD ─────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-[#060d09]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_10%_0%,rgba(34,197,94,0.12),transparent)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_40%_at_90%_100%,rgba(34,197,94,0.06),transparent)]" />
            <div className="absolute inset-0 border border-[#22c55e]/15 rounded-2xl" />
            <div className="absolute inset-0 opacity-[0.025]"
              style={{ backgroundImage: "linear-gradient(rgba(34,197,94,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.5) 1px, transparent 1px)", backgroundSize: "32px 32px" }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="absolute -inset-1.5 bg-[#22c55e]/20 rounded-full blur-md opacity-60 group-hover:opacity-90 transition-opacity" />
                  <Avatar className="relative h-20 w-20 ring-2 ring-[#22c55e]/30 ring-offset-2 ring-offset-[#060d09]">
                    <AvatarImage src={profile.image ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-[#1a472a] to-[#0d2a18] text-[#22c55e] font-bold text-2xl" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 backdrop-blur-sm">
                    {uploadingAvatar
                      ? <Loader2 className="h-5 w-5 text-white animate-spin" />
                      : <Camera className="h-5 w-5 text-white" />
                    }
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("avatar", e)} />
                  </label>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-white font-bold text-2xl tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {profile.name ?? "Your Name"}
                    </h1>
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold ${plan.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${plan.dot}`} />
                      {plan.label}
                    </span>
                  </div>
                  <p className="text-white/40 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>{profile.email}</p>
                  {profile.businessName && (
                    <p className="text-[#22c55e]/50 text-xs font-medium" style={{ fontFamily: "'DM Sans', sans-serif" }}>{profile.businessName}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="flex sm:flex-col items-start sm:items-end gap-4 sm:gap-1">
                  {profile.planExpiresAt && (
                    <div className="text-right">
                      <p className="text-white/20 text-[10px] uppercase tracking-widest">Expires</p>
                      <p className="text-white/50 text-xs font-medium mt-0.5">
                        {new Date(profile.planExpiresAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer row */}
              <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
                <p className="text-white/20 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Member since{" "}
                  <span className="text-white/35">
                    {profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
                      : "—"}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[#22c55e]/60 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>Active</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── TABS ─────────────────────────────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <Tabs defaultValue="personal">
            <div className="flex flex-col lg:flex-row gap-4">

              {/* Sidebar */}
              <div className="lg:w-48 shrink-0">
                <TabsList className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible bg-transparent h-auto gap-1 p-0 w-full">
                  {tabs.map(({ value, label, icon: Icon }) => (
                    <TabsTrigger
                      key={value}
                      value={value}
                      className={`
                        group relative flex items-center gap-2.5
                        px-3 lg:px-4 py-2.5 rounded-xl
                        text-xs font-semibold transition-all duration-200
                        text-white/30 hover:text-white/60 hover:bg-white/[0.03]
                        data-[state=active]:text-white data-[state=active]:bg-white/[0.04]
                        shrink-0 lg:w-full justify-center lg:justify-start
                        whitespace-nowrap
                        ${value === "danger"
                          ? "data-[state=active]:text-red-400 data-[state=active]:bg-red-500/[0.06] hover:text-red-400/60"
                          : "data-[state=active]:text-[#22c55e]"}
                      `}
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      <span className={`
                        hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full
                        transition-all duration-200 opacity-0
                        group-data-[state=active]:opacity-100
                        ${value === "danger" ? "bg-red-400" : "bg-[#22c55e]"}
                      `} />
                      <Icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${value === "danger" ? "group-data-[state=active]:text-red-400" : "group-data-[state=active]:text-[#22c55e]"}`} strokeWidth={1.8} />
                      <span className="hidden lg:block">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="flex-1 min-w-0">

                {/* ── Personal ─────────────────────────────────────────── */}
                <TabsContent value="personal" className="mt-0">
                  <motion.div variants={fadeUp}>
                    <GlowCard>
                      <SectionHeader icon={User} title="Personal Info" desc="Update your name, phone and email" />
                      <div className="p-6 space-y-5">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Full Name">
                            <DarkInput value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="Your name" />
                          </Field>
                          <Field label="Phone">
                            <DarkInput value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
                          </Field>
                        </div>

                        <Separator className="bg-white/[0.05]" />

                        <Field label="Email Address">
                          <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#22c55e]/[0.04] border border-[#22c55e]/15 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" strokeWidth={1.5} />
                            <span className="text-white/75 font-medium flex-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{profile.email}</span>
                            <span className="text-xs text-[#22c55e]/50 font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>Verified</span>
                          </div>
                          {profile.pendingEmail && (
                            <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-[#c9a84c]/[0.04] border border-[#c9a84c]/15 text-sm mt-2">
                              <Clock className="h-4 w-4 text-[#c9a84c] shrink-0" strokeWidth={1.5} />
                              <span className="text-[#c9a84c]/70 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                Pending: <strong>{profile.pendingEmail}</strong>
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            <DarkInput
                              value={f.newEmail}
                              onChange={(e) => set("newEmail", e.target.value)}
                              placeholder="New email address"
                              type="email"
                            />
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => {
                                // ── FIX 3: Proper email validation ──────────
                                if (!isValidEmail(f.newEmail)) return toast.error("Invalid email address");
                                patch({ newEmail: f.newEmail }, "Verification email sent!");
                                set("newEmail", "");
                              }}
                              disabled={saving}
                              className="border border-white/[0.08] hover:border-[#22c55e]/30 text-white/40 hover:text-[#22c55e] hover:bg-[#22c55e]/5 rounded-xl shrink-0 transition-all duration-200"
                            >
                              <Mail className="h-4 w-4 mr-1.5" /> Change
                            </Button>
                          </div>
                          <p className="text-white/20 text-xs mt-1.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>A verification link will be sent to the new address</p>
                        </Field>

                        <div className="flex justify-end pt-1">
                          <SaveButton onClick={() => patch({ name: f.name, phone: f.phone })} saving={saving} />
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                </TabsContent>

                {/* ── Business ─────────────────────────────────────────── */}
                <TabsContent value="business" className="mt-0">
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                    <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                      <UploadCard label="Business Logo" preview={profile.logoUrl} previewAlt="Logo" uploading={uploadingLogo} onFile={(e) => handleUpload("logo", e)} />
                      <UploadCard label="Signature" preview={profile.signature} previewAlt="Signature" uploading={uploadingSig} onFile={(e) => handleUpload("sig", e)} />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                      <GlowCard>
                        <SectionHeader icon={Building2} title="Business Details" desc="Shown on your invoices" />
                        <div className="p-6 space-y-4">
                          <Field label="Business Name">
                            <DarkInput value={f.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="Company name" />
                          </Field>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="GSTIN">
                              <DarkInput value={f.gstin} onChange={(e) => set("gstin", e.target.value.toUpperCase())} placeholder="22AAAAA0000A1Z5" maxLength={15} />
                            </Field>
                            <Field label="PAN">
                              <DarkInput value={f.pan} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
                            </Field>
                            <Field label="Address">
                              <DarkInput value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" />
                            </Field>
                            <Field label="City">
                              <DarkInput value={f.city} onChange={(e) => set("city", e.target.value)} placeholder="City" />
                            </Field>
                            <Field label="State">
                              <DarkInput value={f.state} onChange={(e) => set("state", e.target.value)} placeholder="State" />
                            </Field>
                            <Field label="Pincode">
                              <DarkInput value={f.pincode} onChange={(e) => set("pincode", e.target.value)} placeholder="110001" maxLength={6} />
                            </Field>
                            <Field label="Currency">
                              <DarkInput value={f.currency} onChange={(e) => set("currency", e.target.value)} placeholder="INR" />
                            </Field>
                            <Field label="Invoice Prefix">
                              <DarkInput value={f.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} placeholder="INV-" />
                            </Field>
                          </div>
                          <div className="flex justify-end pt-1">
                            <SaveButton
                              onClick={() => patch({ businessName: f.businessName, gstin: f.gstin, pan: f.pan, address: f.address, city: f.city, state: f.state, pincode: f.pincode, currency: f.currency, invoicePrefix: f.invoicePrefix })}
                              saving={saving}
                            />
                          </div>
                        </div>
                      </GlowCard>
                    </motion.div>
                  </motion.div>
                </TabsContent>

                {/* ── Payment ──────────────────────────────────────────── */}
                <TabsContent value="payment" className="mt-0">
                  <motion.div variants={fadeUp}>
                    <GlowCard>
                      <SectionHeader icon={IndianRupee} title="Payment Details" desc="Displayed on invoices for customer payments" />
                      <div className="p-6 space-y-5">
                        <Field label="UPI ID">
                          <DarkInput value={f.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="name@upi" />
                        </Field>
                        <Separator className="bg-white/[0.05]" />
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label="Bank Name">
                            <DarkInput value={f.bankName} onChange={(e) => set("bankName", e.target.value)} placeholder="SBI, HDFC…" />
                          </Field>
                          <Field label="Account Number">
                            <DarkInput value={f.bankAccount} onChange={(e) => set("bankAccount", e.target.value)} type="password" placeholder="Account number" />
                          </Field>
                          <Field label="IFSC Code">
                            <DarkInput value={f.bankIfsc} onChange={(e) => set("bankIfsc", e.target.value.toUpperCase())} placeholder="SBIN0001234" maxLength={11} />
                          </Field>
                          <Field label="Branch">
                            <DarkInput value={f.bankBranch} onChange={(e) => set("bankBranch", e.target.value)} placeholder="Branch name" />
                          </Field>
                        </div>
                        <div className="flex justify-end pt-1">
                          <SaveButton onClick={() => patch({ upiId: f.upiId, bankName: f.bankName, bankAccount: f.bankAccount, bankIfsc: f.bankIfsc, bankBranch: f.bankBranch })} saving={saving} />
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                </TabsContent>

                {/* ── Alerts ───────────────────────────────────────────── */}
                <TabsContent value="alerts" className="mt-0">
                  <motion.div variants={fadeUp}>
                    <GlowCard>
                      <SectionHeader icon={Bell} title="Notification Preferences" desc="Choose how you want to receive updates" />
                      <div className="p-6 space-y-3">
                        {[
                          { key: "notifyEmail",    label: "Email Notifications",    desc: "Invoices, reminders and updates via email" },
                          { key: "notifyWhatsapp", label: "WhatsApp Notifications", desc: "Payment reminders on WhatsApp" },
                        ].map(({ key, label, desc }) => (
                          <div key={key} className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] hover:bg-white/[0.03] hover:border-[#22c55e]/15 p-4 transition-all duration-200 cursor-pointer">
                            <div>
                              <p className="text-white/70 font-semibold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>{label}</p>
                              <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>{desc}</p>
                            </div>
                            {/* ── FIX 6: Type-safe switch access ──────────── */}
                            <Switch
                              checked={key === "notifyEmail" ? f.notifyEmail : f.notifyWhatsapp}
                              onCheckedChange={(v) => set(key, v)}
                              className="data-[state=checked]:bg-[#22c55e]"
                            />
                          </div>
                        ))}
                        <div className="flex justify-end pt-2">
                          <SaveButton onClick={() => patch({ notifyEmail: f.notifyEmail, notifyWhatsapp: f.notifyWhatsapp })} saving={saving} />
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                </TabsContent>

                {/* ── Security ─────────────────────────────────────────── */}
                <TabsContent value="security" className="mt-0">
                  <motion.div variants={fadeUp}>
                    <GlowCard>
                      <SectionHeader icon={Lock} title="Change Password" desc="Use a strong password to secure your account" />
                      <div className="p-6 space-y-4">
                        {[
                          { key: "currentPassword", label: "Current Password",     placeholder: "Enter current password" },
                          { key: "newPassword",      label: "New Password",         placeholder: "Minimum 6 characters" },
                          { key: "confirmPassword",  label: "Confirm New Password", placeholder: "Re-enter new password" },
                        ].map(({ key, label, placeholder }) => (
                          <Field key={key} label={label}>
                            <DarkInput
                              type="password"
                              value={f[key as keyof typeof f] as string}
                              onChange={(e) => set(key, e.target.value)}
                              placeholder={placeholder}
                            />
                          </Field>
                        ))}
                        {f.newPassword && f.confirmPassword && f.newPassword !== f.confirmPassword && (
                          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/15 rounded-xl px-3 py-2">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            <span style={{ fontFamily: "'DM Sans', sans-serif" }}>Passwords do not match</span>
                          </div>
                        )}
                        <div className="flex justify-end pt-1">
                          <SaveButton
                            onClick={() => {
                              if (f.newPassword !== f.confirmPassword) return toast.error("Passwords do not match");
                              if (f.newPassword.length < 6) return toast.error("Minimum 6 characters required");
                              patch({ currentPassword: f.currentPassword, newPassword: f.newPassword }, "Password updated!");
                              set("currentPassword", ""); set("newPassword", ""); set("confirmPassword", "");
                            }}
                            disabled={saving || !f.currentPassword || !f.newPassword || f.newPassword !== f.confirmPassword}
                            saving={saving}
                          />
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                </TabsContent>

                {/* ── Danger ───────────────────────────────────────────── */}
                <TabsContent value="danger" className="mt-0">
                  <motion.div variants={fadeUp}>
                    <GlowCard danger>
                      <SectionHeader icon={AlertTriangle} title="Danger Zone" desc="Irreversible actions — proceed with caution" danger />
                      <div className="p-6">
                        <div className="rounded-xl border border-red-500/[0.12] bg-red-500/[0.03] p-5 space-y-4">
                          <div>
                            <p className="text-white/75 font-semibold text-sm" style={{ fontFamily: "'Syne', sans-serif" }}>Delete Account</p>
                            <p className="text-white/25 text-xs mt-1.5 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                              Permanently removes all your clients, invoices, expenses and data. This cannot be undone.
                            </p>
                          </div>
                          {/* ── FIX 4: open/onOpenChange se dialog manually control ── */}
                          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive" size="sm"
                                onClick={() => setDeleteDialogOpen(true)}
                                // ── FIX 2 (bonus): bg-red-500/8 → bg-red-500/10 ──────
                                className="rounded-xl bg-red-500/10 hover:bg-red-500/15 text-red-400 border border-red-500/20 transition-all duration-200"
                              >
                                <Trash2 className="h-4 w-4 mr-2" strokeWidth={1.5} /> Delete My Account
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#060d09] border border-white/[0.08] rounded-2xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription className="text-white/35" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                  All your data will be permanently deleted. Enter your password to confirm.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <DarkInput
                                type="password"
                                placeholder="Enter your password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                className="my-2"
                              />
                              <AlertDialogFooter>
                                <AlertDialogCancel
                                  onClick={() => {
                                    setDeletePassword("");
                                    setDeleteDialogOpen(false);
                                  }}
                                  className="bg-white/[0.03] border-white/[0.08] text-white/50 hover:bg-white/[0.06] hover:text-white rounded-xl"
                                >Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
                                  onClick={(e) => {
                                    e.preventDefault(); // dialog auto-close rokta hai
                                    deleteAccount();
                                  }}
                                  disabled={deleting || !deletePassword}
                                >
                                  {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                  Yes, Delete My Account
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </GlowCard>
                  </motion.div>
                </TabsContent>

              </div>
            </div>
          </Tabs>
        </motion.div>

      </motion.div>
    </>
  );
}
