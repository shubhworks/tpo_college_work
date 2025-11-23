"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Github, Linkedin, Code2, Mail, Phone, FileText, Download, X, GraduationCap, Building2 } from "lucide-react"
import { studentAPI } from "@/lib/api"
import type { Student, Certificate } from "@/types/student"
import { CertGallery } from "./cert-gallery"

interface StudentModalProps {
  enrollment: string | null
  isOpen: boolean
  onClose: () => void
}

export function StudentModal({ enrollment, isOpen, onClose }: StudentModalProps) {
  const [student, setStudent] = useState<Student | null>(null)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [fileId, setFileId] = useState<string | null>(null);


  // fetching the image's fileid
  useEffect(() => {
    async function fetchFile() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${student?.university_enrolment_number}`);
        const data = await res.json();
        setFileId(data.fileid || null);
      } catch (error) {
        console.error("Error fetching fileId:", error);
      }
    }
    fetchFile();
  }, [student?.university_enrolment_number]);

  useEffect(() => {
    if (isOpen && enrollment) {
      const fetchData = async () => {
        setLoading(true)
        try {
          const [studentRes, certsRes] = await Promise.all([
            studentAPI.getStudent(enrollment),
            studentAPI.getStudentCerts(enrollment),
          ])
          setStudent(studentRes.data || null)
          setCertificates(certsRes.data || [])
        } catch (error) {
          console.error("Error fetching data", error)
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen, enrollment])

  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6 p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-gray-50 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {loading ? (
              <div className="flex items-center justify-center h-[500px]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : student ? (
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {/* Header Section - Gradient Background */}
                <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white">
                  <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start relative z-0">
                    {/* Avatar */}
                    <div className="shrink-0">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/30 shadow-xl overflow-hidden relative">
                        <Image
                          src={
                            fileId
                              ? `https://drive.google.com/uc?export=view&id=${fileId}`
                              : "/placeholder.svg?height=80&width=80&query=profile"
                          }
                          alt={student.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                      <h2 className="text-3xl sm:text-4xl font-bold mb-2">{student.name}</h2>
                      <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-6 text-sm">
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                          {student.university_enrolment_number}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                          <GraduationCap className="w-3 h-3" /> {student.branch}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2">
                          <Building2 className="w-3 h-3" /> {student.college}
                        </span>
                      </div>

                      <div className="space-y-2 text-white/90 text-sm sm:text-base">
                        {student.email_id && (
                          <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <Mail className="w-4 h-4" /> {student.email_id}
                          </div>
                        )}
                        {student.mobile_number && (
                          <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <Phone className="w-4 h-4" /> {student.mobile_number}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 sm:p-10 space-y-10">
                  {/* Action Buttons & Socials */}
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-gray-200">
                    <div className="flex gap-4">
                      {student.latest_resume_link && (
                        <a
                          href={student.latest_resume_link}
                          className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium"
                        >
                          <Download className="w-4 h-4" /> Resume
                        </a>
                      )}
                      {student.student_folder_link && (
                        <a
                          href={student.student_folder_link}
                          className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" /> Portfolio
                        </a>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {[
                        { link: student.github_profile_link, icon: Github, label: "GitHub" },
                        { link: student.linkedin_profile_link, icon: Linkedin, label: "LinkedIn" },
                        { link: student.leetcode_profile_link, icon: Code2, label: "LeetCode" },
                      ].map(
                        (social, i) =>
                          social.link && (
                            <a
                              key={i}
                              href={social.link}
                              target="_blank"
                              className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all"
                              title={social.label}
                              rel="noreferrer"
                            >
                              <social.icon className="w-5 h-5" />
                            </a>
                          ),
                      )}
                    </div>
                  </div>

                  {/* Certificates Section */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                      Certificates
                    </h3>
                    <CertGallery certificates={certificates} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Student not found</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
