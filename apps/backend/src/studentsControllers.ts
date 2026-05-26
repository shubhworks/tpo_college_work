import { Request, Response } from "express";
import { getSheetsClient } from "./googleClient";
import { extractFileId } from "./lib/extractFileId";
import { parseDriveLinks } from "./lib/parseDriveLinks";
import { getCache, setCache } from "./cache";
import { BATCH_CONFIGS, DEFAULT_BATCH, BatchConfig } from "./config/batches";


function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

const CACHE_TTL_SECONDS = Number(process.env.CACHE_TTL_SECONDS || 300); // default 5 minutes

function getBatchConfig(req: Request): BatchConfig {
  const batch = (req.query.batch as string) || DEFAULT_BATCH;
  const spreadsheetId = (req.query.spreadsheetId as string) || (req.query.fileId as string);

  let config = BATCH_CONFIGS[batch];
  
  if (!config) {
    if (spreadsheetId) {
      // Use 2027 structure as a template for unknown batches with a spreadsheetId
      config = {
        ...BATCH_CONFIGS["2027"],
        spreadsheetId: spreadsheetId,
      };
    } else {
      config = BATCH_CONFIGS[DEFAULT_BATCH];
    }
  } else if (spreadsheetId) {
    config = { ...config, spreadsheetId };
  }

  // Fallback spreadsheetId from env if still empty
  if (!config.spreadsheetId) {
      config.spreadsheetId = process.env.SPREADSHEET_ID || "";
  }

  return config;
}

async function loadSheetRows(sheets: any, spreadsheetId: string, sheetName: string, force = false) {
  const cacheKey = `sheet_${spreadsheetId}_${sheetName}`;
  if (!force) {
    const cached = getCache<any[]>(cacheKey);
    if (cached) return cached;
  }

  const readRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: sheetName,
  });

  const rows = readRes.data.values || [];
  setCache(cacheKey, rows, CACHE_TTL_SECONDS);
  return rows;
}

function rowsToObjects(rows: any[]) {
  if (rows.length === 0) return [];
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
  return data;
}

export async function getBatches(req: Request, res: Response) {
    res.json(Object.keys(BATCH_CONFIGS));
}

