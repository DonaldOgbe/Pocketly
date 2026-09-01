import { X, ExternalLink } from "lucide-react";
import type { Bookmark } from "../types/bookmark";

type BookmarkPreviewProps = {
  bookmark: Bookmark;
  onClose: () => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const BookmarkPreview = ({ bookmark, onClose }: BookmarkPreviewProps) => {
  return (
    <aside className="h-screen w-96 shrink-0 overflow-y-auto border-l border-gray-200 bg-white p-6">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      {bookmark.thumbnail && (
        <div className="mt-2 overflow-hidden rounded-xl bg-gray-100">
          <img
            src={bookmark.thumbnail}
            alt=""
            className="h-48 w-full object-cover"
          />
        </div>
      )}

      <h2 className="mt-4 text-xl font-semibold text-gray-900">
        {bookmark.title ?? "Untitled page"}
      </h2>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {bookmark.favicon && (
            <img src={bookmark.favicon} alt="" className="h-4 w-4" />
          )}
          <span className="text-sm text-gray-500">{bookmark.domain}</span>
        </div>

        {bookmark.isFavorite && (
          <span className="flex items-center gap-1 rounded-full bg-brand-green-light px-3 py-1 text-xs font-medium text-brand-green">
            ★ Favorited
          </span>
        )}
      </div>

      {bookmark.description && (
        <p className="mt-4 text-sm leading-relaxed text-gray-600">
          {bookmark.description}
        </p>
      )}

      <div className="mt-6 flex items-center gap-2 border-t border-gray-100 pt-4 text-xs text-gray-400">
        Saved on {formatDate(bookmark.savedAt)}
      </div>

      <div className="mt-4 flex gap-3">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Open
        </a>
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-brand-pink px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
        >
          Go to Source
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
};

export default BookmarkPreview;