import { Request, Response } from "express";
import { getMySQLPool } from "../lib/mysql";

export interface StudentV2 {
  id: number;
  rollNo: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  gender: string | null;
  dob: string | null;
  fatherName: string | null;
  fatherPhone: string | null;
  motherName: string | null;
  currentAddress: string | null;
  permanentAddress: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  cast: string | null;
  bloodGroup: string | null;
  batch: {
    id: number | null;
    name: string;
  };
  course: {
    id: number | null;
    name: string;
  };
  branch: {
    id: number | null;
    name: string;
    code: string | null;
  };
  semester: string | null;
  className: string | null;
  sectionName: string | null;
  image: string | null;
  skills: string[];
  academicDetails: {
    marks10: number | null;
    marks12: number | null;
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
  } | null;
  collegeCertificates: Array<{
    id: number;
    certificateName: string;
    certificateNumber: string;
    issueDate: string;
    status: string;
    fileUrl: string | null;
  }>;
  otherCertificates: Array<{
    id: number;
    certificateName: string;
    issuingOrganization: string;
    issueDate: string;
    credentialId: string | null;
    credentialUrl: string | null;
    fileUrl: string | null;
  }>;
}

/**
 * GET /api/new/batches
 */
export async function getNewBatches(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<any[]>(`
      SELECT 
        b.id, 
        b.batchName as name, 
        b.active,
        COUNT(s.id) as studentCount
      FROM batches b
      LEFT JOIN students s ON s.batchid = b.id
      GROUP BY b.id, b.batchName, b.active
      ORDER BY b.batchName DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Failed to fetch batches from MySQL:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/new/courses
 */
export async function getNewCourses(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<any[]>(`
      SELECT 
        c.id, 
        c.courseName as name, 
        c.active,
        COUNT(s.id) as studentCount
      FROM courses c
      LEFT JOIN students s ON s.courseid = c.id
      GROUP BY c.id, c.courseName, c.active
      ORDER BY c.id ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Failed to fetch courses from MySQL:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/new/branches
 */
export async function getNewBranches(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();
    const [rows] = await pool.query<any[]>(`
      SELECT id, name, code, is_active as isActive
      FROM branch
      WHERE is_active = 1 OR is_active IS NULL
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error: any) {
    console.error("Failed to fetch branches from MySQL:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/new/semesters
 */
export async function getNewSemesters(req: Request, res: Response) {
  res.json({
    success: true,
    data: [
      "Sem I",
      "Sem II",
      "Sem III",
      "Sem IV",
      "Sem V",
      "Sem VI",
      "Sem VII",
      "Sem VIII",
    ],
  });
}

/**
 * GET /api/new/filters-meta
 * Returns all available filter options dynamically from the DB:
 * batches, courses, branches, semesters, skills, genders, categories
 */
export async function getNewFiltersMeta(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();

    const [batches] = await pool.query<any[]>(`
      SELECT b.id, b.batchName as name, COUNT(s.id) as studentCount
      FROM batches b
      LEFT JOIN students s ON s.batchid = b.id
      GROUP BY b.id, b.batchName
      ORDER BY b.batchName DESC
    `);

    const [courses] = await pool.query<any[]>(`
      SELECT id, courseName as name FROM courses WHERE active = 'yes' OR active = 1 ORDER BY id ASC
    `);

    const [branches] = await pool.query<any[]>(`
      SELECT id, name, code FROM branch WHERE is_active = 1 OR is_active IS NULL ORDER BY name ASC
    `);

    // Distinct skills
    const [skillsRows] = await pool.query<any[]>(`
      SELECT DISTINCT skill_name FROM student_skills WHERE skill_name IS NOT NULL AND skill_name != '' ORDER BY skill_name ASC
    `).catch(() => [[]]);
    const skills = skillsRows.map((r: any) => r.skill_name).filter(Boolean);

    // Categories / Casts
    const [castRows] = await pool.query<any[]>(`
      SELECT DISTINCT cast FROM students WHERE cast IS NOT NULL AND cast != '' GROUP BY cast HAVING count(*) >= 3 ORDER BY cast ASC
    `).catch(() => [[]]);
    const categories = castRows.map((r: any) => r.cast.trim()).filter(Boolean);

    res.json({
      success: true,
      data: {
        batches,
        courses,
        branches,
        semesters: ["Sem I", "Sem II", "Sem III", "Sem IV", "Sem V", "Sem VI", "Sem VII", "Sem VIII"],
        skills,
        genders: ["Male", "Female"],
        categories: categories.length > 0 ? categories : ["General", "OBC", "SC", "ST"],
      },
    });
  } catch (error: any) {
    console.error("Failed to fetch filter metadata:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

function extractSemester(className: string | null): string | null {
  if (!className) return null;
  const match = className.match(/(?:(I{1,3}|IV|V?I{0,3}|\d+)(?:st|nd|rd|th)?\s*Sem|Sem\s*(?:ester)?\s*(I{1,3}|IV|V?I{0,3}|\d+))/i);
  if (match) {
    const sem = (match[1] || match[2] || "").toUpperCase();
    return `Sem ${sem}`;
  }
  return null;
}

/**
 * Helper to build Master Filter query conditions and SQL joins
 */
function buildMasterFilterSQL(query: any) {
  const batchQuery = query.batch as string | undefined;
  const courseQuery = query.course as string | undefined;
  const branchQuery = query.branch as string | undefined;
  const semesterQuery = query.semester as string | undefined;
  const searchQuery = (query.search as string | undefined)?.trim();

  // Academic Cutoffs
  const minCgpa = query.minCgpa ? parseFloat(query.minCgpa as string) : null;
  const maxCgpa = query.maxCgpa ? parseFloat(query.maxCgpa as string) : null;
  const min10th = query.min10th ? parseFloat(query.min10th as string) : null;
  const max10th = query.max10th ? parseFloat(query.max10th as string) : null;
  const min12th = query.min12th ? parseFloat(query.min12th as string) : null;
  const max12th = query.max12th ? parseFloat(query.max12th as string) : null;

  // Skills
  const skillsQuery = query.skills as string | undefined;
  const skillsMatch = (query.skillsMatch as string) || "any"; // 'any' or 'all'

  // Certificates
  const hasVerifiedCert = query.hasVerifiedCert === "true" || query.hasVerifiedCert === "1";
  const hasOtherCert = query.hasOtherCert === "true" || query.hasOtherCert === "1";

  // Demographics
  const genderQuery = query.gender as string | undefined;
  const categoryQuery = query.category as string | undefined;
  const cityQuery = query.city as string | undefined;

  const whereConditions: string[] = ["(s.is_active = 'yes' OR s.is_active = 1)"];
  const params: any[] = [];

  // Batch Filter
  if (batchQuery && batchQuery !== "ALL") {
    const batches = batchQuery.split(",").map((b) => b.trim()).filter(Boolean);
    if (batches.length === 1) {
      if (/^\d+$/.test(batches[0]) && parseInt(batches[0], 10) <= 20) {
        whereConditions.push("s.batchid = ?");
        params.push(parseInt(batches[0], 10));
      } else {
        whereConditions.push("(b.batchName = ? OR b.batchName LIKE ?)");
        params.push(batches[0], `%${batches[0]}%`);
      }
    } else if (batches.length > 1) {
      const placeholders = batches.map(() => "?").join(",");
      whereConditions.push(`b.batchName IN (${placeholders})`);
      params.push(...batches);
    }
  }

  // Course Filter
  if (courseQuery && courseQuery !== "ALL") {
    if (/^\d+$/.test(courseQuery)) {
      whereConditions.push("s.courseid = ?");
      params.push(parseInt(courseQuery, 10));
    } else {
      whereConditions.push("c.courseName LIKE ?");
      params.push(`%${courseQuery}%`);
    }
  }

  // Branch Filter (supports multiple comma-separated branches e.g. "CSE,AIML")
  if (branchQuery && branchQuery !== "ALL") {
    const branches = branchQuery.split(",").map((b) => b.trim()).filter(Boolean);
    if (branches.length === 1) {
      whereConditions.push(`(
        cl.class LIKE ? OR
        s.roll_no LIKE ? OR
        s.admission_no LIKE ? OR
        br.name = ?
      )`);
      params.push(`%${branches[0]}%`, `%${branches[0]}%`, `%${branches[0]}%`, branches[0]);
    } else if (branches.length > 1) {
      const branchConditions = branches.map(() => "(cl.class LIKE ? OR s.roll_no LIKE ? OR br.name = ?)").join(" OR ");
      whereConditions.push(`(${branchConditions})`);
      for (const b of branches) {
        params.push(`%${b}%`, `%${b}%`, b);
      }
    }
  }

  // Semester Filter
  if (semesterQuery && semesterQuery !== "ALL") {
    const semMatch = semesterQuery.match(/(?:Sem\s*)?(I{1,3}|IV|V?I{0,3}|\d+)/i);
    const semVal = semMatch ? semMatch[1] : semesterQuery;
    whereConditions.push(`(cl.class LIKE ? OR cl.class LIKE ?)`);
    params.push(`%${semVal} Sem%`, `%Sem%${semVal}%`);
  }

  // Academic Cutoffs (students_acadmic_details)
  if (minCgpa !== null && !isNaN(minCgpa)) {
    whereConditions.push("sad.cgpa >= ?");
    params.push(minCgpa);
  }
  if (maxCgpa !== null && !isNaN(maxCgpa)) {
    whereConditions.push("sad.cgpa <= ?");
    params.push(maxCgpa);
  }
  if (min10th !== null && !isNaN(min10th)) {
    whereConditions.push("sad.marks_10 >= ?");
    params.push(min10th);
  }
  if (max10th !== null && !isNaN(max10th)) {
    whereConditions.push("sad.marks_10 <= ?");
    params.push(max10th);
  }
  if (min12th !== null && !isNaN(min12th)) {
    whereConditions.push("sad.marks_12 >= ?");
    params.push(min12th);
  }
  if (max12th !== null && !isNaN(max12th)) {
    whereConditions.push("sad.marks_12 <= ?");
    params.push(max12th);
  }

  // Skills Filter
  if (skillsQuery) {
    const skillList = skillsQuery.split(",").map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      const placeholders = skillList.map(() => "?").join(",");
      if (skillsMatch === "all") {
        whereConditions.push(`s.id IN (
          SELECT student_id FROM student_skills 
          WHERE skill_name IN (${placeholders}) 
          GROUP BY student_id 
          HAVING COUNT(DISTINCT skill_name) = ?
        )`);
        params.push(...skillList, skillList.length);
      } else {
        whereConditions.push(`s.id IN (
          SELECT student_id FROM student_skills 
          WHERE skill_name IN (${placeholders})
        )`);
        params.push(...skillList);
      }
    }
  }

  // Verified College Certificate Filter
  if (hasVerifiedCert) {
    whereConditions.push(`s.id IN (
      SELECT student_id FROM student_college_certificates 
      WHERE status = 'verified' OR file_key IS NOT NULL
    )`);
  }

  // External / Other Certificate Filter
  if (hasOtherCert) {
    whereConditions.push(`s.id IN (
      SELECT student_id FROM student_other_certificates
    )`);
  }

  // Gender Filter
  if (genderQuery && genderQuery !== "ALL") {
    whereConditions.push("s.gender = ?");
    params.push(genderQuery);
  }

  // Category / Cast Filter
  if (categoryQuery && categoryQuery !== "ALL") {
    whereConditions.push("(s.cast = ? OR s.cast LIKE ?)");
    params.push(categoryQuery, `%${categoryQuery}%`);
  }

  // City Filter
  if (cityQuery && cityQuery !== "ALL") {
    whereConditions.push("s.city LIKE ?");
    params.push(`%${cityQuery}%`);
  }

  // General Search
  if (searchQuery) {
    whereConditions.push(`(
      s.roll_no LIKE ? OR
      s.admission_no LIKE ? OR
      s.firstname LIKE ? OR
      s.lastname LIKE ? OR
      s.email LIKE ? OR
      s.mobileno LIKE ? OR
      s.father_name LIKE ?
    )`);
    const wild = `%${searchQuery}%`;
    params.push(wild, wild, wild, wild, wild, wild, wild);
  }

  const whereSql = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

  const baseJoinSql = `
    FROM students s
    LEFT JOIN batches b ON b.id = s.batchid
    LEFT JOIN courses c ON c.id = s.courseid
    LEFT JOIN (
      SELECT ss.student_id, ss.class_id, ss.section_id
      FROM student_session ss
      INNER JOIN (
        SELECT student_id, MAX(id) AS max_ss_id
        FROM student_session
        GROUP BY student_id
      ) latest_ss ON ss.student_id = latest_ss.student_id AND ss.id = latest_ss.max_ss_id
    ) latest ON latest.student_id = s.id
    LEFT JOIN classes cl ON cl.id = latest.class_id
    LEFT JOIN sections sec ON sec.id = latest.section_id
    LEFT JOIN branch br ON (
      (cl.class IS NOT NULL AND cl.class LIKE CONCAT('%', br.name, '%')) OR
      (s.admission_no IS NOT NULL AND s.admission_no LIKE CONCAT('%', br.code, '%'))
    )
    LEFT JOIN students_acadmic_details sad ON sad.student_id = s.id
  `;

  return { whereSql, params, baseJoinSql };
}

/**
 * GET /api/new/students
 * Master filter query endpoint
 */
export async function getNewStudents(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "48", 10)));
    const offset = (page - 1) * limit;

    const { whereSql, params, baseJoinSql } = buildMasterFilterSQL(req.query);

    // Count matching students
    const countSql = `SELECT COUNT(DISTINCT s.id) as total ${baseJoinSql} ${whereSql}`;
    const [countRows] = await pool.query<any[]>(countSql, params);
    const total = countRows[0]?.total || 0;

    // Fetch paginated student records
    const selectSql = `
      SELECT
        s.id,
        s.roll_no,
        s.admission_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.email,
        s.mobileno,
        s.image,
        s.gender,
        DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,
        s.father_name,
        s.father_phone,
        s.mother_name,
        s.current_address,
        s.permanent_address,
        s.city,
        s.state,
        s.pincode,
        s.cast,
        s.blood_group,
        s.is_active,
        b.id AS batch_id,
        b.batchName AS batch_name,
        c.id AS course_id,
        c.courseName AS course_name,
        cl.class AS class_name,
        sec.section AS section_name,
        br.id AS branch_id,
        br.name AS branch_name,
        br.code AS branch_code,
        sad.marks_10,
        sad.marks_12,
        sad.cgpa,
        sad.sem_1,
        sad.sem_2,
        sad.sem_3,
        sad.sem_4,
        sad.sem_5,
        sad.sem_6,
        sad.sem_7,
        sad.sem_8,
        sad.ug
      ${baseJoinSql}
      ${whereSql}
      GROUP BY s.id
      ORDER BY s.id ASC
      LIMIT ? OFFSET ?
    `;

    const queryParams = [...params, limit, offset];
    const [studentRows] = await pool.query<any[]>(selectSql, queryParams);

    const studentIds = studentRows.map((r) => r.id);

    // Fetch skills
    let skillsByStudentId: Record<number, string[]> = {};
    if (studentIds.length > 0) {
      const [skillsRows] = await pool.query<any[]>(
        `SELECT student_id, skill_name FROM student_skills WHERE student_id IN (?)`,
        [studentIds]
      ).catch(() => [[]]);

      for (const row of skillsRows) {
        if (!skillsByStudentId[row.student_id]) {
          skillsByStudentId[row.student_id] = [];
        }
        skillsByStudentId[row.student_id].push(row.skill_name);
      }
    }

    // Fetch college certificates
    let collegeCertsByStudentId: Record<number, any[]> = {};
    if (studentIds.length > 0) {
      const [collegeCertRows] = await pool.query<any[]>(
        `SELECT id, student_id, certificate_name, certificate_number, DATE_FORMAT(issue_date, '%Y-%m-%d') as issue_date, status, file_key 
         FROM student_college_certificates 
         WHERE student_id IN (?)`,
        [studentIds]
      ).catch(() => [[]]);

      for (const row of collegeCertRows) {
        if (!collegeCertsByStudentId[row.student_id]) {
          collegeCertsByStudentId[row.student_id] = [];
        }
        collegeCertsByStudentId[row.student_id].push({
          id: row.id,
          certificateName: row.certificate_name,
          certificateNumber: row.certificate_number,
          issueDate: row.issue_date,
          status: row.status,
          fileUrl: row.file_key ? `/api/student/certificates/college/${row.id}/file` : null,
        });
      }
    }

    // Fetch other/external certificates
    let otherCertsByStudentId: Record<number, any[]> = {};
    if (studentIds.length > 0) {
      const [otherCertRows] = await pool.query<any[]>(
        `SELECT id, student_id, certificate_name, issuing_organization, DATE_FORMAT(issue_date, '%Y-%m-%d') as issue_date, credential_id, credential_url, file_key 
         FROM student_other_certificates 
         WHERE student_id IN (?)`,
        [studentIds]
      ).catch(() => [[]]);

      for (const row of otherCertRows) {
        if (!otherCertsByStudentId[row.student_id]) {
          otherCertsByStudentId[row.student_id] = [];
        }
        otherCertsByStudentId[row.student_id].push({
          id: row.id,
          certificateName: row.certificate_name,
          issuingOrganization: row.issuing_organization,
          issueDate: row.issue_date,
          credentialId: row.credential_id,
          credentialUrl: row.credential_url,
          fileUrl: row.file_key ? `/api/student/certificates/other/${row.id}/file` : null,
        });
      }
    }

    // Format final response
    const students: StudentV2[] = studentRows.map((r) => {
      const fullName = [r.firstname, r.middlename, r.lastname].filter(Boolean).join(" ").trim();
      const semester = extractSemester(r.class_name);

      let branchName = r.branch_name || "General";
      let branchCode = r.branch_code || null;
      if (!r.branch_name && r.class_name) {
        const parts = r.class_name.split(" ");
        branchName = parts[parts.length - 1] || "General";
      }

      const hasAcademicData = r.cgpa !== null || r.marks_10 !== null || r.marks_12 !== null;

      return {
        id: r.id,
        rollNo: r.roll_no || r.admission_no || `STU-${r.id}`,
        admissionNo: r.admission_no || "",
        firstName: r.firstname || "",
        lastName: r.lastname || "",
        fullName: fullName || "Unnamed Student",
        email: r.email || "",
        phone: r.mobileno || "",
        gender: r.gender || null,
        dob: r.dob || null,
        fatherName: r.father_name || null,
        fatherPhone: r.father_phone || null,
        motherName: r.mother_name || null,
        currentAddress: r.current_address || null,
        permanentAddress: r.permanent_address || null,
        city: r.city || null,
        state: r.state || null,
        pincode: r.pincode || null,
        cast: r.cast || null,
        bloodGroup: r.blood_group || null,
        batch: {
          id: r.batch_id || null,
          name: r.batch_name || "Unknown Batch",
        },
        course: {
          id: r.course_id || null,
          name: r.course_name || "B.Tech",
        },
        branch: {
          id: r.branch_id || null,
          name: branchName,
          code: branchCode,
        },
        semester,
        className: r.class_name || null,
        sectionName: r.section_name || null,
        image: r.image || null,
        skills: skillsByStudentId[r.id] || [],
        academicDetails: hasAcademicData ? {
          marks10: r.marks_10 !== null ? parseFloat(r.marks_10) : null,
          marks12: r.marks_12 !== null ? parseFloat(r.marks_12) : null,
          cgpa: r.cgpa !== null ? parseFloat(r.cgpa) : null,
          sem1: r.sem_1 !== null ? parseFloat(r.sem_1) : null,
          sem2: r.sem_2 !== null ? parseFloat(r.sem_2) : null,
          sem3: r.sem_3 !== null ? parseFloat(r.sem_3) : null,
          sem4: r.sem_4 !== null ? parseFloat(r.sem_4) : null,
          sem5: r.sem_5 !== null ? parseFloat(r.sem_5) : null,
          sem6: r.sem_6 !== null ? parseFloat(r.sem_6) : null,
          sem7: r.sem_7 !== null ? parseFloat(r.sem_7) : null,
          sem8: r.sem_8 !== null ? parseFloat(r.sem_8) : null,
          ug: r.ug !== null ? parseFloat(r.ug) : null,
        } : null,
        collegeCertificates: collegeCertsByStudentId[r.id] || [],
        otherCertificates: otherCertsByStudentId[r.id] || [],
      };
    });

    res.json({
      success: true,
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Failed to query students from MySQL:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * GET /api/new/export
 * Exports currently filtered students as a clean CSV with UTF-8 BOM
 */
export async function exportNewStudentsCSV(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();
    const { whereSql, params, baseJoinSql } = buildMasterFilterSQL(req.query);

    // Fetch up to 5,000 students matching filter
    const selectSql = `
      SELECT
        s.id,
        s.roll_no,
        s.admission_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.email,
        s.mobileno,
        s.gender,
        DATE_FORMAT(s.dob, '%Y-%m-%d') AS dob,
        s.father_name,
        s.father_phone,
        s.city,
        s.state,
        s.cast,
        b.batchName AS batch_name,
        c.courseName AS course_name,
        cl.class AS class_name,
        sec.section AS section_name,
        br.name AS branch_name,
        sad.marks_10,
        sad.marks_12,
        sad.cgpa
      ${baseJoinSql}
      ${whereSql}
      GROUP BY s.id
      ORDER BY s.id ASC
      LIMIT 5000
    `;

    const [rows] = await pool.query<any[]>(selectSql, params);

    // Fetch skills for these students
    const studentIds = rows.map((r) => r.id);
    let skillsByStudentId: Record<number, string[]> = {};
    if (studentIds.length > 0) {
      const [skillsRows] = await pool.query<any[]>(
        `SELECT student_id, skill_name FROM student_skills WHERE student_id IN (?)`,
        [studentIds]
      ).catch(() => [[]]);
      for (const row of skillsRows) {
        if (!skillsByStudentId[row.student_id]) skillsByStudentId[row.student_id] = [];
        skillsByStudentId[row.student_id].push(row.skill_name);
      }
    }

    // CSV header row
    const headers = [
      "Roll No / Enrollment",
      "Admission No",
      "Full Name",
      "Course",
      "Branch",
      "Batch",
      "Semester",
      "Section",
      "CGPA",
      "10th %",
      "12th %",
      "Technical Skills",
      "Gender",
      "Category",
      "Mobile",
      "Email",
      "Father Name",
      "Father Phone",
      "City",
      "State",
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvRows = [headers.join(",")];

    for (const r of rows) {
      const fullName = [r.firstname, r.middlename, r.lastname].filter(Boolean).join(" ").trim();
      const semester = extractSemester(r.class_name) || "N/A";
      const branch = r.branch_name || (r.class_name ? r.class_name.split(" ").pop() : "General");
      const skills = (skillsByStudentId[r.id] || []).join("; ");

      const rowData = [
        escapeCSV(r.roll_no || r.admission_no || `STU-${r.id}`),
        escapeCSV(r.admission_no || ""),
        escapeCSV(fullName || "Unnamed"),
        escapeCSV(r.course_name || "B.Tech"),
        escapeCSV(branch),
        escapeCSV(r.batch_name || "N/A"),
        escapeCSV(semester),
        escapeCSV(r.section_name || ""),
        escapeCSV(r.cgpa !== null ? r.cgpa : ""),
        escapeCSV(r.marks_10 !== null ? r.marks_10 : ""),
        escapeCSV(r.marks_12 !== null ? r.marks_12 : ""),
        escapeCSV(skills),
        escapeCSV(r.gender || ""),
        escapeCSV(r.cast || ""),
        escapeCSV(r.mobileno || ""),
        escapeCSV(r.email || ""),
        escapeCSV(r.father_name || ""),
        escapeCSV(r.father_phone || ""),
        escapeCSV(r.city || ""),
        escapeCSV(r.state || ""),
      ];

      csvRows.push(rowData.join(","));
    }

    const csvContent = "\uFEFF" + csvRows.join("\r\n"); // \uFEFF is UTF-8 BOM for Microsoft Excel

    const filename = `TPO_Students_${(req.query.batch as string) || "All"}_${Date.now()}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (error: any) {
    console.error("Failed to export students CSV:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}
