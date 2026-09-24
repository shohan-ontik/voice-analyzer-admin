import { NextResponse } from "next/server";
import { ApiClientError, createAdminModule, listAdminModules } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listAdminModules(token, {
      page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
      pageSize: searchParams.has("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
      q: searchParams.get("q") ?? undefined,
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("List modules proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load modules." } }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { title, description, thumbnailUrl } = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  };
  if (!title) {
    return NextResponse.json({ error: { message: "Title is required." } }, { status: 400 });
  }

  try {
    const created = await createAdminModule(token, { title, description, thumbnailUrl });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Create module proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to create module." } }, { status: 502 });
  }
}
