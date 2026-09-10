import { NextResponse } from "next/server";
import { ApiClientError, deleteChapter, updateChapter } from "@/app/lib/apiClient";
import { generateChapterScenario } from "@/app/lib/generateChapterScenario";
import type { ChapterScenario } from "@/app/lib/types";
import { getSessionToken } from "@/app/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id, chapterId } = await params;
  const patch = (await request.json().catch(() => ({}))) as { title?: string; description?: string };

  // The chapter's topic changed — regenerate its roleplay scenario to
  // match, since there's no manual editor for it. A generation failure
  // just leaves the existing scenario in place (scenario omitted from the
  // patch) rather than blocking the rename.
  let scenario: ChapterScenario | undefined;
  if (patch.title !== undefined) {
    const generated = await generateChapterScenario(patch.title, patch.description);
    if (generated) scenario = generated;
  }

  try {
    const chapter = await updateChapter(token, id, chapterId, { ...patch, scenario });
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
