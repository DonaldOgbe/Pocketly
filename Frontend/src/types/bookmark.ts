export type MetadataStatus = "PENDING" | "SUCCESS" | "FAILED";

export type BookmarkRef = {
  id: string;
  name: string;
};

export type Bookmark = {
  id: string;
  userId: string;
  url: string;
  domain: string;
  title: string | null;
  metadataStatus: MetadataStatus;
  thumbnail: string | null;
  favicon: string | null;
  description: string | null;
  isFavorite: boolean;
  isRead: boolean;
  savedAt: string;
  readAt: string | null;
  tags: BookmarkRef[];
  collections: BookmarkRef[];
};

export type BookmarksResponse = {
  bookmarks: Bookmark[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type BookmarkScope =
  | { type: "all" }
  | { type: "favorites" }
  | { type: "collection"; id: string; name: string };

// Scope and tag apply together, so a tag narrows whichever scope is selected.
export type BookmarkFilter = {
  scope: BookmarkScope;
  tag?: BookmarkRef;
};

export const DEFAULT_FILTER: BookmarkFilter = { scope: { type: "all" } };
