import { apiFetch } from "./client";
import type { Collection } from "../types/collection";

export async function fetchCollections(): Promise<Collection[]> {
  const response = await apiFetch("/collections");
  if (!response.ok) {
    throw new Error(`Failed to fetch collections: ${response.status}`);
  }
  const data = await response.json();
  return data.collections;
}

export async function createCollection(name: string): Promise<Collection> {
  const response = await apiFetch("/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to create collection: ${response.status}`);
  }
  return response.json();
}

export async function addBookmarkToCollection(collectionId: string, bookmarkId: string): Promise<void> {
  const response = await apiFetch(`/collections/${collectionId}/bookmarks`, {
    method: "POST",
    body: JSON.stringify({ bookmarkId }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to add to collection: ${response.status}`);
  }
}

export async function removeBookmarkFromCollection(collectionId: string, bookmarkId: string): Promise<void> {
  const response = await apiFetch(`/collections/${collectionId}/bookmarks/${bookmarkId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `Failed to remove from collection: ${response.status}`);
  }
}