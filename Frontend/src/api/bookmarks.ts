import { apiFetch } from "./client";
import type { BookmarksResponse, Bookmark, BookmarkFilter } from "../types/bookmark";


export async function fetchBookmarks(
  page = 1,
  filter: BookmarkFilter = { type: "all" },
  search?: string
): Promise<BookmarksResponse> {
  const params = new URLSearchParams({ page: String(page) });

  if (search?.trim()) {
    params.set("q", search.trim());
  }

  if (filter.type === "favorites") {
    params.set("favorite", "true");
  } else if (filter.type === "tag") {
    params.set("tag", filter.id);
  } else if (filter.type === "collection") {
    params.set("collection", filter.id);
  }

  const response = await apiFetch(`/bookmarks?${params.toString()}`);

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

export async function toggleFavorite(id: string): Promise<Bookmark> {
  const response = await apiFetch(`/bookmarks/${id}/favorite`, {
    method: "PATCH",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to toggle favorite: ${response.status}`);
  }

  return response.json();
}

export async function deleteBookmark(id: string): Promise<void> {
  const response = await apiFetch(`/bookmarks/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to delete bookmark: ${response.status}`);
  }
}
