"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Award, BriefcaseBusiness, Download, ExternalLink, FileBadge, Github, Globe, Linkedin, Mail, X } from "lucide-react"
import Image from "next/image"
import type { MyGGStudent } from "@/types/mygg"

interface MyGGStudentModalProps {
  student: MyGGStudent | null
  onClose: () => void
}

function formatDate(value?: string | null) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString()
}

export function MyGGStudentModal({ student, onClose }: MyGGStudentModalProps) {
  return (
    <AnimatePresence>
      {student && (
        <div className="fixed inset-0 z-60 flex items-center justify-center sm:p-6 p-0">
          <motion.button
            type="button"
            aria-label="Close profile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="mygg-profile-name"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-5xl h-full sm:h-auto sm:max-h-[90vh] bg-gray-50 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="absolute top-4 right-4 z-10 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <header className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-12 text-white">
                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white/30 shadow-xl overflow-hidden shrink-0 bg-white/20 flex items-center justify-center">
                    {student.profileImageUrl ? (
                      <Image
                        src={student.profileImageUrl}
                        alt={`${student.fullName || "Student"}'s profile`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold">
                        {(student.firstName?.charAt(0) || student.fullName?.charAt(0) || "?")}
                        {(student.lastName?.charAt(0) || "")}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h2 id="mygg-profile-name" className="text-3xl sm:text-4xl font-bold mb-2">
                      {student.fullName || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student Profile"}
                    </h2>
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start mb-6 text-sm">
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{student.enrollmentNumber}</span>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">{student.academic?.branch?.name || student.academic?.branch?.shortCode || "—"}</span>
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">Passout {student.academic?.passoutYear ?? "—"}</span>
                    </div>
                    <div className="space-y-2 text-white/90 text-sm">
                      {student.email && (
                        <a href={`mailto:${student.email}`} className="flex items-center gap-3 justify-center sm:justify-start">
                          <Mail className="w-4 h-4" /> {student.email}
                        </a>
                      )}
                      {student.phone && <p>{student.phone}</p>}
                    </div>
                  </div>
                </div>
              </header>

              <div className="p-6 sm:p-10 space-y-10">
                <section className="flex flex-col sm:flex-row justify-between items-center gap-6 pb-8 border-b border-gray-200">
                  <div className="flex flex-wrap gap-3">
                    {student.resumes?.tech && (
                      <a href={student.resumes.tech} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors shadow-sm text-sm font-medium">
                        <Download className="w-4 h-4" /> Technical Resume
                      </a>
                    )}
                    {student.resumes?.nonTech && (
                      <a href={student.resumes.nonTech} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium">
                        <Download className="w-4 h-4" /> Non-technical Resume
                      </a>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {[
                      { link: student.links?.github, icon: Github, label: "GitHub" },
                      { link: student.links?.linkedin, icon: Linkedin, label: "LinkedIn" },
                      { link: student.links?.portfolio, icon: Globe, label: "Portfolio" },
                    ].map(({ link, icon: Icon, label }) =>
                      link ? (
                        <a key={label} href={link} target="_blank" rel="noreferrer" aria-label={label} title={label} className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all">
                          <Icon className="w-5 h-5" />
                        </a>
                      ) : null,
                    )}
                    {(student.socialLinks || []).map((social) => (
                      <a key={social.id} href={social.url} target="_blank" rel="noreferrer" title={social.platform} aria-label={social.platform} className="p-3 bg-white border border-gray-200 text-gray-600 rounded-xl hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full" /> Academic Details
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      ["Branch", student.academic.branch.name],
                      ["Admission year", student.academic.admissionYear],
                      ["Passout year", student.academic.passoutYear],
                      ["Semester / section", [student.academic.currentSemester, student.academic.section].filter(Boolean).join(" / ")],
                      ["Date of birth", formatDate(student.dateOfBirth)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl bg-white border border-gray-200 p-4">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="mt-1 text-sm font-semibold text-gray-900">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full" /> Projects
                  </h3>
                  {student.projects?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {student.projects.map((project) => (
                        <article key={project.id} className="rounded-xl bg-white border border-gray-200 p-5">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <BriefcaseBusiness className="w-4 h-4 text-blue-600" /> {project.title}
                          </h4>
                          {project.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{project.description}</p>}
                          {project.techStack?.length ? <p className="mt-3 text-xs font-medium text-blue-700">{project.techStack.join(" · ")}</p> : null}
                          {(formatDate(project.startDate) || formatDate(project.endDate)) && (
                            <p className="mt-2 text-xs text-gray-500">{formatDate(project.startDate) || "—"} – {formatDate(project.endDate) || "Present"}</p>
                          )}
                          {project.link && <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-700 hover:underline">View project <ExternalLink className="w-3 h-3" /></a>}
                        </article>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No projects available.</p>}
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full" /> Certificates
                  </h3>
                  {student.certificates?.length ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {student.certificates.map((certificate) => (
                        <article key={certificate.id} className="rounded-xl bg-white border border-gray-200 p-5">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2"><FileBadge className="w-4 h-4 text-blue-600" /> {certificate.title}</h4>
                          {certificate.issuer && <p className="mt-2 text-sm text-gray-600">{certificate.issuer}</p>}
                          {formatDate(certificate.issueDate) && <p className="mt-1 text-xs text-gray-500">{formatDate(certificate.issueDate)}</p>}
                          {certificate.fileUrl && <a href={certificate.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-700 hover:underline">Open certificate <ExternalLink className="w-3 h-3" /></a>}
                        </article>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No certificates available.</p>}
                </section>

                <section>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-600 rounded-full" /> Achievements
                  </h3>
                  {student.achievements?.length ? (
                    <div className="space-y-3">
                      {student.achievements.map((achievement) => (
                        <article key={achievement.id} className="rounded-xl bg-white border border-gray-200 p-5">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2"><Award className="w-4 h-4 text-blue-600" /> {achievement.title}</h4>
                          {achievement.description && <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">{achievement.description}</p>}
                          <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                            {achievement.category && <span>{achievement.category}</span>}
                            {formatDate(achievement.date) && <span>{formatDate(achievement.date)}</span>}
                          </div>
                          {achievement.fileUrl && <a href={achievement.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-blue-700 hover:underline">Open attachment <ExternalLink className="w-3 h-3" /></a>}
                        </article>
                      ))}
                    </div>
                  ) : <p className="text-sm text-gray-500">No achievements available.</p>}
                </section>
              </div>
            </div>
          </motion.section>
        </div>
      )}
    </AnimatePresence>
  )
}
