import { Bookmark as BookmarkIcon, Heart, LayoutGrid, Tag } from "lucide-react";

type NavItem = {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "All Bookmarks", icon: <BookmarkIcon size={18} />, active: true },
  { label: "Favorites", icon: <Heart size={18} /> },
  { label: "Collections", icon: <LayoutGrid size={18} /> },
  { label: "Tags", icon: <Tag size={18} /> },
];

const Sidebar = () => {
  return (
    <aside className="flex h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-pink text-white">
          <BookmarkIcon size={16} fill="white" />
        </div>
        <span className="text-lg font-bold text-brand-pink">Pocketly</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
              item.active
                ? "bg-brand-pink-light text-brand-pink"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* User footer */}
      <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-pink text-sm font-semibold text-white">
          DO
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            Donald Ogbe
          </p>
          <p className="truncate text-xs text-gray-500">
            donald@example.com
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;