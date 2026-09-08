import { NextResponse } from "next/server";
import { ApiClientError, getMe } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  try {
    const user = await getMe(token);
    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Me proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load current user." } }, { status: 502 });
  }
}
