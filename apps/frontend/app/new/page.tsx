"use client"

import { useCallback, useEffect, useState } from "react"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/footer"
import { NewStudentCard } from "@/components/new-student-card"
import { NewStudentModal } from "@/components/new-student-modal"
import { MasterFilterPanel } from "@/components/master-filter-panel"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { newArchitectureAPI } from "@/lib/api"
import type { FilterMeta, MasterFilterState, StudentV2 } from "@/types/student-v2"
import { Database, Search, Users, AlertCircle, RefreshCw } from "lucide-react"

const defaultFilters: MasterFilterState = {
  batch: "2024-2028",
  course: "B.Tech",
  department: "ALL",
  branches: [],
  minCgpa: "",
  min10th: "",
  min12th: "",
  skills: [],
  skillsMatch: "any",
  hasVerifiedCert: false,
  hasOtherCert: false,
  gender: "ALL",
  category: "ALL",
  search: "",
}

export default function NewArchitecturePage() {
  const [meta, setMeta] = useState<FilterMeta | null>(null)
  const [filters, setFilters] = useState<MasterFilterState>(defaultFilters)
  const [searchInput, setSearchInput] = useState<string>("")

  // Students & Pagination
  const [students, setStudents] = useState<StudentV2[]>([])
  const [totalStudents, setTotalStudents] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")
  const [isExporting, setIsExporting] = useState<boolean>(false)

  // Selected Student for Modal
  const [selectedStudent, setSelectedStudent] = useState<StudentV2 | null>(null)

  // 1. Initial Load: Fetch filter metadata from live MySQL
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const metaRes = await newArchitectureAPI.getFiltersMeta()
        if (metaRes.data.success) {
          const m: FilterMeta = metaRes.data.data
          setMeta(m)
          // Default to 2024-2028 if available, else first batch
          if (m.batches.length > 0 && !m.batches.some((b) => b.name === "2024-2028")) {
            setFilters((prev) => ({ ...prev, batch: m.batches[0].name }))
          }
        }
      } catch (err: any) {
        console.error("Failed to load filter metadata:", err)
        setError("Could not connect to the ERP database. Make sure the backend server is running and port 3306 is reachable.")
      }
    }

    fetchMetadata()
  }, [])

  // 2. Fetch Students when filters or page change
  const fetchStudents = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const response = await newArchitectureAPI.getStudents({
        batch: filters.batch === "ALL" ? undefined : filters.batch,
        course: filters.course === "ALL" ? undefined : filters.course,
        department: filters.department === "ALL" ? undefined : filters.department,
        branch: filters.branches.length > 0 ? filters.branches.join(",") : undefined,
        minCgpa: filters.minCgpa || undefined,
        min10th: filters.min10th || undefined,
        min12th: filters.min12th || undefined,
        skills: filters.skills.length > 0 ? filters.skills.join(",") : undefined,
        skillsMatch: filters.skillsMatch,
        hasVerifiedCert: filters.hasVerifiedCert ? "true" : undefined,
        hasOtherCert: filters.hasOtherCert ? "true" : undefined,
        gender: filters.gender === "ALL" ? undefined : filters.gender,
        category: filters.category === "ALL" ? undefined : filters.category,
        search: filters.search.trim() || undefined,
        page: currentPage,
        limit: 48,
      })

      if (response.data.success) {
        const studentList = response.data.data || []
        const pagination = response.data.pagination || {}
        setStudents(studentList)
        setTotalStudents(pagination.total || 0)
        setTotalPages(pagination.totalPages || 1)
      } else {
        setError(response.data.message || "Failed to load students.")
      }
    } catch (err: any) {
      console.error("Failed to fetch students:", err)
      setError(err.response?.data?.message || err.message || "Could not fetch student records from database.")
    } finally {
      setLoading(false)
    }
  }, [filters, currentPage])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Handle Search submit / debounce
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    setFilters((prev) => ({ ...prev, search: searchInput }))
  }

  // Handle Filter Change
  const handleFilterChange = (newFilters: MasterFilterState) => {
    setCurrentPage(1)
    setFilters(newFilters)
  }

  // Reset Filters
  const handleResetFilters = () => {
    setCurrentPage(1)
    setSearchInput("")
    setFilters(defaultFilters)
  }

  // Handle Export to CSV
  const handleExport = () => {
    setIsExporting(true)
    try {
      const exportParams = {
        batch: filters.batch === "ALL" ? undefined : filters.batch,
        course: filters.course === "ALL" ? undefined : filters.course,
        department: filters.department === "ALL" ? undefined : filters.department,
        branch: filters.branches.length > 0 ? filters.branches.join(",") : undefined,
        minCgpa: filters.minCgpa || undefined,
        min10th: filters.min10th || undefined,
        min12th: filters.min12th || undefined,
        skills: filters.skills.length > 0 ? filters.skills.join(",") : undefined,
        skillsMatch: filters.skillsMatch,
        hasVerifiedCert: filters.hasVerifiedCert ? "true" : undefined,
        hasOtherCert: filters.hasOtherCert ? "true" : undefined,
        gender: filters.gender === "ALL" ? undefined : filters.gender,
        category: filters.category === "ALL" ? undefined : filters.category,
        search: filters.search.trim() || undefined,
      }

      const exportUrl = newArchitectureAPI.getExportUrl(exportParams)

      // Trigger file download
      const link = document.createElement("a")
      link.href = exportUrl
      link.setAttribute("download", `TPO_Placement_Eligible_${filters.batch}_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setTimeout(() => setIsExporting(false), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full">
        {/* Page Title & Subtitle */}
        <div className="mb-6 mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Candidate Placement Directory
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Select cohorts, set academic cutoffs, filter by verified technical skills, and export candidates.
            </p>
          </div>

          {/* Quick Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-84">
            <input
              type="text"
              placeholder="Search by name, roll no, email..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-22 py-2.5 text-sm bg-white border border-slate-300 rounded-xl shadow-2xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-800"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-2xs"
            >
              Search
            </button>
          </form>
        </div>

        {/* Master Filtering Panel */}
        <MasterFilterPanel
          meta={meta}
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          onExport={handleExport}
          totalCount={totalStudents}
          isExporting={isExporting}
        />

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Database Connection Notice</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchStudents}
              className="px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Student Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : students.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {students.map((student) => (
                <NewStudentCard
                  key={student.id}
                  student={student}
                  onOpenProfile={(stu) => setSelectedStudent(stu)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-xs text-slate-500 font-medium">
                  Showing Page <strong className="text-slate-800">{currentPage}</strong> of{" "}
                  <strong className="text-slate-800">{totalPages}</strong> ({totalStudents} total students)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-xl transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Students Match Selected Criteria</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
              Try adjusting your filter criteria, relaxing the CGPA / board marks cutoff, or choosing different branches.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        )}
      </main>

      <Footer />

      {/* Detailed Student Modal */}
      <NewStudentModal
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </div>
  )
}
