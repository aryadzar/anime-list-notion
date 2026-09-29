import { useState } from "react";
import { useLayout } from "../../context/LayoutContext";
import { useAuth } from "../../context/AuthContext";
import { InstallPwaModal } from "./InstallPwaModal";

interface MobileHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isRefetching?: boolean;
  onRefresh?: () => void;
}

export function MobileHeader({
  searchQuery,
  onSearchChange,
  isRefetching,
  onRefresh,
}: MobileHeaderProps) {
  const { mobileTab, setMobileTab, setLayoutMode } = useLayout();
  const { user } = useAuth();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Dynamic Title based on active tab
  const getHeaderTitle = () => {
    switch (mobileTab) {
      case "vault":
        return "VAULT COLLECTION";
      case "gallery":
        return "GALLERY GRID";
      case "stats":
        return "STATS WRAPPED";
      case "settings":
        return "ACCOUNT SETTINGS";
      default:
        return "VAULT COLLECTION";
    }
  };

  return (
    <header className="bg-[#FAF8F5] border-b border-[#E8E2D8] sticky top-0 z-30 select-none shrink-0">
      {/* Main Header Bar */}
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Left: App Logo & Title OR Back Button if in settings */}
        <div className="flex items-center space-x-2">
          {mobileTab === "settings" ? (
            <button
              onClick={() => setMobileTab("vault")}
              className="bg-[#171717] hover:bg-[#2b2b2b] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <span>←</span>
              <span>KEMBALI KE LIST</span>
            </button>
          ) : (
            <>
              <span className="text-xl">📖</span>
              <span className="font-extrabold text-base tracking-tight text-[#171717] font-sans">
                {getHeaderTitle()}
              </span>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Quick Install to Home Screen Button */}
          <button
            onClick={() => setIsInstallOpen(true)}
            className="text-[11px] font-bold bg-[#FAF3E0] hover:bg-[#F3E7C4] text-[#805B10] border border-[#ECD9A2] px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer font-mono"
            title="Pasang aplikasi di layar utama HP"
          >
            <span>📲</span>
            <span className="hidden sm:inline">Pasang</span>
          </button>

          {/* Quick Switch to Web View */}
          <button
            onClick={() => setLayoutMode("web")}
            className="text-[11px] font-bold bg-[#EFECE4] hover:bg-[#E2DDD3] text-[#171717] border border-[#DDD5C7] px-2 py-1 rounded-md transition flex items-center gap-1 cursor-pointer"
            title="Beralih ke Tipe Desain Web"
          >
            <span>💻</span>
            <span className="hidden sm:inline">Tipe Web</span>
          </button>

          {/* Search Toggle Icon */}
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer ${
              isSearchExpanded || searchQuery
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "text-neutral-700 hover:bg-[#EFECE4]"
            }`}
            title="Cari Judul"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.2"
              />
            </svg>
          </button>

          {/* Sync / Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefetching}
              className="w-8 h-8 rounded-full text-neutral-700 hover:bg-[#EFECE4] flex items-center justify-center transition cursor-pointer"
              title="Sinkronkan Notion"
            >
              <svg
                className={`w-4 h-4 ${isRefetching ? "animate-spin text-amber-600" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          )}

          {/* Avatar Profile Button */}
          <button
            onClick={() => setMobileTab("settings")}
            className="w-8 h-8 rounded-full bg-[#171717] text-white flex items-center justify-center font-bold text-xs shadow-xs hover:ring-2 hover:ring-amber-400 transition cursor-pointer ml-0.5 overflow-hidden"
            title="Pengaturan Akun"
          >
            {user?.picture ? (
              <img src={user.picture} alt={user.name || "User"} className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name[0].toUpperCase() : "A"}</span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {isSearchExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-[#EAE4D8] animate-in slide-in-from-top-1 duration-150">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari komik, manga, atau tag..."
              className="w-full bg-white border border-[#D5CDC0] rounded-xl pl-9 pr-8 py-2 text-xs text-[#171717] placeholder:text-neutral-400 focus:outline-none focus:border-[#171717] shadow-xs"
            />
            <span className="absolute left-3 top-2.5 text-neutral-400 text-xs">🔍</span>
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-2.5 text-neutral-400 hover:text-black text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Install PWA Modal */}
      <InstallPwaModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />
    </header>
  );
}
