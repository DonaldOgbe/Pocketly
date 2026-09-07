import { apiFetch } from "./client";
import type { Bookmark } from "../types/bookmark";

export async function createBookmark(url: string, isFavorite: boolean): Promise<Bookmark> {
  const response = await apiFetch("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ url, isFavorite }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to save bookmark: ${response.status}`);
  }

  return response.json();
}