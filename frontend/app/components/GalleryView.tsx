import type { NotionItem } from "../types/notion";
import { getStatusBadgeClass, getTipeBadgeClass, getTagBadgeClass } from "../lib/utils";

interface GalleryViewProps {
  items: NotionItem[];
  selectedItem: NotionItem | null;
  onSelectItem: (item: NotionItem) => void;
  onOpenNewModal: () => void;
}

export function GalleryView({
  items,
  selectedItem,
  onSelectItem,
  onOpenNewModal,
}: GalleryViewProps) {
  return (
    <div className="flex-1 overflow-y-auto pr-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => {
          const isSelected = selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={`group bg-[#1a1a1a] hover:bg-[#202020] border rounded-lg overflow-hidden cursor-pointer transition flex flex-col shadow-md ${
                isSelected
                  ? "border-neutral-400 ring-1 ring-neutral-400"
                  : "border-[#2c2c2c] hover:border-[#383838]"
              }`}
            >
              {/* Card Cover Area */}
              <div className="w-full h-44 bg-[#141414] relative overflow-hidden flex items-center justify-center border-b border-[#262626]">
                {item.cover ? (
                  <img
                    src={item.cover}
                    alt={item.title}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-neutral-500">
                    <span className="text-3xl mb-1">{item.icon || "📖"}</span>
                    <span className="text-xs font-mono font-semibold text-neutral-400">
                      {item.initials || "NOTION"}
                    </span>
                  </div>
                )}
                {/* Status chip over cover */}
                <div className="absolute top-2 right-2">
                  <span className={`${getStatusBadgeClass(item.status)} notion-tag text-[10px] shadow`}>
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Card Content Area */}
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Title & Icon */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{item.icon || "📖"}</span>
                    <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white truncate">
                      {item.title}
                    </h3>
                  </div>

                  {/* Tipe & Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className={`${getTipeBadgeClass(item.tipe)} notion-tag text-[10px]`}>
                      {item.tipe}
                    </span>
                    {item.tags?.slice(0, 2).map((t, idx) => (
                      <span
                        key={idx}
                        className={`${getTagBadgeClass(t.name)} notion-tag text-[10px]`}
                      >
                        {t.name}
                      </span>
                    ))}
                    {item.tags && item.tags.length > 2 && (
                      <span className="text-[10px] text-neutral-500">
                        +{item.tags.length - 2}
                      </span>
                    )}
                  </div>

                  {/* Notes snippet */}
                  {item.notes && (
                    <p className="text-[11px] text-neutral-400 line-clamp-1 italic">
                      "{item.notes}"
                    </p>
                  )}
                </div>

                {/* Card footer */}
                <div className="mt-3 pt-2 border-t border-[#262626] flex items-center justify-between text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1">
                    <span className="text-xs">🐹</span> {item.createdBy?.name || "arya"}
                  </span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-neutral-400 hover:text-white underline font-mono text-[10px]"
                    >
                      Buka Link ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Card Slot */}
        <button
          onClick={onOpenNewModal}
          className="h-64 border-2 border-dashed border-[#2a2a2a] hover:border-neutral-500 bg-[#161616]/40 hover:bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center text-neutral-500 hover:text-neutral-300 transition cursor-pointer"
        >
          <svg className="w-8 h-8 mb-2 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs font-medium">+ Tambah Entri Baru</span>
        </button>
      </div>
    </div>
  );
}
