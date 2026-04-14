"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Save, Building2, CreditCard, Landmark, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    businessName: "",
    gstin: "",
    pan: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    currency: "INR",
    invoicePrefix: "INV",
    upiId: "",
    bankName: "",
    bankAccount: "",
    bankIfsc: "",
    bankBranch: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.data) {
          setForm({
            name: data.data.name || "",
            businessName: data.data.businessName || "",
            gstin: data.data.gstin || "",
            pan: data.data.pan || "",
            phone: data.data.phone || "",
            address: data.data.address || "",
            city: data.data.city || "",
            state: data.data.state || "",
            pincode: data.data.pincode || "",
            currency: data.data.currency || "INR",
            invoicePrefix: data.data.invoicePrefix || "INV",
            upiId: data.data.upiId || "",
            bankName: data.data.bankName || "",
            bankAccount: data.data.bankAccount || "",
            bankIfsc: data.data.bankIfsc || "",
            bankBranch: data.data.bankBranch || "",
          });
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Settings saved successfully!");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#1a472a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage your business profile & payment details</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}
          className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>

      {/* Business Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}>
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#22c55e]" /> Business Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Your Name</Label>
                <Input value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Ashutosh Kumar"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Business Name</Label>
                <Input value={form.businessName}
                  onChange={(e) => update("businessName", e.target.value)}
                  placeholder="My Business Pvt. Ltd."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Phone</Label>
                <Input value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">GSTIN</Label>
                <Input value={form.gstin}
                  onChange={(e) => update("gstin", e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">PAN</Label>
                <Input value={form.pan}
                  onChange={(e) => update("pan", e.target.value)}
                  placeholder="AAAAA0000A"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Pincode</Label>
                <Input value={form.pincode}
                  onChange={(e) => update("pincode", e.target.value)}
                  placeholder="226001"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">Address</Label>
              <Input value={form.address}
                onChange={(e) => update("address", e.target.value)}
                placeholder="123, Street Name, Area"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">City</Label>
                <Input value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Lucknow"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">State</Label>
                <select value={form.state}
                  onChange={(e) => update("state", e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#1a472a] focus:outline-none text-sm">
                  <option value="" className="bg-[#0f1f14]">Select State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s} className="bg-[#0f1f14]">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Invoice Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}>
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#22c55e]" /> Invoice Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Invoice Prefix</Label>
                <Input value={form.invoicePrefix}
                  onChange={(e) => update("invoicePrefix", e.target.value)}
                  placeholder="INV"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono" />
                <p className="text-white/30 text-xs">Example: {form.invoicePrefix || "INV"}-0001</p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Currency</Label>
                <select value={form.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-[#1a472a] focus:outline-none text-sm">
                  <option value="INR" className="bg-[#0f1f14]">INR — Indian Rupee (₹)</option>
                  <option value="USD" className="bg-[#0f1f14]">USD — US Dollar ($)</option>
                  <option value="EUR" className="bg-[#0f1f14]">EUR — Euro (€)</option>
                  <option value="GBP" className="bg-[#0f1f14]">GBP — British Pound (£)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* UPI Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}>
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#22c55e]" /> UPI Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">UPI ID</Label>
              <Input value={form.upiId}
                onChange={(e) => update("upiId", e.target.value)}
                placeholder="yourname@upi or 9876543210@paytm"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono" />
              <p className="text-white/30 text-xs">
                Ye UPI ID Record Payment modal mein QR code generate karne ke liye use hogi
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bank Details */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}>
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base flex items-center gap-2">
              <Landmark className="w-4 h-4 text-[#22c55e]" /> Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Bank Name</Label>
                <Input value={form.bankName}
                  onChange={(e) => update("bankName", e.target.value)}
                  placeholder="State Bank of India"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Account Number</Label>
                <Input value={form.bankAccount}
                  onChange={(e) => update("bankAccount", e.target.value)}
                  placeholder="1234567890"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">IFSC Code</Label>
                <Input value={form.bankIfsc}
                  onChange={(e) => update("bankIfsc", e.target.value)}
                  placeholder="SBIN0001234"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Branch</Label>
                <Input value={form.bankBranch}
                  onChange={(e) => update("bankBranch", e.target.value)}
                  placeholder="Lucknow Main Branch"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl" />
              </div>
            </div>
            <p className="text-white/30 text-xs">
              Ye bank details Record Payment modal mein Bank Transfer select karne par show hongi
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button Bottom */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}
          className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white gap-2">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
}
