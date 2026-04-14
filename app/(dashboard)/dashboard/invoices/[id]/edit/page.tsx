"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Trash2, Save, Send, Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

type Client = { id: string; name: string; email?: string; city?: string };

type InvoiceItem = {
  name: string;
  description: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  rate: number;
  taxRate: number;
};

const UNITS = ["nos", "hrs", "days", "kg", "pcs", "set", "job", "month"];
const TAX_RATES = [0, 5, 12, 18, 28];

const defaultItem: InvoiceItem = {
  name: "", description: "", hsnCode: "",
  quantity: 1, unit: "nos", rate: 0, taxRate: 18,
};

export default function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [clients, setClients] = useState<Client[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ ...defaultItem }]);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">(
    "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState(0);
  const [isGst, setIsGst] = useState(true);
  const [gstType, setGstType] = useState<"CGST_SGST" | "IGST" | "NONE">(
    "CGST_SGST",
  );
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 15 days.");
  const [status, setStatus] = useState<"DRAFT" | "SENT">("DRAFT");

  // Fetch clients
  useEffect(() => {
    fetch("/api/clients?limit=100")
      .then((r) => r.json())
      .then((d) => setClients(d.data || []))
      .catch(() => toast.error("Failed to load clients"));
  }, []);

  // Fetch existing invoice data
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const invoice = data.data;

        // Pre-fill form with existing data
        setClientId(invoice.clientId);
        setIssueDate(new Date(invoice.issueDate).toISOString().split("T")[0]);
        setDueDate(new Date(invoice.dueDate).toISOString().split("T")[0]);
        setDiscountType(invoice.discountType || "PERCENTAGE");
        setDiscountValue(invoice.discountValue || 0);
        setIsGst(invoice.isGst ?? true);
        setGstType(invoice.gstType || "CGST_SGST");
        setNotes(invoice.notes || "");
        setTerms(invoice.terms || "Payment due within 15 days.");
        setStatus(invoice.status || "DRAFT");
        setItems(
          invoice.items.map((item: any) => ({
            name: item.name,
            description: item.description || "",
            hsnCode: item.hsnCode || "",
            quantity: item.quantity,
            unit: item.unit || "nos",
            rate: item.rate,
            taxRate: item.taxRate || 18,
          })),
        );
      } catch {
        toast.error("Failed to load invoice");
        router.push("/dashboard/invoices");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0,
  );

  const discountAmount =
    discountType === "PERCENTAGE"
      ? (subtotal * discountValue) / 100
      : discountValue;

  const afterDiscount = subtotal - discountAmount;

  const totalTax = isGst
    ? items.reduce(
        (sum, item) => sum + (item.quantity * item.rate * item.taxRate) / 100,
        0,
      )
    : 0;

  const cgst = gstType === "CGST_SGST" ? totalTax / 2 : 0;
  const sgst = gstType === "CGST_SGST" ? totalTax / 2 : 0;
  const igst = gstType === "IGST" ? totalTax : 0;
  const total = afterDiscount + totalTax;

  // Item handlers
  const addItem = () => setItems((prev) => [...prev, { ...defaultItem }]);
  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: keyof InvoiceItem, value: any) =>
    setItems((prev) =>
      prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)),
    );

  const handleSubmit = async (newStatus: "DRAFT" | "SENT") => {
    if (!clientId) {
      toast.error("Please select a client");
      return;
    }
    if (!dueDate) {
      toast.error("Please set a due date");
      return;
    }
    if (items.some((item) => !item.name || item.rate <= 0)) {
      toast.error("Please fill all item details");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          issueDate,
          dueDate,
          status: newStatus,
          items,
          discountType,
          discountValue,
          isGst,
          gstType,
          notes,
          terms,
        }),
      });

      if (!res.ok) throw new Error();
      toast.success(
        newStatus === "SENT" ? "Invoice updated & sent!" : "Invoice updated!",
      );
      router.push(`/dashboard/invoices/${id}`);
    } catch {
      toast.error("Failed to update invoice");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white/40 text-sm">Loading invoice...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/40 hover:text-white hover:bg-white/5 gap-2"
          >
            <Link href={`/dashboard/invoices/${id}`}>
              <ArrowLeft className="w-4 h-4" /> Back
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Invoice</h1>
            <p className="text-white/40 text-sm mt-0.5">
              Update invoice details
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSaving}
            className="border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            onClick={() => handleSubmit("SENT")}
            disabled={isSaving}
            className="bg-[#1a472a] hover:bg-[#1a472a]/80 text-white gap-2"
          >
            <Send className="w-4 h-4" />
            {isSaving ? "Updating..." : "Save & Send"}
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Client + Dates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Invoice Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-sm">
                    Client <span className="text-red-400">*</span>
                  </Label>
                  <Select value={clientId} onValueChange={setClientId}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-xl h-11">
                      <SelectValue placeholder="Select a client..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1f14] border-white/10">
                      {clients.map((c) => (
                        <SelectItem
                          key={c.id}
                          value={c.id}
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          {c.name}
                          {c.city ? ` — ${c.city}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-sm">Issue Date</Label>
                    <Input
                      type="date"
                      value={issueDate}
                      onChange={(e) => setIssueDate(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-sm">
                      Due Date <span className="text-red-400">*</span>
                    </Label>
                    <Input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-white text-base">Items</CardTitle>
                <Button
                  size="sm"
                  onClick={addItem}
                  className="bg-[#1a472a]/60 hover:bg-[#1a472a] text-white gap-1.5 rounded-lg text-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1.5">
                        <Label className="text-white/60 text-xs">
                          Item Name *
                        </Label>
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(i, "name", e.target.value)
                          }
                          placeholder="Service or product name"
                          className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-9 text-sm"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(i)}
                          className="mt-6 text-red-400/60 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs">
                        Description
                      </Label>
                      <Input
                        value={item.description}
                        onChange={(e) =>
                          updateItem(i, "description", e.target.value)
                        }
                        placeholder="Optional description"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-9 text-sm"
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-white/60 text-xs">Qty</Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "quantity",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-lg h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/60 text-xs">Unit</Label>
                        <Select
                          value={item.unit}
                          onValueChange={(v) => updateItem(i, "unit", v)}
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-lg h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f1f14] border-white/10">
                            {UNITS.map((u) => (
                              <SelectItem
                                key={u}
                                value={u}
                                className="text-white focus:bg-white/10 focus:text-white text-sm"
                              >
                                {u}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/60 text-xs">
                          Rate (₹)
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "rate",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-lg h-9 text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-white/60 text-xs">GST %</Label>
                        <Select
                          value={String(item.taxRate)}
                          onValueChange={(v) =>
                            updateItem(i, "taxRate", parseInt(v))
                          }
                        >
                          <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-lg h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f1f14] border-white/10">
                            {TAX_RATES.map((r) => (
                              <SelectItem
                                key={r}
                                value={String(r)}
                                className="text-white focus:bg-white/10 focus:text-white text-sm"
                              >
                                {r}%
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-white/60 text-xs">
                        HSN/SAC Code
                      </Label>
                      <Input
                        value={item.hsnCode}
                        onChange={(e) =>
                          updateItem(i, "hsnCode", e.target.value)
                        }
                        placeholder="Optional HSN code"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-lg h-9 text-sm"
                      />
                    </div>

                    <div className="flex justify-end">
                      <span className="text-[#22c55e] font-semibold text-sm">
                        = {formatCurrency(item.quantity * item.rate)}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Notes + Terms */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  Notes & Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-sm">Notes</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Thank you for your business!"
                    rows={2}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl resize-none text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/60 text-sm">
                    Terms & Conditions
                  </Label>
                  <Textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="Payment terms..."
                    rows={2}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl resize-none text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Right — Summary */}
        <div className="space-y-5">
          {/* GST Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-base">
                  GST Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-white/60 text-sm">Apply GST</Label>
                  <Switch checked={isGst} onCheckedChange={setIsGst} />
                </div>
                {isGst && (
                  <div className="space-y-1.5">
                    <Label className="text-white/60 text-sm">GST Type</Label>
                    <Select
                      value={gstType}
                      onValueChange={(v: any) => setGstType(v)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-[#1a472a] rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0f1f14] border-white/10">
                        <SelectItem
                          value="CGST_SGST"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          CGST + SGST (Intra-state)
                        </SelectItem>
                        <SelectItem
                          value="IGST"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          IGST (Inter-state)
                        </SelectItem>
                        <SelectItem
                          value="NONE"
                          className="text-white focus:bg-white/10 focus:text-white"
                        >
                          None
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Discount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
              <CardHeader>
                <CardTitle className="text-white text-base">Discount</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDiscountType("PERCENTAGE")}
                    className={`flex-1 rounded-lg text-xs ${
                      discountType === "PERCENTAGE"
                        ? "bg-[#1a472a] border-[#1a472a] text-white"
                        : "border-white/10 bg-white/5 text-white/60"
                    }`}
                  >
                    %
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDiscountType("FIXED")}
                    className={`flex-1 rounded-lg text-xs ${
                      discountType === "FIXED"
                        ? "bg-[#1a472a] border-[#1a472a] text-white"
                        : "border-white/10 bg-white/5 text-white/60"
                    }`}
                  >
                    ₹ Fixed
                  </Button>
                </div>
                <Input
                  type="number"
                  min="0"
                  value={discountValue}
                  onChange={(e) =>
                    setDiscountValue(parseFloat(e.target.value) || 0)
                  }
                  placeholder={discountType === "PERCENTAGE" ? "0%" : "₹0"}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-[#1a472a] rounded-xl"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border border-white/5 bg-white/[0.02] rounded-2xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-[#22c55e]" /> Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white">{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">
                      Discount{" "}
                      {discountType === "PERCENTAGE"
                        ? `(${discountValue}%)`
                        : ""}
                    </span>
                    <span className="text-red-400">
                      − {formatCurrency(discountAmount)}
                    </span>
                  </div>
                )}
                {isGst && totalTax > 0 && (
                  <>
                    {gstType === "CGST_SGST" ? (
                      <>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">CGST</span>
                          <span className="text-white">
                            {formatCurrency(cgst)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">SGST</span>
                          <span className="text-white">
                            {formatCurrency(sgst)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between text-sm">
                        <span className="text-white/40">IGST</span>
                        <span className="text-white">
                          {formatCurrency(igst)}
                        </span>
                      </div>
                    )}
                  </>
                )}
                <Separator className="bg-white/10" />
                <div className="flex justify-between">
                  <span className="text-white font-semibold">Total</span>
                  <span className="text-[#22c55e] font-bold text-lg">
                    {formatCurrency(total)}
                  </span>
                </div>

                <div className="pt-2 space-y-2">
                  <Button
                    className="w-full bg-[#1a472a] hover:bg-[#1a472a]/80 text-white gap-2"
                    onClick={() => handleSubmit("SENT")}
                    disabled={isSaving}
                  >
                    <Send className="w-4 h-4" />
                    {isSaving ? "Updating..." : "Save & Send"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
                    onClick={() => handleSubmit("DRAFT")}
                    disabled={isSaving}
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
