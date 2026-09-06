import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import BookmarkCard from "../components/BookmarkCard";
import BookmarkPreview from "../components/BookmarkPreview";
import SaveBookmarkModal from "../components/SaveBookmarkModal";
import { deleteBookmark, fetchBookmarks, toggleFavorite } from "../api/bookmarks";
import { fetchCollections } from "../api/collection";
import { fetchTags } from "../api/tags";
import type { Bookmark, BookmarkFilter } from "../types/bookmark";
import type { Collection } from "../types/collection";
import type { Tag } from "../types/tag";

type BookmarksPageProps = {
  filter: BookmarkFilter;
};

const PAGE_SIZE = 10;

const filterTitle = (filter: BookmarkFilter): string => {
  switch (filter.type) {
    case "favorites":
      return "Favorites";
    case "tag":
      return `#${filter.name}`;
    case "collection":
      return filter.name;
    default:
      return "All Bookmarks";
  }
};

const BookmarksPage = ({ filter }: BookmarksPageProps) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const latestRequest = useRef(0);

  const [prevFilter, setPrevFilter] = useState(filter);
  if (prevFilter !== filter) {
    setPrevFilter(filter);
    setSelectedId(null);
    setIsLoading(true);
    setPage(1);
  }

  useEffect(() => {
    fetchCollections().then(setCollections).catch((err) => console.error("Failed to load collections", err));
    fetchTags().then(setTags).catch((err) => console.error("Failed to load tags", err));
  }, []);

  useEffect(() => {
    const requestId = latestRequest.current + 1;
    latestRequest.current = requestId;

    fetchBookmarks(page, filter, search)
      .then((data) => {
        if (requestId !== latestRequest.current) return;
        setBookmarks(data.bookmarks);
        setTotal(data.total);
        setTotalPages(Math.max(data.totalPages, 1));
        setError(null);
      })
      .catch((err) => {
        if (requestId !== latestRequest.current) return;
        setError(err.message);
      })
      .finally(() => {
        if (requestId === latestRequest.current) setIsLoading(false);
      });
  }, [filter, page, search]);

  const selectedBookmark = bookmarks.find((b) => b.id === selectedId) ?? null;

  const handleSaved = (bookmark: Bookmark) => {
    // POST /bookmarks doesn't include tags/collections, default to empty
    setBookmarks((prev) => [
      { ...bookmark, tags: bookmark.tags ?? [], collections: bookmark.collections ?? [] },
      ...prev,
    ]);
    setTotal((prev) => prev + 1);
  };

  const handleDelete = async (id: string) => {
    const previous = bookmarks;

    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    setTotal((prev) => Math.max(prev - 1, 0));
    if (selectedId === id) setSelectedId(null);

    try {
      await deleteBookmark(id);
    } catch (err) {
      setBookmarks(previous);
      setTotal((prev) => prev + 1);
      setError(err instanceof Error ? err.message : "Couldn't delete bookmark");
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setPage(1);
    setSearch(searchInput);
  };

  const handleToggleFavorite = async (id: string) => {
    setBookmarks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
    );

    try {
      const updated = await toggleFavorite(id);
      // PATCH response also lacks tags/collections, preserve what we already had
      setBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...updated, tags: b.tags, collections: b.collections } : b))
      );
    } catch {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isFavorite: !b.isFavorite } : b))
      );
    }
  };

  const updateBookmarkRelations = (id: string, updater: (bookmark: Bookmark) => Bookmark) => {
    setBookmarks((prev) => prev.map((b) => (b.id === id ? updater(b) : b)));
  };

  return (
    <div className="flex">
      <main className="min-h-screen flex-1 bg-gray-50 font-sans">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                {filterTitle(filter)}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {isLoading
                  ? "Loading…"
                  : total === 0
                    ? "No bookmarks"
                    : totalPages > 1
                      ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total} bookmarks`
                      : `${total} ${total === 1 ? "bookmark" : "bookmarks"}`}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search bookmarks..."
                  className="w-56 rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-9 text-sm text-gray-700 outline-none focus:border-brand-pink"
                />
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute right-0 top-0 flex h-full w-9 items-center justify-center text-gray-400 transition hover:text-brand-pink"
                >
                  <Search size={15} />
                </button>
              </form>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
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
                <p className="text-sm text-gray-400">No bookmarks here yet.</p>
              ) : (
                bookmarks.map((bookmark) => (
                  <BookmarkCard
                    key={bookmark.id}
                    bookmark={bookmark}
                    isSelected={bookmark.id === selectedId}
                    onClick={() => setSelectedId(bookmark.id)}
                    onToggleFavorite={() => handleToggleFavorite(bookmark.id)}
                    onDelete={() => handleDelete(bookmark.id)}
                  />
                ))
              )}
            </section>
          )}

          {!error && totalPages > 1 && (
            <nav className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage((p) => Math.max(p - 1, 1));
                }}
                disabled={page === 1}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setPage((p) => Math.min(p + 1, totalPages));
                }}
                disabled={page === totalPages}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
              >
                Next
              </button>
            </nav>
          )}
        </div>
      </main>

      {selectedBookmark && (
        <BookmarkPreview
          bookmark={selectedBookmark}
          collections={collections}
          tags={tags}
          onClose={() => setSelectedId(null)}
          onUpdateRelations={updateBookmarkRelations}
        />
      )}

      {isModalOpen && (
        <SaveBookmarkModal onClose={() => setIsModalOpen(false)} onSaved={handleSaved} />
      )}
    </div>
  );
};

export default BookmarksPage;