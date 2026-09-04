import { apiFetch } from "./client";
import type { BookmarksResponse, Bookmark } from "../types/bookmark";

export async function fetchBookmarks(page = 1): Promise<BookmarksResponse> {
  const response = await apiFetch(`/bookmarks?page=${page}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status}`);
  }

  return response.json();
}

export async function createBookmark(url: string): Promise<Bookmark> {
  const response = await apiFetch("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to save bookmark: ${response.status}`);
  }

  return response.json();
}