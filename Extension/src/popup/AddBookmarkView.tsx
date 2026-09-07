import { useEffect, useState, type KeyboardEvent } from "react";
import browser from "webextension-polyfill";
import { Search, Heart, X } from "lucide-react";
import { createBookmark } from "../api/bookmark";
import { fetchCollections, addBookmarkToCollection } from "../api/collection";
import { fetchTags, createTag, addBookmarkToTag } from "../api/tag";
import { ApiError } from "../api/client";
import { WEB_APP_URL } from "../config";
import type { Collection } from "../types/collection";
import type { Tag } from "../types/tag";

type AddBookmarkViewProps = {
  onSessionExpired: () => void;
};

type TabInfo = {
  url: string;
  title: string;
  favicon: string | null;
};

const getDomain = (url: string) => {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
};

const AddBookmarkView = ({ onSessionExpired }: AddBookmarkViewProps) => {
  const [tabInfo, setTabInfo] = useState<TabInfo | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [selectedTagNames, setSelectedTagNames] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url && tab?.title) {
        setTabInfo({
          url: tab.url,
          title: tab.title,
          favicon: tab.favIconUrl ?? null,
        });
      }
    });

    fetchCollections()
      .then(setCollections)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) onSessionExpired();
      });

    fetchTags()
      .then(setTags)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) onSessionExpired();
      });
  }, [onSessionExpired]);

  const addTagFromInput = () => {
    const name = tagInput.trim().toLowerCase();
    if (name && !selectedTagNames.includes(name)) {
      setSelectedTagNames((prev) => [...prev, name]);
    }
    setTagInput("");
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTagFromInput();
    }
  };

  const removeTag = (name: string) => {
    setSelectedTagNames((prev) => prev.filter((t) => t !== name));
  };

  const handleSave = async () => {
    if (!tabInfo) return;
    setIsSaving(true);
    setError(null);

    try {
      const bookmark = await createBookmark(tabInfo.url, isFavorite);

      if (selectedCollectionId) {
        await addBookmarkToCollection(selectedCollectionId, bookmark.id);
      }

      for (const name of selectedTagNames) {
        const existing = tags.find((t) => t.name.toLowerCase() === name);
        const tag = existing ?? (await createTag(name));
        await addBookmarkToTag(tag.id, bookmark.id);
      }

      setIsSaved(true);
      setTimeout(() => window.close(), 900);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onSessionExpired();
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to save bookmark");
    } finally {
      setIsSaving(false);
    }
  };

  const openFullApp = () => {
    browser.tabs.create({ url: WEB_APP_URL });
  };

  if (isSaved) {
    return (
      <div className="flex w-[360px] flex-col items-center justify-center gap-2 bg-white p-8 font-sans">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
          ✓
        </div>
        <p className="text-sm font-medium text-gray-900">Saved to Pocketly</p>
      </div>
    );
  }

  const logoUrl = chrome.runtime.getURL("icons/icon48.png");

  return (
    <div className="w-[360px] bg-white font-sans">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <img src={logoUrl} alt="Pocketly" className="h-6 w-6 rounded-md" />
          <span className="text-sm font-bold text-brand-pink">
            New Bookmark
          </span>
        </div>
        <button
          type="button"
          onClick={openFullApp}
          aria-label="Open full app"
          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600"
        >
          <Search size={16} />
        </button>
      </div>

      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
            {tabInfo?.favicon ? (
              <img
                src={tabInfo.favicon}
                alt=""
                className="h-6 w-6 object-contain"
              />
            ) : (
              <div className="h-full w-full bg-gray-200" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold text-gray-900">
              {tabInfo?.title ?? "Loading tab…"}
            </p>
            <p className="mt-0.5 truncate text-xs text-gray-500">
              {tabInfo ? getDomain(tabInfo.url) : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFavorite((prev) => !prev)}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            className={`shrink-0 rounded-lg p-1.5 transition ${
              isFavorite
                ? "text-brand-green"
                : "text-gray-300 hover:text-gray-400"
            }`}
          >
            <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <label className="w-20 shrink-0 text-xs text-gray-400">
            Collection
          </label>
          <select
            value={selectedCollectionId}
            onChange={(e) => setSelectedCollectionId(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-brand-pink"
          >
            <option value="">Unsorted</option>
            {collections.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <label className="mt-1.5 w-20 shrink-0 text-xs text-gray-400">
            Tags
          </label>
          <div className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus-within:border-brand-pink">
            <div className="flex flex-wrap gap-1.5">
              {selectedTagNames.map((name) => (
                <span
                  key={name}
                  className="flex items-center gap-1 rounded-full bg-brand-green-light px-2 py-0.5 text-xs font-medium text-brand-green"
                >
                  #{name}
                  <button
                    type="button"
                    onClick={() => removeTag(name)}
                    aria-label={`Remove ${name}`}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTagFromInput}
                placeholder={selectedTagNames.length === 0 ? "Add tags..." : ""}
                className="min-w-[60px] flex-1 border-none py-0.5 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <label className="w-20 shrink-0 text-xs text-gray-400">URL</label>
          <div className="w-full truncate rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
            {tabInfo?.url ?? ""}
          </div>
        </div>

        {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
      </div>

      <div className="flex justify-end border-t border-gray-100 px-4 py-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!tabInfo || isSaving}
          className="rounded-lg bg-brand-pink px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
};

export default AddBookmarkView;
