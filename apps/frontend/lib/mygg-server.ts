async function hasPortalAccess(token?: string, sessionCookie?: string) {
  const portalBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
  if (token) {
    const validateUrl = new URL("/api/validate-token", portalBackendUrl)
    const response = await fetch(validateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      cache: "no-store",
    })
    if (response.ok) {
      const result = (await response.json()) as { success?: boolean }
      if (result.success === true) return true
    }
  }

  if (sessionCookie) {
    const sessionUrl = new URL("/api/check-session", portalBackendUrl)
    const response = await fetch(sessionUrl, {
      headers: { Cookie: `tpo_session=${sessionCookie}` },
      cache: "no-store",
    })
    if (response.ok) {
      const result = (await response.json()) as { success?: boolean }
      return result.success === true
    }
  }

  return false
}

export async function proxyMyGGRequest(request: Request, path: string, query?: URLSearchParams) {
  const portalToken = request.headers.get("X-TPO-Access-Token")
  if (portalToken && portalToken.length > 4096) {
    return Response.json(
      { success: false, message: "The TPO portal access token is invalid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    )
  }

  const sessionCookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("tpo_session="))
    ?.slice("tpo_session=".length)

  try {
    if (!(await hasPortalAccess(portalToken || undefined, sessionCookie))) {
      return Response.json(
        { success: false, message: "A valid TPO portal session is required to view MyGG portfolios." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      )
    }
  } catch (error) {
    console.error("Failed to validate TPO portal access for MyGG:", error)
    return Response.json(
      { success: false, message: "Could not validate your TPO portal access. Please try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }

  const backendUrl = process.env.MYGG_BACKEND_URL
  const adminToken = process.env.MYGG_ADMIN_TOKEN

  if (!backendUrl || !adminToken) {
    return Response.json(
      {
        success: false,
        message: "MyGG is not configured. Set MYGG_BACKEND_URL and MYGG_ADMIN_TOKEN on the server.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    )
  }

  let endpoint: URL
  try {
    endpoint = new URL(path, `${backendUrl.replace(/\/+$/, "")}/`)
  } catch {
    return Response.json(
      { success: false, message: "MYGG_BACKEND_URL must be a valid URL." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    )
  }
  if (query) endpoint.search = query.toString()

  try {
    const response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${adminToken}` },
      cache: "no-store",
    })
    const headers = new Headers({
      "Cache-Control": "no-store",
      "Content-Type": response.headers.get("Content-Type") || "application/json",
    })
    return new Response(response.body, { status: response.status, headers })
  } catch (error) {
    console.error("Failed to reach the MyGG backend:", error)
    return Response.json(
      { success: false, message: "Could not reach the MyGG backend. Check MYGG_BACKEND_URL and try again." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    )
  }
}
