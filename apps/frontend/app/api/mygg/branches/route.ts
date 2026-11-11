import { proxyMyGGRequest } from "@/lib/mygg-server"

export async function GET(request: Request) {
  return proxyMyGGRequest(request, "/admin/portfolio/branches")
}
