import { useEffect, useState } from "react";
import {
  Bookmark as BookmarkIcon,
  Heart,
  LayoutGrid,
  Tag as TagIcon,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import { fetchCollections } from "../api/collection";
import { fetchTags } from "../api/tags";
import { getSessionUser, initialsFor } from "../api/session";
import type { Collection } from "../types/collection";
import type { Tag } from "../types/tag";
import type { BookmarkFilter } from "../types/bookmark";

type SidebarProps = {
  activeFilter: BookmarkFilter;
  onSelectFilter: (filter: BookmarkFilter) => void;
};

const Sidebar = ({ activeFilter, onSelectFilter }: SidebarProps) => {
  const navigate = useNavigate();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const sessionUser = getSessionUser();

  useEffect(() => {
    fetchCollections()
      .then(setCollections)
      .catch((err) => console.error("Failed to load collections", err));

    fetchTags()
      .then(setTags)
      .catch((err) => console.error("Failed to load tags", err));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isAllActive = activeFilter.type === "all";
  const isFavoritesActive = activeFilter.type === "favorites";

  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col overflow-y-auto border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pink text-white">
          <BookmarkIcon size={16} fill="white" />
        </div>
        <span className="text-lg font-bold text-brand-pink">Pocketly</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        <button
          type="button"
          onClick={() => onSelectFilter({ type: "all" })}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isAllActive
              ? "bg-brand-pink-light text-brand-pink"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <BookmarkIcon size={18} />
          All Bookmarks
        </button>

        <button
          type="button"
          onClick={() => onSelectFilter({ type: "favorites" })}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
            isFavoritesActive
              ? "bg-brand-pink-light text-brand-pink"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Heart size={18} />
          Favorites
        </button>

        {/* Collections dropdown */}
        <div>
          <button
            type="button"
            onClick={() => setIsCollectionsOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <LayoutGrid size={18} />
            Collections
            <span className="ml-auto text-gray-400">
              {isCollectionsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </button>

          {isCollectionsOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {collections.length === 0 ? (
                <p className="px-3 py-1 text-xs text-gray-400">No collections yet</p>
              ) : (
                collections.map((collection) => {
                  const isActive =
                    activeFilter.type === "collection" && activeFilter.id === collection.id;
                  return (
                    <button
                      key={collection.id}
                      type="button"
                      onClick={() =>
                        onSelectFilter({
                          type: "collection",
                          id: collection.id,
                          name: collection.name,
                        })
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${
                        isActive
                          ? "bg-brand-pink-light text-brand-pink"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{collection.name}</span>
                      <span className="text-xs text-gray-400">
                        {collection._count.bookmarks}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Tags dropdown */}
        <div>
          <button
            type="button"
            onClick={() => setIsTagsOpen((prev) => !prev)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <TagIcon size={18} />
            Tags
            <span className="ml-auto text-gray-400">
              {isTagsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          </button>

          {isTagsOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {tags.length === 0 ? (
                <p className="px-3 py-1 text-xs text-gray-400">No tags yet</p>
              ) : (
                tags.map((tag) => {
                  const isActive = activeFilter.type === "tag" && activeFilter.id === tag.id;
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() =>
                        onSelectFilter({ type: "tag", id: tag.id, name: tag.name })
                      }
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-sm transition ${
                        isActive
                          ? "bg-brand-pink-light text-brand-pink"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{tag.name}</span>
                      <span className="text-xs text-gray-400">{tag._count.bookmarks}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pink text-sm font-semibold text-white">
          {sessionUser ? initialsFor(sessionUser.email) : "?"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {sessionUser?.email.split("@")[0] ?? "Signed in"}
          </p>
          <p className="truncate text-xs text-gray-500">{sessionUser?.email ?? ""}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          className="shrink-0 rounded-lg p-2 text-gray-400 transition hover:bg-gray-50 hover:text-brand-pink"
        >
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;