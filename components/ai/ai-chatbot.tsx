"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  role: "user" | "ai";
  content: string;
}

export function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Hi! I'm your InvoiceFlow AI assistant. Ask me anything about your invoices, revenue, or clients!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.answer ?? "Sorry, I couldn't process that.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-[9999]">
        <Button
          onClick={() => setOpen((prev) => !prev)}
          className="w-14 h-14 rounded-full bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-lg shadow-[#22c55e]/20"
        >
          <AnimatePresence mode="wait">
            {open ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 z-[9999] w-[340px] sm:w-[380px]"
          >
            <div className="rounded-2xl border border-white/10 bg-[#0a0f0d] shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#111a14]">
                <div className="w-8 h-8 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">AI Assistant</p>
                  <p className="text-white/40 text-xs">
                    Ask about your business
                  </p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
              </div>

              {/* Messages */}
              <ScrollArea className="h-[300px] p-4">
                <div className="space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          msg.role === "ai" ? "bg-[#22c55e]/10" : "bg-white/5"
                        }`}
                      >
                        {msg.role === "ai" ? (
                          <Bot className="w-3 h-3 text-[#22c55e]" />
                        ) : (
                          <User className="w-3 h-3 text-white/60" />
                        )}
                      </div>
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                          msg.role === "ai"
                            ? "bg-[#111a14] text-white/80 rounded-tl-none"
                            : "bg-[#1a472a] text-white rounded-tr-none"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}

                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-start gap-2"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#22c55e]/10 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-[#22c55e]" />
                      </div>
                      <div className="bg-[#111a14] px-3 py-2 rounded-xl rounded-tl-none">
                        <Loader2 className="w-4 h-4 text-[#22c55e] animate-spin" />
                      </div>
                    </motion.div>
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-3 border-t border-white/5 flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask anything..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl text-sm focus-visible:ring-[#22c55e]/30"
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-black rounded-xl shrink-0 disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
