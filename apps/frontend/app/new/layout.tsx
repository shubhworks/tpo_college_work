import type { ReactNode } from "react"
import { TokenGate } from "@/components/token-gate"

export default function Layout({ children }: { children: ReactNode }) {
  return <TokenGate>{children}</TokenGate>
}
