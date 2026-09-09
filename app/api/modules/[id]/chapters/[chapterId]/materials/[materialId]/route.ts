import { NextResponse } from "next/server";
import { ApiClientError, deleteMaterial } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; chapterId: string; materialId: string }> }
) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id, chapterId, materialId } = await params;

  try {
    await deleteMaterial(token, id, chapterId, materialId);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Delete material proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to delete this material." } }, { status: 502 });
  }
}
