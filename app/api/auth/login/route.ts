import { NextResponse } from "next/server";
import { ApiClientError, loginRequest } from "@/app/lib/apiClient";
import { setSessionCookie } from "@/app/lib/session";

export async function POST(request: Request) {
  const { email, password } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: { message: "Email and password are required." } }, { status: 400 });
  }

  try {
    const { accessToken, user } = await loginRequest(email, password);

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: { message: "This login is for administrators only." } },
        { status: 403 }
      );
    }

    await setSessionCookie(accessToken);
    return NextResponse.json({ user });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Login proxy failed:", err);
    return NextResponse.json({ error: { message: "Login failed. Please try again." } }, { status: 502 });
  }
}
