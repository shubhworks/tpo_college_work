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
  updateTokenExpiry: (id: string, expiry: string) => apiClient.post(`/api/admin/tokens/${id}/expiry`, { expiry }),
}

export const newArchitectureAPI = {
  getBatches: () => apiClient.get("/api/new/batches"),
  getCourses: () => apiClient.get("/api/new/courses"),
  getBranches: () => apiClient.get("/api/new/branches"),
  getSemesters: () => apiClient.get("/api/new/semesters"),
  getFiltersMeta: () => apiClient.get("/api/new/filters-meta"),
  getStudents: (params?: {
    batch?: string;
    course?: string;
    branch?: string;
    semester?: string;
    search?: string;
    minCgpa?: number | string;
    maxCgpa?: number | string;
    min10th?: number | string;
    max10th?: number | string;
    min12th?: number | string;
    max12th?: number | string;
    skills?: string;
    skillsMatch?: "any" | "all";
    hasVerifiedCert?: boolean | string;
    hasOtherCert?: boolean | string;
    gender?: string;
    category?: string;
    city?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get("/api/new/students", { params }),
  getExportUrl: (params?: Record<string, any>) => {
    const url = new URL("/api/new/export", API_BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "ALL") {
          url.searchParams.append(key, String(val));
        }
      });
    }
    return url.toString();
  },
}

export const academicAPI = {
  searchStudents: (q: string) => apiClient.get("/api/academic/students-search", { params: { q } }),
  getRecords: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get("/api/academic/records", { params }),
  upsertSingle: (data: any) => apiClient.post("/api/academic/single-entry", data),
  bulkUpload: (entries: any[]) => apiClient.post("/api/academic/bulk-upload", { entries }),
  deleteRecord: (id: number) => apiClient.delete(`/api/academic/records/${id}`),
  getTemplateUrl: () => `${API_BASE_URL}/api/academic/template.csv`,
}
