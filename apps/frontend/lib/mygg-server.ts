export async function proxyMyGGRequest(request: Request, path: string, query?: URLSearchParams) {
  const backendUrl = process.env.MYGG_BACKEND_URL || process.env.NEXT_PUBLIC_MYGG_BACKEND_URL || "https://myggapi.shubhashish.me"

  let endpoint: URL
  try {
    endpoint = new URL(path.replace(/^\/+/, ""), `${backendUrl.replace(/\/+$/, "")}/`)
  } catch {
    return Response.json(
      { success: false, message: "MYGG_BACKEND_URL must be a valid URL." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
  if (query) endpoint.search = query.toString()

  const authHeader =
    request.headers.get("Authorization") ||
    (process.env.MYGG_ADMIN_TOKEN ? `Bearer ${process.env.MYGG_ADMIN_TOKEN}` : null)

  const headers: Record<string, string> = {}
  if (authHeader) {
    headers["Authorization"] = authHeader
  }

  try {
    const response = await fetch(endpoint, {
      headers,
      cache: "no-store",
    })
    const responseHeaders = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("Content-Type") || "application/json",
    })
    return new Response(response.body, { status: response.status, headers: responseHeaders })
  } catch (error) {
    console.error("Failed to reach the MyGG backend:", error)
    return Response.json(
      { success: false, message: "Could not reach the MyGG backend. Check MYGG_BACKEND_URL and try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}
