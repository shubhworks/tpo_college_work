"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Users, MapPin, Globe, Code, Database, BrainCircuit } from "lucide-react"
import { PROGRAMS } from "@/lib/mock-data"
import { Footer } from "@/components/footer"
import { Navbar } from "../components/Navbar"
import { studentAPI } from "@/lib/api"

// Icon mapping for programs
const ICONS: Record<string, any> = {
  CSE: Code,
  "CSE-AIML": BrainCircuit,
  "CSE-DS": Database,
}

const COLORS: Record<string, string> = {
  CSE: "bg-blue-100 text-blue-600",
  "CSE-AIML": "bg-purple-100 text-purple-600",
  "CSE-DS": "bg-indigo-100 text-indigo-600",
}

interface BranchCounts {
  [key: string]: number
}

export default function Home() {
  const [branchCounts, setBranchCounts] = useState<BranchCounts>({})
  const [loading, setLoading] = useState(true)
  const [totalPrograms, setTotalPrograms] = useState(0)

  useEffect(() => {
    const fetchStudentCounts = async () => {
      try {
        const response = await studentAPI.getStudents()
        const students = response.data as any[]

        // Count students per branch
        const counts: BranchCounts = {}
        PROGRAMS.forEach(program => {
          counts[program.slug] = students.filter(student => student.branch === program.slug).length
        })

        setBranchCounts(counts)
        setTotalPrograms(PROGRAMS.length)
      } catch (error) {
        console.error("Failed to fetch student counts:", error)
        // Set default counts if API fails
        const defaultCounts: BranchCounts = {}
        PROGRAMS.forEach(program => {
          defaultCounts[program.slug] = 0
        })
        setBranchCounts(defaultCounts)
        setTotalPrograms(PROGRAMS.length)
      } finally {
        setLoading(false)
      }
    }

    fetchStudentCounts()
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative mt-20 bg-slate-50 pt-16 pb-24 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">
              Gyan Ganga Group of Institutions
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Premier group of engineering institutions offering world-class technical education with state-of-the-art
              facilities and industry partnerships. Our commitment to excellence in education has produced thousands of
              successful engineers.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                <p className="text-sm font-medium text-gray-900 mt-1">Jabalpur, MP</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Established</p>
                <p className="text-sm font-medium text-gray-900 mt-1">1992</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Programs</p>
                <p className="text-sm font-medium text-gray-900 mt-1">
                  {loading ? "..." : `${totalPrograms} B.Tech Courses`}
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                <Globe className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Website</p>
                <a href="#" className="text-sm font-medium text-blue-600 hover:underline mt-1">
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Programs Section */}
      <div className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Explore Our B.Tech Programs</h2>
          <p className="text-gray-500 mt-4">Click on any branch to view student portfolios and their achievements</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PROGRAMS.map((program) => {
              const Icon = ICONS[program.slug] || Code
              const colorClass = COLORS[program.slug] || "bg-gray-100 text-gray-600"
              const studentCount = branchCounts[program.slug] || 0

              return (
                <div
                  key={program.id}
                  className="group flex flex-col bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="p-8 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-4 rounded-xl ${colorClass}`}>
                        <Icon className="w-8 h-8" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${colorClass}`}>
                        {program.slug}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">{program.description}</p>

                    <div className="flex justify-center items-center gap-6 text-sm text-gray-500 mb-8 pt-6 border-t border-gray-50">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{studentCount} student{studentCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <Link
                      href={`/branch/${program.slug}`}
                      className="w-full py-3 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all text-center"
                    >
                      View Students
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}