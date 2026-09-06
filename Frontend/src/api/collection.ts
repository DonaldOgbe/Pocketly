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