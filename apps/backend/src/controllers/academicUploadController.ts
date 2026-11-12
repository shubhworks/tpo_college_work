import { Request, Response } from "express";
import { getMySQLPool } from "../lib/mysql";

/**
 * 1. Search students in ERP database by roll_no, admission_no, name, or email.
 * Includes academic details if already entered in students_acadmic_details.
 */
export async function searchStudentsForAcademic(req: Request, res: Response) {
  try {
    const q = ((req.query.q as string) || "").trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, students: [] });
    }

    const pool = getMySQLPool();
    const queryTerm = `%${q}%`;

    const sql = `
      SELECT
        s.id,
        s.roll_no,
        s.admission_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.email,
        s.mobileno,
        b.batchName AS batch_name,
        c.courseName AS course_name,
        sad.id AS academic_record_id,
        sad.marks_10,
        sad.board_id_10,
        sad.marksheet_10,
        sad.marks_12,
        sad.board_id_12,
        sad.marksheet_12,
        sad.sem_1,
        sad.sem_2,
        sad.sem_3,
        sad.sem_4,
        sad.sem_5,
        sad.sem_6,
        sad.sem_7,
        sad.sem_8,
        sad.cgpa,
        sad.ug
      FROM students s
      LEFT JOIN batches b ON b.id = s.batchid
      LEFT JOIN courses c ON c.id = s.courseid
      LEFT JOIN students_acadmic_details sad ON sad.student_id = s.id
      WHERE
        s.roll_no LIKE ? OR
        s.admission_no LIKE ? OR
        s.firstname LIKE ? OR
        s.lastname LIKE ? OR
        CONCAT(s.firstname, ' ', s.lastname) LIKE ? OR
        s.email LIKE ?
      ORDER BY s.id DESC
      LIMIT 20
    `;

    const [rows] = await pool.query<any[]>(sql, [
      queryTerm,
      queryTerm,
      queryTerm,
      queryTerm,
      queryTerm,
      queryTerm,
    ]);

    const formatted = rows.map((r) => {
      const fullName = [r.firstname, r.middlename, r.lastname]
        .filter(Boolean)
        .join(" ")
        .trim();

      const hasAcademic = r.academic_record_id !== null && r.academic_record_id !== undefined;

      return {
        id: r.id,
        rollNo: r.roll_no || "",
        admissionNo: r.admission_no || "",
        name: fullName,
        email: r.email || "",
        phone: r.mobileno || "",
        batchName: r.batch_name || "",
        courseName: r.course_name || "",
        hasAcademic,
        academicDetails: hasAcademic
          ? {
              id: r.academic_record_id,
              marks10: r.marks_10 !== null ? parseFloat(r.marks_10) : null,
              boardId10: r.board_id_10 || 1,
              marksheet10: r.marksheet_10 || "N/A",
              marks12: r.marks_12 !== null ? parseFloat(r.marks_12) : null,
              boardId12: r.board_id_12 || 1,
              marksheet12: r.marksheet_12 || "N/A",
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
            }
          : null,
      };
    });

    res.json({ success: true, students: formatted });
  } catch (error: any) {
    console.error("Error in searchStudentsForAcademic:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 2. Get paginated records from students_acadmic_details joined with student profile.
 */
export async function getAcademicRecords(req: Request, res: Response) {
  try {
    const pool = getMySQLPool();
    const page = Math.max(1, parseInt((req.query.page as string) || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || "25", 10)));
    const offset = (page - 1) * limit;
    const search = ((req.query.search as string) || "").trim();

    let whereSql = "";
    const params: any[] = [];

    if (search) {
      whereSql = `
        WHERE
          s.roll_no LIKE ? OR
          s.admission_no LIKE ? OR
          s.firstname LIKE ? OR
          s.lastname LIKE ? OR
          CONCAT(s.firstname, ' ', s.lastname) LIKE ?
      `;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    const countSql = `
      SELECT COUNT(*) AS total
      FROM students_acadmic_details sad
      INNER JOIN students s ON s.id = sad.student_id
      ${whereSql}
    `;
    const [countRows] = await pool.query<any[]>(countSql, params);
    const total = countRows[0]?.total || 0;

    const selectSql = `
      SELECT
        sad.id,
        sad.student_id,
        sad.marks_10,
        sad.board_id_10,
        sad.marksheet_10,
        sad.marks_12,
        sad.board_id_12,
        sad.marksheet_12,
        sad.cgpa,
        sad.sem_1,
        sad.sem_2,
        sad.sem_3,
        sad.sem_4,
        sad.sem_5,
        sad.sem_6,
        sad.sem_7,
        sad.sem_8,
        sad.ug,
        s.roll_no,
        s.admission_no,
        s.firstname,
        s.middlename,
        s.lastname,
        s.email,
        b.batchName AS batch_name,
        c.courseName AS course_name
      FROM students_acadmic_details sad
      INNER JOIN students s ON s.id = sad.student_id
      LEFT JOIN batches b ON b.id = s.batchid
      LEFT JOIN courses c ON c.id = s.courseid
      ${whereSql}
      ORDER BY sad.id DESC
      LIMIT ? OFFSET ?
    `;

    const [rows] = await pool.query<any[]>(selectSql, [...params, limit, offset]);

    const records = rows.map((r) => {
      const studentName = [r.firstname, r.middlename, r.lastname].filter(Boolean).join(" ");
      return {
        id: r.id,
        studentId: r.student_id,
        studentName,
        rollNo: r.roll_no || "",
        admissionNo: r.admission_no || "",
        email: r.email || "",
        batchName: r.batch_name || "",
        courseName: r.course_name || "",
        marks10: r.marks_10 !== null ? parseFloat(r.marks_10) : null,
        boardId10: r.board_id_10,
        marksheet10: r.marksheet_10,
        marks12: r.marks_12 !== null ? parseFloat(r.marks_12) : null,
        boardId12: r.board_id_12,
        marksheet12: r.marksheet_12,
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
      };
    });

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      records,
    });
  } catch (error: any) {
    console.error("Error in getAcademicRecords:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 3. Upsert a single student's academic record in students_acadmic_details.
 */
export async function upsertSingleAcademicRecord(req: Request, res: Response) {
  try {
    const {
      student_id,
      marks_10,
      board_id_10,
      marksheet_10,
      marks_12,
      board_id_12,
      marksheet_12,
      cgpa,
      sem_1,
      sem_2,
      sem_3,
      sem_4,
      sem_5,
      sem_6,
      sem_7,
      sem_8,
      ug,
    } = req.body;

    if (!student_id || isNaN(Number(student_id))) {
      return res.status(400).json({ success: false, error: "Valid student_id is required" });
    }

    const pool = getMySQLPool();
    const studentIdNum = parseInt(student_id, 10);

    // Verify student exists in students table
    const [studentExists] = await pool.query<any[]>(
      "SELECT id FROM students WHERE id = ?",
      [studentIdNum]
    );
    if (!studentExists || studentExists.length === 0) {
      return res.status(404).json({ success: false, error: "Student not found in database" });
    }

    const m10 = marks_10 !== undefined && marks_10 !== null && marks_10 !== "" ? parseFloat(marks_10) : 0.0;
    const b10 = board_id_10 ? parseInt(board_id_10, 10) : 1;
    const ms10 = (marksheet_10 || "N/A").toString().trim();

    const m12 = marks_12 !== undefined && marks_12 !== null && marks_12 !== "" ? parseFloat(marks_12) : 0.0;
    const b12 = board_id_12 ? parseInt(board_id_12, 10) : 1;
    const ms12 = (marksheet_12 || "N/A").toString().trim();

    const parseNullableFloat = (val: any) =>
      val !== undefined && val !== null && val !== "" && !isNaN(parseFloat(val))
        ? parseFloat(val)
        : null;

    const parsedCgpa = parseNullableFloat(cgpa);
    const parsedSem1 = parseNullableFloat(sem_1);
    const parsedSem2 = parseNullableFloat(sem_2);
    const parsedSem3 = parseNullableFloat(sem_3);
    const parsedSem4 = parseNullableFloat(sem_4);
    const parsedSem5 = parseNullableFloat(sem_5);
    const parsedSem6 = parseNullableFloat(sem_6);
    const parsedSem7 = parseNullableFloat(sem_7);
    const parsedSem8 = parseNullableFloat(sem_8);
    const parsedUg = parseNullableFloat(ug);

    // Check if record exists for this student_id
    const [existing] = await pool.query<any[]>(
      "SELECT id FROM students_acadmic_details WHERE student_id = ?",
      [studentIdNum]
    );

    if (existing && existing.length > 0) {
      // UPDATE
      const updateSql = `
        UPDATE students_acadmic_details
        SET
          marks_10 = ?, board_id_10 = ?, marksheet_10 = ?,
          marks_12 = ?, board_id_12 = ?, marksheet_12 = ?,
          cgpa = ?,
          sem_1 = ?, sem_2 = ?, sem_3 = ?, sem_4 = ?,
          sem_5 = ?, sem_6 = ?, sem_7 = ?, sem_8 = ?,
          ug = ?
        WHERE student_id = ?
      `;
      await pool.query(updateSql, [
        m10, b10, ms10,
        m12, b12, ms12,
        parsedCgpa,
        parsedSem1, parsedSem2, parsedSem3, parsedSem4,
        parsedSem5, parsedSem6, parsedSem7, parsedSem8,
        parsedUg,
        studentIdNum,
      ]);

      return res.json({
        success: true,
        action: "updated",
        id: existing[0].id,
        message: "Academic record updated successfully",
      });
    } else {
      // INSERT
      const insertSql = `
        INSERT INTO students_acadmic_details (
          student_id,
          marks_10, board_id_10, marksheet_10,
          marks_12, board_id_12, marksheet_12,
          cgpa,
          sem_1, sem_2, sem_3, sem_4,
          sem_5, sem_6, sem_7, sem_8,
          ug
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const [result]: any = await pool.query(insertSql, [
        studentIdNum,
        m10, b10, ms10,
        m12, b12, ms12,
        parsedCgpa,
        parsedSem1, parsedSem2, parsedSem3, parsedSem4,
        parsedSem5, parsedSem6, parsedSem7, parsedSem8,
        parsedUg,
      ]);

      return res.json({
        success: true,
        action: "inserted",
        id: result.insertId,
        message: "Academic record created successfully",
      });
    }
  } catch (error: any) {
    console.error("Error in upsertSingleAcademicRecord:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 4. Bulk upsert multiple records from CSV / Excel rows.
 * Matches rows by roll_no, admission_no, email, or student_id.
 */
export async function bulkUpsertAcademicRecords(req: Request, res: Response) {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ success: false, error: "No entries provided" });
    }

    if (entries.length > 2000) {
      return res.status(400).json({
        success: false,
        error: "Exceeded maximum of 2,000 rows per batch upload",
      });
    }

    const pool = getMySQLPool();

    // 1. Gather all identifiers to query matching students
    const identifiers = new Set<string>();
    entries.forEach((e: any) => {
      const iden = (e.identifier || e.roll_no || e.admission_no || e.student_id || e.email || "")
        .toString()
        .trim();
      if (iden) identifiers.add(iden);
    });

    if (identifiers.size === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid student identifiers found in rows (must include roll_no, admission_no, or student_id)",
      });
    }

    const idenArray = Array.from(identifiers);

    // Fetch matching students in chunks of 500
    const matchedStudentsMap = new Map<string, any>(); // key: lowercase identifier -> student object
    const chunkSize = 500;

    for (let i = 0; i < idenArray.length; i += chunkSize) {
      const chunk = idenArray.slice(i, i + chunkSize);
      const placeholders = chunk.map(() => "?").join(",");

      const sql = `
        SELECT id, roll_no, admission_no, email, firstname, lastname
        FROM students
        WHERE
          roll_no IN (${placeholders}) OR
          admission_no IN (${placeholders}) OR
          email IN (${placeholders}) OR
          id IN (${placeholders})
      `;
      const [rows] = await pool.query<any[]>(sql, [
        ...chunk,
        ...chunk,
        ...chunk,
        ...chunk,
      ]);

      rows.forEach((s) => {
        if (s.roll_no) matchedStudentsMap.set(s.roll_no.trim().toLowerCase(), s);
        if (s.admission_no) matchedStudentsMap.set(s.admission_no.trim().toLowerCase(), s);
        if (s.email) matchedStudentsMap.set(s.email.trim().toLowerCase(), s);
        matchedStudentsMap.set(s.id.toString(), s);
      });
    }

    // 2. Fetch existing academic details for matched student IDs
    const matchedStudentIds = Array.from(
      new Set(Array.from(matchedStudentsMap.values()).map((s) => s.id))
    );

    const existingSadMap = new Map<number, number>(); // student_id -> sad.id
    if (matchedStudentIds.length > 0) {
      for (let i = 0; i < matchedStudentIds.length; i += chunkSize) {
        const chunk = matchedStudentIds.slice(i, i + chunkSize);
        const placeholders = chunk.map(() => "?").join(",");
        const [sadRows] = await pool.query<any[]>(
          `SELECT id, student_id FROM students_acadmic_details WHERE student_id IN (${placeholders})`,
          chunk
        );
        sadRows.forEach((row) => existingSadMap.set(row.student_id, row.id));
      }
    }

    // 3. Process entries
    let inserted = 0;
    let updated = 0;
    const notFound: string[] = [];

    const parseNullableFloat = (val: any) =>
      val !== undefined && val !== null && val !== "" && !isNaN(parseFloat(val))
        ? parseFloat(val)
        : null;

    for (const e of entries) {
      const iden = (e.identifier || e.roll_no || e.admission_no || e.student_id || e.email || "")
        .toString()
        .trim();

      const student = matchedStudentsMap.get(iden.toLowerCase()) || matchedStudentsMap.get(iden);

      if (!student) {
        notFound.push(iden || "Empty Identifier");
        continue;
      }

      const studentIdNum = student.id;
      const m10 = e.marks_10 !== undefined && e.marks_10 !== null && e.marks_10 !== "" ? parseFloat(e.marks_10) : 0.0;
      const b10 = e.board_id_10 ? parseInt(e.board_id_10, 10) : 1;
      const ms10 = (e.marksheet_10 || "N/A").toString().trim();

      const m12 = e.marks_12 !== undefined && e.marks_12 !== null && e.marks_12 !== "" ? parseFloat(e.marks_12) : 0.0;
      const b12 = e.board_id_12 ? parseInt(e.board_id_12, 10) : 1;
      const ms12 = (e.marksheet_12 || "N/A").toString().trim();

      const parsedCgpa = parseNullableFloat(e.cgpa);
      const parsedSem1 = parseNullableFloat(e.sem_1);
      const parsedSem2 = parseNullableFloat(e.sem_2);
      const parsedSem3 = parseNullableFloat(e.sem_3);
      const parsedSem4 = parseNullableFloat(e.sem_4);
      const parsedSem5 = parseNullableFloat(e.sem_5);
      const parsedSem6 = parseNullableFloat(e.sem_6);
      const parsedSem7 = parseNullableFloat(e.sem_7);
      const parsedSem8 = parseNullableFloat(e.sem_8);
      const parsedUg = parseNullableFloat(e.ug);

      if (existingSadMap.has(studentIdNum)) {
        // UPDATE
        const updateSql = `
          UPDATE students_acadmic_details
          SET
            marks_10 = ?, board_id_10 = ?, marksheet_10 = ?,
            marks_12 = ?, board_id_12 = ?, marksheet_12 = ?,
            cgpa = ?,
            sem_1 = ?, sem_2 = ?, sem_3 = ?, sem_4 = ?,
            sem_5 = ?, sem_6 = ?, sem_7 = ?, sem_8 = ?,
            ug = ?
          WHERE student_id = ?
        `;
        await pool.query(updateSql, [
          m10, b10, ms10,
          m12, b12, ms12,
          parsedCgpa,
          parsedSem1, parsedSem2, parsedSem3, parsedSem4,
          parsedSem5, parsedSem6, parsedSem7, parsedSem8,
          parsedUg,
          studentIdNum,
        ]);
        updated++;
      } else {
        // INSERT
        const insertSql = `
          INSERT INTO students_acadmic_details (
            student_id,
            marks_10, board_id_10, marksheet_10,
            marks_12, board_id_12, marksheet_12,
            cgpa,
            sem_1, sem_2, sem_3, sem_4,
            sem_5, sem_6, sem_7, sem_8,
            ug
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(insertSql, [
          studentIdNum,
          m10, b10, ms10,
          m12, b12, ms12,
          parsedCgpa,
          parsedSem1, parsedSem2, parsedSem3, parsedSem4,
          parsedSem5, parsedSem6, parsedSem7, parsedSem8,
          parsedUg,
        ]);
        existingSadMap.set(studentIdNum, 1);
        inserted++;
      }
    }

    res.json({
      success: true,
      totalReceived: entries.length,
      matched: entries.length - notFound.length,
      inserted,
      updated,
      notFoundCount: notFound.length,
      notFound: notFound.slice(0, 50), // first 50 for quick feedback
    });
  } catch (error: any) {
    console.error("Error in bulkUpsertAcademicRecords:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 5. Delete an academic record by ID.
 */
export async function deleteAcademicRecord(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (!id || isNaN(id)) {
      return res.status(400).json({ success: false, error: "Valid ID required" });
    }

    const pool = getMySQLPool();
    const [result]: any = await pool.query(
      "DELETE FROM students_acadmic_details WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: "Record not found" });
    }

    res.json({ success: true, message: "Academic record deleted successfully" });
  } catch (error: any) {
    console.error("Error in deleteAcademicRecord:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * 6. Download a ready-to-fill sample CSV template.
 */
export function downloadAcademicCSVTemplate(req: Request, res: Response) {
  const headers = [
    "roll_no",
    "admission_no",
    "marks_10",
    "board_id_10",
    "marks_12",
    "board_id_12",
    "cgpa",
    "sem_1",
    "sem_2",
    "sem_3",
    "sem_4",
    "sem_5",
    "sem_6",
    "sem_7",
    "sem_8",
    "ug",
  ].join(",");

  const sampleRows = [
    "0206EX251001,TS25UI001080,82.5,1,85.0,1,8.45,8.2,8.5,8.6,8.4,8.5,8.7,,",
    "0206EE251002,TS25UH001045,78.0,1,80.5,1,7.90,7.8,8.0,7.9,8.1,,,,",
  ].join("\n");

  const csvContent = `${headers}\n${sampleRows}\n`;

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="students_academic_details_template.csv"'
  );
  res.status(200).send(csvContent);
}
