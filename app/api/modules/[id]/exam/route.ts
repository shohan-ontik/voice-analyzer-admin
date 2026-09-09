import { NextResponse } from "next/server";
import { ApiClientError, upsertExam } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;
  const patch = (await request.json().catch(() => ({}))) as {
    scenario?: string;
    deadlineDays?: number | null;
    passMark?: number;
  };

  try {
    const exam = await upsertExam(token, id, patch);
    return NextResponse.json(exam);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Upsert exam proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to save the exam." } }, { status: 502 });
  }
}
