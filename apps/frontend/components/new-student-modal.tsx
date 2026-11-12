"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Award, Calendar, CheckCircle2, ExternalLink, FileBadge, GraduationCap, Mail, MapPin, Phone, Sparkles, User, Users, X } from "lucide-react"
import type { StudentV2 } from "@/types/student-v2"

interface NewStudentModalProps {
  student: StudentV2 | null
  onClose: () => void
}

export function NewStudentModal({ student, onClose }: NewStudentModalProps) {
  if (!student) return null

  const initials = [
    student.firstName?.charAt(0) || student.fullName?.charAt(0) || "S",
    student.lastName?.charAt(0) || "",
  ].join("").toUpperCase()

  const acad = student.academicDetails

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-6 p-0">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] bg-gray-50 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="relative bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 p-8 sm:p-10 text-white">
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                {/* Avatar */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white/30 shadow-xl overflow-hidden shrink-0 bg-white/20 flex items-center justify-center">
                  {student.image && student.image.startsWith("http") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={student.image}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl sm:text-4xl font-bold tracking-wider">
                      {initials}
                    </span>
                  )}
                </div>

                {/* Main Info */}
                <div className="flex-1 text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                    {student.fullName}
                  </h2>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4 text-xs font-semibold">
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      {student.rollNo}
                    </span>
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      {student.course.name} · {student.branch.name}
                    </span>
                    {student.semester && (
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                        {student.semester}
                      </span>
                    )}
                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                      Batch {student.batch.name}
                    </span>
                    {student.gender && (
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                        {student.gender}
                      </span>
                    )}
                    {student.cast && (
                      <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
                        {student.cast}
                      </span>
                    )}
                  </div>

                  {/* Contacts */}
                  <div className="flex flex-wrap gap-4 text-white/90 text-sm justify-center sm:justify-start">
                    {student.email && (
                      <a
                        href={`mailto:${student.email}`}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Mail className="w-4 h-4 text-blue-200" />
                        <span>{student.email}</span>
                      </a>
                    )}
                    {student.phone && (
                      <a
                        href={`tel:${student.phone}`}
                        className="flex items-center gap-1.5 hover:text-white transition-colors"
                      >
                        <Phone className="w-4 h-4 text-blue-200" />
                        <span>{student.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-8">
              {/* Academic Performance Section */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Academic Scores & CGPA</h3>
                    <p className="text-xs text-gray-500">Board percentages, semester SGPA, and cumulative score</p>
                  </div>
                </div>

                {acad && (acad.cgpa !== null || acad.marks10 !== null || acad.marks12 !== null) ? (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
                        <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">CGPA</span>
                        <span className="text-xl font-extrabold text-blue-900">
                          {acad.cgpa !== null && acad.cgpa !== undefined ? acad.cgpa.toFixed(2) : "N/A"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                        <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">10th Board</span>
                        <span className="text-xl font-extrabold text-emerald-900">
                          {acad.marks10 !== null && acad.marks10 !== undefined ? `${acad.marks10}%` : "N/A"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-center">
                        <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">12th Board</span>
                        <span className="text-xl font-extrabold text-purple-900">
                          {acad.marks12 !== null && acad.marks12 !== undefined ? `${acad.marks12}%` : "N/A"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
                        <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">UG Score</span>
                        <span className="text-xl font-extrabold text-amber-900">
                          {acad.ug !== null && acad.ug !== undefined ? `${acad.ug}%` : "N/A"}
                        </span>
                      </div>
                    </div>

                    {/* Semester-wise grid */}
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-700 mb-2 block">Semester SGPA Breakdown</span>
                      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                        {[
                          { label: "Sem 1", val: acad.sem1 },
                          { label: "Sem 2", val: acad.sem2 },
                          { label: "Sem 3", val: acad.sem3 },
                          { label: "Sem 4", val: acad.sem4 },
                          { label: "Sem 5", val: acad.sem5 },
                          { label: "Sem 6", val: acad.sem6 },
                          { label: "Sem 7", val: acad.sem7 },
                          { label: "Sem 8", val: acad.sem8 },
                        ].map((s, idx) => (
                          <div key={idx} className="p-2 bg-gray-50 border border-gray-200/60 rounded-lg text-center">
                            <span className="text-[10px] text-gray-500 block">{s.label}</span>
                            <span className="text-xs font-bold text-gray-800">
                              {s.val !== null && s.val !== undefined ? s.val : "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No academic marks entered yet in students_acadmic_details.</p>
                )}
              </section>

              {/* Skills Section */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Technical & Professional Skills</h3>
                    <p className="text-xs text-gray-500">Student portfolio skills</p>
                  </div>
                </div>

                {student.skills && student.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {student.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 text-blue-800 rounded-xl text-xs font-semibold shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No skills listed yet for this student.</p>
                )}
              </section>

              {/* College Certificates */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">College Verified Certificates</h3>
                    <p className="text-xs text-gray-500">Official college achievements verified by faculty</p>
                  </div>
                </div>

                {student.collegeCertificates && student.collegeCertificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.collegeCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-sm text-gray-900">{cert.certificateName}</h4>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              {cert.status || "Verified"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono">No: {cert.certificateNumber}</p>
                          <p className="text-xs text-gray-500 mt-1">Issued: {cert.issueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No college certificates uploaded yet.</p>
                )}
              </section>

              {/* External / Other Certificates */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Other Certifications & Courses</h3>
                    <p className="text-xs text-gray-500">External credentials, MOOCs, and industry certs</p>
                  </div>
                </div>

                {student.otherCertificates && student.otherCertificates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {student.otherCertificates.map((cert) => (
                      <div
                        key={cert.id}
                        className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex flex-col justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 mb-1">{cert.certificateName}</h4>
                          <p className="text-xs text-gray-600 font-medium">{cert.issuingOrganization}</p>
                          <p className="text-xs text-gray-400 mt-1">Issued: {cert.issueDate}</p>
                          {cert.credentialId && (
                            <p className="text-xs text-gray-500 mt-1 font-mono">ID: {cert.credentialId}</p>
                          )}
                        </div>
                        {cert.credentialUrl && (
                          <a
                            href={cert.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <span>Verify Credential</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No external certificates uploaded yet.</p>
                )}
              </section>

              {/* Personal & Parent Info */}
              <section className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-gray-100 text-gray-700 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Personal & Family Details</h3>
                    <p className="text-xs text-gray-500">Official college records</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {student.fatherName && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 block mb-1">Father&apos;s Name</span>
                      <span className="font-semibold text-gray-900">{student.fatherName}</span>
                      {student.fatherPhone && (
                        <span className="text-gray-500 block mt-0.5">Phone: {student.fatherPhone}</span>
                      )}
                    </div>
                  )}
                  {student.motherName && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 block mb-1">Mother&apos;s Name</span>
                      <span className="font-semibold text-gray-900">{student.motherName}</span>
                    </div>
                  )}
                  {student.dob && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 block mb-1">Date of Birth</span>
                      <span className="font-semibold text-gray-900">{student.dob}</span>
                    </div>
                  )}
                  {student.bloodGroup && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-gray-500 block mb-1">Blood Group</span>
                      <span className="font-semibold text-gray-900">{student.bloodGroup}</span>
                    </div>
                  )}
                  {(student.city || student.state) && (
                    <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                      <span className="text-gray-500 block mb-1">Location</span>
                      <span className="font-semibold text-gray-900">
                        {[student.city, student.state, student.pincode].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  {(student.currentAddress || student.permanentAddress) && (
                    <div className="p-3 bg-gray-50 rounded-xl sm:col-span-2">
                      <span className="text-gray-500 block mb-1">Permanent Address</span>
                      <span className="font-semibold text-gray-900">
                        {student.permanentAddress || student.currentAddress}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
