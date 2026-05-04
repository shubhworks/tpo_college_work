export interface BatchConfig {
  spreadsheetId: string;
  registrationSheetName: string;
  certificationsSheetName?: string;
  columnMapping: {
    enrollment: string;
    name: string;
    branch: string;
    photo: string;
    // For certifications in same sheet
    certLinks?: string[]; 
    // For certifications in separate sheet
    sepCertEnrollment?: string;
    sepCertLinksPrefix?: string; 
    sepCertNamesPrefix?: string; 
    sepCertCount?: number;
    // Any other fields needed by frontend
    linkedin?: string;
    github?: string;
    resume?: string;
  };
}

export const BATCH_CONFIGS: Record<string, BatchConfig> = {
  "2026": {
    spreadsheetId: process.env.SPREADSHEET_ID || "",
    registrationSheetName: "Sheet2",
    columnMapping: {
      enrollment: "university_enrolment_number",
      name: "name", // Normalizes to 'name' if header is 'Name'
      branch: "branch",
      photo: "upload_your_latest_professional_photo",
      certLinks: ["upload_certificate", "upload_more_if_you_have"],
    }
  },
  "2027": {
    spreadsheetId: "1ng47kUhgr3dwArC9DU9Ov4zHxA6Pmk408VMDw_uy820",
    registrationSheetName: "Certifications",
    certificationsSheetName: "Certifications",
    columnMapping: {
      enrollment: "enrollment",
      name: "name",
      branch: "branch",
      photo: "photo_link", // from Certifications sheet
      sepCertEnrollment: "enrollment",
      sepCertLinksPrefix: "cert_",
      sepCertNamesPrefix: "cert_",
      sepCertCount: 15,
      linkedin: "linkedin",
      github: "github",
      resume: "resume_link",
    }
  },
  "2028": {
    spreadsheetId: "",
    registrationSheetName: "Full_Registration_Values",
    certificationsSheetName: "Certifications",
    columnMapping: {
      enrollment: "enrollment",
      name: "name",
      branch: "branch",
      photo: "photo_link",
      sepCertEnrollment: "enrollment",
      sepCertLinksPrefix: "cert_",
      sepCertNamesPrefix: "cert_",
      sepCertCount: 15,
      linkedin: "linkedin",
      github: "github",
      resume: "resume_link",
    }
  },
  "2029": {
    spreadsheetId: "",
    registrationSheetName: "Full_Registration_Values",
    certificationsSheetName: "Certifications",
    columnMapping: {
      enrollment: "enrollment",
      name: "name",
      branch: "branch",
      photo: "photo_link",
      sepCertEnrollment: "enrollment",
      sepCertLinksPrefix: "cert_",
      sepCertNamesPrefix: "cert_",
      sepCertCount: 15,
      linkedin: "linkedin",
      github: "github",
      resume: "resume_link",
    }
  }
};

export const DEFAULT_BATCH = "2026";
