"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Github, Linkedin, Code2 } from "lucide-react"
import type { Student } from "@/types/student"
import { useEffect, useState } from "react"

interface StudentCardProps {
  student: Student
}


export function StudentCard({ student }: StudentCardProps) {
  const [fileId, setFileId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFile() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${student.university_enrolment_number}`);
        const data = await res.json();
        setFileId(data.fileid || null);
      } catch (error) {
        console.error("Error fetching fileId:", error);
      }
    }
    fetchFile();
  }, [student.university_enrolment_number]);

  return (
    <Link href={`/student/${student.university_enrolment_number}`}>
      <motion.div
        whileHover={{ y: -6 }}
        className="p-6 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:shadow-lg transition-shadow"
      >
        {/* Avatar */}
        <div className="mb-4 flex justify-center">
          <div className="relative w-20 h-20">
            <Image
              src={
                fileId
                  ? `https://drive.google.com/uc?export=view&id=${fileId}`
                  : "/placeholder.svg?height=80&width=80&query=profile"
              }
              alt={student.name}
              fill
              className="rounded-full object-cover"
            />
          </div>
        </div>

        {/* Name and Enrollment */}
        <h3 className="text-lg font-bold text-gray-900 text-center mb-1 truncate">{student.name}</h3>
        <p className="text-xs text-gray-500 text-center mb-3">{student.university_enrolment_number}</p>

        {/* College and Branch */}
        <div className="flex justify-center gap-2 mb-4 flex-wrap">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">{student.branch}</span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
            {student.college}
          </span>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-3 pt-4 border-t border-gray-200">
          {student.github_profile_link && (
            <a
              href={student.github_profile_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="GitHub profile"
            >
              <Github className="w-5 h-5 text-gray-600" />
            </a>
          )}
          {student.linkedin_profile_link && (
            <a
              href={student.linkedin_profile_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="LinkedIn profile"
            >
              <Linkedin className="w-5 h-5 text-gray-600" />
            </a>
          )}
          {student.leetcode_profile_link && (
            <a
              href={student.leetcode_profile_link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="LeetCode profile"
            >
              <Code2 className="w-5 h-5 text-gray-600" />
            </a>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
