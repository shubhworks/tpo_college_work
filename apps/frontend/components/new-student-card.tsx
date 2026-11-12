"use client"

import { motion } from "framer-motion"
import { Award, FileBadge, Sparkles, GraduationCap } from "lucide-react"
import type { StudentV2 } from "@/types/student-v2"

interface NewStudentCardProps {
  student: StudentV2
  onOpenProfile: (student: StudentV2) => void
}

export function NewStudentCard({ student, onOpenProfile }: NewStudentCardProps) {
  const initials = [
    student.firstName?.charAt(0) || student.fullName?.charAt(0) || "S",
    student.lastName?.charAt(0) || "",
  ].join("").toUpperCase()

  const totalCerts = (student.collegeCertificates?.length || 0) + (student.otherCertificates?.length || 0)
  const cgpa = student.academicDetails?.cgpa

  return (
    <motion.article
      whileHover={{ y: -6 }}
      className="bg-linear-to-br from-blue-500 via-white to-blue-400/50 rounded-2xl border border-white/20 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full group bg-size-[200%_200%] animate-gradient-move cursor-pointer"
      onClick={() => onOpenProfile(student)}
    >
      <div className="p-6 flex flex-col items-center flex-1 w-full text-left">
        {/* Avatar with Glow Ring */}
        <div className="mb-5 relative">
          <div className="absolute inset-0 bg-linear-to-br from-blue-100 to-indigo-100 rounded-full scale-110 group-hover:scale-125 transition-transform duration-500" />
          <div className="relative w-24 h-24 rounded-full border-4 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center">
            {student.image && student.image.startsWith("http") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={student.image}
                alt={student.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold bg-linear-to-br from-blue-600 to-indigo-700 bg-clip-text text-transparent">
                {initials}
              </span>
            )}
          </div>
        </div>

        {/* Name and Roll */}
        <h3 className="text-xl font-extrabold text-black text-center mb-1 line-clamp-1">
          {student.fullName}
        </h3>
        <p className="text-xs font-bold text-gray-800 text-center mb-3">
          {student.rollNo}
        </p>

        {/* Primary Tags: Course, Branch, Batch, Sem */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-3">
          <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {student.branch.name}
          </span>
          {student.semester && (
            <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-bold tracking-wide uppercase">
              {student.semester}
            </span>
          )}
          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-full text-[10px] font-bold tracking-wide uppercase">
            {student.batch.name}
          </span>
          {cgpa !== null && cgpa !== undefined && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold tracking-wide uppercase">
              <GraduationCap className="w-3 h-3 text-emerald-600" />
              {cgpa.toFixed(2)} CGPA
            </span>
          )}
        </div>

        {/* Skills Preview */}
        {student.skills && student.skills.length > 0 && (
          <div className="w-full mb-4">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 mb-1.5 justify-center">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Skills</span>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {student.skills.slice(0, 3).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/80 border border-slate-200 text-slate-800 rounded-md text-[10px] font-medium"
                >
                  {skill}
                </span>
              ))}
              {student.skills.length > 3 && (
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium">
                  +{student.skills.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certifications Badge */}
        {totalCerts > 0 && (
          <div className="mt-auto pt-3 border-t border-slate-100 w-full flex items-center justify-center gap-3 text-xs text-slate-600">
            {student.collegeCertificates?.length > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                <Award className="w-3 h-3" />
                {student.collegeCertificates.length} College Cert{student.collegeCertificates.length === 1 ? "" : "s"}
              </span>
            )}
            {student.otherCertificates?.length > 0 && (
              <span className="inline-flex items-center gap-1 font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full text-[10px]">
                <FileBadge className="w-3 h-3" />
                {student.otherCertificates.length} External
              </span>
            )}
          </div>
        )}
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onOpenProfile(student)
        }}
        className="w-full py-3 bg-gray-50 hover:bg-blue-600 text-gray-600 hover:text-white text-sm font-medium transition-colors duration-300 border-t border-gray-100"
      >
        View Full Profile
      </button>
    </motion.article>
  )
}
