import { useState } from "react";
import type { NotionItem, MangaPreviewItem, CreateItemPayload } from "../types/notion";
import { previewMangaImport, createNotionItemsBatch, createNotionItem } from "../lib/api";

interface NewEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNewItem: (item: NotionItem) => void;
  onRefresh?: () => void;
}

export function NewEntryModal({ isOpen, onClose, onAddNewItem, onRefresh }: NewEntryModalProps) {
  const [activeTab, setActiveTab] = useState<"smart" | "manual">("smart");

  // ==========================================
  // TAB 1: SMART BATCH / WEB IMPORT STATE
  // ==========================================
  const [rawInput, setRawInput] = useState("");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isSavingBatch, setIsSavingBatch] = useState(false);
  const [previewItems, setPreviewItems] = useState<MangaPreviewItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ==========================================
  // TAB 2: MANUAL ENTRY STATE
  // ==========================================
  const [title, setTitle] = useState("");
  const [tipe, setTipe] = useState("Manhwa");
  const [status, setStatus] = useState("Reading/Watching");
  const [tagsInput, setTagsInput] = useState("Action, Fantasy");
  const [link, setLink] = useState("");
  const [cover, setCover] = useState("");
  const [notes, setNotes] = useState("");
  const [icon, setIcon] = useState("📖");
  const [isSavingManual, setIsSavingManual] = useState(false);

  if (!isOpen) return null;

  // Populate sample titles for quick demonstration
  const handleInsertSample = () => {
    setRawInput(
      `Perfect Spiral\nSolo Leveling\nhttps://www.mangago.me/read-manga/eleceed/\nOmniscient Reader's Viewpoint\nLookism`
    );
    setErrorMessage(null);
  };

  // Trigger Metadata extraction
  const handleFetchPreview = async () => {
    if (!rawInput.trim()) {
      setErrorMessage("Silakan tempel judul, link, atau daftar bookmark komik terlebih dahulu.");
      return;
    }

    setIsPreviewLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await previewMangaImport(rawInput);
      if (!res.data || res.data.length === 0) {
        setErrorMessage("Tidak ada judul komik yang terdeteksi dari teks yang Anda tempel.");
      } else {
        setPreviewItems(res.data);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal memproses pratinjau komik.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  // Toggle selection on a preview item
  const handleToggleSelect = (id: string) => {
    setPreviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  // Select all / Deselect all
  const handleToggleAll = (selectAll: boolean) => {
    setPreviewItems((prev) => prev.map((item) => ({ ...item, selected: selectAll })));
  };

  // Update field on a preview item
  const handleUpdateItemField = (id: string, field: keyof MangaPreviewItem, value: any) => {
    setPreviewItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  // Save selected batch items to Notion
  const handleSaveBatchToNotion = async () => {
    const selectedItems = previewItems.filter((i) => i.selected);
    if (selectedItems.length === 0) {
      setErrorMessage("Pilih minimal satu komik yang ingin disimpan.");
      return;
    }

    setIsSavingBatch(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const payloads: CreateItemPayload[] = selectedItems.map((item) => ({
        title: item.title,
        tipe: item.tipe,
        status: item.status,
        tags: item.tags.map((t) => t.name),
        link: item.link || undefined,
        notes: item.notes || undefined,
        cover: item.cover || undefined,
        icon: item.tipe === "Anime" ? "🎬" : "📖",
      }));

      const res = await createNotionItemsBatch(payloads);

      if (res.created && res.created.length > 0) {
        // Trigger first created item to open in drawer
        onAddNewItem(res.created[0]);
        // Trigger TanStack query refresh so full list updates
        if (onRefresh) onRefresh();

        setSuccessMessage(res.message);

        // Auto-close modal after 1.5 seconds on full success
        if (res.errors.length === 0) {
          setTimeout(() => {
            onClose();
          }, 1400);
        }
      } else {
        setErrorMessage(
          res.errors.join("; ") || "Gagal menyimpan entri ke Notion. Cek konfigurasi Notion di backend."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Gagal menyimpan komik ke Notion.");
    } finally {
      setIsSavingBatch(false);
    }
  };

  // Handle single manual submission
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSavingManual(true);
    setErrorMessage(null);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: CreateItemPayload = {
      title: title.trim(),
      tipe,
      status,
      tags,
      link: link.trim() || undefined,
      cover: cover.trim() || undefined,
      notes: notes.trim() || undefined,
      icon: icon || "📖",
    };

    try {
      const res = await createNotionItem(payload);
      if (res.data) {
        onAddNewItem(res.data);
      }
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      console.warn("Manual save to Notion failed, using local fallback:", err);
      // Local fallback
      const newItem: NotionItem = {
        id: "NEW-" + Date.now().toString(36),
        title: title.trim(),
        icon: icon || "📖",
        cover: cover.trim() || null,
        initials: title.slice(0, 3).toUpperCase(),
        status,
        tipe,
        tags: tags.map((t) => ({ name: t })),
        createdTime: new Date().toISOString(),
        lastEditedTime: new Date().toISOString(),
        createdBy: { name: "arya" },
        link: link.trim() || null,
        rawAltLink: null,
        notes: notes.trim(),
      };
      onAddNewItem(newItem);
      onClose();
    } finally {
      setIsSavingManual(false);
    }
  };

  const selectedCount = previewItems.filter((i) => i.selected).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#181818] border border-[#2e2e2e] rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#282828] bg-[#1d1d1d]/80">
          <div className="flex items-center space-x-3">
            <span className="text-xl">✨</span>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Tambah Komik ke Database Notion
              </h2>
              <p className="text-[11px] text-neutral-400">
                Pilih metode impor otomatis dari web atau isi formulir manual
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-[#282828] transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs Navigation */}
        <div className="flex border-b border-[#282828] bg-[#141414] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab("smart")}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "smart"
                ? "border-blue-500 text-white font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>⚡</span>
            <span>Smart Import (Batch / Web)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono">
              Rekomendasi
            </span>
          </button>
          <button
            onClick={() => setActiveTab("manual")}
            className={`pb-2.5 px-3 font-medium transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === "manual"
                ? "border-blue-500 text-white font-semibold"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <span>✍️</span>
            <span>Tambah Manual</span>
          </button>
        </div>

        {/* Feedback Alert Messages */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 bg-red-950/50 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-start gap-2">
            <span className="text-red-400">⚠️</span>
            <span className="flex-1">{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-red-200 text-xs"
            >
              ✕
            </button>
          </div>
        )}
        {successMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <span className="text-emerald-400">✅</span>
            <span className="flex-1">{successMessage}</span>
          </div>
        )}

        {/* TAB 1: SMART IMPORT BODY */}
        {activeTab === "smart" && (
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-5 space-y-4">
            {/* Input Form Section */}
            {previewItems.length === 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                    <span>📋</span>
                    <span>Tempel Daftar Judul atau Link Komik:</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleInsertSample}
                    className="text-[11px] text-blue-400 hover:text-blue-300 underline cursor-pointer"
                  >
                    + Coba Contoh Populer
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder={`Tempel daftar komik dari web mana saja (Mangago, Komikindo, Webtoons, Asura, dll):\n\nSolo Leveling\nOmniscient Reader's Viewpoint\nhttps://www.mangago.me/read-manga/eleceed/\nLookism (Ch. 500)\nThe Beginning After the End`}
                  className="w-full bg-[#121212] border border-[#2f2f2f] rounded-lg p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 font-mono leading-relaxed resize-none"
                />

                <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-1">
                  <span>
                    💡 Tips: Anda bisa paste teks bookmark, link URL komik, atau daftar nama (satu per baris).
                  </span>
                  <button
                    type="button"
                    disabled={isPreviewLoading || !rawInput.trim()}
                    onClick={handleFetchPreview}
                    className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                      isPreviewLoading || !rawInput.trim()
                        ? "bg-[#282828] text-neutral-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-900/30"
                    }`}
                  >
                    {isPreviewLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Menganalisis & Mengambil Cover...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Tarik Metadata & Preview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* PREVIEW RESULTS SECTION */
              <div className="flex-1 flex flex-col min-h-0 space-y-3">
                <div className="flex items-center justify-between bg-[#1f1f1f] px-3 py-2 rounded-lg border border-[#2a2a2a]">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span className="text-white font-medium">
                      Pratinjau ({previewItems.length} komik ditemukan)
                    </span>
                    <span className="text-neutral-400">• Terpilih: {selectedCount}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px]">
                    <button
                      onClick={() => handleToggleAll(true)}
                      className="px-2 py-0.5 bg-[#2a2a2a] hover:bg-[#333] text-neutral-300 rounded cursor-pointer transition"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={() => handleToggleAll(false)}
                      className="px-2 py-0.5 bg-[#2a2a2a] hover:bg-[#333] text-neutral-300 rounded cursor-pointer transition"
                    >
                      Batal Pilih
                    </button>
                    <button
                      onClick={() => {
                        setPreviewItems([]);
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded cursor-pointer transition"
                    >
                      Input Ulang
                    </button>
                  </div>
                </div>

                {/* Preview Cards List */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 max-h-[50vh]">
                  {previewItems.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border transition flex gap-3 ${
                        item.selected
                          ? "bg-[#1f1f1f] border-blue-500/50 shadow-md shadow-blue-950/20"
                          : "bg-[#161616] border-[#262626] opacity-60"
                      }`}
                    >
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={item.selected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded bg-[#101010] border-neutral-700 text-blue-600 focus:ring-0 cursor-pointer"
                        />
                      </div>

                      {/* Cover Thumbnail */}
                      <div className="w-14 h-20 rounded bg-[#252525] border border-[#333] overflow-hidden flex-shrink-0 relative">
                        {item.cover ? (
                          <img
                            src={item.cover}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on broken image
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 text-[10px]">
                            <span>📖</span>
                            <span>No Cover</span>
                          </div>
                        )}
                      </div>

                      {/* Metadata Details & Edit Fields */}
                      <div className="flex-1 min-w-0 space-y-1.5 text-xs">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) =>
                              handleUpdateItemField(item.id, "title", e.target.value)
                            }
                            className="flex-1 bg-[#121212] border border-[#2f2f2f] rounded px-2 py-1 text-white font-medium focus:outline-none focus:border-blue-500"
                            placeholder="Judul komik..."
                          />
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${
                              item.matched
                                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                                : "bg-neutral-800 text-neutral-400"
                            }`}
                          >
                            {item.matched ? "✓ Metadata HD" : "Judul Mentah"}
                          </span>
                        </div>

                        {/* Type, Status, & Tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Type Select */}
                          <select
                            value={item.tipe}
                            onChange={(e) =>
                              handleUpdateItemField(item.id, "tipe", e.target.value)
                            }
                            className="bg-[#121212] border border-[#2f2f2f] rounded px-2 py-0.5 text-[11px] text-neutral-200 focus:outline-none"
                          >
                            <option value="Manhwa">Manhwa</option>
                            <option value="Manga">Manga</option>
                            <option value="Anime">Anime</option>
                            <option value="Manhua">Manhua</option>
                            <option value="Novel">Novel</option>
                          </select>

                          {/* Status Select */}
                          <select
                            value={item.status}
                            onChange={(e) =>
                              handleUpdateItemField(item.id, "status", e.target.value)
                            }
                            className="bg-[#121212] border border-[#2f2f2f] rounded px-2 py-0.5 text-[11px] text-neutral-200 focus:outline-none"
                          >
                            <option value="Reading/Watching">Reading/Watching</option>
                            <option value="Completed">Completed</option>
                            <option value="Plan to Read">Plan to Read</option>
                            <option value="On Hold">On Hold</option>
                          </select>

                          {/* Tags Chips */}
                          <div className="flex items-center gap-1 flex-wrap">
                            {item.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-[#262626] text-neutral-300 text-[10px]"
                              >
                                {tag.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Cover Image URL Edit Field */}
                        <div className="flex items-center gap-1.5 text-[10px] text-neutral-400">
                          <span className="text-neutral-500 font-mono flex-shrink-0">Cover:</span>
                          <input
                            type="text"
                            value={item.cover || ""}
                            onChange={(e) =>
                              handleUpdateItemField(item.id, "cover", e.target.value)
                            }
                            placeholder="URL gambar cover (opsional)..."
                            className="flex-1 bg-[#121212] border border-[#2a2a2a] rounded px-1.5 py-0.5 text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-blue-500 font-mono text-[10px]"
                          />
                        </div>

                        {/* Synopsis / Notes snippet */}
                        {item.notes && (
                          <p className="text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                            {item.notes}
                          </p>
                        )}

                        {/* Link preview */}
                        {item.link && (
                          <div className="text-[10px] text-blue-400 truncate flex items-center gap-1">
                            <span>🔗</span>
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noreferrer"
                              className="hover:underline"
                            >
                              {item.link}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 1 ACTION FOOTER */}
        {activeTab === "smart" && previewItems.length > 0 && (
          <div className="px-5 py-3 border-t border-[#282828] bg-[#1d1d1d]/80 flex items-center justify-between text-xs">
            <span className="text-neutral-400">
              Total <strong className="text-white">{selectedCount}</strong> komik akan disimpan langsung ke database Notion Anda.
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#2e2e2e] text-neutral-300 rounded-md transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSavingBatch || selectedCount === 0}
                onClick={handleSaveBatchToNotion}
                className={`px-4 py-1.5 rounded-md font-semibold text-white transition flex items-center gap-2 cursor-pointer ${
                  isSavingBatch || selectedCount === 0
                    ? "bg-blue-900/50 text-neutral-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-900/40"
                }`}
              >
                {isSavingBatch ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Menyimpan ke Notion...</span>
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    <span>Simpan ({selectedCount}) Komik ke Notion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL ENTRY BODY */}
        {activeTab === "manual" && (
          <form onSubmit={handleManualSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
            <div className="flex gap-2">
              <div className="w-16">
                <label className="block text-neutral-400 mb-1">Ikon</label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-2 py-1.5 text-center text-base text-white focus:outline-none focus:border-neutral-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-neutral-400 mb-1">Judul / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Solo Leveling"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-400 mb-1">Tipe</label>
                <select
                  value={tipe}
                  onChange={(e) => setTipe(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-neutral-500"
                >
                  <option value="Manhwa">Manhwa</option>
                  <option value="Manga">Manga</option>
                  <option value="Anime">Anime</option>
                  <option value="Manhua">Manhua</option>
                  <option value="Novel">Novel</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white focus:outline-none focus:border-neutral-500"
                >
                  <option value="Reading/Watching">Reading/Watching</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Plan to Read">Plan to Read</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Tags (pisahkan koma)</label>
              <input
                type="text"
                placeholder="Action, Fantasy, Comedy"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">URL Cover Gambar (Opsional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={cover}
                onChange={(e) => setCover(e.target.value)}
                className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Link Baca / Tonton (Opsional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Catatan / Notes (Opsional)</label>
              <input
                type="text"
                placeholder="Ch. 120, Arc Terakhir, Tamat..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#141414] border border-[#2f2f2f] rounded-md px-3 py-1.5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 bg-[#252525] hover:bg-[#2e2e2e] text-neutral-300 rounded-md transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSavingManual}
                className="px-4 py-1.5 bg-neutral-100 hover:bg-white text-black font-semibold rounded-md transition shadow cursor-pointer flex items-center gap-1.5"
              >
                {isSavingManual && (
                  <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                )}
                <span>Simpan Entri ke Notion</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
