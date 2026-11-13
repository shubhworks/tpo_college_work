"use client"

import { useState } from "react"
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

type TabType = "hierarchy" | "branches" | "cutoffs" | "skills"

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

  // Active filter counters
  const branchCount = filters.branches.length
  const cutoffCount = [Boolean(filters.minCgpa), Boolean(filters.min10th), Boolean(filters.min12th)].filter(Boolean).length
  const skillCount = filters.skills.length + (filters.hasVerifiedCert ? 1 : 0) + (filters.hasOtherCert ? 1 : 0)

  const totalActiveFilters = [
    filters.batch !== "2024-2028" && filters.batch !== "ALL",
    filters.course !== "B.Tech" && filters.course !== "ALL",
    branchCount > 0,
    Boolean(filters.department && filters.department !== "ALL"),
    Boolean(filters.minCgpa),
    Boolean(filters.min10th),
    Boolean(filters.min12th),
    filters.skills.length > 0,
    filters.hasVerifiedCert,
    filters.hasOtherCert,
    filters.gender !== "ALL",
    filters.category !== "ALL",
  ].filter(Boolean).length

  const handleBranchToggle = (branchName: string) => {
    const exists = filters.branches.includes(branchName)
    const updated = exists
      ? filters.branches.filter((b) => b !== branchName)
      : [...filters.branches, branchName]
    onChange({ ...filters, branches: updated })
  }

  const handleSelectAllBranches = () => {
    if (!meta) return
    const allNames = meta.branches.map((b) => b.name)
    onChange({ ...filters, branches: allNames })
  }

  const handleClearBranches = () => {
    onChange({ ...filters, branches: [] })
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
              <span>Cohort & Program</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("branches")}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "branches"
                  ? "border-blue-600 text-blue-600 font-semibold"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Branches ({branchCount > 0 ? branchCount : "All"})</span>
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
            {/* Tab 1: Cohort & Program */}
            {activeTab === "hierarchy" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) => onChange({ ...filters, department: e.target.value })}
                    className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-2xs"
                  >
                    <option value="ALL">All Departments</option>
                    {meta?.departments?.map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name} {d.studentCount ? `(${d.studentCount})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

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
            )}

            {/* Tab 2: Branches */}
            {activeTab === "branches" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-slate-500">
                    Select eligible branches for this recruitment drive (defaults to all if none selected):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAllBranches}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">·</span>
                    <button
                      type="button"
                      onClick={handleClearBranches}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                  {meta?.branches.map((b) => {
                    const isSelected = filters.branches.includes(b.name)
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleBranchToggle(b.name)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-2xs"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className="min-w-0">
                          <span className="text-xs font-bold block truncate">{b.name}</span>
                          {b.code && (
                            <span className={`text-[11px] block mt-0.5 ${isSelected ? "text-slate-300" : "text-slate-400"}`}>
                              Code: {b.code}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Academic Cutoffs */}
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

                {/* Certification Checkboxes */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-4">
                  <label className="inline-flex items-center gap-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100/70 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-800 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.hasVerifiedCert}
                      onChange={(e) => onChange({ ...filters, hasVerifiedCert: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <Award className="w-4 h-4 text-emerald-600" />
                    <span>Verified College Academy Certifications Only</span>
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

          {filters.branches.map((b) => (
            <span
              key={b}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg font-medium shadow-2xs"
            >
              Branch: {b}
              <button type="button" onClick={() => handleBranchToggle(b)}>
                <X className="w-3.5 h-3.5 text-blue-400 hover:text-blue-700" />
              </button>
            </span>
          ))}

          {filters.department && filters.department !== "ALL" && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 text-slate-800 rounded-lg font-medium shadow-2xs">
              Dept: {filters.department}
              <button type="button" onClick={() => onChange({ ...filters, department: "ALL" })}>
                <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-700" />
              </button>
            </span>
          )}

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
