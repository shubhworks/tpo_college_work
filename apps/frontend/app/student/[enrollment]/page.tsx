"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { CertGallery } from "@/components/cert-gallery"
import { useToast } from "@/components/toast"
import { studentAPI } from "@/lib/api"
import type { Student, Certificate } from "@/types/student"
import { Github, Linkedin, Code2, Mail, Phone, FileText, ArrowLeft, Download } from "lucide-react"
import { motion } from "framer-motion"

export default function StudentDetailPage() {
  const params = useParams()
  const enrollment = params.enrollment as string

  const [student, setStudent] = useState<Student | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [certsLoading, setCertsLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true)
        const [studentRes, certsRes] = await Promise.all([
          studentAPI.getStudent(enrollment),
          studentAPI.getStudentCerts(enrollment),
        ])
        setStudent(studentRes.data as Student)
        setCertificates(certsRes.data as Certificate[])
      } catch (error) {
        console.error("Failed to fetch student details:", error)
        showToast("Failed to load student details", "error")
      } finally {
        setLoading(false)
      }
    }

    fetchStudentData()
  }, [enrollment, showToast])

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 rounded mb-4 w-1/3"></div>
            <div className="h-64 bg-gray-300 rounded mb-4"></div>
          </div>
        </div>
      </main>
    )
  }

  if (!student) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500 text-lg">Student not found</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href={`/branch/${student.branch}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {student.branch}
        </Link>

        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 mb-8 border border-gray-200 shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="shrink-0 flex justify-center md:justify-start">
              <div className="relative w-40 h-40">
                <Image
                  src={
                    student.upload_your_latest_professional_photo ||
                    "/placeholder.svg?height=160&width=160&query=profile" ||
                    "/placeholder.svg"
                  }
                  alt={student.name}
                  fill
                  className="rounded-2xl object-cover"
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{student.name}</h1>
              <p className="text-gray-600 mb-4">{student.university_enrolment_number}</p>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {student.branch}
                </span>
                <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                  {student.college}
                </span>
              </div>

              <div className="space-y-2 mb-6">
                {student.email_id && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Mail className="w-5 h-5" />
                    <a href={`mailto:${student.email_id}`} className="hover:text-blue-600">
                      {student.email_id}
                    </a>
                  </div>
                )}
                {student.mobile_number && (
                  <div className="flex items-center gap-3 text-gray-600">
                    <Phone className="w-5 h-5" />
                    <a href={`tel:${student.mobile_number}`} className="hover:text-blue-600">
                      {student.mobile_number}
                    </a>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {student.latest_resume_link && (
                  <a
                    href={student.latest_resume_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Resume
                  </a>
                )}
                {student.student_folder_link && (
                  <a
                    href={student.student_folder_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    <FileText className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            {student.github_profile_link && (
              <a
                href={student.github_profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-6 h-6" />
              </a>
            )}
            {student.linkedin_profile_link && (
              <a
                href={student.linkedin_profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            )}
            {student.leetcode_profile_link && (
              <a
                href={student.leetcode_profile_link}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="LeetCode"
              >
                <Code2 className="w-6 h-6" />
              </a>
            )}
          </div>
        </motion.div>

        {/* Certificates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 border border-gray-200 shadow-sm"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            Certificates
          </h2>
          <CertGallery certificates={certificates} />
        </motion.div>
      </div>
    </main>
  )
}
