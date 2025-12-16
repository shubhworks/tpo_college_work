"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import { Footer } from "@/components/footer"
import { StudentCard } from "@/components/student-card"
import { SkeletonLoader } from "@/components/skeleton-loader"
import { StudentModal } from "@/components/student-modal"
import { studentAPI } from "@/lib/api"
import type { Student } from "@/types/student"
import { Search, SlidersHorizontal } from "lucide-react"
import { Navbar } from "@/components/Navbar"
import { BranchSelector } from "@/components/branch-selector"

const ITEMS_PER_PAGE = 24

export default function BranchPage() {
  const params = useParams()
  const branch = params.branch as string
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
  const [selectedEnrollment, setSelectedEnrollment] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true)
        const response = await studentAPI.getStudents(branch)
        // Filter students by branch if the API doesn't do it automatically
        const allStudents = response.data as Student[]
        const branchStudents = allStudents.filter(student => 
          student.branch === branch || 
          student.branch === branch.replace('-', ' ') ||
          allStudents.length === 0 // If no students, show empty state
        )
        setStudents(branchStudents)
      } catch (error) {
        console.error("Failed to fetch students", error)
        setStudents([])
      } finally {
        setLoading(false)
      }
    }
    fetchStudents()
  }, [branch])

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.university_enrolment_number.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [students, searchQuery])

  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    const end = start + ITEMS_PER_PAGE
    return filteredStudents.slice(start, end)
  }, [filteredStudents, currentPage])

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE)

  const handleOpenProfile = (enrollment: string) => {
    setSelectedEnrollment(enrollment)
    setIsModalOpen(true)
  }

  // Get proper branch display name
  const getBranchDisplayName = (branch: string) => {
    const branchNames: Record<string, string> = {
      'CSE': 'Computer Science & Engineering',
      'CSE-AIML': 'Computer Science & Engineering - AI & ML',
      'CSE-DS': 'Computer Science & Engineering - Data Science',
      'AIML': 'Artificial Intelligence & Machine Learning',
      'DS': 'Data Science',
      'IoT': 'Internet of Things',
      'CSBS': 'Cyber Security',
      'AIR': 'AI Research',
      'CSD': 'Cloud & Security',
      'EC': 'Electronics & Communication',
      'EE': 'Electrical Engineering',
      'EX': 'Embedded Systems',
      'ME': 'Mechanical Engineering',
      'CE': 'Civil Engineering'
    }
    return branchNames[branch] || branch
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <BranchSelector />
      

      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-40">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getBranchDisplayName(branch)}
            </h1>
            <p className="text-gray-500 mt-2">
              Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? "s" : ""}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset to first page when searching
                }}
                className="pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full md:w-64"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
              <SlidersHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonLoader key={i} />
            ))}
          </div>
        ) : paginatedStudents.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedStudents.map((student) => (
                <StudentCard
                  key={student.university_enrolment_number}
                  student={student}
                  onOpenProfile={handleOpenProfile}
                />
              ))}
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
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="text-gray-500 mt-1">
              {searchQuery ? "Try adjusting your search criteria" : `No students found in ${getBranchDisplayName(branch)}`}
            </p>
          </div>
        )}
      </main>

      <Footer />

      {/* Full Screen Modal */}
      <StudentModal 
        enrollment={selectedEnrollment} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}