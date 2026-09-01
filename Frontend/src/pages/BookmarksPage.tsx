import { useEffect, useState } from "react";
import BookmarkCard from "../components/BookmarkCard";
import BookmarkPreview from "../components/BookmarkPreview";
import { fetchBookmarks } from "../api/bookmarks";
import type { Bookmark } from "../types/bookmark";

const BookmarksPage = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    fetchBookmarks()
      .then((data) => {
        if (isMounted) setBookmarks(data.bookmarks);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedBookmark = bookmarks.find((b) => b.id === selectedId) ?? null;

  return (
    <div className="flex">
      <main className="min-h-screen flex-1 bg-gray-50 font-sans">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                All Bookmarks
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading ? "Loading…" : `${bookmarks.length} bookmarks`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search bookmarks..."
                className="hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-brand-pink sm:block"
              />
              <button
                type="button"
                className="rounded-lg bg-brand-pink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                + Save
              </button>
            </div>
          </header>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Couldn't load bookmarks: {error}
            </div>
          )}

          {!error && (
            <section className="space-y-3">
              {isLoading ? (
                <p className="text-sm text-gray-400">Loading bookmarks…</p>
              ) : bookmarks.length === 0 ? (
                <p className="text-sm text-gray-400">No bookmarks yet.</p>
              ) : (
                bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    isSelected={bookmark.id === selectedId}
                    onClick={() => setSelectedId(bookmark.id)}
                  />
                ))
              )}
            </section>
          )}
        </div>
      </main>

      {selectedBookmark && (
        <BookmarkPreview
          bookmark={selectedBookmark}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
};

export default BookmarksPage;