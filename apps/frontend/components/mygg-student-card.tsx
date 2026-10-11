"use client"

import { motion } from "framer-motion"
import { Github, Linkedin, Globe } from "lucide-react"
import Image from "next/image"
import type { MyGGStudent } from "@/types/mygg"

interface MyGGStudentCardProps {
  student: MyGGStudent
  onOpenProfile: (student: MyGGStudent) => void
}

export function MyGGStudentCard({ student, onOpenProfile }: MyGGStudentCardProps) {
  const socials = [
    { link: student.links?.github, icon: Github, label: "GitHub" },
    { link: student.links?.linkedin, icon: Linkedin, label: "LinkedIn" },
    { link: student.links?.portfolio, icon: Globe, label: "Portfolio" },
  ]

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="bg-linear-to-br from-blue-500 via-white to-blue-400/50 rounded-2xl border border-white/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group bg-size-[200%_200%] animate-gradient-move"
    >
      <button
        type="button"
        onClick={() => onOpenProfile(student)}
        className="p-6 flex flex-col items-center flex-1 w-full text-left"
        aria-label={`View ${student.fullName}'s profile`}
      >
        <div className="mb-5 relative">
          <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center">
            {student.profileImageUrl ? (
              <Image
                src={student.profileImageUrl}
                alt={`${student.fullName || "Student"}'s profile`}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-blue-700">
                {(student.firstName?.charAt(0) || student.fullName?.charAt(0) || "?")}
                {(student.lastName?.charAt(0) || "")}
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-extrabold text-black text-center mb-1 line-clamp-1">{student.fullName || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student"}</h3>
        <p className="text-xs font-bold text-gray-800 text-center mb-4">{student.enrollmentNumber}</p>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {student.academic?.branch?.shortCode || "—"}
          </span>
          <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-[10px] font-bold tracking-wide uppercase">
            Passout {student.academic?.passoutYear ?? "—"}
          </span>
        </div>

        <div className="mt-auto w-full pt-4 border-t border-gray-50 flex justify-center gap-4">
          {socials.map(({ link, icon: Icon, label }) =>
            link ? (
              <a
                key={label}
                href={link}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="text-gray-400 hover:text-blue-600 transition-colors"
                onClick={(event) => event.stopPropagation()}
              >
                <Icon className="w-4 h-4" />
              </a>
            ) : null,
          )}
        </div>
      </button>

      <button
        type="button"
        onClick={() => onOpenProfile(student)}
        className="w-full py-3 bg-gray-50 hover:bg-blue-600 text-gray-600 hover:text-white text-sm font-medium transition-colors duration-300 border-t border-gray-100"
      >
        View Full Profile
      </button>
    </motion.article>
  )
}
