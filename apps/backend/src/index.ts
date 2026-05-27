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
import { validateToken, checkSession } from "./controllers/tokenController";
import { adminLogin, listTokens, createToken, revokeToken } from "./controllers/adminController";
import { tokenAuth } from "./middleware/tokenAuth";
import { adminAuth } from "./middleware/adminAuth";

dotenv.config();

const app = express();

// 1. Extreme CORS for debugging/fixing preflight
const corsOptions = {
    origin: (origin: any, callback: any) => {
        // Reflect the origin back to the client, allowing anything
        // This is necessary for credentials: true to work with any origin
        callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Set-Cookie'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Explicitly handle all preflight requests

app.use(cookieParser());
app.use(express.json());

app.get("/" , (req,res) => {
    res.send("TPO SERVER IS UP!!");
})

// Public Token Validation
app.post("/api/validate-token", validateToken);
app.get("/api/check-session", tokenAuth, checkSession);

// Admin Routes
app.post("/api/admin/login", adminLogin);
app.get("/api/admin/tokens", adminAuth, listTokens);
app.post("/api/admin/tokens", adminAuth, createToken);
app.post("/api/admin/tokens/:id/revoke", adminAuth, revokeToken);

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
