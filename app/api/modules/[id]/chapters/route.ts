import { NextResponse } from "next/server";
import { ApiClientError, createChapter } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;
  const { title, description } = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
  };
  if (!title) {
    return NextResponse.json({ error: { message: "Title is required." } }, { status: 400 });
  }

  try {
    const chapter = await createChapter(token, id, { title, description });
    return NextResponse.json(chapter, { status: 201 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Create chapter proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to create chapter." } }, { status: 502 });
  }
}
