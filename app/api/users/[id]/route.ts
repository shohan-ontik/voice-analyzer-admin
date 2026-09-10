import { NextResponse } from "next/server";
import { ApiClientError, deleteUser } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteUser(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Delete user proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to delete user." } }, { status: 502 });
  }
}
