import { NextResponse } from "next/server";
import { ApiClientError, uploadMaterial } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string; chapterId: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id, chapterId } = await params;

  const incoming = await request.formData().catch(() => null);
  const file = incoming?.get("file");
  const title = incoming?.get("title");
  if (!(file instanceof File) || typeof title !== "string" || !title) {
    return NextResponse.json({ error: { message: "A file and title are required." } }, { status: 400 });
  }

  const forward = new FormData();
  forward.set("file", file, file.name);
  forward.set("title", title);

  try {
    const material = await uploadMaterial(token, id, chapterId, forward);
    return NextResponse.json(material, { status: 201 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Upload material proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to upload this file." } }, { status: 502 });
  }
}
