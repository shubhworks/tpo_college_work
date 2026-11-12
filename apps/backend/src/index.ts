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
    getNewSemesters,
    getNewStudents,
    getNewFiltersMeta,
    exportNewStudentsCSV,
} from "./controllers/newArchitectureController";
import { validateToken, checkSession } from "./controllers/tokenController";
import { adminLogin, listTokens, createToken, revokeToken, updateTokenExpiry } from "./controllers/adminController";
import { tokenAuth } from "./middleware/tokenAuth";
import { adminAuth } from "./middleware/adminAuth";

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

// New Database Architecture Routes (Live MySQL gg_app)
app.get("/api/new/batches", getNewBatches);
app.get("/api/new/courses", getNewCourses);
app.get("/api/new/branches", getNewBranches);
app.get("/api/new/semesters", getNewSemesters);
app.get("/api/new/filters-meta", getNewFiltersMeta);
app.get("/api/new/export", exportNewStudentsCSV);
app.get("/api/new/students", getNewStudents);

// Admin Routes
app.post("/api/admin/login", adminLogin);
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