import { apiFetch, ApiError } from "./client";
import type { Bookmark } from "../types/bookmark";

export type SaveResult = {
  bookmark: Bookmark;
  alreadySaved: boolean;
};

export async function createBookmark(url: string, isFavorite: boolean): Promise<SaveResult> {
  const response = await apiFetch("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ url, isFavorite }),
  });

  if (response.status === 409) {
    const body = await response.json().catch(() => null);

    // The page is already saved, so hand back the existing bookmark and let
    // the caller finish applying the collection and tags to it.
    if (body?.bookmark) {
      return { bookmark: body.bookmark as Bookmark, alreadySaved: true };
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      body?.error ?? `Failed to save bookmark: ${response.status}`
    );
  }

  return { bookmark: await response.json(), alreadySaved: false };
}
