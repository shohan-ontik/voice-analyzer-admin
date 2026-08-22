import { NextResponse } from "next/server";
import { ApiClientError, deleteScoreCategory, updateScoreCategory } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;
  const patch = (await request.json().catch(() => ({}))) as { name?: string; isActive?: boolean };

  try {
    const updated = await updateScoreCategory(token, id, patch);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Update score category proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to update category." } }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteScoreCategory(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Delete score category proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to delete category." } }, { status: 502 });
  }
}
