"use client";

import { useBatch } from "@/context/batch-context";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { studentAPI } from "@/lib/api";

export function BatchSelector() {
  const { batch, setBatch, spreadsheetId } = useBatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
        try {
            const res = await studentAPI.getBatches();
            setAvailableBatches(res.data);
        } catch (error) {
            console.error("Failed to fetch batches", error);
            // Fallback
            setAvailableBatches(["2026", "2027"]);
        }
    };
    fetchBatches();
  }, []);

  const handleBatchChange = (newBatch: string) => {
    setBatch(newBatch);
    setIsOpen(false);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("batch", newBatch);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-sm font-medium transition-all"
      >
        <span>Batch: {batch}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 right-0 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {availableBatches.map((b) => (
              <button
                key={b}
                onClick={() => handleBatchChange(b)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                  batch === b ? "bg-blue-50 text-blue-600 font-bold" : "text-slate-700"
                }`}
              >
                {b}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
