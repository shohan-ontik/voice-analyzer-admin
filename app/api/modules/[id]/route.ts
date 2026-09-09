import { NextResponse } from "next/server";
import { ApiClientError, deleteAdminModule, getAdminModule, updateAdminModule } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    const trainingModule = await getAdminModule(token, id);
    return NextResponse.json(trainingModule);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Get module proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load this module." } }, { status: 502 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;
  const patch = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    isActive?: boolean;
    publishDate?: string | null;
  };

  try {
    const updated = await updateAdminModule(token, id, patch);
    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Update module proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to update this module." } }, { status: 502 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { id } = await params;

  try {
    await deleteAdminModule(token, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Delete module proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to delete this module." } }, { status: 502 });
  }
}
