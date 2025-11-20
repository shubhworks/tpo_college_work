import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
    getAllStudents,
    getStudentByEnrollment,
    getStudentCertificates
} from "./studentsControllers";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ ok: true }));

// get all students (optional ?branch=)
app.get("/students", getAllStudents);

// get student detail by enrollment number
app.get("/students/:enrollment", getStudentByEnrollment);

// get certificates list for student
app.get("/students/:enrollment/certs", getStudentCertificates);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
