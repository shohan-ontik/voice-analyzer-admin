import { NextResponse } from "next/server";
import { ApiClientError, deleteChapter, updateChapter } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id, chapterId } = await params;
  const patch = (await request.json().catch(() => ({}))) as { title?: string; description?: string };

  try {
    const chapter = await updateChapter(token, id, chapterId, patch);
    return NextResponse.json(chapter);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Update chapter proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to update chapter." } }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id, chapterId } = await params;

  try {
    await deleteChapter(token, id, chapterId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Delete chapter proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to delete chapter." } }, { status: 502 });
  }
}
