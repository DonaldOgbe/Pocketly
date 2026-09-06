import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import type { Bookmark } from "../types/bookmark";
import type { Collection } from "../types/collection";
import type { Tag } from "../types/tag";
import {
  addBookmarkToCollection,
  removeBookmarkFromCollection,
} from "../api/collection";
import { addBookmarkToTag, removeBookmarkFromTag } from "../api/tags";

type BookmarkPreviewProps = {
  bookmark: Bookmark;
  collections: Collection[];
  tags: Tag[];
  onClose: () => void;
  onUpdateRelations: (
    id: string,
    updater: (bookmark: Bookmark) => Bookmark,
  ) => void;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const BookmarkPreview = ({
  bookmark,
  collections,
  tags,
  onClose,
  onUpdateRelations,
}: BookmarkPreviewProps) => {
  const [pendingCollectionId, setPendingCollectionId] = useState<string | null>(
    null,
  );
  const [pendingTagId, setPendingTagId] = useState<string | null>(null);

  const isInCollection = (id: string) =>
    bookmark.collections.some((c) => c.id === id);
  const hasTag = (id: string) => bookmark.tags.some((t) => t.id === id);

  const handleToggleCollection = async (collection: Collection) => {
    const alreadyIn = isInCollection(collection.id);
    setPendingCollectionId(collection.id);
    try {
      if (alreadyIn) {
        await removeBookmarkFromCollection(collection.id, bookmark.id);
        onUpdateRelations(bookmark.id, (b) => ({
          ...b,
          collections: b.collections.filter((c) => c.id !== collection.id),
        }));
      } else {
        await addBookmarkToCollection(collection.id, bookmark.id);
        onUpdateRelations(bookmark.id, (b) => ({
          ...b,
          collections: [
            ...b.collections,
            { id: collection.id, name: collection.name },
          ],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingCollectionId(null);
    }
  };

  const handleToggleTag = async (tag: Tag) => {
    const alreadyHas = hasTag(tag.id);
    setPendingTagId(tag.id);
    try {
      if (alreadyHas) {
        await removeBookmarkFromTag(tag.id, bookmark.id);
        onUpdateRelations(bookmark.id, (b) => ({
          ...b,
          tags: b.tags.filter((t) => t.id !== tag.id),
        }));
      } else {
        await addBookmarkToTag(tag.id, bookmark.id);
        onUpdateRelations(bookmark.id, (b) => ({
          ...b,
          tags: [...b.tags, { id: tag.id, name: tag.name }],
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setPendingTagId(null);
    }
  };

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

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Collections
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {collections.length === 0 ? (
            <p className="text-xs text-gray-400">No collections yet</p>
          ) : (
            collections.map((collection) => {
              const active = isInCollection(collection.id);
              return (
                <button
                  key={collection.id}
                  type="button"
                  disabled={pendingCollectionId === collection.id}
                  onClick={() => handleToggleCollection(collection)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                    active
                      ? "border-brand-pink bg-brand-pink-light text-brand-pink"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {collection.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          Tags
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.length === 0 ? (
            <p className="text-xs text-gray-400">No tags yet</p>
          ) : (
            tags.map((tag) => {
              const active = hasTag(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  disabled={pendingTagId === tag.id}
                  onClick={() => handleToggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition disabled:opacity-50 ${
                    active
                      ? "border-brand-green bg-brand-green-light text-brand-green"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })
          )}
        </div>
      </div>

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
