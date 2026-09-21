import { NextResponse } from "next/server";
import { ApiClientError, createUser, listUsers } from "@/app/lib/apiClient";
import { getSessionToken } from "@/app/lib/session";

export async function GET(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  try {
    const result = await listUsers(token, {
      page: searchParams.has("page") ? Number(searchParams.get("page")) : undefined,
      pageSize: searchParams.has("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
      q: searchParams.get("q") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("List users proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to load users." } }, { status: 502 });
  }
}

export async function POST(request: Request) {
  const token = await getSessionToken();
  if (!token) {
    return NextResponse.json({ error: { message: "Not authenticated." } }, { status: 401 });
  }

  const { username, phone, name, employeeId } = (await request.json().catch(() => ({}))) as {
    username?: string;
    phone?: string;
    name?: string;
    employeeId?: string;
  };
  if (!username || !phone || !name) {
    return NextResponse.json({ error: { message: "Username, phone, and name are required." } }, { status: 400 });
  }

  try {
    const created = await createUser(token, { username, phone, name, employeeId: employeeId || undefined });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err instanceof ApiClientError) {
      return NextResponse.json({ error: { message: err.message } }, { status: err.status });
    }
    console.error("Create user proxy failed:", err);
    return NextResponse.json({ error: { message: "Failed to create user." } }, { status: 502 });
  }
}
