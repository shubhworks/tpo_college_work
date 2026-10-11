"use client"

import { useEffect, useMemo, useState } from "react"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/Navbar"
import { MyGGStudentCard } from "@/components/mygg-student-card"
import { MyGGStudentModal } from "@/components/mygg-student-modal"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { TokenGate } from "@/components/token-gate"
import { useBatch } from "@/context/batch-context"
import { getMyGGBranches, getMyGGBranchStudents } from "@/lib/mygg-api"
import type { MyGGBranch, MyGGStudent } from "@/types/mygg"
import { Search } from "lucide-react"

const ITEMS_PER_PAGE = 24

export default function MyGGPage() {
  const { batch } = useBatch()
  const [branches, setBranches] = useState<MyGGBranch[]>([])
  const [branchCode, setBranchCode] = useState("")
  const [students, setStudents] = useState<MyGGStudent[]>([])
  const [loadingBranches, setLoadingBranches] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<MyGGStudent | null>(null)

  useEffect(() => {
    let isMounted = true
    getMyGGBranches()
      .then((items) => {
        if (!isMounted) return
        setBranches(items)
        setBranchCode((current) => current || items[0]?.shortCode || "")
      })
      .catch((fetchError: unknown) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : "Could not load MyGG branches.")
      })
      .finally(() => {
        if (isMounted) setLoadingBranches(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!branchCode) {
      setStudents([])
      return
    }

    let isMounted = true
    setLoadingStudents(true)
    setError("")
    setStudents([])
    setCurrentPage(1)
    getMyGGBranchStudents(branchCode, batch)
      .then((items) => {
        if (isMounted) setStudents(items)
      })
      .catch((fetchError: unknown) => {
        if (isMounted) setError(fetchError instanceof Error ? fetchError.message : "Could not load student portfolios.")
      })
      .finally(() => {
        if (isMounted) setLoadingStudents(false)
      })

    return () => {
      isMounted = false
    }
  }, [branchCode, batch])

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
    <TokenGate>
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-40">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">MyGG Student Portfolios</p>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                {selectedBranch?.name || "Student profiles"}
              </h1>
              <p className="text-gray-500 mt-2">
                {loadingStudents ? "Loading student portfolios…" : `${filteredStudents.length} student${filteredStudents.length === 1 ? "" : "s"} · Passout ${batch}`}
                {searchQuery && ` matching “${searchQuery}”`}
              </p>
            </div>

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
          </div>

          {error ? (
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
                    : `No active portfolios found for passout ${batch}${selectedBranch ? ` in ${selectedBranch.shortCode}` : ""}.`}
              </p>
            </div>
          )}
        </main>
        <Footer />
        <MyGGStudentModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      </div>
    </TokenGate>
  )
}
