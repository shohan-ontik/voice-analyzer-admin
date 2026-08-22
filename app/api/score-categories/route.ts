import { NextResponse } from "next/server";
import { ApiClientError, createScoreCategory, listScoreCategories } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listScoreCategories(token, {
      q: searchParams.get("q") ?? undefined,
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("List score categories proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load categories." } }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { name } = (await request.json().catch(() => ({}))) as { name?: string };
  if (!name) {
    return NextResponse.json({ error: { message: "Name is required." } }, { status: 400 });
  }

  try {
    const created = await createScoreCategory(token, { name });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Create score category proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to create category." } }, { status: 502 });
  }
}
