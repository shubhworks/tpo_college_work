import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
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

  getImage: (enrollment: string, batch?: string, spreadsheetId?: string) => 
    apiClient.get(`/image/${enrollment}`, { params: { batch, spreadsheetId } }),
}

export const authAPI = {
  validateToken: (token: string) => apiClient.post("/api/validate-token", { token }),
  checkSession: () => apiClient.get("/api/check-session"),
}

export const adminAPI = {
  login: (password: string) => apiClient.post("/api/admin/login", { password }),
  getTokens: () => apiClient.get("/api/admin/tokens"),
  createToken: (label: string, expiry: string) => apiClient.post("/api/admin/tokens", { label, expiry }),
  revokeToken: (id: string) => apiClient.post(`/api/admin/tokens/${id}/revoke`),
}