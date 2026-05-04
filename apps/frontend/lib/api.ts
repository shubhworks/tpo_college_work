import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// API endpoints
export const studentAPI = {
  getBatches: () => apiClient.get("/batches"),

  getStudents: (branch?: string, batch?: string, spreadsheetId?: string) => 
    apiClient.get("/students", { params: { branch, batch, spreadsheetId } }),

  getStudent: (enrollment: string, batch?: string, spreadsheetId?: string) => 
    apiClient.get(`/students/${enrollment}`, { params: { batch, spreadsheetId } }),

  getStudentCerts: (enrollment: string, batch?: string, spreadsheetId?: string) => 
    apiClient.get(`/students/${enrollment}/certs`, { params: { batch, spreadsheetId } }),
}