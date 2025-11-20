"use client"

import type React from "react"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  Code2,
  Zap,
  Database,
  Wifi,
  Brain,
  Wind,
  Smartphone,
  Radio,
  Power,
  Lightbulb,
  Wrench,
  Building2,
} from "lucide-react"

interface BranchCardProps {
  branch: string
  count: number
}

const branchIcons: Record<string, React.ReactNode> = {
  CSE: <Code2 className="w-6 h-6" />,
  AIML: <Brain className="w-6 h-6" />,
  DS: <Database className="w-6 h-6" />,
  IOT: <Wifi className="w-6 h-6" />,
  CSBS: <Smartphone className="w-6 h-6" />,
  AIR: <Wind className="w-6 h-6" />,
  CSD: <Zap className="w-6 h-6" />,
  EC: <Radio className="w-6 h-6" />,
  EE: <Power className="w-6 h-6" />,
  EX: <Lightbulb className="w-6 h-6" />,
  ME: <Wrench className="w-6 h-6" />,
  CE: <Building2 className="w-6 h-6" />,
}

export function BranchCard({ branch, count }: BranchCardProps) {
  return (
    <Link href={`/branch/${branch}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.02 }}
        className="p-6 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow backdrop-blur-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
            {branchIcons[branch] || <Code2 className="w-6 h-6" />}
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">{branch}</h3>
        <p className="text-sm text-gray-600">
          {count} student{count !== 1 ? "s" : ""}
        </p>
      </motion.div>
    </Link>
  )
}
