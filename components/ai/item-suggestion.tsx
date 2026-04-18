"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Plus, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SuggestedItem {
  name: string;
  rate: number;
  unit: string;
  taxRate: number;
  hsnCode: string;
}

interface ItemSuggestionsProps {
  onSelect: (item: SuggestedItem) => void;
}

export function ItemSuggestions({ onSelect }: ItemSuggestionsProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestedItem[]>([]);
  const [loading, setLoading] = useState(false);
const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce — wait 600ms after user stops typing
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/ai/suggestions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const data = await res.json();
        setSuggestions(data.suggestions ?? []);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleSelect = (item: SuggestedItem) => {
    onSelect(item);
    setQuery("");
    setSuggestions([]);
  };

  return (
    <div className="relative">
      {/* Input */}
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type item name..."
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl pr-10 focus-visible:ring-[#22c55e]/30"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 text-[#22c55e] animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-white/20" />
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-white/10 bg-[#0f1f14] shadow-xl overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-white/5">
              <p className="text-white/30 text-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#22c55e]" />
                AI Suggestions
              </p>
            </div>
            {suggestions.map((item, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.04] transition-colors group"
              >
                <div className="text-left">
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  <p className="text-white/40 text-xs">
                    {item.unit} · HSN: {item.hsnCode} · GST {item.taxRate}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-[#22c55e] text-sm font-semibold">
                    ₹{item.rate.toLocaleString()}
                  </p>
                  <div className="w-6 h-6 rounded-lg bg-[#22c55e]/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="w-3.5 h-3.5 text-[#22c55e]" />
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