export async function getAllStudents(req: Request, res: Response) {
  try {
    const config = getBatchConfig(req);
    const batch = (req.query.batch as string) || DEFAULT_BATCH;
    const sheets = await getSheetsClient();
    const force = (req.query.force as string) === "true";

    const cacheKey = `processed_students_${config.spreadsheetId}_${batch}`;
    if (!force) {
      const cached = getCache<any[]>(cacheKey);
      if (cached) {
        // Apply branch filter if present even on cached data
        const branchQ = (req.query.branch as string) || "";
        let filtered = cached;
        if (branchQ) {
          filtered = cached.filter(
            (s: any) => (s.branch || "").toLowerCase() === branchQ.toLowerCase()
          );
        }
        return res.json(filtered);
      }
    }

    const rows = await loadSheetRows(sheets, config.spreadsheetId, config.registrationSheetName, force);
    let data = rowsToObjects(rows);

    // Merge with certifications sheet if exists for all students
    if (config.certificationsSheetName) {
        const certRows = await loadSheetRows(sheets, config.spreadsheetId, config.certificationsSheetName, force);
        const certData = rowsToObjects(certRows);
        
        // Create a map for faster lookup
        const certMap = new Map();
        certData.forEach(item => {
            const enr = String(item[config.columnMapping.sepCertEnrollment || "enrollment"] || "").toString();
            if (enr) certMap.set(enr, item);
        });

        data = data.map(student => {
            const enr = String(student[config.columnMapping.enrollment] || "").toString();
            const certInfo = certMap.get(enr);
            return certInfo ? { ...student, ...certInfo } : student;
        });
    }

    // Map fields to standard names for frontend if necessary
    const mappedData = data.map(item => ({
        ...item,
        university_enrolment_number: item[config.columnMapping.enrollment] || "",
        name: item[config.columnMapping.name] || "",
        branch: item[config.columnMapping.branch] || "",
        upload_your_latest_professional_photo: item[config.columnMapping.photo] || "",
        linkedin_profile_link: (config.columnMapping.linkedin ? item[config.columnMapping.linkedin] : "") || item.linkedin_profile_link || "",
        github_profile_link: (config.columnMapping.github ? item[config.columnMapping.github] : "") || item.github_profile_link || "",
        latest_resume_link: (config.columnMapping.resume ? item[config.columnMapping.resume] : "") || item.latest_resume_link || "",
        // Also keep these for any internal use or different frontend versions
        enrollment: item[config.columnMapping.enrollment] || "",
        photo: item[config.columnMapping.photo] || "",
    }));

    // Cache the fully mapped data
    setCache(cacheKey, mappedData, CACHE_TTL_SECONDS);

    // optional: filter by branch query param
    const branchQ = (req.query.branch as string) || "";
    let filtered = mappedData;
    if (branchQ) {
      filtered = mappedData.filter(
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
    const config = getBatchConfig(req);
    const batch = (req.query.batch as string) || DEFAULT_BATCH;
    const force = (req.query.force as string) === "true";
    
    // Try to get from processed students cache first
    const studentsCacheKey = `processed_students_${config.spreadsheetId}_${batch}`;
    const cachedStudents = getCache<any[]>(studentsCacheKey);
    if (cachedStudents && !force) {
        const student = cachedStudents.find(s => String(s.university_enrolment_number || "").toString() === enrollment);
        if (student) return res.json(student);
    }

    const sheets = await getSheetsClient();
    const rows = await loadSheetRows(sheets, config.spreadsheetId, config.registrationSheetName, force);
    const data = rowsToObjects(rows);

    let student = data.find(s => String(s[config.columnMapping.enrollment] || "").toString() === enrollment);

    if (!student) return res.status(404).json({ error: "Student not found" });

    // Merge with certifications sheet if exists
    if (config.certificationsSheetName) {
        const certRows = await loadSheetRows(sheets, config.spreadsheetId, config.certificationsSheetName, force);
        const certData = rowsToObjects(certRows);
        const studentCertsInfo = certData.find(s => String(s[config.columnMapping.sepCertEnrollment || "enrollment"] || "").toString() === enrollment);
        if (studentCertsInfo) {
            student = { ...student, ...studentCertsInfo };
        }
    }

    // Standardize fields
    const standardizedStudent = {
        ...student,
        university_enrolment_number: student[config.columnMapping.enrollment],
        name: student[config.columnMapping.name],
        branch: student[config.columnMapping.branch],
        upload_your_latest_professional_photo: student[config.columnMapping.photo],
        linkedin_profile_link: (config.columnMapping.linkedin ? student[config.columnMapping.linkedin] : "") || student.linkedin_profile_link,
        github_profile_link: (config.columnMapping.github ? student[config.columnMapping.github] : "") || student.github_profile_link,
        latest_resume_link: (config.columnMapping.resume ? student[config.columnMapping.resume] : "") || student.latest_resume_link,
        // Keep these for internal use
        enrollment: student[config.columnMapping.enrollment],
        photo: student[config.columnMapping.photo],
        linkedin: config.columnMapping.linkedin ? student[config.columnMapping.linkedin] : undefined,
        github: config.columnMapping.github ? student[config.columnMapping.github] : undefined,
        resume: config.columnMapping.resume ? student[config.columnMapping.resume] : undefined,
    };

    res.json(standardizedStudent);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read sheet" });
  }
}

export async function getStudentCertificates(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const config = getBatchConfig(req);
    const sheets = await getSheetsClient();
    const force = (req.query.force as string) === "true";
    
    let certSourceObj: any = null;

    if (config.certificationsSheetName) {
        const rows = await loadSheetRows(sheets, config.spreadsheetId, config.certificationsSheetName, force);
        const data = rowsToObjects(rows);
        certSourceObj = data.find(s => String(s[config.columnMapping.sepCertEnrollment || "enrollment"] || "").toString() === enrollment);
    } else {
        const rows = await loadSheetRows(sheets, config.spreadsheetId, config.registrationSheetName, force);
        const data = rowsToObjects(rows);
        certSourceObj = data.find(s => String(s[config.columnMapping.enrollment] || "").toString() === enrollment);
    }

    if (!certSourceObj) return res.json([]);

    const certs: any[] = [];

    // Handle same-sheet certs (2026 style)
    if (config.columnMapping.certLinks) {
        const allLinks: string[] = [];
        config.columnMapping.certLinks.forEach(field => {
            allLinks.push(...parseDriveLinks(certSourceObj[field]));
        });

        allLinks.forEach((url) => {
            const match = url.match(/id=([^&]+)/) || url.match(/\/d\/([^/]+)/);
            if (match) {
                const fileId = match[1];
                certs.push({
                    id: fileId,
                    name: `Certificate-${fileId}`,
                    mimeType: "application/pdf",
                    webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
                    webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
                });
            }
        });
    }

    // Handle separate sheet certs (2027 style)
    if (config.columnMapping.sepCertLinksPrefix && config.columnMapping.sepCertCount) {
        for (let i = 1; i <= config.columnMapping.sepCertCount; i++) {
            const linkField = `${config.columnMapping.sepCertLinksPrefix}${i}_link`;
            const nameField = `${config.columnMapping.sepCertNamesPrefix}${i}_name`;
            
            const link = certSourceObj[linkField];
            const name = certSourceObj[nameField] || `Certificate ${i}`;

            if (link) {
                const match = link.match(/id=([^&]+)/) || link.match(/\/d\/([^/]+)/) || link.match(/id=([^&]+)/);
                const fileId = match ? match[1] : extractFileId(link);
                
                if (fileId) {
                    certs.push({
                        id: fileId,
                        name: name,
                        mimeType: "application/pdf",
                        webViewLink: `https://drive.google.com/file/d/${fileId}/view`,
                        webContentLink: `https://drive.google.com/uc?export=download&id=${fileId}`,
                    });
                } else if (link.startsWith("http")) {
                     // Fallback for non-drive links if any
                     certs.push({
                        id: `ext-${i}`,
                        name: name,
                        webViewLink: link,
                    });
                }
            }
        }
    }

    return res.json(certs);
  } catch (err) {
    console.error("Error fetching certificates:", err);
    res.status(500).json({ error: "Failed to list certs" });
  }
}

export async function getImageFileID(req: Request, res: Response) {
  try {
    const enrollment = req.params.enrollment;
    const config = getBatchConfig(req);
    const batch = (req.query.batch as string) || DEFAULT_BATCH;
    const force = (req.query.force as string) === "true";

    const cacheKey = `image_id_${config.spreadsheetId}_${batch}_${enrollment}`;
    if (!force) {
      const cached = getCache<{fileid: string}>(cacheKey);
      if (cached) return res.json(cached);
    }
    
    // Check if we can find it in the processed students cache first to avoid re-reading sheet
    const studentsCacheKey = `processed_students_${config.spreadsheetId}_${batch}`;
    const cachedStudents = getCache<any[]>(studentsCacheKey);
    if (cachedStudents && !force) {
        const student = cachedStudents.find(s => String(s.university_enrolment_number || "").toString() === enrollment);
        if (student) {
            const photoVal = student.upload_your_latest_professional_photo || student[config.columnMapping.photo];
            const fileId = extractFileId(photoVal);
            if (fileId) {
                const result = { fileid: fileId };
                setCache(cacheKey, result, CACHE_TTL_SECONDS);
                return res.json(result);
            }
        }
    }

    const sheets = await getSheetsClient();
    let sourceObj: any = null;

    if (config.certificationsSheetName) {
        const rows = await loadSheetRows(sheets, config.spreadsheetId, config.certificationsSheetName, force);
        const data = rowsToObjects(rows);
        sourceObj = data.find(s => String(s[config.columnMapping.sepCertEnrollment || "enrollment"] || "").toString() === enrollment);
    } else {
        const rows = await loadSheetRows(sheets, config.spreadsheetId, config.registrationSheetName, force);
        const data = rowsToObjects(rows);
        sourceObj = data.find(s => String(s[config.columnMapping.enrollment] || "").toString() === enrollment);
    }

    if (sourceObj) {
      const photoVal = sourceObj[config.columnMapping.photo];
      const fileId = extractFileId(photoVal);
      if (fileId) {
          const result = { fileid: fileId };
          setCache(cacheKey, result, CACHE_TTL_SECONDS);
          return res.json(result);
      }
    }

    return res.status(404).json({ error: "Image not found" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something Went Wrong, Please Try Again Later"
    });
  }
}

