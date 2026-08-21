import { NextResponse } from "next/server";
import { ApiClientError, createTopic, listTopics } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listTopics(token, {
      q: searchParams.get("q") ?? undefined,
      isActive: searchParams.has("isActive") ? searchParams.get("isActive") === "true" : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("List topics proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load topics." } }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { name, passage } = (await request.json().catch(() => ({}))) as { name?: string; passage?: string };
  if (!name || !passage) {
    return NextResponse.json({ error: { message: "Name and passage are required." } }, { status: 400 });
  }

  try {
    const created = await createTopic(token, { name, passage });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Create topic proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to create topic." } }, { status: 502 });
  }
}
