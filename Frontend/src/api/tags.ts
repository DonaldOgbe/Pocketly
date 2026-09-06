import { apiFetch } from "./client";
import type { Tag } from "../types/tag";

export async function fetchTags(): Promise<Tag[]> {
  const response = await apiFetch("/tags");
  if (!response.ok) {
    throw new Error(`Failed to fetch tags: ${response.status}`);
  }
  const data = await response.json();
  return data.tags;
}

export async function createTag(name: string): Promise<Tag> {
  const response = await apiFetch("/tags", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to create tag: ${response.status}`);
  }
  return response.json();
}

export async function addBookmarkToTag(tagId: string, bookmarkId: string): Promise<void> {
  const response = await apiFetch(`/tags/${tagId}/bookmarks`, {
    method: "POST",
    body: JSON.stringify({ bookmarkId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to add tag: ${response.status}`);
  }
}

export async function removeBookmarkFromTag(tagId: string, bookmarkId: string): Promise<void> {
  const response = await apiFetch(`/tags/${tagId}/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to remove tag: ${response.status}`);
  }
}