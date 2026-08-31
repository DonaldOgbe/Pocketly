import BookmarkCard from "../components/BookmarkCard";
import type { Bookmark } from "../types/bookmark";

const mockBookmarks: Bookmark[] = [
  {
    id: "1",
    userId: "user-1",
    url: "https://github.com/DonaldOgbe/Pocketly/issues/17",
    domain: "github.com",
    title: "[12] POST /bookmarks · Issue #17 · DonaldOgbe/Pocketly",
    metadataStatus: "SUCCESS",
    thumbnail:
      "https://opengraph.githubassets.com/1133f0e6240bb6665e3ab19ce07629c83d82bb00939884d3de132c03354c04e3/DonaldOgbe/Pocketly/issues/17",
    favicon: "https://github.githubassets.com/favicons/favicon.svg",
    description:
      "Validate an incoming URL and create the record immediately.",
    isFavorite: true,
    isRead: false,
    savedAt: "2026-08-20T11:07:32.103Z",
    readAt: null,
  },
  {
    id: "2",
    userId: "user-1",
    url: "https://react.dev/",
    domain: "react.dev",
    title: "React",
    metadataStatus: "SUCCESS",
    thumbnail: null,
    favicon: null,
    description: "The library for web and native user interfaces.",
    isFavorite: false,
    isRead: false,
    savedAt: "2026-08-19T10:00:00.000Z",
    readAt: null,
  },
];

const BookmarksPage = () => {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-8 py-10">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            All Bookmarks
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Your saved articles
          </p>
        </header>

        <section className="space-y-3">
          {mockBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark.id}
              bookmark={bookmark}
            />
          ))}
        </section>
      </div>
    </main>
  );
};

export default BookmarksPage;