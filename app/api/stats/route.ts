import { NextResponse } from "next/server";
import { ApiClientError, getAdminStatsSummary } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET() {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  try {
    const stats = await getAdminStatsSummary(token);
    return NextResponse.json(stats);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Stats proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load stats." } }, { status: 502 });
  }
}
