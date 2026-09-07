export type Bookmark = {
  id: string;
  url: string;
  domain: string;
  title: string | null;
  thumbnail: string | null;
  favicon: string | null;
  description: string | null;
  isFavorite: boolean;
};