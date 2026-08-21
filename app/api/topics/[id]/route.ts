import { NextResponse } from "next/server";
import { ApiClientError, deleteTopic, updateTopic } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;
  const patch = (await request.json().catch(() => ({}))) as {
    name?: string;
    passage?: string;
    isActive?: boolean;
  };

  try {
    const updated = await updateTopic(token, id, patch);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Update topic proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to update topic." } }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteTopic(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Delete topic proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to delete topic." } }, { status: 502 });
  }
}
