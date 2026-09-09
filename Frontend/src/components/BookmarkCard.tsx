import { useState } from "react";
import { Check, Trash2, Undo2 } from "lucide-react";
import type { Bookmark, BookmarkRef } from "../types/bookmark";

type BookmarkCardProps = {
  bookmark: Bookmark;
  isSelected?: boolean;
  onClick?: () => void;
  onToggleFavorite?: () => void;
  onDelete?: () => void;
  onToggleRead?: () => void;
  onSelectTag?: (tag: BookmarkRef) => void;
  activeTagId?: string;
};

const BookmarkCard = ({
  bookmark,
  isSelected = false,
  onClick,
  onToggleFavorite,
  onDelete,
  onToggleRead,
  onSelectTag,
  activeTagId,
}: BookmarkCardProps) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <article
      onClick={onClick}
      className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition ${
        isSelected
          ? "border-brand-pink bg-brand-pink-light"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
      } ${bookmark.isRead ? "opacity-60" : ""}`}
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
        <h2
          className={`line-clamp-2 text-base font-semibold ${
            bookmark.isRead ? "text-gray-500" : "text-gray-900"
          }`}
        >
          {bookmark.title ?? "Untitled page"}
        </h2>

        <div className="mt-2 flex items-center gap-2">
          {bookmark.favicon && (
            <img src={bookmark.favicon} alt="" className="h-4 w-4" />
          )}
          <span className="text-sm text-gray-500">{bookmark.domain}</span>
        </div>

        {bookmark.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {bookmark.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className={`rounded-full px-2 py-0.5 text-xs transition ${
                  tag.id === activeTagId
                    ? "bg-brand-pink text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-brand-pink-light hover:text-brand-pink"
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}
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

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleRead?.();
          }}
          className={`rounded-lg p-1 transition ${
            bookmark.isRead
              ? "text-brand-green hover:text-brand-green"
              : "text-gray-300 hover:text-brand-green"
          }`}
          aria-label={bookmark.isRead ? "Mark as unread" : "Mark as read"}
          aria-pressed={bookmark.isRead}
        >
          {bookmark.isRead ? <Undo2 size={16} /> : <Check size={16} />}
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