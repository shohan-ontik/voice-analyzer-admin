import { NextResponse } from "next/server";
import { ApiClientError, banUser } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const user = await banUser(token, id);
    return NextResponse.json(user);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Ban user proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to ban user." } }, { status: 502 });
  }
}
