"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Code2 } from "lucide-react"
import type { Student } from "@/types/student"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useBatch } from "@/context/batch-context"
import { studentAPI } from "@/lib/api"

interface StudentCardProps {
  student: Student
  onOpenProfile: (enrollment: string) => void
}

export function StudentCard({ student, onOpenProfile }: StudentCardProps) {
  const { batch, spreadsheetId } = useBatch()
  const [fileId, setFileId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchFile() {
      try {
        const response = await studentAPI.getImage(student.university_enrolment_number, batch, spreadsheetId || undefined);
        if (isMounted) {
            setFileId(response.data.fileid || null);
        }
      } catch (error) {
        console.error("Error fetching fileId:", error);
      }
    }
    fetchFile();
    return () => {
        isMounted = false;
    };
  }, [student.university_enrolment_number, batch, spreadsheetId]);

  const studentEnrollment = student.university_enrolment_number;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      className="bg-linear-to-br from-blue-500 via-white to-blue-400/50
  cursor-pointer rounded-2xl border border-white/20
  shadow-sm hover:shadow-xl transition-all duration-300
  overflow-hidden flex flex-col h-full group
  bg-size-[200%_200%] animate-gradient-move"
    >
      <div onClick={() => onOpenProfile(studentEnrollment)} className="p-6 flex flex-col items-center flex-1">
        {/* Avatar with Ring */}
        <div className="mb-5 relative">
          <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden">
            <Image
              src={
                fileId
                  ? `https://drive.google.com/uc?export=view&id=${fileId}`
                  : "/placeholder.svg?height=80&width=80&query=profile"
              }
              alt={student.name || "Student"}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Info */}
        <h3 className="text-xl font-extrabold text-black text-center mb-1 line-clamp-1">{student.name}</h3>
        <p className="text-xs font-bold text-gray-800 text-center mb-4">{studentEnrollment}</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {student.branch}
          </span>
          <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {student.college}
          </span>
        </div>

        {/* Socials - Push to bottom */}
        <div className="mt-auto w-full pt-4 border-t border-gray-50 flex justify-center gap-4">
          {[
            { link: student.github_profile_link, icon: Github },
            { link: student.linkedin_profile_link, icon: Linkedin },
            { link: student.leetcode_profile_link, icon: Code2 },
          ].map(
            (social, idx) =>
              social.link && (
                <a
                  key={idx}
                  href={social.link}
                  target="_blank"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                  rel="noreferrer"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ),
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onOpenProfile(studentEnrollment)}
        className="w-full py-3 bg-gray-50 hover:bg-blue-600 text-gray-600 hover:text-white text-sm font-medium transition-colors duration-300 border-t border-gray-100"
      >
        View Full Profile
      </button>
    </motion.div>
  )
}

