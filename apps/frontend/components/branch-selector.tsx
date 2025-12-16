"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { PROGRAMS } from "@/lib/mock-data"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export function BranchSelector() {
  const params = useParams()
  const currentBranch = params.branch as string
  const [isOpen, setIsOpen] = useState(false)

  const getBranchDisplayName = (slug: string) => {
    const program = PROGRAMS.find(p => p.slug === slug)
    return program?.title || slug
  }

  const currentBranchName = getBranchDisplayName(currentBranch)

  return (
    <div className="fixed top-28 flex justify-center items-center left-0 right-0 z-40">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Desktop View - Horizontal Scroll */}
          <div className="hidden md:flex items-center space-x-2 overflow-x-auto pb-1">
            {PROGRAMS.map((program) => (
              <Link
                key={program.slug}
                href={`/branch/${program.slug}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  currentBranch === program.slug
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-black text-white hover:bg-slate-600"
                }`}
              >
                {program.slug}
              </Link>
            ))}
          </div>

          {/* Mobile View - Dropdown */}
          <div className="md:hidden relative w-full">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-between hover:bg-blue-700 transition-colors duration-300"
            >
              <span className="truncate">{currentBranch}</span>
              <ChevronDown
                className={`w-4 h-4 ml-2 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                >
                  {PROGRAMS.map((program) => (
                    <Link
                      key={program.slug}
                      href={`/branch/${program.slug}`}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                        currentBranch === program.slug
                          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {program.slug} - {program.title}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
