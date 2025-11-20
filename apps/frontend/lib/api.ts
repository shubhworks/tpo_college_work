import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// API endpoints
export const studentAPI = {
  getStudents: (branch?: string) => apiClient.get("/students", { params: branch ? { branch } : {} }),

  getStudent: (enrollment: string) => apiClient.get(`/students/${enrollment}`),

  getStudentCerts: (enrollment: string) => apiClient.get(`/students/${enrollment}/certs`),
}
