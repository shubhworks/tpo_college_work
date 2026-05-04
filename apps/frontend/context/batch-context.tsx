"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

interface BatchContextType {
  batch: string;
  setBatch: (batch: string) => void;
  spreadsheetId: string | null;
  setSpreadsheetId: (id: string | null) => void;
}

const BatchContext = createContext<BatchContextType | undefined>(undefined);

export function BatchProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [batch, setBatchState] = useState("2026");
  const [spreadsheetId, setSpreadsheetIdState] = useState<string | null>(null);

  useEffect(() => {
    const b = searchParams.get("batch");
    const s = searchParams.get("spreadsheetId") || searchParams.get("fileId");
    
    if (b) setBatchState(b);
    if (s) setSpreadsheetIdState(s);
  }, [searchParams]);

  const setBatch = (newBatch: string) => {
    setBatchState(newBatch);
    // Optionally update URL or local storage
  };

  const setSpreadsheetId = (id: string | null) => {
    setSpreadsheetIdState(id);
  };

  return (
    <BatchContext.Provider value={{ batch, setBatch, spreadsheetId, setSpreadsheetId }}>
      {children}
    </BatchContext.Provider>
  );
}

export function useBatch() {
  const context = useContext(BatchContext);
  if (context === undefined) {
    throw new Error("useBatch must be used within a BatchProvider");
  }
  return context;
}
