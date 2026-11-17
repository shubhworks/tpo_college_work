import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {
    getAllStudents,
    getImageFileID,
    getStudentByEnrollment,
    getStudentCertificates,
    getBatches
} from "./studentsControllers";
import {
    getNewBatches,
    getNewCourses,
    getNewBranches,
    getNewDepartments,
    getNewSemesters,
    getNewStudents,
    getNewFiltersMeta,
    exportNewStudentsCSV,
} from "./controllers/newArchitectureController";
import {
    searchStudentsForAcademic,
    getAcademicRecords,
    upsertSingleAcademicRecord,
    bulkUpsertAcademicRecords,
    deleteAcademicRecord,
    downloadAcademicCSVTemplate,
} from "./controllers/academicUploadController";
import { validateToken, checkSession } from "./controllers/tokenController";
import { listTokens, createToken, revokeToken, updateTokenExpiry } from "./controllers/adminController";
import { tokenAuth } from "./middleware/tokenAuth";
import { adminAuth, superAdminAuth } from "./middleware/adminAuth";
import { requestOtp, verifyOtp, setPassword, login, logout, me } from "./controllers/authController";
import {
    listWhitelist,
    addWhitelistedEmail,
    updateWhitelistedEmail,
    removeWhitelistedEmail,
} from "./controllers/whitelistController";

import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "apps/backend/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const app = express();

const configuredFrontendOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://tpoportal.vercel.app',
        ...configuredFrontendOrigins,
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get("/" , (req,res) => {
    res.send("TPO SERVER IS UP!!");
})

// Public Token Validation
app.post("/api/validate-token", validateToken);
app.get("/api/check-session", tokenAuth, checkSession);

// New Database Architecture Routes (Live MySQL gg_app): recruiter link or staff session
app.get("/api/new/batches", tokenAuth, getNewBatches);
app.get("/api/new/courses", tokenAuth, getNewCourses);
app.get("/api/new/branches", tokenAuth, getNewBranches);
app.get("/api/new/departments", tokenAuth, getNewDepartments);
app.get("/api/new/semesters", tokenAuth, getNewSemesters);
app.get("/api/new/filters-meta", tokenAuth, getNewFiltersMeta);
app.get("/api/new/export", tokenAuth, exportNewStudentsCSV);
app.get("/api/new/students", tokenAuth, getNewStudents);

// Academic Upload Routes (students_acadmic_details, writes to ERP): signed-in staff only
app.get("/api/academic/students-search", adminAuth, searchStudentsForAcademic);
app.get("/api/academic/records", adminAuth, getAcademicRecords);
app.post("/api/academic/single-entry", adminAuth, upsertSingleAcademicRecord);
app.post("/api/academic/bulk-upload", adminAuth, bulkUpsertAcademicRecords);
app.delete("/api/academic/records/:id", adminAuth, deleteAcademicRecord);
app.get("/api/academic/template.csv", adminAuth, downloadAcademicCSVTemplate);

// Admin Routes
// Staff email auth (first-time activation via OTP, then email + password)
app.post("/api/auth/request-otp", requestOtp);
app.post("/api/auth/verify-otp", verifyOtp);
app.post("/api/auth/set-password", setPassword);
app.post("/api/auth/login", login);
app.post("/api/auth/logout", logout);
app.get("/api/auth/me", me);

// Whitelist management (super admin only)
app.get("/api/admin/whitelist", superAdminAuth, listWhitelist);
app.post("/api/admin/whitelist", superAdminAuth, addWhitelistedEmail);
app.patch("/api/admin/whitelist/:id", superAdminAuth, updateWhitelistedEmail);
app.delete("/api/admin/whitelist/:id", superAdminAuth, removeWhitelistedEmail);

app.get("/api/admin/tokens", adminAuth, listTokens);
app.post("/api/admin/tokens", adminAuth, createToken);
app.post("/api/admin/tokens/:id/revoke", adminAuth, revokeToken);
app.post("/api/admin/tokens/:id/expiry", adminAuth, updateTokenExpiry);

// Protected data routes
app.use(tokenAuth);

// get available batches
app.get("/batches", getBatches);

// get all students (optional ?branch=)
app.get("/students", getAllStudents);

// get student detail by enrollment number
app.get("/students/:enrollment", getStudentByEnrollment);

// get file id of image by student's enrollment number
app.get("/image/:enrollment", getImageFileID);

// get certificates list for student
app.get("/students/:enrollment/certs", getStudentCertificates);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});