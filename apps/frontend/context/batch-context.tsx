"use client";

import React, { createContext, useContext } from "react";
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
  
  const batch = searchParams.get("batch") || "2026";
  const spreadsheetId = searchParams.get("spreadsheetId") || searchParams.get("fileId");

  const setBatch = (_newBatch: string) => {
    // In this implementation, batch is derived from the URL.
    // Component should use router.push to update the batch.
  };

  const setSpreadsheetId = (_id: string | null) => {
    // Similarly for spreadsheetId
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
