import "server-only";
import { ApiClientError, listScoreCategories } from "../../lib/apiClient";
import { getSessionToken } from "../../lib/session";
import type { ScoreCategory } from "../../lib/types";

export async function loadCategories(): Promise<{ categories: ScoreCategory[]; error: string | null }> {
  const token = await getSessionToken();
  if (!token) {
    return { categories: [], error: "Not authenticated." };
  }

  try {
    const result = await listScoreCategories(token);
    return { categories: result.items, error: null };
  } catch (err) {
    return {
      categories: [],
      error: err instanceof ApiClientError ? err.message : "Failed to load categories.",
    };
  }
}
