import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
    getAllStudents,
    getImageFileID,
    getStudentByEnrollment,
    getStudentCertificates
} from "./studentsControllers";

dotenv.config();

const app = express();


const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'https://tpoportal.vercel.app',
    ],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.get("/" , (req,res) => {
    res.send("TPO SERVER IS UP!!");
})

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
