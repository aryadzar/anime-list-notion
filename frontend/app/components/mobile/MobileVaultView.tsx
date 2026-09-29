import { useState, useMemo } from "react";
import type { NotionItem } from "../../types/notion";
import { NotionStatusSelect } from "../NotionStatusSelect";

interface MobileVaultViewProps {
  items: NotionItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefetching?: boolean;
  onItemStatusChange?: (itemId: string, newStatus: string) => void;
}

export function MobileVaultView({
  items,
  isLoading,
  onRefresh,
  isRefetching,
  onItemStatusChange,
}: MobileVaultViewProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [sortOption, setSortOption] = useState<"default" | "title" | "date">("default");
  const [selectedItem, setSelectedItem] = useState<NotionItem | null>(null);

  // Type counts calculation
  const typeCounts = useMemo(() => {
    const counts = { manhwa: 0, manga: 0, anime: 0 };
    items.forEach((item) => {
      const t = item.tipe.toLowerCase();
      if (t.includes("manhwa")) counts.manhwa++;
      else if (t.includes("manga")) counts.manga++;
      else if (t.includes("anime")) counts.anime++;
    });
    return counts;
  }, [items]);

  // Status counts calculation
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

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = items.filter((item) => {
      if (selectedType !== "all") {
        if (!item.tipe.toLowerCase().includes(selectedType.toLowerCase())) {
          return false;
        }
      }
      if (selectedStatus !== "all") {
        const s = item.status.toLowerCase();
        if (selectedStatus === "reading") {
          if (!s.includes("reading") && !s.includes("aktif") && !s.includes("baca")) return false;
        } else if (selectedStatus === "completed") {
          if (!s.includes("completed") && !s.includes("selesai") && !s.includes("tamat")) return false;
        } else if (selectedStatus === "on-hold") {
          if (!s.includes("hold") && !s.includes("tunda")) return false;
        } else if (selectedStatus === "plan") {
          if (!s.includes("plan") && !s.includes("rencana")) return false;
        }
      }
      return true;
    });

    if (sortOption === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "date") {
      result.sort(
        (a, b) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );
    }
    return result;
  }, [items, selectedType, selectedStatus, sortOption]);

  // Helper to get reading link or provider
  const getReadLinkInfo = (item: NotionItem) => {
    const link = item.link || item.rawAltLink || "https://www.mangago.me";
    let label = "READ ON MANGAGO ↗";
    if (link.includes("webtoons.com")) label = "READ ON WEBTOON ↗";
    else if (link.includes("mangaplus")) label = "READ ON MANGAPLUS ↗";
    else if (link.includes("kakao")) label = "READ ON KAKAOPAGE ↗";
    else if (link.includes("asura")) label = "READ ON ASURA ↗";
    return { url: link, label };
  };

  return (
    <div
      className="w-full h-full flex-1 overflow-y-auto overscroll-y-contain bg-[#F6F3EB] text-[#171717] pb-36"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {/* 1. Sub-Header: Koleksi Bacaan & Sync Status (Image 6 Match) */}
      <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          {/* Badge: Koleksi Bacaan */}
          <div className="bg-[#171717] text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-2xs font-mono">
            <span>📖</span>
            <span>KOLEKSI BACAAN</span>
          </div>

          {/* Badge: Tersinkron */}
          <div className="bg-[#EAE5DC] border border-[#DDD5C7] text-neutral-800 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRefetching ? "bg-amber-500 animate-ping" : "bg-emerald-500"
              }`}
            ></span>
            <span>{isRefetching ? "Memuat..." : "Tersinkron"}</span>
          </div>
        </div>

        {/* View & Sort buttons */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() =>
              setSortOption(
                sortOption === "default"
                  ? "title"
                  : sortOption === "title"
                  ? "date"
                  : "default"
              )
            }
            className="w-7 h-7 bg-[#EAE5DC] border border-[#DDD5C7] rounded-md flex items-center justify-center text-xs font-bold text-neutral-700 hover:bg-[#DDD5C7] transition cursor-pointer"
            title={`Urutkan: ${sortOption}`}
          >
            ⇅
          </button>
        </div>
      </div>

      {/* 2a. Filter Tipe Pills Row (Horizontal Scroll) (Image 6 Match) */}
      <div
        className="px-4 py-1.5 flex items-center space-x-2 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setSelectedType("all")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedType === "all"
              ? "bg-[#171717] text-white shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          SEMUA ({items.length})
        </button>

        <button
          onClick={() => setSelectedType("manhwa")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedType === "manhwa"
              ? "bg-[#171717] text-white shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          MANHWA ({typeCounts.manhwa})
        </button>

        <button
          onClick={() => setSelectedType("manga")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedType === "manga"
              ? "bg-[#171717] text-white shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          MANGA ({typeCounts.manga})
        </button>

        <button
          onClick={() => setSelectedType("anime")}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase font-mono tracking-wider transition shrink-0 cursor-pointer ${
            selectedType === "anime"
              ? "bg-[#171717] text-white shadow-2xs"
              : "bg-[#EAE5DC] text-neutral-700 hover:bg-[#E0D8CB]"
          }`}
        >
          ANIME ({typeCounts.anime})
        </button>
      </div>

      {/* 2b. Filter Status Pills Row (Notion-style Tags) */}
      <div
        className="px-4 pb-2.5 flex items-center space-x-1.5 overflow-x-auto no-scrollbar"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <button
          onClick={() => setSelectedStatus("all")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 cursor-pointer font-mono ${
            selectedStatus === "all"
              ? "bg-[#171717] text-white shadow-2xs"
              : "bg-white/80 border border-[#DDD5C7] text-neutral-700 hover:bg-[#EAE5DC]"
          }`}
        >
          Semua Status
        </button>

        <button
          onClick={() => setSelectedStatus("reading")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 font-mono ${
            selectedStatus === "reading"
              ? "bg-[#3b2d54] text-[#d8b4fe] font-bold shadow-2xs"
              : "bg-white/80 border border-[#DDD5C7] text-neutral-700 hover:bg-[#EAE5DC]"
          }`}
        >
          <span>◐</span>
          <span>Reading ({statusCounts.reading})</span>
        </button>

        <button
          onClick={() => setSelectedStatus("completed")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 font-mono ${
            selectedStatus === "completed"
              ? "bg-[#1e3a2f] text-[#86efac] font-bold shadow-2xs"
              : "bg-white/80 border border-[#DDD5C7] text-neutral-700 hover:bg-[#EAE5DC]"
          }`}
        >
          <span>✓</span>
          <span>Selesai ({statusCounts.completed})</span>
        </button>

        <button
          onClick={() => setSelectedStatus("on-hold")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 font-mono ${
            selectedStatus === "on-hold"
              ? "bg-[#3b3322] text-[#fef08a] font-bold shadow-2xs"
              : "bg-white/80 border border-[#DDD5C7] text-neutral-700 hover:bg-[#EAE5DC]"
          }`}
        >
          <span>⏸</span>
          <span>On Hold ({statusCounts.onHold})</span>
        </button>

        <button
          onClick={() => setSelectedStatus("plan")}
          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition shrink-0 cursor-pointer flex items-center gap-1 font-mono ${
            selectedStatus === "plan"
              ? "bg-[#263140] text-[#93c5fd] font-bold shadow-2xs"
              : "bg-white/80 border border-[#DDD5C7] text-neutral-700 hover:bg-[#EAE5DC]"
          }`}
        >
          <span>○</span>
          <span>Plan ({statusCounts.plan})</span>
        </button>
      </div>

      {/* 3. Loading State or Empty State or List of Items */}
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
          <p className="font-bold text-sm text-neutral-800 mb-1">Tidak ada komik ditemukan</p>
          <p className="text-xs text-neutral-500 mb-4">Coba sesuaikan filter tipe atau status di atas.</p>
          <button
            onClick={() => {
              setSelectedType("all");
              setSelectedStatus("all");
            }}
            className="px-3.5 py-1.5 bg-[#171717] text-white text-xs font-bold font-mono rounded-lg transition cursor-pointer"
          >
            RESET FILTER
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 space-y-2.5">
        {filteredItems.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-white border border-[#E3DC CE] hover:border-[#C8BFB0] rounded-xl p-3 flex items-center space-x-3.5 shadow-2xs transition-all hover:shadow-xs active:scale-[0.99] cursor-pointer"
            >
              {/* Thumbnail with RAW badge */}
              <div className="relative w-14 h-18 rounded-lg overflow-hidden bg-neutral-200 shrink-0 border border-[#DDD5C7]">
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg bg-[#202020] text-white font-mono">
                    {item.icon || "📖"}
                  </div>
                )}
                <span className="absolute top-1 left-1 bg-black/80 text-white font-bold text-[8px] px-1 py-0.2 rounded font-mono">
                  RAW
                </span>
              </div>

              {/* Middle Details */}
              <div className="flex-1 min-w-0">
                {/* Badges: MANHWA / MANGA + Notion Status */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-[#171717] text-white text-[9px] font-extrabold uppercase font-mono px-1.5 py-0.5 rounded">
                    {item.tipe.toUpperCase()}
                  </span>

                  {/* Notion-like Status Select */}
                  <NotionStatusSelect
                    itemId={item.id}
                    currentStatus={item.status}
                    size="sm"
                    onStatusChange={(newStatus) => {
                      if (onItemStatusChange) onItemStatusChange(item.id, newStatus);
                      if (selectedItem?.id === item.id) {
                        setSelectedItem((prev) =>
                          prev ? { ...prev, status: newStatus } : null
                        );
                      }
                    }}
                  />
                </div>

                {/* Title */}
                <h3 className="font-extrabold text-sm text-[#171717] truncate leading-snug">
                  {item.title}
                </h3>

                {/* Subtitle: Tags & Date */}
                <p className="text-xs text-neutral-500 font-medium truncate mt-0.5">
                  {item.tags && item.tags.length > 0
                    ? item.tags.map((t) => t.name).join(" • ")
                    : `Ditambahkan: ${new Date(item.createdTime).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}`}
                </p>
              </div>

              {/* Right Side: Arrow button */}
              <div className="shrink-0 flex items-center pl-1 text-neutral-400 font-bold text-base">
                <span>›</span>
              </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Bottom Sheet Modal: DETAIL ENTRI DATABASE (With Smooth Spring Animations) */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md anim-backdrop"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg bg-[#FAF8F5] rounded-t-3xl border-t border-[#DDD5C7] shadow-2xl p-5 space-y-4 anim-sheet-spring max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Grabber Handle */}
            <div className="w-12 h-1.5 bg-[#DDD5C7] rounded-full mx-auto mb-1"></div>

            {/* Header: DETAIL ENTRI DATABASE */}
            <div className="flex items-center justify-between pb-1 border-b border-[#E8E2D8]">
              <div className="flex items-center space-x-2 text-xs font-mono font-extrabold tracking-wider text-neutral-700">
                <span>⤢</span>
                <span>DETAIL ENTRI DATABASE</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="w-7 h-7 rounded-full bg-[#EAE5DC] hover:bg-[#DDD5C7] text-neutral-700 font-bold flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Hero Row: Cover + Info + Notion Status Picker */}
            <div className="flex gap-4 items-start">
              <div className="w-20 h-28 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-[#D5CDC0] shadow-xs">
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
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#171717] text-white text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded">
                    {selectedItem.tipe.toUpperCase()}
                  </span>

                  {/* Notion-style Status Picker */}
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

                <h2 className="font-extrabold text-base text-[#171717] leading-snug">
                  {selectedItem.title}
                </h2>

                <p className="text-xs text-neutral-500 font-medium">
                  Dibuat oleh <strong className="text-neutral-900 font-bold">arya</strong>
                </p>

                <p className="text-[11px] text-neutral-400 font-mono">
                  📅 {new Date(selectedItem.createdTime).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Info Grid: TIPE SUMBER & BAHASA */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white border border-[#E3DC CE] rounded-xl p-3 shadow-2xs">
                <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-wider block mb-0.5">
                  TIPE SUMBER
                </span>
                <span className="text-xs font-extrabold text-neutral-900 truncate block">
                  Official Webtoon
                </span>
              </div>
              <div className="bg-white border border-[#E3DC CE] rounded-xl p-3 shadow-2xs">
                <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-wider block mb-0.5">
                  BAHASA
                </span>
                <span className="text-xs font-extrabold text-neutral-900 truncate block">
                  Bahasa Indonesia
                </span>
              </div>
            </div>

            {/* Notes Section (Replacing Chapter Stepper) */}
            {selectedItem.notes && (
              <div className="bg-white border border-[#E3DC CE] rounded-xl p-3.5 shadow-2xs space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-wider block">
                  CATATAN / SINOPSIS
                </span>
                <p className="text-xs text-neutral-700 leading-relaxed font-sans">
                  {selectedItem.notes}
                </p>
              </div>
            )}

            {/* Actions: READ ON MANGAGO & SHARE BUTTON */}
            <div className="flex gap-2 pt-1">
              <a
                href={getReadLinkInfo(selectedItem).url}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-[#171717] hover:bg-[#2C2C2C] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl text-center uppercase font-mono tracking-wider transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>{getReadLinkInfo(selectedItem).label}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  const url = getReadLinkInfo(selectedItem).url;
                  navigator.clipboard.writeText(url);
                  alert("Tautan komik berhasil disalin ke clipboard!");
                }}
                className="w-12 bg-[#EAE5DC] hover:bg-[#DDD5C7] rounded-xl flex items-center justify-center text-neutral-800 text-base font-bold transition cursor-pointer border border-[#D5CDC0]"
                title="Salin Tautan"
              >
                🔗
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
