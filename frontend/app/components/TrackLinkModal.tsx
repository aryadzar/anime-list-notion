import { useState, useEffect } from "react";
import type { NotionItem, MangaPreviewItem } from "../types/notion";
import { previewMangaImport, createNotionItem } from "../lib/api";

interface TrackLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUrl?: string;
  onItemAdded?: (item: NotionItem) => void;
  onRefresh?: () => void;
}

export function TrackLinkModal({
  isOpen,
  onClose,
  initialUrl = "",
  onItemAdded,
  onRefresh,
}: TrackLinkModalProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Extracted preview state
  const [previewItem, setPreviewItem] = useState<MangaPreviewItem | null>(null);
  const [title, setTitle] = useState("");
  const [tipe, setTipe] = useState("Manhwa");
  const [status, setStatus] = useState("Reading/Watching");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [scrapeTime, setScrapeTime] = useState("0.28s");

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (initialUrl) {
        setInputUrl(initialUrl);
        handleExtract(initialUrl);
      } else {
        setInputUrl("");
        setPreviewItem(null);
      }
    }
  }, [isOpen, initialUrl]);

  if (!isOpen) return null;

  // Preset sample URLs for quick testing
  const sampleLinks = [
    {
      name: "Mangago (Place to Be)",
      url: "https://www.mangago.me/read-manga/place_to_be_1/",
      type: "Manhwa",
    },
    {
      name: "Webtoon (Omniscient Reader)",
      url: "https://www.webtoons.com/en/action/omniscient-reader/list?title_no=2154",
      type: "Manhwa",
    },
    {
      name: "MangaPlus (Chainsaw Man)",
      url: "https://mangaplus.shueisha.co.jp/titles/100037",
      type: "Manga",
    },
    {
      name: "Kakaopage (Solo Leveling)",
      url: "https://page.kakao.com/content/50866481",
      type: "Manhwa",
    },
  ];

  // Clipboard paste helper
  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputUrl(text);
          setErrorMsg(null);
        }
      }
    } catch {
      setErrorMsg("Izin membaca clipboard ditolak oleh browser.");
    }
  };

  // Extract metadata via backend
  const handleExtract = async (urlToQuery?: string) => {
    const target = (urlToQuery || inputUrl).trim();
    if (!target) {
      setErrorMsg("Masukkan atau tempel link komik/anime terlebih dahulu.");
      return;
    }

    setIsExtracting(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setPreviewItem(null);
    const startTime = performance.now();

    try {
      const res = await previewMangaImport(target);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setScrapeTime(`${elapsed}s`);

      if (res.data && res.data.length > 0) {
        const item = res.data[0];
        setPreviewItem(item);
        setTitle(item.title || "Untitled Comic");
        setTipe(item.tipe || "Manhwa");
        setStatus(item.status || "Reading/Watching");
        setNotes(item.notes || `Scraped from ${target}`);

        // Tags parsing
        const initialTags = (item.tags || []).map((t) =>
          typeof t === "string" ? t : t.name
        );
        if (initialTags.length === 0) {
          initialTags.push("Tracker", "Online Read");
        }
        setTags(initialTags);
      } else {
        setErrorMsg("Tidak dapat mengekstrak metadata dari link tersebut.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menghubungi service scraper preview.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Add custom tag
  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput("");
    }
  };

  // Remove tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Save to Notion Live Database
  const handleSaveToNotion = async () => {
    if (!title.trim()) {
      setErrorMsg("Judul komik/anime tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const coverUrl = previewItem?.cover || undefined;
      const res = await createNotionItem({
        title: title.trim(),
        tipe,
        status,
        link: inputUrl.trim() || previewItem?.link || undefined,
        tags: tags.length > 0 ? tags : ["Tracker"],
        notes: notes.trim(),
        cover: coverUrl,
        icon: tipe === "Anime" ? "🎬" : "📖",
      });

      setSuccessMsg(`"${title}" berhasil didaftarkan langsung ke database Notion!`);

      if (onItemAdded && res.data) {
        onItemAdded(res.data);
      }
      if (onRefresh) {
        onRefresh();
      }

      // Auto close after 1.5 seconds on success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal menyimpan entri ke database Notion.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md anim-backdrop">
      <div className="bg-[#FAF8F5] text-[#171717] w-full max-w-lg rounded-2xl shadow-2xl border border-[#E5DFD5] overflow-hidden flex flex-col max-h-[92vh] anim-modal-spring">
        {/* Header Bar (Image 1 Style) */}
        <div className="bg-[#171717] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#2C2C2C] select-none">
          <div className="flex items-center space-x-2.5">
            <span className="text-amber-400 text-lg">⚡</span>
            <div>
              <div className="font-bold text-xs tracking-wider uppercase font-mono text-white">
                SHARE TO NOTION TRACKER
              </div>
              <div className="text-[10px] text-neutral-400 tracking-tight flex items-center gap-1.5">
                <span>MOBILE SHARE TARGET</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="font-mono text-neutral-300">V2.4.1 BRIDGE</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#262626] hover:bg-[#333333] flex items-center justify-center text-neutral-300 hover:text-white transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Quick Alert Notices */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between">
              <span>⚠️ {errorMsg}</span>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-red-500 hover:text-red-900 ml-2 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-3.5 py-2.5 rounded-lg flex items-center space-x-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Section 1: Inbound Link Input */}
          <div className="bg-white border border-[#E8E2D8] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-neutral-700 tracking-wider uppercase flex items-center gap-1.5">
                <span>🔗</span>
                <span>INBOUND COMIC / ANIME LINK</span>
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] font-medium text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded transition cursor-pointer flex items-center gap-1"
              >
                <span>📋</span>
                <span>Tempel Link</span>
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleExtract()}
                placeholder="https://mangago.me/read-manga/..."
                className="flex-1 bg-[#F9F7F2] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#171717] focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleExtract()}
                disabled={isExtracting}
                className="bg-[#171717] hover:bg-[#2C2C2C] disabled:bg-neutral-300 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {isExtracting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    <span>Scraping...</span>
                  </>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>Ekstrak</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Samples */}
            <div className="mt-2.5 pt-2 border-t border-[#F0EBE0] flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-neutral-500 font-semibold uppercase">
                Contoh Cepat:
              </span>
              {sampleLinks.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputUrl(s.url);
                    handleExtract(s.url);
                  }}
                  className="text-[10px] bg-[#EFECE4] hover:bg-[#E5DFD5] text-neutral-800 px-2 py-0.5 rounded font-medium transition cursor-pointer"
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Scraped Preview Card (Image 1 Style) */}
          {previewItem ? (
            <div className="bg-white border-2 border-[#171717] rounded-xl p-4 shadow-md space-y-3.5 relative overflow-hidden">
              {/* Parsed Inbound Link Badge */}
              <div className="flex items-center justify-between text-[11px] pb-2 border-b border-[#EAE5DC]">
                <div className="text-blue-600 font-bold uppercase font-mono tracking-tight flex items-center gap-1">
                  <span>⚡ PARSED INBOUND LINK</span>
                </div>
                <div className="text-[10px] text-neutral-500 font-mono">
                  ⏱️ {scrapeTime} scrape
                </div>
              </div>

              {/* URL String Display */}
              <div className="bg-[#F6F3EB] px-2.5 py-1.5 rounded border border-[#E3DC CE] text-[11px] font-mono text-neutral-700 truncate">
                🔗 {inputUrl || previewItem.link || "https://..."}
              </div>

              {/* Main Info: Cover + Details */}
              <div className="flex gap-3.5 items-start">
                {/* Cover with HD BADGE */}
                <div className="relative w-20 h-28 rounded-lg overflow-hidden border border-[#D5CDC0] bg-neutral-200 shrink-0 shadow-xs">
                  {previewItem.cover ? (
                    <img
                      src={previewItem.cover}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-xl bg-[#202020] text-neutral-400">
                      📖
                    </div>
                  )}
                  <span className="absolute bottom-1 left-1 bg-black/80 text-amber-400 font-bold text-[9px] px-1 py-0.2 rounded font-mono tracking-wider">
                    HD COVER
                  </span>
                </div>

                {/* Right Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="bg-[#171717] text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                      DETECTED
                    </span>
                    <span className="text-[11px] font-semibold text-neutral-600">
                      METADATA TERVERIFIKASI
                    </span>
                  </div>

                  {/* Title Input */}
                  <div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full font-bold text-sm text-[#171717] bg-[#F7F5EE] border border-[#DDD5C7] rounded px-2 py-1 focus:outline-none focus:border-black"
                      placeholder="Judul Komik / Anime"
                    />
                  </div>

                  {/* Format & Status Selectors */}
                  <div className="flex gap-2 pt-1">
                    <select
                      value={tipe}
                      onChange={(e) => setTipe(e.target.value)}
                      className="text-xs bg-[#EFECE4] border border-[#D5CDC0] text-[#171717] rounded px-2 py-1 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="Manhwa">📖 Manhwa</option>
                      <option value="Manga">📚 Manga</option>
                      <option value="Anime">🎬 Anime</option>
                      <option value="Novel">📄 Novel</option>
                    </select>

                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="text-xs bg-[#EFECE4] border border-[#D5CDC0] text-[#171717] rounded px-2 py-1 font-semibold focus:outline-none cursor-pointer"
                    >
                      <option value="Reading/Watching">⦿ Reading</option>
                      <option value="Completed">✓ Completed</option>
                      <option value="Plan to Read">○ Plan to Read</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Scraped Tags Pill Bar */}
              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  SCRAPED TAGS
                </label>
                <div className="flex flex-wrap gap-1.5 items-center">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-[#EAE5DC] text-[#171717] text-xs font-semibold px-2 py-0.5 rounded border border-[#D5CDC0] flex items-center gap-1 group"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-neutral-400 hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  <div className="inline-flex items-center gap-1">
                    <input
                      type="text"
                      value={newTagInput}
                      onChange={(e) => setNewTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                      placeholder="+ Tag"
                      className="bg-[#F7F5EE] border border-[#DDD5C7] rounded px-2 py-0.5 text-xs w-16 focus:outline-none focus:w-24 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Notes / Description */}
              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block mb-1">
                  CATATAN / SINOPSIS
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#F7F5EE] border border-[#DDD5C7] rounded-lg p-2 text-xs text-[#171717] focus:outline-none focus:border-black font-sans resize-none"
                  placeholder="Catatan tambahan untuk entri Notion..."
                />
              </div>

              {/* BIG YELLOW 1-CLICK SAVE BUTTON (Image 1 Style) */}
              <button
                type="button"
                onClick={handleSaveToNotion}
                disabled={isSaving}
                className="w-full bg-[#F5C518] hover:bg-[#E5B508] active:bg-[#D5A500] text-[#171717] font-extrabold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 border border-[#E0B000]"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span>
                    <span>MENYIMPAN KE NOTION VAULT...</span>
                  </>
                ) : (
                  <>
                    <span>📑</span>
                    <span>SIMPAN KE NOTION DATABASE (1-KLIK)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Empty State Guidance */
            <div className="border border-dashed border-[#D5CDC0] rounded-xl p-6 text-center bg-white/60 space-y-2">
              <span className="text-3xl block">⚡</span>
              <div className="font-bold text-xs uppercase tracking-wider text-neutral-800">
                Fitur Track Link Otomatis
              </div>
              <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
                Tempelkan tautan komik dari Mangago, Webtoon, MangaPlus, atau Kakaopage.
                Sistem akan secara instan mengekstrak cover, sinopsis, dan tag untuk disimpan ke Notion.
              </p>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="bg-[#EFECE4] border-t border-[#DDD5C7] px-5 py-2.5 text-[11px] text-neutral-600 flex items-center justify-between select-none">
          <span className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Target: Notion Database #MN-2026</span>
          </span>
          <button
            onClick={onClose}
            className="text-neutral-700 hover:text-black font-semibold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
