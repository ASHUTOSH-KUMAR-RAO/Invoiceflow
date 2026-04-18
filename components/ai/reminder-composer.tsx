"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Copy, Send, Loader2, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ReminderComposerProps {
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

type Tone = "polite" | "firm" | "final";

const tones: { value: Tone; label: string; color: string }[] = [
  {
    value: "polite",
    label: "Polite",
    color: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  },
  {
    value: "firm",
    label: "Firm",
    color: "bg-[#c9a84c]/10 text-[#c9a84c] border-[#c9a84c]/20",
  },
  {
    value: "final",
    label: "Final Notice",
    color: "bg-red-400/10 text-red-400 border-red-400/20",
  },
];

export function ReminderComposer({
  invoiceNumber,
  clientName,
  clientEmail,
  amount,
  dueDate,
  daysOverdue,
}: ReminderComposerProps) {
  const [tone, setTone] = useState<Tone>("polite");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReminder = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/ai/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          invoiceNumber,
          amount,
          dueDate,
          daysOverdue,
          tone,
        }),
      });
      const data = await res.json();
      setMessage(data.message ?? "Failed to generate message.");
    } catch {
      toast.error("Failed to generate reminder.");
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const sendEmail = async () => {
    if (!message) return;
    setSending(true);
    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "reminder",
          to: clientEmail,
          clientName,
          invoiceNumber,
          amount,
          dueDate,
          message,
        }),
      });
      toast.success("Reminder email sent!");
    } catch {
      toast.error("Failed to send email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="border border-white/5 bg-white/[0.02] rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#22c55e]" />
          </div>
          <CardTitle className="text-white font-semibold text-base">
            AI Payment Reminder
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Invoice Info */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
          <div>
            <p className="text-white/40 text-xs">Invoice</p>
            <p className="text-white text-sm font-medium">{invoiceNumber}</p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Amount</p>
            <p className="text-[#22c55e] text-sm font-semibold">
              ₹{amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-white/40 text-xs">Overdue</p>
            <p className="text-red-400 text-sm font-medium">
              {daysOverdue} days
            </p>
          </div>
        </div>

        {/* Tone Selector */}
        <div>
          <p className="text-white/40 text-xs mb-2">Select Tone</p>
          <div className="flex gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  tone === t.value
                    ? t.color
                    : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={generateReminder}
          disabled={loading}
          className="w-full bg-[#1a472a] hover:bg-[#1a472a]/80 text-white rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
            </>
          )}
        </Button>

        {/* Generated Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              <div className="p-4 rounded-xl bg-[#111a14] border border-white/5 border-l-2 border-l-[#22c55e]">
                <p className="text-white/80 text-sm leading-relaxed">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={copyMessage}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-white/10 text-white/60 hover:text-white hover:border-white/20 bg-transparent rounded-xl"
                >
                  {copied ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 mr-1.5 text-[#22c55e]" />{" "}
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1.5" /> Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={sendEmail}
                  disabled={sending}
                  size="sm"
                  className="flex-1 bg-[#22c55e] hover:bg-[#16a34a] text-black rounded-xl"
                >
                  {sending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />{" "}
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Send Email
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
