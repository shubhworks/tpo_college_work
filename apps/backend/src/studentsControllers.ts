import { Request, Response } from "express";
import { getSheetsClient, getDriveClient } from "./googleClient";

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

/**
 * Read all students from Google Sheets.
 * Expects first row as headers.
 */
export async function getAllStudents(req: Request, res: Response) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Form responses 1", // change if different sheet name
    });

    const rows = readRes.data.values || [];
    if (rows.length === 0) return res.json([]);

    const headersRaw = rows[0] as string[];
    const headers = headersRaw.map(normalizeHeader);

    const data = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as string[];
      if (row.length === 0) continue;
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] ?? "";
      }
      data.push(obj);
    }

    // optional: filter by branch query param
    const branchQ = (req.query.branch as string) || "";
    let filtered = data;
    if (branchQ) {
      filtered = data.filter(
        (s: any) => (s.branch || "").toLowerCase() === branchQ.toLowerCase()
      );
    }
    res.json(filtered);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read sheet" });
  }
}

/**
 * Get single student by enrollment number (exact match)
 */
export async function getStudentByEnrollment(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const readRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Sheet1",
    });

    const rows = readRes.data.values || [];
    if (rows.length === 0) return res.status(404).json({});

    const headersRaw = rows[0] as string[];
    const headers = headersRaw.map(normalizeHeader);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as string[];
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) obj[headers[j]] = row[j] ?? "";
      if ((obj.university_enrolment_number || "").toString() === enrollment) {
        return res.json(obj);
      }
    }

    res.status(404).json({ error: "Student not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read sheet" });
  }
}

/**
 * List certificate files inside student's folder.
 * Folder name is expected to equal enrollment number.
 * Parent folder id is from env PARENT_CERT_FOLDER_ID.
 */
export async function getStudentCertificates(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const drive = await getDriveClient();
    const parentId = process.env.PARENT_CERT_FOLDER_ID!;
    // 1) Find the folder with name == enrollment under parent
    const q = [
      `name = '${enrollment.replace(/'/g, "\\'")}'`,
      `mimeType = 'application/vnd.google-apps.folder'`,
      `'${parentId}' in parents`
    ].join(" and ");

    const folderList = await drive.files.list({
      q,
      fields: "files(id, name)"
    });

    if (!folderList.data || !(folderList.data as any).files || (folderList.data as any).files.length === 0) {
      return res.json([]);
    }

    const folderId = (folderList.data as any).files[0].id!;
    // 2) List files in that folder
    const filesRes = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType, webViewLink, webContentLink)"
    });

    const files = ((filesRes.data as any).files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      webViewLink: f.webViewLink,
      webContentLink: f.webContentLink
    }));

    res.json(files);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list certs" });
  }
}
