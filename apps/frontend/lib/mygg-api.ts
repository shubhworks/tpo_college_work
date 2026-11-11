import type { MyGGApiError, MyGGBranch, MyGGStudent } from "@/types/mygg"

const MYGG_TOKEN_KEY = "mygg_admin_token"

export function getMyGGToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(MYGG_TOKEN_KEY)
}

export function setMyGGToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(MYGG_TOKEN_KEY, token)
  }
}

export function clearMyGGToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(MYGG_TOKEN_KEY)
  }
}

interface LoginResponse {
  success: boolean
  token?: string
  role?: string
  message?: string
  code?: string
}

export async function loginMyGG(identifier: string, password: string): Promise<LoginResponse> {
  const response = await fetch("/api/mygg/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })
  const payload = (await response.json()) as LoginResponse
  if (!response.ok || !payload.success) {
    throw new Error(payload.message || "MyGG authentication failed.")
  }
  if (payload.token) {
    setMyGGToken(payload.token)
  }
  return payload
}

interface BranchesResponse {
  success: boolean
  data: {
    items: MyGGBranch[]
    total: number
  }
}

interface StudentsResponse {
  success: boolean
  data: {
    items: MyGGStudent[]
    total: number
    page: number
    totalPages: number
  }
}

async function request<T>(path: string): Promise<T> {
  const token = getMyGGToken()
  const headers: Record<string, string> = {}
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(path, {
    cache: "no-store",
    headers,
  })
  const payload = (await response.json()) as T & MyGGApiError

  if (!response.ok) {
    const error = new Error(payload.message || `MyGG request failed (${response.status}).`) as Error & {
      code?: string
      status?: number
    }
    error.status = response.status
    error.code = payload.code
    throw error
  }

  return payload
}

export async function getMyGGBranches() {
  const response = await request<BranchesResponse>("/api/mygg/branches")
  return response.data.items
}

export async function getMyGGBranchStudents(branchCode: string, passoutYear?: string) {
  const students: MyGGStudent[] = []
  let page = 1
  let totalPages = 1

  do {
    const query = new URLSearchParams({
      status: "ACTIVE",
      limit: "100",
      page: String(page),
    })
    if (passoutYear) {
      query.set("passoutYear", passoutYear)
    }
    const response = await request<StudentsResponse>(
      `/api/mygg/branches/${encodeURIComponent(branchCode)}/students?${query.toString()}`,
    )
    students.push(...response.data.items)
    totalPages = response.data.totalPages
    page += 1
  } while (page <= totalPages)

  return students
}
