import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Bookmark } from "../types/bookmark";

type BookmarkCardProps = {
  bookmark: Bookmark;
  isSelected?: boolean;
  onClick?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
};

const BookmarkCard = ({
  bookmark,
  isSelected = false,
  onClick,
  onToggleFavorite,
  onDelete,
}: BookmarkCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <article
      onClick={onClick}
      className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
        isSelected
          ? "border-brand-pink bg-brand-pink-light"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {bookmark.thumbnail ? (
          <img
            src={bookmark.thumbnail}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
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
            <img src={bookmark.favicon} alt="" className="h-4 w-4" />
          )}
          <span className="text-sm text-gray-500">{bookmark.domain}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-center gap-1 self-start">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.();
          }}
          className={`text-xl leading-none transition hover:scale-110 ${
            bookmark.isFavorite ? "text-brand-green" : "text-gray-300"
          }`}
          aria-label={
            bookmark.isFavorite ? "Remove from favorites" : "Add to favorites"
          }
        >
          {bookmark.isFavorite ? "★" : "☆"}
        </button>

        {confirmingDelete ? (
          <div
            className="flex flex-col items-center gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(false);
                onDelete?.();
              }}
              className="rounded-md bg-brand-pink px-2 py-1 text-xs font-medium text-white"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmingDelete(true);
            }}
            className="rounded-lg p-1 text-gray-300 transition hover:text-brand-pink"
            aria-label="Delete bookmark"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </article>
  );
};

export default BookmarkCard;