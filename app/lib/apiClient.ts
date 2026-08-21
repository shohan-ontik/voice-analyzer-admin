import "server-only";
import type { AdminUser, ApiErrorBody, CreatedUser, UserListResult } from "./types";

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:4000/api/v1";

export class ApiClientError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: { method?: string; token?: string | null; body?: unknown; searchParams?: Record<string, string | undefined> } = {}
): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options.searchParams) {
    for (const [key, value] of Object.entries(options.searchParams)) {
      if (value !== undefined) url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiClientError(res.status, body?.error?.message ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export function loginRequest(email: string, password: string) {
  return request<{ accessToken: string; user: AdminUser }>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function getMe(token: string) {
  return request<AdminUser>("/auth/me", { token });
}

export function listUsers(token: string, params: { page?: number; pageSize?: number; q?: string } = {}) {
  return request<UserListResult>("/admin/users", {
    token,
    searchParams: {
      page: params.page?.toString(),
      pageSize: params.pageSize?.toString(),
      q: params.q,
    },
  });
}

export function createUser(token: string, input: { email: string; name: string }) {
  return request<CreatedUser>("/admin/users", { method: "POST", token, body: input });
}

export function banUser(token: string, id: string) {
  return request<AdminUser>(`/admin/users/${id}/ban`, { method: "POST", token });
}

export function unbanUser(token: string, id: string) {
  return request<AdminUser>(`/admin/users/${id}/unban`, { method: "POST", token });
}
