"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
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

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const planConfig: Record<string, { label: string; className: string }> = {
  FREE:     { label: "Free",     className: "bg-white/5 text-white/50 border border-white/10" },
  PRO:      { label: "Pro",      className: "bg-[#c9a84c]/10 text-[#c9a84c] border border-[#c9a84c]/20" },
  BUSINESS: { label: "Business", className: "bg-[#22c55e]/10 text-[#22c55e] border border-[#22c55e]/20" },
};

// ─── Reusable Card ────────────────────────────────────────────────────────────
function DarkCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
      <div className="w-9 h-9 rounded-xl bg-[#1a472a]/40 flex items-center justify-center">
        <Icon className="w-4 h-4 text-[#22c55e]" />
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-white/40 text-xs">{desc}</p>
      </div>
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-white/50 text-xs font-medium uppercase tracking-wide">{label}</Label>
      {children}
    </div>
  );
}

// ─── Styled Input ─────────────────────────────────────────────────────────────
function DarkInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className="bg-white/[0.03] border-white/10 text-white placeholder:text-white/20 focus:border-[#22c55e]/50 focus:ring-0 rounded-xl h-10"
    />
  );
}

// ─── Save Button ─────────────────────────────────────────────────────────────
function SaveButton({ onClick, disabled, saving }: { onClick: () => void; disabled?: boolean; saving: boolean }) {
  return (
    <Button
      onClick={onClick}
      disabled={disabled ?? saving}
      className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-xl px-5"
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
    <DarkCard>
      <div className="p-4 space-y-3">
        <p className="text-white/50 text-xs uppercase tracking-wide font-medium">{label}</p>
        {preview
          ? <img src={preview} alt={previewAlt} className="h-16 w-full object-contain rounded-xl border border-white/5 bg-white/[0.02] p-2" />
          : <div className="h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-white/20 text-xs">No file uploaded</div>
        }
        <label>
          <Button variant="ghost" size="sm" disabled={uploading} asChild
            className="w-full border border-white/10 hover:border-white/20 text-white/50 hover:text-white hover:bg-white/5 rounded-xl">
            <span>
              {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Upload {label}
            </span>
          </Button>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
      </div>
    </DarkCard>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);

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
      const fresh = await fetch("/api/profile");
      if (fresh.ok) setProfile(await fresh.json());
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
      router.push("/");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete account");
    } finally { setDeleting(false); }
  }

  if (!profile) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-[#22c55e]" />
        <p className="text-white/30 text-sm">Loading profile…</p>
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
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-3xl mx-auto"
    >
      {/* ── Profile Header Card ───────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <DarkCard>
          <div className="p-6 flex items-center gap-5">
            {/* Avatar with upload overlay */}
            <div className="relative group shrink-0">
              <Avatar className="h-16 w-16 ring-2 ring-[#22c55e]/20">
                <AvatarImage src={profile.image ?? undefined} />
                <AvatarFallback className="bg-[#1a472a]/50 text-[#22c55e] font-bold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                {uploadingAvatar
                  ? <Loader2 className="h-4 w-4 text-white animate-spin" />
                  : <Camera className="h-4 w-4 text-white" />
                }
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload("avatar", e)} />
              </label>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white font-semibold text-lg truncate">{profile.name ?? "User"}</p>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${plan.className}`}>
                  {plan.label}
                </span>
              </div>
              <p className="text-white/40 text-sm">{profile.email}</p>
              {profile.businessName && (
                <p className="text-white/30 text-xs mt-0.5">{profile.businessName}</p>
              )}
            </div>

            {/* Expiry */}
            {profile.planExpiresAt && (
              <div className="hidden sm:flex flex-col items-end gap-1">
                <p className="text-white/20 text-xs">Plan expires</p>
                <p className="text-white/50 text-xs font-medium">
                  {new Date(profile.planExpiresAt).toLocaleDateString("en-IN")}
                </p>
              </div>
            )}
          </div>

          {/* Member since footer */}
          <div className="border-t border-white/5 px-6 py-3">
            <p className="text-white/25 text-xs">
              Member since{" "}
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long" })
                : "—"}
            </p>
          </div>
        </DarkCard>
      </motion.div>

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <motion.div variants={fadeUp}>
        <Tabs defaultValue="personal" className="space-y-4">

          {/* Tab List */}
          <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-1.5">
            <TabsList className="w-full bg-transparent grid grid-cols-3 sm:grid-cols-6 gap-1 h-auto">
              {tabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className={`
                    flex items-center gap-1.5 py-2 px-2 rounded-xl text-xs font-medium transition-all
                    text-white/30 hover:text-white/60
                    data-[state=active]:bg-[#1a472a]/50 data-[state=active]:text-[#22c55e]
                    ${value === "danger" ? "data-[state=active]:bg-red-500/10 data-[state=active]:text-red-400" : ""}
                  `}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:block capitalize">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ── Personal Tab ─────────────────────────────────────────────── */}
          <TabsContent value="personal">
            <motion.div variants={fadeUp}>
              <DarkCard>
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

                  <Separator className="bg-white/5" />

                  <Field label="Email Address">
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#22c55e]/5 border border-[#22c55e]/15 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-[#22c55e] shrink-0" />
                      <span className="text-white/80 font-medium flex-1">{profile.email}</span>
                      <span className="text-xs text-[#22c55e]/60">Verified</span>
                    </div>
                    {profile.pendingEmail && (
                      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-[#c9a84c]/5 border border-[#c9a84c]/20 text-sm mt-2">
                        <Clock className="h-4 w-4 text-[#c9a84c] shrink-0" />
                        <span className="text-[#c9a84c]/80 text-xs">
                          Pending verification: <strong>{profile.pendingEmail}</strong>
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
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (!f.newEmail.includes("@")) return toast.error("Invalid email");
                          patch({ newEmail: f.newEmail }, "Verification email sent!");
                          set("newEmail", "");
                        }}
                        disabled={saving}
                        className="border border-white/10 hover:border-white/20 text-white/50 hover:text-white hover:bg-white/5 rounded-xl shrink-0"
                      >
                        <Mail className="h-4 w-4 mr-1.5" /> Change
                      </Button>
                    </div>
                    <p className="text-white/25 text-xs mt-1">A verification link will be sent to the new address</p>
                  </Field>

                  <div className="flex justify-end pt-1">
                    <SaveButton onClick={() => patch({ name: f.name, phone: f.phone })} saving={saving} />
                  </div>
                </div>
              </DarkCard>
            </motion.div>
          </TabsContent>

          {/* ── Business Tab ─────────────────────────────────────────────── */}
          <TabsContent value="business">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
              {/* Upload Cards Row */}
              <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
                <UploadCard
                  label="Business Logo"
                  preview={profile.logoUrl}
                  previewAlt="Logo"
                  uploading={uploadingLogo}
                  onFile={(e) => handleUpload("logo", e)}
                />
                <UploadCard
                  label="Signature"
                  preview={profile.signature}
                  previewAlt="Signature"
                  uploading={uploadingSig}
                  onFile={(e) => handleUpload("sig", e)}
                />
              </motion.div>

              {/* Business Details */}
              <motion.div variants={fadeUp}>
                <DarkCard>
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
                      <Field label="Address" >
                        <DarkInput value={f.address} onChange={(e) => set("address", e.target.value)} placeholder="Street address" className="sm:col-span-2" />
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
                    </div>
                    <Field label="Invoice Prefix">
                      <DarkInput value={f.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} placeholder="INV-" />
                    </Field>
                    <div className="flex justify-end pt-1">
                      <SaveButton
                        onClick={() => patch({ businessName: f.businessName, gstin: f.gstin, pan: f.pan, address: f.address, city: f.city, state: f.state, pincode: f.pincode, currency: f.currency, invoicePrefix: f.invoicePrefix })}
                        saving={saving}
                      />
                    </div>
                  </div>
                </DarkCard>
              </motion.div>
            </motion.div>
          </TabsContent>

          {/* ── Payment Tab ──────────────────────────────────────────────── */}
          <TabsContent value="payment">
            <motion.div variants={fadeUp}>
              <DarkCard>
                <SectionHeader icon={IndianRupee} title="Payment Details" desc="Displayed on invoices for customer payments" />
                <div className="p-6 space-y-5">
                  <Field label="UPI ID">
                    <DarkInput value={f.upiId} onChange={(e) => set("upiId", e.target.value)} placeholder="name@upi" />
                  </Field>
                  <Separator className="bg-white/5" />
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
                    <SaveButton
                      onClick={() => patch({ upiId: f.upiId, bankName: f.bankName, bankAccount: f.bankAccount, bankIfsc: f.bankIfsc, bankBranch: f.bankBranch })}
                      saving={saving}
                    />
                  </div>
                </div>
              </DarkCard>
            </motion.div>
          </TabsContent>

          {/* ── Alerts Tab ───────────────────────────────────────────────── */}
          <TabsContent value="alerts">
            <motion.div variants={fadeUp}>
              <DarkCard>
                <SectionHeader icon={Bell} title="Notification Preferences" desc="Choose how you want to receive updates" />
                <div className="p-6 space-y-3">
                  {[
                    { key: "notifyEmail",    label: "Email Notifications",    desc: "Invoices, reminders and updates via email" },
                    { key: "notifyWhatsapp", label: "WhatsApp Notifications", desc: "Payment reminders on WhatsApp" },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 transition-colors">
                      <div>
                        <p className="text-white/80 font-medium text-sm">{label}</p>
                        <p className="text-white/30 text-xs mt-0.5">{desc}</p>
                      </div>
                      <Switch
                        checked={f[key as keyof typeof f] as boolean}
                        onCheckedChange={(v) => set(key, v)}
                        className="data-[state=checked]:bg-[#22c55e]"
                      />
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <SaveButton onClick={() => patch({ notifyEmail: f.notifyEmail, notifyWhatsapp: f.notifyWhatsapp })} saving={saving} />
                  </div>
                </div>
              </DarkCard>
            </motion.div>
          </TabsContent>

          {/* ── Security Tab ─────────────────────────────────────────────── */}
          <TabsContent value="security">
            <motion.div variants={fadeUp}>
              <DarkCard>
                <SectionHeader icon={Lock} title="Change Password" desc="Use a strong password to secure your account" />
                <div className="p-6 space-y-4">
                  {[
                    { key: "currentPassword", label: "Current Password",    placeholder: "••••••••" },
                    { key: "newPassword",      label: "New Password",        placeholder: "Minimum 6 characters" },
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
                    <p className="text-xs text-red-400">Passwords do not match</p>
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
              </DarkCard>
            </motion.div>
          </TabsContent>

          {/* ── Danger Tab ───────────────────────────────────────────────── */}
          <TabsContent value="danger">
            <motion.div variants={fadeUp}>
              <DarkCard className="border-red-500/15">
                <div className="flex items-center gap-3 px-6 py-5 border-b border-red-500/10">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 font-semibold text-sm">Danger Zone</p>
                    <p className="text-white/40 text-xs">Irreversible actions — proceed with caution</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="rounded-xl border border-red-500/10 bg-red-500/[0.03] p-5 space-y-4">
                    <div>
                      <p className="text-white/80 font-medium text-sm">Delete Account</p>
                      <p className="text-white/30 text-xs mt-1">
                        Permanently removes all your clients, invoices, expenses and data. Cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" className="rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete My Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-[#0a0f0d] border border-white/10 rounded-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription className="text-white/40">
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
                            onClick={() => setDeletePassword("")}
                            className="bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white rounded-xl"
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl"
                            onClick={deleteAccount}
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
              </DarkCard>
            </motion.div>
          </TabsContent>

        </Tabs>
      </motion.div>
    </motion.div>
  );
}
