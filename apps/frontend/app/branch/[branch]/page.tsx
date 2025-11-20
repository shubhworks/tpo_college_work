"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { StudentCard } from "@/components/student-card"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { useToast } from "@/components/toast"
import { studentAPI } from "@/lib/api"
import type { Student } from "@/types/student"

const ITEMS_PER_PAGE = 24

export default function BranchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const branch = params.branch as string

  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const { showToast } = useToast()

  const searchQuery = searchParams.get("q")?.toLowerCase() || ""

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await studentAPI.getStudents(branch)
        setStudents(response.data as Student[])
      } catch (error) {
        console.error("Failed to fetch students:", error)
        showToast("Failed to load students", "error")
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [branch, showToast])

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery) || s.university_enrolment_number.toLowerCase().includes(searchQuery),
    )
  }, [students, searchQuery])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredStudents.slice(start, end)
  }, [filteredStudents, currentPage])

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{branch}</h1>
          <p className="text-gray-600">
            {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""} found
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} />)
          ) : paginatedStudents.length > 0 ? (
            paginatedStudents.map((student) => (
              <StudentCard key={student.university_enrolment_number} student={student} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === i + 1 ? "bg-blue-600 text-white" : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
