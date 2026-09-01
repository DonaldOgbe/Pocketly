export type MetadataStatus = "PENDING" | "SUCCESS" | "FAILED";

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
};

export type BookmarksResponse = {
  bookmarks: Bookmark[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};