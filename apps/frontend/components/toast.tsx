"use client"

import { useState, useCallback } from "react"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"

export type ToastType = "success" | "error" | "info"

interface ToastMessage {
  id: string
  message: string
  type: ToastType
}

const toastContext: { messages: ToastMessage[]; listeners: Function[] } = {
  messages: [],
  listeners: [],
}

export function useToast() {
  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastMessage = { id, message, type }
    toastContext.messages.push(toast)
    toastContext.listeners.forEach((listener) => listener([...toastContext.messages]))

    setTimeout(() => {
      toastContext.messages = toastContext.messages.filter((t) => t.id !== id)
      toastContext.listeners.forEach((listener) => listener([...toastContext.messages]))
    }, 4000)
  }, [])

  return { showToast }
}

export function ToastContainer() {
  const [messages, setMessages] = useState<ToastMessage[]>([])

  toastContext.listeners.push(setMessages)

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {messages.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${
            toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-blue-600"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="w-5 h-5" />}
          {toast.type === "error" && <AlertCircle className="w-5 h-5" />}
          {toast.type === "info" && <Info className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  )
}
