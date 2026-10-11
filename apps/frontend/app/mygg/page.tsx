"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/Navbar"
import { MyGGStudentCard } from "@/components/mygg-student-card"
import { MyGGStudentModal } from "@/components/mygg-student-modal"
import { SkeletonLoader } from "@/components/skeleton-loader"
import {
  clearMyGGToken,
  getMyGGBranches,
  getMyGGBranchStudents,
  getMyGGToken,
  loginMyGG,
  setMyGGToken,
} from "@/lib/mygg-api"
import type { MyGGBranch, MyGGStudent } from "@/types/mygg"
import { KeyRound, Lock, LogOut, Search } from "lucide-react"

const ITEMS_PER_PAGE = 24
const YEAR_OPTIONS = ["2026", "2027", "2028", "2029", "2030"]

export default function MyGGPage() {
  const [branches, setBranches] = useState<MyGGBranch[]>([])
  const [branchCode, setBranchCode] = useState("")
  const [students, setStudents] = useState<MyGGStudent[]>([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<MyGGStudent | null>(null)

  // Auth state
  const [authRequired, setAuthRequired] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "token">("login")
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [manualToken, setManualToken] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState("")
  const [hasCustomToken, setHasCustomToken] = useState(false)

  const loadBranches = useCallback(async () => {
    setLoadingBranches(true)
    setError("")
    try {
      const items = await getMyGGBranches()
      setBranches(items)
      setBranchCode((current) => current || items[0]?.shortCode || "")
      setAuthRequired(false)
      setHasCustomToken(Boolean(getMyGGToken()))
    } catch (fetchError: unknown) {
      const err = fetchError as Error & { status?: number; code?: string }
      if (err.status === 401 || err.code === "UNAUTHENTICATED" || err.code === "INVALID_TOKEN") {
        setAuthRequired(true)
      } else {
        setError(err.message || "Could not load MyGG branches.")
      }
    } finally {
      setLoadingBranches(false)
    }
  }, [])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  // Local passout year filter – empty string = show all years
  const [passoutYear, setPassoutYear] = useState<string>("")

  const loadStudents = useCallback(async (code: string, year?: string) => {
    if (!code) {
      setStudents([])
      return
    }

    setLoadingStudents(true)
    setError("")
    setCurrentPage(1)
    try {
      const items = await getMyGGBranchStudents(code, year || undefined)
      setStudents(items)
    } catch (fetchError: unknown) {
      const err = fetchError as Error & { status?: number; code?: string }
      if (err.status === 401 || err.code === "UNAUTHENTICATED" || err.code === "INVALID_TOKEN") {
        setAuthRequired(true)
      } else {
        setError(err.message || "Could not load student portfolios.")
      }
    } finally {
      setLoadingStudents(false)
    }
  }, [])

  useEffect(() => {
    if (!authRequired && branchCode) {
      loadStudents(branchCode, passoutYear || undefined)
    }
  }, [authRequired, branchCode, passoutYear, loadStudents])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError("")
    try {
      if (authMode === "login") {
        await loginMyGG(identifier, password)
      } else {
        if (!manualToken.trim()) {
          throw new Error("Please enter a valid token.")
        }
        setMyGGToken(manualToken.trim())
      }
      setAuthRequired(false)
      setHasCustomToken(true)
      await loadBranches()
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Authentication failed.")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = () => {
    clearMyGGToken()
    setHasCustomToken(false)
    setAuthRequired(true)
    setBranches([])
    setStudents([])
  }

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return students
    return students.filter((student) =>
      [student.fullName, student.enrollmentNumber, student.email]
        .some((value) => value?.toLowerCase().includes(query)),
    )
  }, [students, searchQuery])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredStudents.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredStudents, currentPage])

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)
  const selectedBranch = branches.find((branch) => branch.shortCode === branchCode)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-40">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
                MyGG Student Portfolios
              </p>
              {hasCustomToken && !authRequired && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-red-600 transition-colors bg-white px-2.5 py-1 rounded-full border border-gray-200"
                  title="Sign out of MyGG session"
                >
                  <LogOut className="w-3 h-3" />
                  Sign out
                </button>
              )}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mt-2">
              {selectedBranch?.name || "Student profiles"}
            </h1>
            <p className="text-gray-500 mt-2">
              {loadingStudents
                ? "Loading student portfolios…"
                : `${filteredStudents.length} student${filteredStudents.length === 1 ? "" : "s"}${passoutYear ? ` · Passout ${passoutYear}` : " · All years"}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>

          {!authRequired && (
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="sr-only" htmlFor="mygg-branch">Select branch</label>
              <select
                id="mygg-branch"
                value={branchCode}
                onChange={(event) => {
                  setBranchCode(event.target.value)
                  setCurrentPage(1)
                }}
                disabled={loadingBranches || branches.length === 0}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                {loadingBranches && <option value="">Loading branches…</option>}
                {!loadingBranches && branches.length === 0 && <option value="">No branches available</option>}
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.shortCode}>
                    {branch.shortCode} · {branch.studentCount}
                  </option>
                ))}
              </select>

              <label className="sr-only" htmlFor="mygg-year">Passout year</label>
              <select
                id="mygg-year"
                value={passoutYear}
                onChange={(event) => {
                  setPassoutYear(event.target.value)
                  setCurrentPage(1)
                }}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">All years</option>
                {YEAR_OPTIONS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="search"
                  placeholder="Search students…"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-64"
                />
              </div>
            </div>
          )}
        </div>

        {authRequired ? (
          <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white text-center">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-3">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Authenticate with MyGG</h2>
              <p className="text-blue-100 text-xs mt-1">
                Enter your admin credentials to load placement portfolios
              </p>
            </div>

            <div className="p-6">
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("login")
                    setAuthError("")
                  }}
                  className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors ${
                    authMode === "login"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode("token")
                    setAuthError("")
                  }}
                  className={`flex-1 pb-3 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors ${
                    authMode === "token"
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Direct Token
                </button>
              </div>

              {authError && (
                <div role="alert" className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {authError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {authMode === "login" ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="mygg-id">
                        Admin Identifier (Email / Username)
                      </label>
                      <input
                        id="mygg-id"
                        type="text"
                        required
                        placeholder="admin@ggits.org"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="mygg-pw">
                        Password
                      </label>
                      <input
                        id="mygg-pw"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1" htmlFor="mygg-token">
                      Admin Session Token
                    </label>
                    <textarea
                      id="mygg-token"
                      required
                      rows={3}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <span>Authenticating…</span>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>{authMode === "login" ? "Sign In & Load Portfolios" : "Save Token & Load"}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : error ? (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
            {error}
          </div>
        ) : loadingBranches || loadingStudents ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }, (_, index) => <SkeletonLoader key={index} />)}
          </div>
        ) : paginatedStudents.length ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedStudents.map((student) => (
                <MyGGStudentCard
                  key={student.id}
                  student={student}
                  onOpenProfile={setSelectedStudent}
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg ${currentPage === page ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"}`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900">
              {branches.length === 0 ? "No branches available" : "No students found"}
            </h2>
            <p className="text-gray-500 mt-1">
              {branches.length === 0
                ? "No active branches were returned by MyGG."
                : searchQuery
                  ? "Try adjusting your search criteria."
                  : `No active portfolios found${passoutYear ? ` for passout ${passoutYear}` : ""}${selectedBranch ? ` in ${selectedBranch.shortCode}` : ""}.`}
            </p>
          </div>
        )}
      </main>
      <Footer />
      <MyGGStudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
    </div>
  )
}
