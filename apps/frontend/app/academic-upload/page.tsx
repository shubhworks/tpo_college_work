"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit3,
  Plus,
  RefreshCw,
  GraduationCap,
  BookOpen,
  Layers,
  ArrowRight,
  UserCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/footer";
import { academicAPI } from "@/lib/api";

interface StudentSearchResult {
  id: number;
  rollNo: string;
  admissionNo: string;
  name: string;
  email: string;
  phone: string;
  batchName: string;
  courseName: string;
  hasAcademic: boolean;
  academicDetails: any | null;
}

interface AcademicRecordItem {
  id: number;
  studentId: number;
  studentName: string;
  rollNo: string;
  admissionNo: string;
  email: string;
  batchName: string;
  courseName: string;
  marks10: number | null;
  boardId10: number;
  marksheet10: string;
  marks12: number | null;
  boardId12: number;
  marksheet12: string;
  cgpa: number | null;
  sem1: number | null;
  sem2: number | null;
  sem3: number | null;
  sem4: number | null;
  sem5: number | null;
  sem6: number | null;
  sem7: number | null;
  sem8: number | null;
  ug: number | null;
}

export default function AcademicUploadPage() {
  const [activeTab, setActiveTab] = useState<"form" | "bulk" | "records">("form");

  // --- TAB 1: FORM ENTRY STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);

  // Form Fields
  const [marks10, setMarks10] = useState<string>("");
  const [boardId10, setBoardId10] = useState<string>("1");
  const [marksheet10, setMarksheet10] = useState<string>("N/A");

  const [marks12, setMarks12] = useState<string>("");
  const [boardId12, setBoardId12] = useState<string>("1");
  const [marksheet12, setMarksheet12] = useState<string>("N/A");

  const [cgpa, setCgpa] = useState<string>("");
  const [ug, setUg] = useState<string>("");

  const [sem1, setSem1] = useState<string>("");
  const [sem2, setSem2] = useState<string>("");
  const [sem3, setSem3] = useState<string>("");
  const [sem4, setSem4] = useState<string>("");
  const [sem5, setSem5] = useState<string>("");
  const [sem6, setSem6] = useState<string>("");
  const [sem7, setSem7] = useState<string>("");
  const [sem8, setSem8] = useState<string>("");

  const [isSaving, setIsSaving] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // --- TAB 2: BULK UPLOAD STATE ---
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- TAB 3: RECORDS LIST STATE ---
  const [records, setRecords] = useState<AcademicRecordItem[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [recordsSearch, setRecordsSearch] = useState("");
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);

  // Search students with debounce
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await academicAPI.searchStudents(searchQuery.trim());
        if (res.data?.success) {
          setSearchResults(res.data.students || []);
        }
      } catch (err) {
        console.error("Student search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load existing records
  const loadRecords = async (page = 1, search = "") => {
    try {
      setIsLoadingRecords(true);
      const res = await academicAPI.getRecords({ page, limit: 15, search });
      if (res.data?.success) {
        setRecords(res.data.records || []);
        setTotalRecords(res.data.total || 0);
        setCurrentPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to load academic records:", err);
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    if (activeTab === "records") {
      loadRecords(currentPage, recordsSearch);
    }
  }, [activeTab, currentPage]);

  // Handle student selection in form
  const handleSelectStudent = (student: StudentSearchResult) => {
    setSelectedStudent(student);
    setSearchQuery("");
    setSearchResults([]);
    setFormFeedback(null);

    if (student.hasAcademic && student.academicDetails) {
      const d = student.academicDetails;
      setMarks10(d.marks10 !== null ? String(d.marks10) : "");
      setBoardId10(d.boardId10 ? String(d.boardId10) : "1");
      setMarksheet10(d.marksheet10 || "N/A");

      setMarks12(d.marks12 !== null ? String(d.marks12) : "");
      setBoardId12(d.boardId12 ? String(d.boardId12) : "1");
      setMarksheet12(d.marksheet12 || "N/A");

      setCgpa(d.cgpa !== null ? String(d.cgpa) : "");
      setUg(d.ug !== null ? String(d.ug) : "");

      setSem1(d.sem1 !== null ? String(d.sem1) : "");
      setSem2(d.sem2 !== null ? String(d.sem2) : "");
      setSem3(d.sem3 !== null ? String(d.sem3) : "");
      setSem4(d.sem4 !== null ? String(d.sem4) : "");
      setSem5(d.sem5 !== null ? String(d.sem5) : "");
      setSem6(d.sem6 !== null ? String(d.sem6) : "");
      setSem7(d.sem7 !== null ? String(d.sem7) : "");
      setSem8(d.sem8 !== null ? String(d.sem8) : "");
    } else {
      // Reset form fields
      setMarks10("");
      setBoardId10("1");
      setMarksheet10("N/A");
      setMarks12("");
      setBoardId12("1");
      setMarksheet12("N/A");
      setCgpa("");
      setUg("");
      setSem1("");
      setSem2("");
      setSem3("");
      setSem4("");
      setSem5("");
      setSem6("");
      setSem7("");
      setSem8("");
    }
  };

  // Submit single entry
  const handleSaveSingleRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      setFormFeedback({ type: "error", message: "Please search and select a student first." });
      return;
    }

    try {
      setIsSaving(true);
      setFormFeedback(null);

      const payload = {
        student_id: selectedStudent.id,
        marks_10: marks10 || 0,
        board_id_10: parseInt(boardId10 || "1", 10),
        marksheet_10: marksheet10 || "N/A",
        marks_12: marks12 || 0,
        board_id_12: parseInt(boardId12 || "1", 10),
        marksheet_12: marksheet12 || "N/A",
        cgpa: cgpa || null,
        ug: ug || null,
        sem_1: sem1 || null,
        sem_2: sem2 || null,
        sem_3: sem3 || null,
        sem_4: sem4 || null,
        sem_5: sem5 || null,
        sem_6: sem6 || null,
        sem_7: sem7 || null,
        sem_8: sem8 || null,
      };

      const res = await academicAPI.upsertSingle(payload);
      if (res.data?.success) {
        setFormFeedback({
          type: "success",
          message: `Academic details for ${selectedStudent.name} (${selectedStudent.rollNo || selectedStudent.admissionNo}) saved successfully!`,
        });
        // Update local selected student indicator
        setSelectedStudent({
          ...selectedStudent,
          hasAcademic: true,
        });
      }
    } catch (err: any) {
      setFormFeedback({
        type: "error",
        message: err.response?.data?.error || "Failed to save record.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Parse CSV File Client-Side
  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setBulkResult(null);
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          alert("CSV file must have a header row and at least 1 data row.");
          setIsParsing(false);
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
        const rows: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim().replace(/^['"]|['"]$/g, ""));
          if (values.length < 2) continue;

          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] !== undefined ? values[idx] : "";
          });

          // Standardize identifier
          const identifier =
            rowObj.roll_no ||
            rowObj.rollno ||
            rowObj.admission_no ||
            rowObj.admissionno ||
            rowObj.student_id ||
            rowObj.id ||
            rowObj.email ||
            "";

          if (identifier) {
            rowObj.identifier = identifier;
            rows.push(rowObj);
          }
        }

        setParsedRows(rows);
      } catch (err) {
        console.error("Error parsing CSV:", err);
        alert("Could not parse CSV. Please check formatting.");
      } finally {
        setIsParsing(false);
      }
    };

    reader.readAsText(file);
  };

  // Submit Bulk Upload
  const handleBulkUpload = async () => {
    if (parsedRows.length === 0) return;

    try {
      setIsBulkUploading(true);
      setBulkResult(null);

      const res = await academicAPI.bulkUpload(parsedRows);
      if (res.data?.success) {
        setBulkResult(res.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Bulk upload failed.");
    } finally {
      setIsBulkUploading(false);
    }
  };

  // Delete Record
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this academic record?")) return;
    try {
      await academicAPI.deleteRecord(id);
      loadRecords(currentPage, recordsSearch);
    } catch (err: any) {
      alert("Failed to delete record: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <div className="flex items-center mt-5 gap-3">
                <span className="p-2.5 bg-blue-600 text-white rounded-xl shadow-md">
                  <GraduationCap className="w-7 h-7" />
                </span>
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Academic Marks Portal
                  </h1>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    Direct upload into live ERP table:{" "}
                    <code className="bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">
                      students_acadmic_details
                    </code>
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Template Download Button */}
            {/* <div className="flex items-center gap-3">
              <a
                href={academicAPI.getTemplateUrl()}
                download="students_academic_details_template.csv"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-300 shadow-sm transition"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Download CSV Template
              </a>
            </div> */}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab("form")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === "form"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Edit3 className="w-4 h-4" />
              1. Direct Student Form
            </button>

            {/* <button
              onClick={() => setActiveTab("bulk")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === "bulk"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              2. Bulk CSV / Excel Upload
            </button> */}

            {/* <button
              onClick={() => setActiveTab("records")}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition ${
                activeTab === "records"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-lg"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Layers className="w-4 h-4" />
              3. View All Records ({totalRecords})
            </button> */}
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: DIRECT STUDENT FORM ENTRY                              */}
        {/* ============================================================== */}
        {activeTab === "form" && (
          <div className="space-y-6">
            {/* Step 1: Student Search Autocomplete */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                Step 1: Search & Select Student
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                Type student roll number (e.g. 0206EX251001), admission number, or name to load their profile.
              </p>

              <div className="relative max-w-xl">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Roll No, Admission No, or Name..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-800"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  {isSearching && (
                    <RefreshCw className="w-4 h-4 text-blue-600 animate-spin absolute right-3.5 top-3.5" />
                  )}
                </div>

                {/* Dropdown Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-20 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {searchResults.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectStudent(s)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50/70 transition flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm group-hover:text-blue-600">
                            {s.name}
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="font-mono font-semibold text-slate-700">
                              {s.rollNo || s.admissionNo}
                            </span>
                            <span>•</span>
                            <span>{s.batchName || "Batch N/A"}</span>
                            <span>•</span>
                            <span>{s.courseName || "Course N/A"}</span>
                          </div>
                        </div>
                        <div>
                          {s.hasAcademic ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Has Record
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full">
                              No Record
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Student Banner */}
              {selectedStudent && (
                <div className="mt-4 p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                      {selectedStudent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {selectedStudent.name}
                      </div>
                      <div className="text-xs text-slate-600 font-mono mt-0.5">
                        Roll: <strong>{selectedStudent.rollNo || "N/A"}</strong> | Admission:{" "}
                        <strong>{selectedStudent.admissionNo || "N/A"}</strong> | ID: #{selectedStudent.id}
                      </div>
                    </div>
                  </div>
                  <div>
                    {selectedStudent.hasAcademic ? (
                      <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm">
                        Editing Existing Record
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm">
                        New Record
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Academic Details Form */}
            <form onSubmit={handleSaveSingleRecord} className="space-y-6">
              {/* Feedback Alert */}
              {formFeedback && (
                <div
                  className={`p-4 rounded-xl flex items-center gap-3 text-sm font-semibold ${
                    formFeedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {formFeedback.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  {formFeedback.message}
                </div>
              )}

              {/* 10th & 12th Board Marks */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  Class 10th & 12th Board Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Class 10th */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <div className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                      Class 10th (Secondary)
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        10th Percentage (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={marks10}
                        onChange={(e) => setMarks10(e.target.value)}
                        placeholder="e.g. 85.50"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Board ID
                        </label>
                        <input
                          type="number"
                          value={boardId10}
                          onChange={(e) => setBoardId10(e.target.value)}
                          placeholder="1 (CBSE/MPBSE)"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Marksheet Doc Ref
                        </label>
                        <input
                          type="text"
                          value={marksheet10}
                          onChange={(e) => setMarksheet10(e.target.value)}
                          placeholder="e.g. N/A"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Class 12th */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3">
                    <div className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                      Class 12th (Higher Secondary)
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        12th Percentage (%) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={marks12}
                        onChange={(e) => setMarks12(e.target.value)}
                        placeholder="e.g. 82.40"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Board ID
                        </label>
                        <input
                          type="number"
                          value={boardId12}
                          onChange={(e) => setBoardId12(e.target.value)}
                          placeholder="1 (CBSE/MPBSE)"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">
                          Marksheet Doc Ref
                        </label>
                        <input
                          type="text"
                          value={marksheet12}
                          onChange={(e) => setMarksheet12(e.target.value)}
                          placeholder="e.g. N/A"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* College Overall & CGPA */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  College CGPA & UG Score
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Current Cumulative CGPA (0.00 – 10.00)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={cgpa}
                      onChange={(e) => setCgpa(e.target.value)}
                      placeholder="e.g. 8.45"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Undergraduate (UG) Percentage % (if applicable)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={ug}
                      onChange={(e) => setUg(e.target.value)}
                      placeholder="e.g. 78.50"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Semester SGPA (Sem 1 to 8) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Semester SGPA Breakdown (Sem 1 – 8)
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Leave future or unannounced semesters blank.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  {[
                    { label: "Sem 1", val: sem1, set: setSem1 },
                    { label: "Sem 2", val: sem2, set: setSem2 },
                    { label: "Sem 3", val: sem3, set: setSem3 },
                    { label: "Sem 4", val: sem4, set: setSem4 },
                    { label: "Sem 5", val: sem5, set: setSem5 },
                    { label: "Sem 6", val: sem6, set: setSem6 },
                    { label: "Sem 7", val: sem7, set: setSem7 },
                    { label: "Sem 8", val: sem8, set: setSem8 },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                      <label className="block text-xs font-extrabold text-slate-700 mb-1">
                        {s.label}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="10"
                        value={s.val}
                        onChange={(e) => s.set(e.target.value)}
                        placeholder="SGPA"
                        className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-center font-bold text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving || !selectedStudent}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 text-sm"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Saving to MySQL...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Save Academic Details
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: BULK CSV / EXCEL UPLOAD                                 */}
        {/* ============================================================== */}
        {activeTab === "bulk" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    Bulk Upload Academic Records via CSV
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Upload a CSV file containing hundreds or thousands of students. Rows are automatically matched by{" "}
                    <strong>roll_no</strong>, <strong>admission_no</strong>, <strong>email</strong>, or <strong>student_id</strong>.
                  </p>
                </div>

                <a
                  href={academicAPI.getTemplateUrl()}
                  download="students_academic_details_template.csv"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition shrink-0"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  Download Sample CSV Template
                </a>
              </div>

              {/* File Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 rounded-2xl p-8 text-center cursor-pointer transition"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleCsvFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-800">
                  {csvFile ? csvFile.name : "Click here or drag & drop a .csv file"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported format: <strong>.csv</strong> (Exported from Excel or Google Sheets)
                </p>
              </div>

              {/* Parsing Indicator */}
              {isParsing && (
                <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3 text-sm font-semibold text-blue-800">
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  Parsing CSV rows...
                </div>
              )}

              {/* Bulk Results Feedback */}
              {bulkResult && (
                <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    Bulk Upload Completed Successfully!
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xs text-slate-500 font-semibold">Total Received</div>
                      <div className="text-lg font-black text-slate-800">{bulkResult.totalReceived}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xs text-emerald-600 font-semibold">Newly Inserted</div>
                      <div className="text-lg font-black text-emerald-600">{bulkResult.inserted}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xs text-blue-600 font-semibold">Updated</div>
                      <div className="text-lg font-black text-blue-600">{bulkResult.updated}</div>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-emerald-100 text-center">
                      <div className="text-xs text-rose-500 font-semibold">Unmatched (Not Found)</div>
                      <div className="text-lg font-black text-rose-600">{bulkResult.notFoundCount}</div>
                    </div>
                  </div>

                  {bulkResult.notFoundCount > 0 && (
                    <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl mt-2">
                      <strong>Unmatched Identifiers:</strong> {bulkResult.notFound.join(", ")}
                    </div>
                  )}
                </div>
              )}

              {/* Parsed Preview Table */}
              {parsedRows.length > 0 && !bulkResult && (
                <div className="space-y-4 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-bold text-slate-800">
                      Previewing <strong>{parsedRows.length}</strong> records from CSV
                    </div>
                    <button
                      type="button"
                      onClick={handleBulkUpload}
                      disabled={isBulkUploading}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2"
                    >
                      {isBulkUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Uploading to MySQL...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Submit {parsedRows.length} Records to MySQL
                        </>
                      )}
                    </button>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-96">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 uppercase tracking-wider">
                        <tr>
                          <th className="p-2.5 border-b">#</th>
                          <th className="p-2.5 border-b">Student Identifier</th>
                          <th className="p-2.5 border-b">10th %</th>
                          <th className="p-2.5 border-b">12th %</th>
                          <th className="p-2.5 border-b">CGPA</th>
                          <th className="p-2.5 border-b">Sem 1</th>
                          <th className="p-2.5 border-b">Sem 2</th>
                          <th className="p-2.5 border-b">Sem 3</th>
                          <th className="p-2.5 border-b">Sem 4</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {parsedRows.slice(0, 50).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2.5 text-slate-400">{i + 1}</td>
                            <td className="p-2.5 font-mono font-bold text-blue-600">
                              {r.identifier || r.roll_no || r.admission_no || "N/A"}
                            </td>
                            <td className="p-2.5">{r.marks_10 || "-"}</td>
                            <td className="p-2.5">{r.marks_12 || "-"}</td>
                            <td className="p-2.5 font-bold text-emerald-600">{r.cgpa || "-"}</td>
                            <td className="p-2.5">{r.sem_1 || "-"}</td>
                            <td className="p-2.5">{r.sem_2 || "-"}</td>
                            <td className="p-2.5">{r.sem_3 || "-"}</td>
                            <td className="p-2.5">{r.sem_4 || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedRows.length > 50 && (
                    <div className="text-xs text-slate-500 italic text-center">
                      Showing first 50 rows of {parsedRows.length}. All rows will be processed on Submit.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: VIEW & MANAGE EXISTING RECORDS TABLE                    */}
        {/* ============================================================== */}
        {activeTab === "records" && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    Existing Academic Records in Database
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Showing {records.length} of {totalRecords} student academic records.
                  </p>
                </div>

                {/* Search in records */}
                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    value={recordsSearch}
                    onChange={(e) => setRecordsSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") loadRecords(1, recordsSearch);
                    }}
                    placeholder="Search by name, roll no..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3 border-b">Student</th>
                      <th className="p-3 border-b">Roll No</th>
                      <th className="p-3 border-b">10th %</th>
                      <th className="p-3 border-b">12th %</th>
                      <th className="p-3 border-b">CGPA</th>
                      <th className="p-3 border-b">Sem 1-4</th>
                      <th className="p-3 border-b">Sem 5-8</th>
                      <th className="p-3 border-b text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {isLoadingRecords ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-600 mb-2" />
                          Loading records...
                        </td>
                      </tr>
                    ) : records.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          No academic records found in database yet.
                        </td>
                      </tr>
                    ) : (
                      records.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{r.studentName}</div>
                            <div className="text-[11px] text-slate-500">
                              {r.batchName} • {r.courseName}
                            </div>
                          </td>
                          <td className="p-3 font-mono font-bold text-blue-600">
                            {r.rollNo || r.admissionNo || "N/A"}
                          </td>
                          <td className="p-3 font-semibold">{r.marks10 !== null ? `${r.marks10}%` : "-"}</td>
                          <td className="p-3 font-semibold">{r.marks12 !== null ? `${r.marks12}%` : "-"}</td>
                          <td className="p-3">
                            {r.cgpa !== null ? (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded">
                                {r.cgpa.toFixed(2)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-3 text-[11px] font-mono text-slate-600">
                            {[r.sem1, r.sem2, r.sem3, r.sem4]
                              .map((v) => (v !== null ? v : "-"))
                              .join(" | ")}
                          </td>
                          <td className="p-3 text-[11px] font-mono text-slate-600">
                            {[r.sem5, r.sem6, r.sem7, r.sem8]
                              .map((v) => (v !== null ? v : "-"))
                              .join(" | ")}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDelete(r.id)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Delete record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500">
                    Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage <= 1}
                      className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages}
                      className="p-2 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
