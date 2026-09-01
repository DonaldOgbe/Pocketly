import { apiFetch } from "./client";
import type { BookmarksResponse } from "../types/bookmark";

export async function fetchBookmarks(page = 1): Promise<BookmarksResponse> {
  const response = await apiFetch(`/bookmarks?page=${page}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status}`);
  }

  return response.json();
}