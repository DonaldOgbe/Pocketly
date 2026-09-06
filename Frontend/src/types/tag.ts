export type Tag = {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  _count: {
    bookmarks: number;
  };
};