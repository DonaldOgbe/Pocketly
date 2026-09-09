import { apiFetch, ApiError } from "./client";
import { DEFAULT_FILTER } from "../types/bookmark";
import type { BookmarksResponse, Bookmark, BookmarkFilter } from "../types/bookmark";


export async function fetchBookmarks(
  page = 1,
  filter: BookmarkFilter = DEFAULT_FILTER,
  search?: string
): Promise<BookmarksResponse> {
  const params = new URLSearchParams({ page: String(page) });

  if (search?.trim()) {
    params.set("q", search.trim());
  }

  if (filter.scope.type === "favorites") {
    params.set("favorite", "true");
  } else if (filter.scope.type === "unread") {
    params.set("read", "false");
  } else if (filter.scope.type === "collection") {
    params.set("collection", filter.scope.id);
  }

  if (filter.tag) {
    params.set("tag", filter.tag.id);
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

export async function setRead(id: string, isRead: boolean): Promise<Bookmark> {
  const response = await apiFetch(`/bookmarks/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ isRead }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.error ?? `Failed to update bookmark: ${response.status}`
    );
  }

  return response.json();
}
