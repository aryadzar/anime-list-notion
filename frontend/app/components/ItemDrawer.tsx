import { useState } from "react";
import type { NotionItem } from "../types/notion";
import {
  formatFullDate,
  getStatusBadgeClass,
  getTipeBadgeClass,
  getTagBadgeClass,
} from "../lib/utils";

interface ItemDrawerProps {
  item: NotionItem | null;
  isOpen: boolean;
  onClose: () => void;
  isFullPage: boolean;
  onToggleFullPage: () => void;
  isMock: boolean;
}

export function ItemDrawer({
  item,
  isOpen,
  onClose,
  isFullPage,
  onToggleFullPage,
  isMock,
}: ItemDrawerProps) {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<
    Array<{ author: string; text: string; time: string }>
  >([]);
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen || !item) return null;

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments([
      ...comments,
      {
        author: "Arya",
        text: commentText.trim(),
        time: "Baru saja",
      },
    ]);
    setCommentText("");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <aside
      className={`bg-[#191919] border-l border-[#242424] overflow-y-auto px-6 sm:px-8 py-6 select-text flex flex-col justify-between shadow-2xl transition-all duration-300 z-20 ${
        isFullPage
          ? "fixed inset-0 z-50 w-full max-w-none border-l-0"
          : "w-full md:w-[480px] lg:w-[540px] xl:w-[580px] h-full flex-shrink-0"
      }`}
      data-purpose="notion-inspection-panel"
    >
      <div>
        {/* Top Drawer Controls */}
        <div className="flex items-center justify-between pb-4 text-neutral-400">
          <div className="flex items-center space-x-2">
            {/* Double arrow collapse */}
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#282828] rounded text-neutral-400 hover:text-white transition"
              title="Tutup / Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            </button>

            {/* Fullscreen / expand icon */}
            <button
              onClick={onToggleFullPage}
              className="p-1 hover:bg-[#282828] rounded text-neutral-400 hover:text-white transition"
              title={isFullPage ? "Keluar layar penuh" : "Buka sebagai halaman penuh"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isFullPage ? (
                  <path
                    d="M9 9L4 4m0 0h5m-5 0v5m6 6l5 5m0 0h-5m5 0v-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                ) : (
                  <path
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-xs text-neutral-500">
            <button
              onClick={handleShare}
              className="hover:text-neutral-300 cursor-pointer transition flex items-center gap-1"
            >
              <span>{isCopied ? "Tersalin!" : "Bagikan"}</span>
            </button>
            <span className="hover:text-neutral-300 cursor-pointer">Favorit</span>
            <span className="hover:text-neutral-300 cursor-pointer font-bold">•••</span>
          </div>
        </div>

        {/* Document Main Title */}
        <div className="mt-4 mb-6 flex items-start gap-3">
          <span className="text-3xl select-none mt-1">{item.icon || "📖"}</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#f3f3f2] tracking-tight leading-tight">
            {item.title}
          </h1>
        </div>

        {/* Cover Property Section */}
        <div className="mb-8" data-purpose="cover-field">
          <div className="flex items-center space-x-1.5 text-xs text-neutral-400 mb-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span className="font-medium text-neutral-300">Cover</span>
          </div>

          <div className="flex items-center space-x-3">
            {item.cover ? (
              <div className="w-36 h-48 rounded-lg overflow-hidden border border-[#333333] relative bg-[#222222] shadow-sm flex-shrink-0 group">
                <img
                  alt={`${item.title} cover art`}
                  className="w-full h-full object-cover object-top"
                  src={item.cover}
                />
              </div>
            ) : (
              <div className="w-36 h-48 rounded-lg border border-[#333333] bg-[#222222] flex flex-col items-center justify-center text-neutral-400 shadow-sm flex-shrink-0">
                <span className="text-3xl mb-2">{item.icon || "📖"}</span>
                <span className="text-sm font-mono font-bold text-neutral-300">
                  {item.initials || "RAW"}
                </span>
              </div>
            )}

            {/* Empty slot '+' dashed container */}
            <div
              onClick={() => alert("Cover gambar disinkronkan otomatis dari Notion database atau kolom Cover!")}
              className="w-36 h-48 rounded-lg border border-[#2e2e2e] bg-[#202020]/40 flex flex-col items-center justify-center hover:bg-[#242424] hover:border-neutral-500 transition cursor-pointer flex-shrink-0 text-neutral-500 hover:text-neutral-300 group"
              title="Notion Media Slot"
            >
              <svg
                className="w-8 h-8 stroke-[1.25] group-hover:scale-110 transition"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-[10px] mt-1 text-neutral-500">Notion Media</span>
            </div>
          </div>
        </div>

        {/* Properties List (Notion Key-Value Grid) */}
        <div className="space-y-3 text-xs" data-purpose="notion-properties-table">
          <div className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-3">
            Properties
          </div>

          {/* Property: Catatan */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Catatan</span>
            </div>
            <div className={item.notes ? "text-neutral-200" : "text-neutral-500"}>
              {item.notes || "Empty"}
            </div>
          </div>

          {/* Property: Created by */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Created by</span>
            </div>
            <div className="flex items-center space-x-1.5 text-neutral-200">
              <span className="w-5 h-5 rounded-full bg-amber-600/40 border border-amber-500/50 flex items-center justify-center text-[11px]">
                🐹
              </span>
              <span className="font-medium">{item.createdBy?.name || "arya"}</span>
            </div>
          </div>

          {/* Property: Ditambahkan */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Ditambahkan</span>
            </div>
            <div className="text-neutral-200 font-normal">
              {formatFullDate(item.createdTime)}
            </div>
          </div>

          {/* Property: Files & media */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span>Files &amp; media</span>
            </div>
            <div className="text-neutral-500">Empty</div>
          </div>

          {/* Property: Status */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" strokeWidth="2" />
                <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeWidth="2" />
              </svg>
              <span>Status</span>
            </div>
            <div>
              <span className={`${getStatusBadgeClass(item.status)} notion-tag`}>
                {item.status}
              </span>
            </div>
          </div>

          {/* Property: Tags */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Tags</span>
            </div>
            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
              {item.tags && item.tags.length > 0 ? (
                item.tags.map((tag, idx) => (
                  <span key={idx} className={`${getTagBadgeClass(tag.name)} notion-tag`}>
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-neutral-500">Empty</span>
              )}
            </div>
          </div>

          {/* Property: Terakhir diedit */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Terakhir diedit</span>
            </div>
            <div className="text-neutral-200">
              {formatFullDate(item.lastEditedTime)}
            </div>
          </div>

          {/* Property: Tipe */}
          <div className="grid grid-cols-[130px_1fr] items-center py-1 border-b border-[#222222]/60">
            <div className="flex items-center space-x-2 text-neutral-400">
              <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span>Tipe</span>
            </div>
            <div>
              <span className={`${getTipeBadgeClass(item.tipe)} notion-tag`}>
                {item.tipe}
              </span>
            </div>
          </div>

          {/* Action: Add a property */}
          <div className="pt-2">
            <button
              onClick={() => alert("Menambah properti baru dapat dilakukan langsung di database Notion Anda!")}
              className="flex items-center space-x-2 text-neutral-400 hover:text-neutral-200 hover:bg-[#242424] px-2 py-1 -ml-2 rounded transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
              <span className="text-xs">Add a property</span>
            </button>
          </div>
        </div>

        {/* Custom Links Block */}
        <div className="mt-8 pt-6 border-t border-[#292929] space-y-4 text-xs" data-purpose="external-links">
          {/* Link Property */}
          <div>
            <div className="flex items-center space-x-1.5 text-neutral-400 mb-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="font-medium text-neutral-300">Link</span>
            </div>
            {item.link ? (
              <a
                className="text-neutral-200 underline underline-offset-2 decoration-[#4a4a4a] hover:decoration-neutral-200 font-mono text-[11px] break-all block"
                href={item.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.link}
              </a>
            ) : (
              <span className="text-neutral-500">Empty</span>
            )}
          </div>

          {/* Raw/Alt Link Property */}
          <div>
            <div className="flex items-center space-x-1.5 text-neutral-400 mb-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <span className="font-medium text-neutral-300">Raw/Alt Link</span>
            </div>
            {item.rawAltLink ? (
              <a
                className="text-neutral-200 underline underline-offset-2 decoration-[#4a4a4a] hover:decoration-neutral-200 font-mono text-[11px] break-all block"
                href={item.rawAltLink}
                rel="noopener noreferrer"
                target="_blank"
              >
                {item.rawAltLink}
              </a>
            ) : (
              <span className="text-neutral-500">Empty</span>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10 pt-6 border-t border-[#292929]">
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-3">
            <span className="font-medium text-neutral-300">Comments</span>
            {comments.length > 0 && (
              <span className="text-[11px] text-neutral-500">{comments.length} komentar</span>
            )}
          </div>

          {/* Comment list */}
          {comments.length > 0 && (
            <div className="space-y-2 mb-3">
              {comments.map((c, i) => (
                <div key={i} className="bg-[#222222] p-2.5 rounded text-xs border border-[#2c2c2c]">
                  <div className="flex items-center justify-between text-neutral-400 text-[10px] mb-1">
                    <span className="font-medium text-neutral-300">{c.author}</span>
                    <span>{c.time}</span>
                  </div>
                  <p className="text-neutral-200">{c.text}</p>
                </div>
              ))}
            </div>
          )}

          {/* Comment input */}
          <form onSubmit={handleAddComment} className="flex items-center space-x-2 bg-[#202020] rounded-md px-2 py-1 border border-[#2b2b2b] focus-within:border-neutral-500 transition">
            <div className="w-6 h-6 rounded-full bg-neutral-700 flex items-center justify-center text-[10px] text-neutral-300 font-medium flex-shrink-0">
              A
            </div>
            <input
              className="bg-transparent border-none text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-0 w-full px-2 py-1"
              placeholder="Tambahkan komentar atau catatan rilis..."
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            {commentText && (
              <button
                type="submit"
                className="text-[11px] px-2 py-0.5 bg-neutral-100 hover:bg-white text-black font-semibold rounded transition"
              >
                Kirim
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-12 pt-4 border-t border-[#242424] text-[11px] text-neutral-600 flex justify-between items-center">
        <span>{isMock ? "Tersinkron dengan Database Lokal (Mock)" : "Tersinkron dengan Notion API Live"}</span>
        <span className="font-mono text-neutral-500">ID: {item.id.slice(0, 12)}</span>
      </footer>
    </aside>
  );
}
