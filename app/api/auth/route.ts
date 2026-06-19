import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Checks a submitted password against the ADMIN_PASSWORD env var.
// Kept server-side so the password is never shipped to the client.
export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD is not configured on the server." },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = await req.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    /* ignore malformed body */
  }

  if (password && password === expected) {
    // Opaque token stored client-side purely to gate the admin UI.
    return NextResponse.json({ ok: true, token: "gn-admin-ok" });
  }

  return NextResponse.json({ ok: false, error: "Wrong password." }, { status: 401 });
}
