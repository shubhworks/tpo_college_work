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

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://tpoportal.vercel.app',
];

if (process.env.CORS_ORIGIN) {
    const origins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
    allowedOrigins.push(...origins);
}

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some(ao => {
            if (ao === '*') return true;
            if (ao === origin) return true;
            if (ao.startsWith('*.') && origin.endsWith(ao.slice(2))) return true;
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.log(`CORS blocked for origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
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
