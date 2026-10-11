import type { MyGGApiError, MyGGBranch, MyGGStudent } from "@/types/mygg"
import { getStoredToken } from "@/lib/token"

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
  const token = getStoredToken()
  const response = await fetch(path, {
    cache: "no-store",
    headers: token ? { "X-TPO-Access-Token": token } : {},
  })
  const payload = (await response.json()) as T & MyGGApiError

  if (!response.ok) {
    if (payload.message) throw new Error(payload.message)
    if (response.status === 401) {
      throw new Error("MyGG authentication failed. Check the configured admin token.")
    }
    if (response.status === 403) {
      throw new Error("MyGG access denied. The token must belong to an ADMIN with EXPORT_STUDENT_PROFILES permission.")
    }
    throw new Error(`MyGG request failed (${response.status}).`)
  }

  return payload
}

export async function getMyGGBranches() {
  const response = await request<BranchesResponse>("/api/mygg/branches")
  return response.data.items
}

export async function getMyGGBranchStudents(branchCode: string, passoutYear: string) {
  const students: MyGGStudent[] = []
  let page = 1
  let totalPages = 1

  do {
    const query = new URLSearchParams({
      status: "ACTIVE",
      limit: "100",
      page: String(page),
      passoutYear,
    })
    const response = await request<StudentsResponse>(
      `/api/mygg/branches/${encodeURIComponent(branchCode)}/students?${query.toString()}`,
    )
    students.push(...response.data.items)
    totalPages = response.data.totalPages
    page += 1
  } while (page <= totalPages)

  return students
}
