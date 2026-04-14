"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, User, Mail, Phone, Building2, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().default("India"),
  notes: z.string().optional(),
});

type ClientInput = z.infer<typeof clientSchema>;

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

export default function NewClientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: { country: "India" },
  });

  async function onSubmit(data: ClientInput) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Client added successfully! 🎉");
      router.push("/dashboard/clients");
    } catch {
      toast.error("Failed to add client");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div variants={stagger} initial="hidden" animate="visible" className="flex items-center gap-4">
        <motion.div variants={fadeUp}>
          <Button asChild variant="ghost" size="sm" className="text-white/40 hover:text-white hover:bg-white/5 gap-2">
            <Link href="/dashboard/clients"><ArrowLeft className="w-4 h-4" /> Back</Link>
          </Button>
        </motion.div>
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-bold text-white">Add New Client</h1>
          <p className="text-white/40 text-sm mt-0.5">Fill in the client details below</p>
        </motion.div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <User className="w-4 h-4 text-[#22c55e]" /> Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/70 text-sm mb-1.5 block">Client Name *</Label>
                <Input {...register("name")} placeholder="Rahul Sharma / Acme Corp"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10" />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <Input {...register("email")} type="email" placeholder="client@example.com"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10" />
                  {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone
                  </Label>
                  <Input {...register("phone")} placeholder="+91 98765 43210"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* GST / Tax Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#22c55e]" /> Tax Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">GSTIN</Label>
                  <Input {...register("gstin")} placeholder="22AAAAA0000A1Z5"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10 uppercase" />
                </div>
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">PAN</Label>
                  <Input {...register("pan")} placeholder="AAAAA0000A"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10 uppercase" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Address */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-base flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#22c55e]" /> Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white/70 text-sm mb-1.5 block">Street Address</Label>
                <Input {...register("address")} placeholder="123, MG Road, Sector 5"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">City</Label>
                  <Input {...register("city")} placeholder="Mumbai"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10" />
                </div>
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">State</Label>
                  <select {...register("state")}
                    className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#1a472a] appearance-none">
                    <option value="" className="bg-[#0a0a0a]">Select state</option>
                    {indianStates.map((s) => (
                      <option key={s} value={s} className="bg-[#0a0a0a]">{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-white/70 text-sm mb-1.5 block">Pincode</Label>
                  <Input {...register("pincode")} placeholder="400001"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-10" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notes */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
            <CardContent className="pt-5">
              <Label className="text-white/70 text-sm mb-1.5 block">Notes (Optional)</Label>
              <Textarea {...register("notes")} placeholder="Any additional notes about this client..."
                className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg resize-none" rows={3} />
            </CardContent>
          </Card>
        </motion.div>

        <Separator className="bg-white/5" />

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="flex items-center justify-end gap-3">
          <Button asChild variant="ghost" className="text-white/50 hover:text-white hover:bg-white/5">
            <Link href="/dashboard/clients">Cancel</Link>
          </Button>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button type="submit" disabled={isLoading} className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-lg px-8">
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Adding...</>
              ) : "Add Client"}
            </Button>
          </motion.div>
        </motion.div>
      </form>
    </div>
  );
}
