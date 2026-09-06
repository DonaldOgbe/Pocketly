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