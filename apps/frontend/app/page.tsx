"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { BranchCard } from "@/components/branch-card"
import { useToast } from "@/components/toast"
import { studentAPI } from "@/lib/api"

const branches = [
  { name: "CSE", label: "Computer Science" },
  { name: "AIML", label: "AI & Machine Learning" },
  { name: "DS", label: "Data Science" },
  { name: "IoT", label: "IoT" },
  { name: "CSBS", label: "Cyber Security" },
  { name: "AIR", label: "AI Research" },
  { name: "CSD", label: "Cloud & Security" },
  { name: "EC", label: "Electronics" },
  { name: "EE", label: "Electrical" },
  { name: "EX", label: "Embedded" },
  { name: "ME", label: "Mechanical" },
  { name: "CE", label: "Civil" },
]

export default function Home() {
  const [branchCounts, setBranchCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await studentAPI.getStudents()
        const students = response.data as any[]

        const counts: Record<string, number> = {}
        branches.forEach((b) => {
          counts[b.name] = students.filter((s) => s.branch === b.name).length
        })
        setBranchCounts(counts)
      } catch (error) {
        console.error("Failed to fetch branch counts:", error)
        // Provide default counts if API fails
        branches.forEach((b) => {
          branchCounts[b.name] = 0
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCounts()
  }, [])

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">College Student Showcase</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore talented students across different branches and specializations
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch) => (
            <BranchCard key={branch.name} branch={branch.name} count={branchCounts[branch.name] || 0} />
          ))}
        </div>
      </div>
    </main>
  )
}
