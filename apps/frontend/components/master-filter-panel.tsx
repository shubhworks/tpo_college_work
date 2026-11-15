"use client"

import { useState, useRef, useMemo, useEffect } from "react"
import {
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  GraduationCap,
  Layers,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import type { FilterMeta, MasterFilterState } from "@/types/student-v2"

interface MasterFilterPanelProps {
  meta: FilterMeta | null
  filters: MasterFilterState
  onChange: (filters: MasterFilterState) => void
  onReset: () => void
  onExport: () => void
  totalCount: number
  isExporting?: boolean
}

type TabType = "hierarchy" | "cutoffs" | "skills"

export function MasterFilterPanel({
  meta,
  filters,
  onChange,
  onReset,
  onExport,
  totalCount,
  isExporting = false,
}: MasterFilterPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>("hierarchy")
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState<boolean>(false)
  const deptDropdownRef = useRef<HTMLDivElement>(null)

  // Close department dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target as Node)) {
        setIsDeptDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Active filter counters
  const selectedDepts = filters.departments || (filters.department && filters.department !== "ALL" ? [filters.department] : [])
  const deptCount = selectedDepts.length
  const cutoffCount = [Boolean(filters.minCgpa), Boolean(filters.min10th), Boolean(filters.min12th)].filter(Boolean).length

  // Academy & Certification filter helpers
  const hasAcademyFilter = Boolean(filters.selectedAcademy && filters.selectedAcademy !== "ALL")
  const hasCertFilter = Boolean(filters.selectedCertificate && filters.selectedCertificate !== "ALL")

  const availableCertificates = useMemo(() => {
    if (!meta?.academies) return []
    if (filters.selectedAcademy && filters.selectedAcademy !== "ALL") {
      const found = meta.academies.find(
        (a) => a.name === filters.selectedAcademy || String(a.id) === filters.selectedAcademy
      )
      return found?.certificates || []
    }
    return meta.academies.flatMap((a) => a.certificates || [])
  }, [meta?.academies, filters.selectedAcademy])

  const skillCount =
    filters.skills.length +
    (filters.hasVerifiedCert ? 1 : 0) +
    (filters.hasOtherCert ? 1 : 0) +
    (hasAcademyFilter ? 1 : 0) +
    (hasCertFilter ? 1 : 0)

  const totalActiveFilters = [
    filters.batch !== "2024-2028" && filters.batch !== "ALL",
    filters.course !== "B.Tech" && filters.course !== "ALL",
    deptCount > 0,
    Boolean(filters.minCgpa),
    Boolean(filters.min10th),
    Boolean(filters.min12th),
    filters.skills.length > 0,
    filters.hasVerifiedCert,
    filters.hasOtherCert,
    hasAcademyFilter,
    hasCertFilter,
    filters.gender !== "ALL",
    filters.category !== "ALL",
  ].filter(Boolean).length

  const handleDepartmentToggle = (deptName: string) => {
    const exists = selectedDepts.includes(deptName)
    const updated = exists
      ? selectedDepts.filter((d) => d !== deptName)
      : [...selectedDepts, deptName]
    onChange({
      ...filters,
      departments: updated,
      department: updated.length === 1 ? updated[0] : (updated.length > 1 ? updated.join(",") : "ALL"),
    })
  }

  const handleSelectAllDepartments = () => {
    if (!meta?.departments) return
    const allNames = meta.departments.map((d) => d.name)
    onChange({
      ...filters,
      departments: allNames,
      department: allNames.join(","),
    })
  }

  const handleClearDepartments = () => {
    onChange({
      ...filters,
      departments: [],
      department: "ALL",
    })
  }

  const handleSkillToggle = (skillName: string) => {
    const exists = filters.skills.includes(skillName)
    const updated = exists
      ? filters.skills.filter((s) => s !== skillName)
      : [...filters.skills, skillName]
    onChange({ ...filters, skills: updated })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs mb-8 transition-all">
      {/* Top Header Bar */}
      <div className="px-6 py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Filter Candidates
              </h2>
              {totalActiveFilters > 0 && (
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/60 text-xs font-semibold rounded-full">
                  {totalActiveFilters} active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Showing <span className="font-semibold text-slate-900">{totalCount}</span> eligible candidates in database
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2.5">
          {totalActiveFilters > 0 && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Reset</span>
            </button>
          )}

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-98"
          >
            <Download className="w-4 h-4 text-slate-300" />
            <span>{isExporting ? "Generating CSV..." : "Export to Excel"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle filter panel"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div>
          {/* Segmented Navigation Tabs */}
          <div className="flex overflow-x-auto border-b border-slate-100 px-6 gap-2 bg-slate-50/50">
            <button
              type="button"
              onClick={() => setActiveTab("hierarchy")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "hierarchy"
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Cohort & Program {deptCount > 0 && `(${deptCount} depts)`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cutoffs")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "cutoffs"
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Academic Cutoffs {cutoffCount > 0 && `(${cutoffCount})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "skills"
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Skills & Certifications {skillCount > 0 && `(${skillCount})`}</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-6">
            {/* Tab 1: Cohort & Program (Batch, Course, Multi-Select Departments Dropdown, Gender) */}
            {activeTab === "hierarchy" && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* 1. Graduation Batch */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Graduation Batch
                    </label>
                    <select
                      value={filters.batch}
                      onChange={(e) => onChange({ ...filters, batch: e.target.value })}
                      className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-2xs"
                    >
                      <option value="ALL">All Batches</option>
                      {meta?.batches.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name} ({b.studentCount || 0} students)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. Course / Degree */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Course / Degree
                    </label>
                    <select
                      value={filters.course}
                      onChange={(e) => onChange({ ...filters, course: e.target.value })}
                      className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-2xs"
                    >
                      <option value="ALL">All Courses</option>
                      {meta?.courses.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. Academic Departments Dropdown (Space-saving Multi-Select Popover) */}
                  <div className="relative" ref={deptDropdownRef}>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Academic Department
                      </label>
                      {selectedDepts.length > 0 && (
                        <button
                          type="button"
                          onClick={handleClearDepartments}
                          className="text-[11px] font-semibold text-slate-400 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                      className={`w-full text-sm font-medium bg-white border rounded-xl px-3.5 py-2.5 text-left flex items-center justify-between transition-all shadow-2xs ${
                        isDeptDropdownOpen
                          ? "border-blue-500 ring-1 ring-blue-500"
                          : "border-slate-300 hover:border-slate-400"
                      }`}
                    >
                      <span className="truncate text-slate-800 text-xs sm:text-sm font-medium">
                        {selectedDepts.length === 0
                          ? "All Departments"
                          : selectedDepts.length === 1
                          ? selectedDepts[0]
                          : selectedDepts.length === 2
                          ? selectedDepts.join(", ")
                          : `${selectedDepts.length} Selected (${selectedDepts.slice(0, 2).join(", ")}...)`}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {selectedDepts.length > 0 && (
                          <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                            {selectedDepts.length}
                          </span>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-slate-400 transition-transform ${
                            isDeptDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Multi-Select Floating Menu */}
                    {isDeptDropdownOpen && (
                      <div className="absolute left-0 right-0 z-50 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl p-2.5 space-y-2 min-w-[270px]">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Filter by Department
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSelectAllDepartments}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
                            >
                              Select All
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              type="button"
                              onClick={handleClearDepartments}
                              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1">
                          {meta?.departments?.map((d) => {
                            const isSelected = selectedDepts.includes(d.name)
                            return (
                              <button
                                key={d.id}
                                type="button"
                                onClick={() => handleDepartmentToggle(d.name)}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                                  isSelected ? "bg-blue-50/80 text-blue-900 font-bold" : "text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  <div
                                    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                      isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                                    }`}
                                  >
                                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                  </div>
                                  <span className="truncate">{d.name}</span>
                                </div>
                                {d.studentCount !== undefined && (
                                  <span
                                    className={`text-[10px] ml-2 shrink-0 ${
                                      isSelected ? "text-blue-600 font-semibold" : "text-slate-400"
                                    }`}
                                  >
                                    {d.studentCount}
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Gender (Diversity) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Gender (Diversity)
                    </label>
                    <select
                      value={filters.gender}
                      onChange={(e) => onChange({ ...filters, gender: e.target.value })}
                      className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-2xs"
                    >
                      <option value="ALL">All Genders</option>
                      <option value="Male">Male Candidates</option>
                      <option value="Female">Female Candidates</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Academic Cutoffs */}
            {activeTab === "cutoffs" && (
              <div>
                <p className="text-xs text-slate-500 font-medium mb-4">
                  Set corporate eligibility cutoffs. Students without academic marks recorded in the ERP will be excluded when criteria are active.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Min CGPA */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Minimum CGPA
                      </label>
                      {filters.minCgpa && (
                        <button
                          type="button"
                          onClick={() => onChange({ ...filters, minCgpa: "" })}
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="e.g. 7.5"
                      value={filters.minCgpa}
                      onChange={(e) => onChange({ ...filters, minCgpa: e.target.value })}
                      className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-800 outline-none focus:border-blue-500 mb-3 shadow-2xs"
                    />
                    <div className="flex gap-1.5">
                      {["6.0", "6.5", "7.0", "7.5", "8.0"].map((cutoff) => (
                        <button
                          key={cutoff}
                          type="button"
                          onClick={() => onChange({ ...filters, minCgpa: cutoff })}
                          className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            filters.minCgpa === cutoff
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cutoff}+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min 10th Board % */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        10th Board Percentage (%)
                      </label>
                      {filters.min10th && (
                        <button
                          type="button"
                          onClick={() => onChange({ ...filters, min10th: "" })}
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="e.g. 60"
                      value={filters.min10th}
                      onChange={(e) => onChange({ ...filters, min10th: e.target.value })}
                      className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-800 outline-none focus:border-blue-500 mb-3 shadow-2xs"
                    />
                    <div className="flex gap-1.5">
                      {["60", "65", "70", "75", "80"].map((cutoff) => (
                        <button
                          key={cutoff}
                          type="button"
                          onClick={() => onChange({ ...filters, min10th: cutoff })}
                          className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            filters.min10th === cutoff
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cutoff}%+
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Min 12th Board % */}
                  <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        12th Board Percentage (%)
                      </label>
                      {filters.min12th && (
                        <button
                          type="button"
                          onClick={() => onChange({ ...filters, min12th: "" })}
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      placeholder="e.g. 60"
                      value={filters.min12th}
                      onChange={(e) => onChange({ ...filters, min12th: e.target.value })}
                      className="w-full text-sm font-semibold bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-slate-800 outline-none focus:border-blue-500 mb-3 shadow-2xs"
                    />
                    <div className="flex gap-1.5">
                      {["60", "65", "70", "75", "80"].map((cutoff) => (
                        <button
                          key={cutoff}
                          type="button"
                          onClick={() => onChange({ ...filters, min12th: cutoff })}
                          className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition-all ${
                            filters.min12th === cutoff
                              ? "bg-slate-900 border-slate-900 text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {cutoff}%+
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Skills & Certifications */}
            {activeTab === "skills" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <span className="text-xs font-medium text-slate-500">
                    Filter students by certified or self-reported technical competencies:
                  </span>

                  {filters.skills.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Match criteria:</span>
                      <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => onChange({ ...filters, skillsMatch: "any" })}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            filters.skillsMatch === "any"
                              ? "bg-white text-slate-900 shadow-2xs font-bold"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          Any Selected (OR)
                        </button>
                        <button
                          type="button"
                          onClick={() => onChange({ ...filters, skillsMatch: "all" })}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            filters.skillsMatch === "all"
                              ? "bg-white text-slate-900 shadow-2xs font-bold"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          All Selected (AND)
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-2 mb-5">
                  {(meta?.skills && meta.skills.length > 0 ? meta.skills : ["C", "C#", "Java", "Python", "SQL"]).map((skill) => {
                    const isSelected = filters.skills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleSkillToggle(skill)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        <span>{skill}</span>
                      </button>
                    )
                  })}
                </div>

                {/* College Academy & Certifications Section */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      College Academy Certifications
                    </span>
                    <span className="text-[11px] text-slate-400 font-normal">
                      (Cisco, Oracle, AWS, Microsoft, Red Hat)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Academy Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        Issuing College Academy
                      </label>
                      <select
                        value={filters.selectedAcademy || "ALL"}
                        onChange={(e) => {
                          const val = e.target.value
                          onChange({
                            ...filters,
                            selectedAcademy: val,
                            selectedCertificate: "ALL",
                          })
                        }}
                        className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-2xs"
                      >
                        <option value="ALL">All Academies</option>
                        {meta?.academies?.map((a) => (
                          <option key={a.id} value={a.name}>
                            {a.name} ({a.certificates?.length || 0} courses)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specific Course Dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                        Specific Academy Course
                      </label>
                      <select
                        value={filters.selectedCertificate || "ALL"}
                        onChange={(e) => onChange({ ...filters, selectedCertificate: e.target.value })}
                        disabled={!availableCertificates || availableCertificates.length === 0}
                        className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-2xs disabled:bg-slate-50 disabled:text-slate-400"
                      >
                        <option value="ALL">
                          {filters.selectedAcademy && filters.selectedAcademy !== "ALL"
                            ? `All Courses under ${filters.selectedAcademy}`
                            : "All Academy Courses (or select Academy first)"}
                        </option>
                        {availableCertificates.map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Verification & External Filters */}
                  <div className="flex flex-wrap gap-4">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.hasVerifiedCert}
                        onChange={(e) => onChange({ ...filters, hasVerifiedCert: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Verified by Faculty / College Only</span>
                    </label>

                    <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 transition-colors">
                      <input
                        type="checkbox"
                        checked={filters.hasOtherCert}
                        onChange={(e) => onChange({ ...filters, hasOtherCert: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                      />
                      <span>External Industry / MOOC Certifications Only</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Chips Strip */}
      {totalActiveFilters > 0 && (
        <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-200/70 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 mr-1">Active Criteria:</span>

          {filters.batch !== "2024-2028" && filters.batch !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-medium shadow-2xs">
              Batch: {filters.batch}
              <button type="button" onClick={() => onChange({ ...filters, batch: "ALL" })}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          )}

          {filters.course !== "B.Tech" && filters.course !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-medium shadow-2xs">
              Course: {filters.course}
              <button type="button" onClick={() => onChange({ ...filters, course: "ALL" })}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          )}

          {selectedDepts.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-medium shadow-2xs"
            >
              Dept: {d}
              <button type="button" onClick={() => handleDepartmentToggle(d)}>
                <X className="w-3.5 h-3.5 text-blue-400 hover:text-blue-700" />
              </button>
            </span>
          ))}

          {filters.minCgpa && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium shadow-2xs">
              CGPA &ge; {filters.minCgpa}
              <button type="button" onClick={() => onChange({ ...filters, minCgpa: "" })}>
                <X className="w-3.5 h-3.5 text-emerald-400 hover:text-emerald-700" />
              </button>
            </span>
          )}

          {filters.min10th && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-medium shadow-2xs">
              10th &ge; {filters.min10th}%
              <button type="button" onClick={() => onChange({ ...filters, min10th: "" })}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          )}

          {filters.min12th && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-medium shadow-2xs">
              12th &ge; {filters.min12th}%
              <button type="button" onClick={() => onChange({ ...filters, min12th: "" })}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          )}

          {filters.skills.map((s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 text-white rounded-lg font-medium shadow-2xs"
            >
              Skill: {s}
              <button type="button" onClick={() => handleSkillToggle(s)}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
              </button>
            </span>
          ))}

          {filters.hasVerifiedCert && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium shadow-2xs">
              Verified Certs
              <button type="button" onClick={() => onChange({ ...filters, hasVerifiedCert: false })}>
                <X className="w-3.5 h-3.5 text-emerald-400 hover:text-emerald-700" />
              </button>
            </span>
          )}

          {hasAcademyFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-800 rounded-lg font-medium shadow-2xs">
              Academy: {filters.selectedAcademy}
              <button
                type="button"
                onClick={() =>
                  onChange({ ...filters, selectedAcademy: "ALL", selectedCertificate: "ALL" })
                }
              >
                <X className="w-3.5 h-3.5 text-purple-400 hover:text-purple-700" />
              </button>
            </span>
          )}

          {hasCertFilter && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg font-medium shadow-2xs">
              Cert: {filters.selectedCertificate}
              <button
                type="button"
                onClick={() => onChange({ ...filters, selectedCertificate: "ALL" })}
              >
                <X className="w-3.5 h-3.5 text-emerald-400 hover:text-emerald-700" />
              </button>
            </span>
          )}

          {filters.gender !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-medium shadow-2xs">
              Gender: {filters.gender}
              <button type="button" onClick={() => onChange({ ...filters, gender: "ALL" })}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
