import { useState, useMemo } from "react";
import type { NotionItem } from "../../types/notion";
import { useLayout } from "../../context/LayoutContext";
import { NotionStatusSelect } from "../NotionStatusSelect";

interface MobileGalleryViewProps {
  items: NotionItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefetching?: boolean;
  onItemStatusChange?: (itemId: string, newStatus: string) => void;
}

export function MobileGalleryView({
  items,
  isLoading,
  onRefresh,
  isRefetching,
  onItemStatusChange,
}: MobileGalleryViewProps) {
  const { setMobileTab } = useLayout();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "title">("newest");
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<NotionItem | null>(null);

  // Toggle bookmark on poster card
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Status counts
  const statusCounts = useMemo(() => {
    const counts = { reading: 0, completed: 0, onHold: 0, plan: 0 };
    items.forEach((item) => {
      const s = item.status.toLowerCase();
      if (s.includes("reading") || s.includes("aktif") || s.includes("baca")) counts.reading++;
      else if (s.includes("completed") || s.includes("selesai") || s.includes("tamat")) counts.completed++;
      else if (s.includes("hold") || s.includes("tunda")) counts.onHold++;
      else counts.plan++;
    });
    return counts;
  }, [items]);

  // Filtered & sorted
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      if (selectedStatus === "all") return true;
      const s = item.status.toLowerCase();
      if (selectedStatus === "reading") {
        return s.includes("reading") || s.includes("aktif") || s.includes("baca");
      }
      if (selectedStatus === "completed") {
        return s.includes("completed") || s.includes("selesai") || s.includes("tamat");
      }
      if (selectedStatus === "on-hold") {
        return s.includes("hold") || s.includes("tunda");
      }
      if (selectedStatus === "plan") {
        return s.includes("plan") || s.includes("rencana");
      }
      return true;
    });

    if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      result.sort(
        (a, b) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );
    }

    return result;
  }, [items, selectedStatus, sortBy]);

  return (
    <div
      className="w-full h-full flex-1 overflow-y-auto overscroll-y-contain bg-[#F6F3EB] text-[#171717] pb-36"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {/* 1. Sub-Header: LIST / GRID Toggle & Sort (Image 3 Match) */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
        {/* Toggle List / Grid */}
        <div className="bg-[#EAE5DC] border border-[#DDD5C7] rounded-lg p-0.5 flex items-center space-x-1">
          <button
            onClick={() => setMobileTab("vault")}
            className="px-2.5 py-1 rounded text-xs font-bold font-mono uppercase text-neutral-600 hover:text-black transition cursor-pointer flex items-center gap-1"
          >
            <span>☰</span>
            <span>LIST</span>
          </button>
          <button
            className="bg-[#171717] text-white px-2.5 py-1 rounded text-xs font-bold font-mono uppercase shadow-2xs flex items-center gap-1 cursor-default"
          >
            <span>⊞</span>
            <span>GRID</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#EAE5DC] border border-[#DDD5C7] text-neutral-800 text-xs font-bold font-mono uppercase px-2.5 py-1 rounded-lg focus:outline-none cursor-pointer"
          >
            <option value="newest">⇅ TERBARU</option>
            <option value="title">⇅ ABJAD A-Z</option>
          </select>
        </div>
      </div>

      {/* 2. Filter Tabs: SEMUA, READING, COMPLETED, ON HOLD, PLAN */}
      <div
        className="px-4 py-2 flex items-center space-x-2 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedStatus === "all"
              ? "bg-[#171717] text-white shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          SEMUA ({items.length})
        </button>

        <button
          onClick={() => setSelectedStatus("reading")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedStatus === "reading"
              ? "bg-[#3b2d54] text-[#d8b4fe] shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          READING ({statusCounts.reading})
        </button>

        <button
          onClick={() => setSelectedStatus("completed")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedStatus === "completed"
              ? "bg-[#1e3a2f] text-[#86efac] shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          COMPLETED ({statusCounts.completed})
        </button>

        <button
          onClick={() => setSelectedStatus("on-hold")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedStatus === "on-hold"
              ? "bg-[#3b3322] text-[#fef08a] shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          ON HOLD ({statusCounts.onHold})
        </button>

        <button
          onClick={() => setSelectedStatus("plan")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedStatus === "plan"
              ? "bg-[#263140] text-[#93c5fd] shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          PLAN ({statusCounts.plan})
        </button>
      </div>

      {/* 3. Live Sync Notice */}
      <div className="px-4 py-1.5 flex items-center justify-center space-x-1.5 text-[10px] font-mono font-bold uppercase text-neutral-500 tracking-wider">
        <span className={isRefetching ? "animate-spin text-amber-600" : ""}>🔄</span>
        <span>{isRefetching ? "MENYINKRONKAN DENGAN NOTION..." : "LIVE SYNC AKTIF"}</span>
      </div>

      {/* 4. Loading or Empty or 2-Column Gallery Poster Grid */}
      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center my-auto min-h-[300px]">
          <div className="w-10 h-10 border-3 border-neutral-300 border-t-[#171717] rounded-full animate-spin mb-3.5"></div>
          <p className="text-xs font-bold text-neutral-800 font-mono uppercase tracking-wider">
            Sedang Mengambil Data dari Notion...
          </p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Menghubungkan ke database anime &amp; manhwa Anda
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="mx-4 my-8 p-8 border-2 border-dashed border-[#DDD5C7] rounded-2xl text-center bg-white/50">
          <span className="text-3xl mb-2 block">🔍</span>
          <p className="font-bold text-sm text-neutral-800 mb-1">Tidak ada koleksi ditemukan</p>
          <p className="text-xs text-neutral-500 mb-4">Coba sesuaikan filter status di atas.</p>
          <button
            onClick={() => setSelectedStatus("all")}
            className="px-3.5 py-1.5 bg-[#171717] text-white text-xs font-bold font-mono rounded-lg transition cursor-pointer"
          >
            RESET FILTER
          </button>
        </div>
      ) : (
        <div className="px-3.5 py-2 grid grid-cols-2 gap-3">
        {filteredItems.map((item) => {
          const isAktif =
            item.status.toLowerCase().includes("reading") ||
            item.status.toLowerCase().includes("aktif") ||
            item.status.toLowerCase().includes("baca");
          const isCompleted =
            item.status.toLowerCase().includes("completed") ||
            item.status.toLowerCase().includes("selesai");
          const isBookmarked = bookmarkedIds.has(item.id);

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative rounded-xl overflow-hidden aspect-[3/4.2] bg-[#1E1E1E] border-2 border-[#171717] shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] cursor-pointer flex flex-col justify-between"
            >
              {/* Cover Image Background */}
              {item.cover ? (
                <img
                  src={item.cover}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="absolute inset-0 bg-[#252525] flex items-center justify-center text-4xl text-neutral-500">
                  {item.icon || "📖"}
                </div>
              )}

              {/* Top Badges Row */}
              <div className="relative z-10 p-2.5 flex items-center justify-between">
                <span className="bg-[#171717] text-white text-[9px] font-extrabold uppercase font-mono px-2 py-0.5 rounded shadow-sm">
                  {item.tipe.toUpperCase()}
                </span>

                <button
                  type="button"
                  onClick={(e) => toggleBookmark(item.id, e)}
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs transition cursor-pointer ${
                    isBookmarked
                      ? "bg-amber-400 text-black shadow-sm"
                      : "bg-white/80 hover:bg-white text-neutral-800 backdrop-blur-xs"
                  }`}
                  title={isBookmarked ? "Hapus Bookmark" : "Simpan Bookmark"}
                >
                  🔖
                </button>
              </div>

              {/* Bottom Scrim Overlay & Title Info */}
              <div className="relative z-10 p-3 pt-8 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end">
                {/* Status Pill Row */}
                <div className="flex items-center justify-between mb-1.5">
                  <div onClick={(e) => e.stopPropagation()}>
                    <NotionStatusSelect
                      itemId={item.id}
                      currentStatus={item.status}
                      size="sm"
                      onStatusChange={(newStatus) => {
                        if (onItemStatusChange) onItemStatusChange(item.id, newStatus);
                      }}
                    />
                  </div>

                  <span className="text-neutral-400 font-mono text-[9px] uppercase font-bold tracking-wider drop-shadow-sm truncate pl-1">
                    {item.tipe}
                  </span>
                </div>

                {/* Comic / Anime Title */}
                <h3 className="font-extrabold text-sm text-white leading-tight line-clamp-2 drop-shadow-md">
                  {item.title}
                </h3>
              </div>

              {/* Bottom Active Yellow Accent Line (Image 3 Match) */}
              {isAktif && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F5C518] z-20"></div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* 5. Bottom Weekly Reading Stats Banner (Image 3 Match) */}
      <div className="px-3.5 pt-3">
        <div className="bg-white border border-[#E3DC CE] rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-[#171717] text-white flex items-center justify-center text-lg">
              🔥
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-wider block">
                KOLEKSI AKTIF TERPANTAU
              </span>
              <span className="text-xs font-extrabold text-[#171717]">
                {items.length} Judul Tersinkron
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileTab("stats")}
            className="bg-[#171717] hover:bg-[#2C2C2C] text-white text-[11px] font-mono font-bold uppercase px-3 py-2 rounded-lg transition cursor-pointer shadow-2xs"
          >
            STATISTIK
          </button>
        </div>
      </div>

      {/* Three dots archive footer */}
      <div className="py-6 text-center text-neutral-400 space-y-1">
        <div className="flex justify-center space-x-1.5 text-xs font-bold text-neutral-600">
          <span>●</span>
          <span>●</span>
          <span>●</span>
        </div>
        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
          MEMUAT KOLEKSI ARSIP LAINNYA
        </div>
      </div>

      {/* Quick Modal with Smooth Spring Animation & Notion Status Selector */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md anim-backdrop"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl border-t border-[#DDD5C7] shadow-2xl p-5 space-y-4 anim-sheet-spring max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-[#DDD5C7] rounded-full mx-auto mb-1"></div>

            <div className="flex items-center justify-between pb-1 border-b border-[#E8E2D8]">
              <div className="text-xs font-mono font-extrabold tracking-wider text-neutral-700">
                INFO POSTER GALERI
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-[#EAE5DC] text-neutral-700 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-[#D5CDC0]">
                {selectedItem.cover ? (
                  <img
                    src={selectedItem.cover}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-[#171717] text-white">
                    {selectedItem.icon || "📖"}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="bg-[#171717] text-white text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded">
                    {selectedItem.tipe.toUpperCase()}
                  </span>

                  {/* Notion Status Picker */}
                  <NotionStatusSelect
                    itemId={selectedItem.id}
                    currentStatus={selectedItem.status}
                    size="sm"
                    onStatusChange={(newStatus) => {
                      if (onItemStatusChange) onItemStatusChange(selectedItem.id, newStatus);
                      setSelectedItem((prev) =>
                        prev ? { ...prev, status: newStatus } : null
                      );
                    }}
                  />
                </div>

                <h3 className="font-extrabold text-base text-[#171717] leading-tight">
                  {selectedItem.title}
                </h3>

                <p className="text-xs text-neutral-500 font-mono">
                  Ditambahkan:{" "}
                  {new Date(selectedItem.createdTime).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <a
                href={selectedItem.link || selectedItem.rawAltLink || "#"}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#171717] hover:bg-[#2C2C2C] text-white font-extrabold text-xs py-3 rounded-xl text-center uppercase font-mono tracking-wider transition"
              >
                BACA SEKARANG ↗
              </a>
              <button
                onClick={() => setSelectedItem(null)}
                className="bg-[#EAE5DC] hover:bg-[#DDD5C7] text-neutral-800 font-bold text-xs px-4 py-3 rounded-xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
