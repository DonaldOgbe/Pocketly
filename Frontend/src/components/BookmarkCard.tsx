import type { Bookmark } from "../types/bookmark";

type BookmarkCardProps = {
  bookmark: Bookmark;
};

const BookmarkCard = ({ bookmark }: BookmarkCardProps) => {
  return (
    <article className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm">
      <div className="h-24 w-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {bookmark.thumbnail ? (
          <img
            src={bookmark.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No image
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="line-clamp-2 text-base font-semibold text-gray-900">
          {bookmark.title ?? "Untitled page"}
        </h2>

        <div className="mt-2 flex items-center gap-2">
          {bookmark.favicon && (
            <img
              src={bookmark.favicon}
              alt=""
              className="h-4 w-4"
            />
          )}

          <span className="text-sm text-gray-500">
            {bookmark.domain}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="shrink-0 self-start text-xl"
        aria-label={
          bookmark.isFavorite
            ? "Remove from favorites"
            : "Add to favorites"
        }
      >
        {bookmark.isFavorite ? "★" : "☆"}
      </button>
    </article>
  );
};

export default BookmarkCard;