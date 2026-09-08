import "server-only";
import type {
  AdminModuleDetail,
  AdminModuleSummary,
  AdminStatsSummary,
  AdminUser,
  ApiErrorBody,
  CreatedUser,
  ScoreCategory,
  ScoreCategoryListResult,
  Topic,
  TopicListResult,
  UserListResult,
} from "./types";

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

  if (res.status === 204) {
    return undefined as T;
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

export function createUser(token: string, input: { email: string; name: string; employeeId?: string }) {
  return request<CreatedUser>("/admin/users", { method: "POST", token, body: input });
}

export function banUser(token: string, id: string) {
  return request<AdminUser>(`/admin/users/${id}/ban`, { method: "POST", token });
}

export function unbanUser(token: string, id: string) {
  return request<AdminUser>(`/admin/users/${id}/unban`, { method: "POST", token });
}

export function getAdminStatsSummary(token: string) {
  return request<AdminStatsSummary>("/admin/stats/summary", { token });
}

export function listTopics(token: string, params: { q?: string; isActive?: boolean } = {}) {
  return request<TopicListResult>("/admin/topics", {
    token,
    searchParams: {
      q: params.q,
      isActive: params.isActive === undefined ? undefined : String(params.isActive),
    },
  });
}

export function createTopic(token: string, input: { name: string; passage: string }) {
  return request<Topic>("/admin/topics", { method: "POST", token, body: input });
}

export function updateTopic(
  token: string,
  id: string,
  patch: { name?: string; passage?: string; isActive?: boolean }
) {
  return request<Topic>(`/admin/topics/${id}`, { method: "PATCH", token, body: patch });
}

export function deleteTopic(token: string, id: string) {
  return request<void>(`/admin/topics/${id}`, { method: "DELETE", token });
}

export function listScoreCategories(token: string, params: { q?: string; isActive?: boolean } = {}) {
  return request<ScoreCategoryListResult>("/admin/score-categories", {
    token,
    searchParams: {
      q: params.q,
      isActive: params.isActive === undefined ? undefined : String(params.isActive),
    },
  });
}

export function createScoreCategory(token: string, input: { name: string }) {
  return request<ScoreCategory>("/admin/score-categories", { method: "POST", token, body: input });
}

export function updateScoreCategory(token: string, id: string, patch: { name?: string; isActive?: boolean }) {
  return request<ScoreCategory>(`/admin/score-categories/${id}`, { method: "PATCH", token, body: patch });
}

export function deleteScoreCategory(token: string, id: string) {
  return request<void>(`/admin/score-categories/${id}`, { method: "DELETE", token });
}

export function listAdminModules(token: string) {
  return request<{ items: AdminModuleSummary[] }>("/admin/modules", { token });
}

export function createAdminModule(token: string, input: { title: string; description?: string; thumbnailUrl?: string }) {
  return request<AdminModuleSummary>("/admin/modules", { method: "POST", token, body: input });
}

export function getAdminModule(token: string, id: string) {
  return request<AdminModuleDetail>(`/admin/modules/${id}`, { token });
}

export function updateAdminModule(
  token: string,
  id: string,
  patch: { title?: string; description?: string; thumbnailUrl?: string; isActive?: boolean }
) {
  return request<AdminModuleSummary>(`/admin/modules/${id}`, { method: "PATCH", token, body: patch });
}
