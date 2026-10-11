export async function POST(request: Request) {
  const backendUrl =
    process.env.MYGG_BACKEND_URL ||
    process.env.NEXT_PUBLIC_MYGG_BACKEND_URL ||
    "https://myggapi.shubhashish.me"

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON body." },
      { status: 400 },
    )
  }

  let endpoint: URL
  try {
    endpoint = new URL("auth/login", `${backendUrl.replace(/\/+$/, "")}/`)
  } catch {
    return Response.json(
      { success: false, message: "MYGG_BACKEND_URL must be a valid URL." },
      { status: 500 },
    )
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    })
    const data = await response.json()
    return Response.json(data, { status: response.status })
  } catch (error) {
    console.error("Login failed:", error)
    return Response.json(
      { success: false, message: "Could not reach the MyGG backend." },
      { status: 502 },
    )
  }
}
