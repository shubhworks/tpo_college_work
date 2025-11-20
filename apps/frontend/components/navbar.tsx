"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { GraduationCap, Search } from "lucide-react"

export function Navbar() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [branch, setBranch] = useState("")

  // read search params on client after mount (avoids needing Suspense)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      setBranch(params.get("branch") || "")
    } catch (e) {
      // noop in non-browser environments
    }
  }, [])

  const branches = ["CSE", "AIML", "DS", "IOT", "CSBS", "AIR", "CSD", "EC", "EE", "EX", "ME", "CE"]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      const params = new URLSearchParams()
      params.set("q", searchQuery)
      if (branch) params.set("branch", branch)
      router.push(`/?${params.toString()}`)
    }
  }

  const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranch = e.target.value
    setBranch(newBranch)
    if (newBranch) {
      router.push(`/branch/${newBranch}`)
    } else {
      router.push("/")
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            <span className="text-gray-900">Student's Data</span>
          </Link>

          {/* Search and Filter */}
          <div className="flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name or enrollment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  aria-label="Search students"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Branch Filter */}
          <select
            value={branch}
            onChange={handleBranchChange}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            aria-label="Filter by branch"
          >
            <option value="">All Branches</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  )
}
