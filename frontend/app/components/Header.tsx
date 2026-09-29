import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLayout } from "../context/LayoutContext";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedType: string;
  onTypeChange: (t: string) => void;
  selectedStatus: string;
  onStatusChange: (s: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  isRefetching: boolean;
  onRefresh: () => void;
  isMock: boolean;
  onOpenNewModal: () => void;
  onOpenGuideModal: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  isRefetching,
  onRefresh,
  isMock,
  onOpenNewModal,
  onOpenGuideModal,
}: HeaderProps) {
  const { user, logout } = useAuth();
  const { layoutMode, setLayoutMode, openTrackLink } = useLayout();
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  return (
    <header className="border-b border-[#242424] bg-[#171717] px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Breadcrumb / Workspace Name */}
      <div className="flex items-center space-x-2 text-sm text-[#9ca3af]">
        <div className="flex items-center space-x-1.5 hover:bg-[#252525] px-2 py-1 rounded cursor-pointer transition">
          <span className="text-base">📚</span>
          <span className="font-medium text-neutral-200">Catalog Database</span>
        </div>
        <span>/</span>
        <div className="flex items-center space-x-1 hover:bg-[#252525] px-2 py-1 rounded cursor-pointer transition">
          <span className="text-neutral-300 font-medium">Manhwa &amp; Manga Vault</span>
        </div>

        {/* Notion Sync Indicator */}
        <button
          onClick={onOpenGuideModal}
          title={isMock ? "Klik untuk melihat panduan integrasi Notion" : "Terhubung langsung ke Notion Database"}
          className={`hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border transition ml-2 ${
            isMock
              ? "bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/40"
              : "bg-emerald-950/40 text-emerald-300 border-emerald-800/60"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isMock ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
            }`}
          />
          <span>{isMock ? "Mock / Setup Key" : "Notion Live"}</span>
        </button>
      </div>

      {/* Right: Global Actions */}
      <div className="flex items-center space-x-2 text-xs">
        {/* Search Input */}
        <div className="relative">
          <input
            className="bg-[#202020] border border-[#2e2e2e] text-neutral-200 rounded-md pl-8 pr-3 py-1.5 focus:outline-none focus:border-neutral-500 w-36 sm:w-48 md:w-56 text-xs placeholder:text-neutral-500 transition"
            placeholder="Cari koleksi..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <svg
            className="w-3.5 h-3.5 absolute left-2.5 top-2 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-2 text-neutral-400 hover:text-neutral-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Sync/Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefetching}
          title="Sinkronisasi ulang dengan database Notion"
          className="bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 p-1.5 rounded-md border border-[#333333] transition flex items-center justify-center disabled:opacity-50"
        >
          <svg
            className={`w-3.5 h-3.5 text-neutral-300 ${isRefetching ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Filter Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowFilterMenu(!showFilterMenu);
              setShowSortMenu(false);
            }}
            className={`bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 px-3 py-1.5 rounded-md border border-[#333333] flex items-center space-x-1.5 transition ${
              selectedType !== "all" || selectedStatus !== "all"
                ? "border-blue-500/50 bg-[#292929]"
                : ""
            }`}
          >
            <svg
              className="w-3.5 h-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Filter</span>
          </button>

          {showFilterMenu && (
            <div className="absolute right-0 mt-1 w-56 bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg shadow-2xl p-3 z-50">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Filter Tipe
              </div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {["all", "Manhwa", "Manga", "Anime"].map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      onTypeChange(t);
                    }}
                    className={`px-2 py-1 rounded text-xs text-left transition ${
                      selectedType === t
                        ? "bg-[#333333] text-white font-medium"
                        : "text-neutral-400 hover:bg-[#262626] hover:text-neutral-200"
                    }`}
                  >
                    {t === "all" ? "Semua" : t}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                Filter Status
              </div>
              <div className="flex flex-col gap-1">
                {[
                  { id: "all", label: "Semua Status" },
                  { id: "Reading/Watching", label: "Reading/Watching" },
                  { id: "Completed", label: "Completed" },
                  { id: "On Hold", label: "On Hold" },
                  { id: "Plan to Read", label: "Plan to Read" },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onStatusChange(s.id);
                    }}
                    className={`px-2 py-1 rounded text-xs text-left transition ${
                      selectedStatus === s.id
                        ? "bg-[#333333] text-white font-medium"
                        : "text-neutral-400 hover:bg-[#262626] hover:text-neutral-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {(selectedType !== "all" || selectedStatus !== "all") && (
                <button
                  onClick={() => {
                    onTypeChange("all");
                    onStatusChange("all");
                    setShowFilterMenu(false);
                  }}
                  className="mt-3 w-full py-1 text-center text-xs text-red-400 hover:bg-red-950/30 rounded border border-red-900/40 transition"
                >
                  Reset Filter
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sort Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortMenu(!showSortMenu);
              setShowFilterMenu(false);
            }}
            className="bg-[#242424] hover:bg-[#2e2e2e] text-neutral-200 px-3 py-1.5 rounded-md border border-[#333333] flex items-center space-x-1.5 transition"
          >
            <svg
              className="w-3.5 h-3.5 text-neutral-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span>Urutkan</span>
          </button>

          {showSortMenu && (
            <div className="absolute right-0 mt-1 w-48 bg-[#1f1f1f] border border-[#2f2f2f] rounded-lg shadow-2xl p-2 z-50">
              <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-2 py-1">
                Urutkan Berdasarkan
              </div>
              {[
                { id: "default", label: "Default Notion" },
                { id: "title-asc", label: "Judul (A - Z)" },
                { id: "title-desc", label: "Judul (Z - A)" },
                { id: "date-newest", label: "Terbaru Ditambahkan" },
                { id: "date-edited", label: "Terakhir Diedit" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSortChange(opt.id);
                    setShowSortMenu(false);
                  }}
                  className={`w-full px-2 py-1.5 rounded text-xs text-left transition ${
                    sortBy === opt.id
                      ? "bg-[#333333] text-white font-medium"
                      : "text-neutral-400 hover:bg-[#262626] hover:text-neutral-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Track Link (Share Target) Button */}
        <button
          onClick={() => openTrackLink()}
          className="bg-[#F5C518] hover:bg-[#E5B508] text-black font-extrabold px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition shadow-sm font-mono cursor-pointer shrink-0"
          title="Track Link Komik / Anime via URL (Share Target)"
        >
          <span>⚡</span>
          <span>Track Link</span>
        </button>

        {/* Layout Switcher (Web vs Mobile) */}
        <div className="flex items-center bg-[#202020] border border-[#2e2e2e] rounded-md p-0.5 shrink-0">
          <button
            onClick={() => setLayoutMode("web")}
            className={`px-2 py-1 rounded text-[11px] font-mono transition cursor-pointer flex items-center gap-1 ${
              layoutMode === "web"
                ? "bg-[#2f2f2f] text-white font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Mode Web (Notion Database Desktop)"
          >
            <span>💻</span>
            <span className="hidden md:inline">Web</span>
          </button>
          <button
            onClick={() => setLayoutMode("mobile")}
            className={`px-2 py-1 rounded text-[11px] font-mono transition cursor-pointer flex items-center gap-1 ${
              layoutMode === "mobile"
                ? "bg-[#F5C518] text-black font-bold"
                : "text-neutral-400 hover:text-white"
            }`}
            title="Mode Mobile (Image 6 & 3 Warm App)"
          >
            <span>📱</span>
            <span className="hidden md:inline">Mobile</span>
          </button>
        </div>

        {/* "+ Baru" Button */}
        <button
          onClick={onOpenNewModal}
          className="bg-neutral-100 hover:bg-white text-black font-semibold px-3 py-1.5 rounded-md flex items-center space-x-1 transition shadow-sm shrink-0 cursor-pointer"
        >
          <span>Baru</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M12 4v16m8-8H4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center pl-2 ml-1 border-l border-[#2e2e2e] space-x-2">
            <div className="flex items-center space-x-2 bg-[#202020] border border-[#2e2e2e] px-2.5 py-1 rounded-md text-xs">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || user.email}
                  className="w-4 h-4 rounded-full border border-neutral-600"
                />
              ) : (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(user.name || user.email)[0].toUpperCase()}
                </span>
              )}
              <span
                className="hidden md:inline font-mono text-[11px] text-neutral-300 max-w-[150px] truncate"
                title={user.email}
              >
                {user.email}
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-1 py-0.2 rounded">
                Owner
              </span>
            </div>

            <button
              onClick={logout}
              title="Keluar dari akun (Logout)"
              className="px-2.5 py-1.5 bg-[#221a1a] hover:bg-red-950/70 text-neutral-300 hover:text-red-200 border border-[#382626] hover:border-red-800/60 rounded-md transition duration-150 flex items-center space-x-1.5 cursor-pointer text-xs font-medium shadow-sm group"
            >
              <svg className="w-3.5 h-3.5 text-red-400 group-hover:text-red-300 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
