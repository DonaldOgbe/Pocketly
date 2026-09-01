import { apiFetch } from "./client";
import type { Bookmark } from "../types/bookmark";

export async function fetchBookmarks(): Promise<Bookmark[]> {
  const response = await apiFetch("/bookmarks");

  if (!response.ok) {
    throw new Error(`Failed to fetch bookmarks: ${response.status}`);
  }

  return response.json();
}