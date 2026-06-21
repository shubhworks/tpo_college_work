"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Calendar, Users, MapPin, Globe, Code, Database } from "lucide-react"
import { PROGRAMS } from "@/lib/mock-data"
import { Footer } from "@/components/footer"
import { studentAPI } from "@/lib/api"
import { Navbar } from "@/components/Navbar"
import { useBatch } from "@/context/batch-context"
import { TokenGate } from "@/components/token-gate"
import type { Student } from "@/types/student"

import type { LucideIcon } from "lucide-react"

// Icon mapping for programs
const ICONS: Record<string, LucideIcon> = {
  CSE: Code,
  "CSE-AIML": Database,
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
  const { batch, spreadsheetId } = useBatch()
  const [branchCounts, setBranchCounts] = useState<BranchCounts>({})
  const [loading, setLoading] = useState(true)
  const [totalPrograms, setTotalPrograms] = useState(0)

  const totalEligibleStudents = PROGRAMS.reduce(
    (sum, program) => sum + (branchCounts[program.slug] || 0),
    0,
  )

  const formatCount = (count: number) => `${count}+`

  useEffect(() => {
    let isMounted = true;
    const fetchStudentCounts = async () => {
      setLoading(true)
      try {
        const response = await studentAPI.getStudents(undefined, batch, spreadsheetId || undefined)
        if (!isMounted) return;

        const students = response.data as Student[]

        // Count students per branch
        const counts: BranchCounts = {}
        PROGRAMS.forEach(program => {
          counts[program.slug] = students.filter(student => (student.branch || "").toLowerCase() === program.slug.toLowerCase()).length
        })

        setBranchCounts(counts)
        setTotalPrograms(PROGRAMS.length)
      } catch (error) {
        console.error("Failed to fetch student counts:", error)
        if (isMounted) {
          // Set default counts if API fails
          const defaultCounts: BranchCounts = {}
          PROGRAMS.forEach(program => {
            defaultCounts[program.slug] = 0
          })
          setBranchCounts(defaultCounts)
          setTotalPrograms(PROGRAMS.length)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchStudentCounts()
    return () => {
      isMounted = false;
    };
  }, [batch, spreadsheetId])

  return (
    <TokenGate>
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

            <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_1.9fr] gap-6 mb-10 items-start">
              {/* Stats + Branch-wise Table */}
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm col-span-full">
                {/* Stats Row */}
                <div className="flex overflow-x-auto border-b border-gray-200">
                  {[
                    { num: "240", sup: "+", label: "Corporate Associations" },
                    { num: "53", unit: " LPA", label: "Highest CTC" },
                    { num: "5", unit: " LPA", label: "Average CTC" },
                    { num: "20", sup: "+", unit: " MOUs", label: "For Training & Development" },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="flex flex-1 min-w-[120px] flex-col items-center justify-center px-3 py-5 border-r border-gray-200 last:border-r-0"
                    >
                      <span className="text-3xl font-black text-gray-900">
                        {stat.num}
                        {stat.sup && <sup className="text-base font-bold align-super">{stat.sup}</sup>}
                        {stat.unit && <span className="text-base font-bold">{stat.unit}</span>}
                      </span>
                      <span className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 text-center leading-tight">
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* NBA + Programs Info Bar */}
                <div className="flex flex-col sm:flex-row items-stretch border-b border-gray-200">
                  {/* NBA Badge */}
                  <div className="flex items-center gap-4 px-6 py-5 border-b sm:border-b-0 sm:border-r border-gray-200 shrink-0">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 text-white shrink-0">
                      <span className="text-2xl font-black leading-none">5</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 leading-tight">Branches of GGITS</p>
                      <p className="text-xs text-gray-500 mt-0.5">Accredited by</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-700 text-white text-xs font-black tracking-widest">
                        NBA
                      </span>
                    </div>
                  </div>

                  {/* B.Tech Programs */}
                  <div className="flex flex-col justify-center px-6 py-5 border-b sm:border-b-0 sm:border-r border-gray-200 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">B.Tech in</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        "CSE", "CSE – Data Science", "CSE – AIML", "CSE – IoT",
                        "Cyber Security", "CSBS", "AIR", "CSD", "ECE", "EE", "EX", "ME", "CE"
                      ].map((prog) => (
                        <span
                          key={prog}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* M.Tech / MBA / MCA / Pharma */}
                  <div className="flex flex-col justify-center px-6 py-5 shrink-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400 mb-2">Also Offered</p>
                    <div className="flex flex-wrap gap-1.5">
                      {["M.Tech", "MBA", "MCA", "Pharma"].map((prog) => (
                        <span
                          key={prog}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold"
                        >
                          {prog}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Branch-wise Table Header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-400">Placement Data</p>
                    <h3 className="text-lg font-bold text-gray-900 mt-0.5">Branch-wise Eligible Students</h3>
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm">
                    <span>785</span>
                    <span className="text-slate-400 text-xs">+</span>
                  </div>
                </div>

                {/* Scrollable Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        {[
                          "Branches", "CSE", "CSE – AI&ML", "CSE – DS", "CSE – IoT & CySec",
                          "CSBS", "CSE – AI&DS", "CSE – CSD", "CSE – AI & Robotics",
                          "EC", "EE", "EX", "CE", "ME", "MCA"
                        ].map((h, i) => (
                          <th
                            key={i}
                            className={`py-3 px-3 font-semibold whitespace-nowrap border-r border-white/10 last:border-r-0 text-[11px] tracking-wide ${i === 0 ? "text-left min-w-[120px]" : "text-center"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-blue-50">
                        <td className="py-3.5 px-4 font-bold text-[11px] whitespace-nowrap text-blue-800 border-r border-blue-100 border-b border-blue-100 uppercase tracking-wide">
                          60% Throughout
                        </td>
                        {[356, 128, 75, 28, 20, 20, 17, 14, 20, 12, 11, 20, 8, 36].map((n, i) => (
                          <td key={i} className="py-3.5 px-3 text-center font-bold text-sm text-blue-900 border-r border-blue-100 border-b border-blue-100 last:border-r-0">
                            {n}
                          </td>
                        ))}
                      </tr>
                      <tr className="bg-amber-50">
                        <td className="py-3.5 px-4 font-bold text-[11px] whitespace-nowrap text-amber-800 border-r border-amber-100 uppercase tracking-wide">
                          70% Throughout
                        </td>
                        {[216, 84, 49, 16, 12, 12, 9, 7, 10, 8, 3, 10, 5, 19].map((n, i) => (
                          <td key={i} className="py-3.5 px-3 text-center font-bold text-sm text-amber-900 border-r border-amber-100 last:border-r-0">
                            {n}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
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
                  <p className="text-sm font-medium text-gray-900 mt-1">2003</p>
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
                  <a href="https://ggits.org" target="_blank" className="text-sm font-medium text-blue-600 hover:underline mt-1">
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

                const batchParams = new URLSearchParams()
                if (batch) batchParams.set("batch", batch)
                if (spreadsheetId) batchParams.set("spreadsheetId", spreadsheetId)
                const queryStr = batchParams.toString() ? `?${batchParams.toString()}` : ""

                return (
                  <div
                    key={program.id}
                    className="group cursor-pointer flex flex-col
      rounded-2xl border border-white/20
      hover:border-blue-200 hover:shadow-xl
      transition-all duration-300 overflow-hidden
      bg-linear-to-br from-blue-500 via-white to-blue-300
      bg-size-[200%_200%] animate-gradient-move"
                  >
                    <div onClick={() => {
                      window.location.href = `/branch/${program.slug}${queryStr}`;
                    }} className="p-8 flex flex-col h-full">
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
                        href={`/branch/${program.slug}${queryStr}`}
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
    </TokenGate>
  )
}
