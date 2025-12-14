import { Request, Response } from "express";
import { getSheetsClient, getDriveClient } from "./googleClient";
import { extractFileId } from "./lib/extractFileId";
import { parseDriveLinks } from "./lib/parseDriveLinks";
import { getCache, setCache } from "./cache";


function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 300); // default 5 minutes

async function loadSheetRows(sheets: any, spreadsheetId: string, force = false) {
  const cacheKey = `sheet_${spreadsheetId}_Sheet2`;
  if (!force) {
    const cached = getCache<any[]>(cacheKey);
    if (cached) return cached;
  }

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "Sheet2",
  });

  const rows = readRes.data.values || [];
  setCache(cacheKey, rows, CACHE_TTL_SECONDS);
  return rows;
}

export async function getAllStudents(req: Request, res: Response) {
  try {
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const force = (req.query.force as string) === "true";

    const rows = await loadSheetRows(sheets, spreadsheetId, force);
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


export async function getStudentByEnrollment(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const force = (req.query.force as string) === "true";
    const rows = await loadSheetRows(sheets, spreadsheetId, force);
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

export async function getStudentCertificates(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const force = (req.query.force as string) === "true";
    const rows = await loadSheetRows(sheets, spreadsheetId, force);
    if (rows.length === 0) return res.json([]);

    const headers = rows[0].map((h: string) => normalizeHeader(h));

    const uploadField1 = "upload_certificate";
    const uploadField2 = "upload_more_if_you_have";

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const obj: any = {};

      headers.forEach((h: string, idx: number) => {
        obj[h] = row[idx] ?? "";
      });

      if ((obj.university_enrolment_number || "").toString() === enrollment) {
        // 🔥 PERMANENT FIX HERE
        const links1 = parseDriveLinks(obj[uploadField1]);
        const links2 = parseDriveLinks(obj[uploadField2]);

        const allLinks = [...links1, ...links2];

        const certs = allLinks
          .map((url) => {
            const match = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
            if (!match) return null;

            const fileId = match[1];

            return {
              id: fileId,
              name: `Certificate-${fileId}`,
              mimeType: "application/pdf",
              webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
              webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
            };
          })
          .filter(Boolean); // remove nulls

        return res.json(certs);
      }
    }

    return res.json([]);
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ error: "Failed to list certs" });
  }
}


// export async function getStudentCertificates(req: Request, res: Response) {
//   try {
//     const enrollment = req.params.enrollment;
//     const sheets = await getSheetsClient();
//     const spreadsheetId = process.env.SPREADSHEET_ID!;

//     const readRes = await sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: "Sheet2", // CHANGE to your sheet tab name
//     });

//     const rows = readRes.data.values || [];
//     const headers = rows[0].map((h: string) =>
//       h.trim().toLowerCase().replace(/\s+/g, "_")
//     );

//     const uploadField1 = "upload_certificate";
//     const uploadField2 = "upload_more_if_you_have";

//     const certs: any[] = [];

//     for (let i = 1; i < rows.length; i++) {
//       const row = rows[i];
//       const obj: any = {};

//       headers.forEach((h: string, idx: number) => {
//         obj[h] = row[idx] || "";
//       });

//       if (obj.university_enrolment_number === enrollment) {
//         const links1 = obj[uploadField1] ? obj[uploadField1].split(",") : [];
//         const links2 = obj[uploadField2] ? obj[uploadField2].split(",") : [];
//         const allLinks = [...links1, ...links2];

//         allLinks.forEach((url) => {
//           const match = url.match(/id=([^&]+)/);
//           if (!match) return;

//           const fileId = match[1];

//           certs.push({
//             id: fileId,
//             name: `Certificate-${fileId}.pdf`,
//             mimeType: "application/pdf",
//             webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
//             webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
//           });
//         });

//         return res.json(certs);
//       }
//     }

//     res.json([]);
//   } catch (err) {
//     console.error("Error fetching certificates:", err);
//     res.status(500).json({ error: "Failed to list certs" });
//   }
// }

export async function getImageFileID(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const sheets = await getSheetsClient();
    const spreadsheetId = process.env.SPREADSHEET_ID!;
    const force = (req.query.force as string) === "true";
    const rows = await loadSheetRows(sheets, spreadsheetId, force);
    if (rows.length === 0) return res.status(404).json({});

    const headersRaw = rows[0] as string[];
    const headers = headersRaw.map(normalizeHeader);

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] as string[];
      const obj: any = {};

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = row[j] ?? "";
      }

      if ((obj.university_enrolment_number || "").toString() === enrollment) {
        const fileId = extractFileId(
          obj.upload_your_latest_professional_photo
        );

        return res.json({ fileid: fileId });
      }
    }

    return res.status(404).json({});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something Went Wrong, Please Try Again Later"
    });
  }
}
