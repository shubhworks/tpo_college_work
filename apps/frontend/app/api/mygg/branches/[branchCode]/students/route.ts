import { proxyMyGGRequest } from "@/lib/mygg-server"

interface RouteContext {
  params: Promise<{ branchCode: string }>
}

export async function GET(request: Request, { params }: RouteContext) {
  const { branchCode } = await params
  if (!/^[a-zA-Z0-9_-]+$/.test(branchCode)) {
    return Response.json(
      { success: false, message: "Invalid branch code" },
      { status: 400 },
    )
  }

  const searchParams = new URL(request.url).searchParams
  const query = new URLSearchParams()
  for (const key of ["status", "page", "limit", "passoutYear", "admissionYear", "currentSemester", "section", "search"]) {
    const value = searchParams.get(key)
    if (value) query.set(key, value)
  }

  return proxyMyGGRequest(
    request,
    `/admin/portfolio/branches/${encodeURIComponent(branchCode)}/students`,
    query,
  )
}
