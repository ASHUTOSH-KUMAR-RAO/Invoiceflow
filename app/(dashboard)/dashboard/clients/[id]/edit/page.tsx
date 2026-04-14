"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

export default function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    gstin: "",
    pan: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    notes: "",
  });

  // Existing client data fetch karo
  useEffect(() => {
    async function fetchClient() {
      try {
        const res = await fetch(`/api/clients/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const c = data.data;
        setForm({
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          gstin: c.gstin || "",
          pan: c.pan || "",
          address: c.address || "",
          city: c.city || "",
          state: c.state || "",
          pincode: c.pincode || "",
          country: c.country || "",
          notes: c.notes || "",
        });
      } catch {
        toast.error("Failed to load client");
        router.push("/dashboard/clients");
      } finally {
        setIsLoading(false);
      }
    }
    fetchClient();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Client name is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();
      toast.success("Client updated successfully");
      router.push(`/dashboard/clients/${id}`);
    } catch {
      toast.error("Failed to update client");
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <motion.div variants={fadeUp}>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white hover:bg-white/5 gap-2"
            >
              <Link href={`/dashboard/clients/${id}`}>
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </Button>
          </motion.div>
          <motion.div variants={fadeUp}>
            <h1 className="text-2xl font-bold text-white">Edit Client</h1>
            <p className="text-white/40 text-sm mt-0.5">
              Update client details
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">
                Name <span className="text-red-400">*</span>
              </Label>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Client name"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Email</Label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  type="email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Phone</Label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </div>
            </div>

            {/* GSTIN + PAN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">GSTIN</Label>
                <Input
                  name="gstin"
                  value={form.gstin}
                  onChange={handleChange}
                  placeholder="22AAAAA0000A1Z5"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">PAN</Label>
                <Input
                  name="pan"
                  value={form.pan}
                  onChange={handleChange}
                  placeholder="AAAAA0000A"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl font-mono"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Address */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-sm">Address</Label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Street address"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">City</Label>
                <Input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="City"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">State</Label>
                <Input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="State"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Pincode</Label>
                <Input
                  name="pincode"
                  value={form.pincode}
                  onChange={handleChange}
                  placeholder="000000"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-white/60 text-sm">Country</Label>
                <Input
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  placeholder="India"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
          <CardHeader>
            <CardTitle className="text-white text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Any additional notes about this client..."
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl resize-none"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end gap-3 pb-6"
      >
        <Button
          asChild
          variant="outline"
          className="border-white/10 bg-white/5 hover:bg-white/10 text-white"
        >
          <Link href={`/dashboard/clients/${id}`}>Cancel</Link>
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSaving}
          className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>
    </div>
  );
}
