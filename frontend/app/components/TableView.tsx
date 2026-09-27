import type { NotionItem } from "../types/notion";
import {
  formatDate,
  getStatusBadgeClass,
  getTipeBadgeClass,
  getTagBadgeClass,
  formatUrlDisplay,
} from "../lib/utils";

interface TableViewProps {
  items: NotionItem[];
  selectedItem: NotionItem | null;
  onSelectItem: (item: NotionItem) => void;
  onOpenNewModal: () => void;
}

export function TableView({
  items,
  selectedItem,
  onSelectItem,
  onOpenNewModal,
}: TableViewProps) {
  // Compute footer statistics
  const totalCount = items.length;
  const uniqueUsers = new Set(items.map((i) => i.createdBy?.name).filter(Boolean)).size;

  return (
    <div className="flex-1 overflow-x-auto border border-[#262626] rounded-md bg-[#161616]">
      <table className="w-full text-left text-xs border-collapse select-text whitespace-nowrap">
        <thead className="bg-[#1c1c1c] text-neutral-400 border-b border-[#262626] select-none text-[11px] font-medium sticky top-0 z-10">
          <tr>
            <th className="py-2.5 px-3 border-r border-[#262626] w-64 min-w-[220px]">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Judul</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-24">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Cover</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-36">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="2" />
                  <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeWidth="2" />
                </svg>
                <span>Status</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-28">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Tipe</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-48">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Tags</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-44">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Ditambahkan</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-44">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Terakhir diedit</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-32">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Created by</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-52">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Link</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-40">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Raw/Alt Link</span>
              </div>
            </th>
            <th className="py-2.5 px-3 border-r border-[#262626] w-36">
              <div className="flex items-center space-x-1.5">
                <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M4 6h16M4 10h16M4 14h10" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>Catatan</span>
              </div>
            </th>
            <th className="py-2 px-3 text-neutral-500 hover:text-neutral-300 cursor-pointer w-10 text-center">
              <button className="hover:text-white" title="Tambah property">
                +
              </button>
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-[#222222] font-normal text-neutral-300">
          {items.map((item) => {
            const isSelected = selectedItem?.id === item.id;

            return (
              <tr
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`cursor-pointer transition ${
                  isSelected
                    ? "bg-[#222222] hover:bg-[#252525]"
                    : "hover:bg-[#1d1d1d]"
                }`}
              >
                {/* Judul */}
                <td className="py-2 px-3 border-r border-[#262626] font-medium text-white flex items-center gap-2">
                  <span className="text-xs">{item.icon || "📖"}</span>
                  <span className="truncate">{item.title}</span>
                  {isSelected && (
                    <span className="text-[9px] bg-neutral-800 text-neutral-300 px-1 py-0.2 rounded border border-neutral-700 ml-auto">
                      OPEN
                    </span>
                  )}
                </td>

                {/* Cover */}
                <td className="py-2 px-3 border-r border-[#262626]">
                  {item.cover ? (
                    <div className="w-14 h-20 rounded-md bg-[#202020] border border-[#333333] overflow-hidden shadow-sm">
                      <img
                        alt={`${item.title} cover`}
                        className="w-full h-full object-cover object-top"
                        src={item.cover}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-20 rounded-md bg-[#252525] border border-[#333333] flex flex-col items-center justify-center text-xs text-neutral-400 font-mono font-medium shadow-sm">
                      <span className="text-base mb-1">{item.icon || "📖"}</span>
                      <span>{item.initials || "RAW"}</span>
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="py-2 px-3 border-r border-[#262626]">
                  <span className={`${getStatusBadgeClass(item.status)} notion-tag text-[10px]`}>
                    {item.status}
                  </span>
                </td>

                {/* Tipe */}
                <td className="py-2 px-3 border-r border-[#262626]">
                  <span className={`${getTipeBadgeClass(item.tipe)} notion-tag text-[10px]`}>
                    {item.tipe}
                  </span>
                </td>

                {/* Tags */}
                <td className="py-2 px-3 border-r border-[#262626]">
                  <div className="flex items-center gap-1 flex-wrap">
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className={`${getTagBadgeClass(tag.name)} notion-tag text-[10px]`}
                        >
                          {tag.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-600">Empty</span>
                    )}
                  </div>
                </td>

                {/* Ditambahkan */}
                <td className="py-2 px-3 border-r border-[#262626] text-neutral-400 font-mono text-[11px]">
                  {formatDate(item.createdTime)}
                </td>

                {/* Terakhir diedit */}
                <td className="py-2 px-3 border-r border-[#262626] text-neutral-400 font-mono text-[11px]">
                  {formatDate(item.lastEditedTime)}
                </td>

                {/* Created by */}
                <td className="py-2 px-3 border-r border-[#262626]">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-600/40 border border-amber-500/50 flex items-center justify-center text-[9px]">
                      🐹
                    </span>
                    <span className="text-xs">{item.createdBy?.name || "arya"}</span>
                  </div>
                </td>

                {/* Link */}
                <td className="py-2 px-3 border-r border-[#262626] font-mono text-[11px] text-neutral-400 underline decoration-neutral-600 hover:text-neutral-200 truncate max-w-[200px]">
                  {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formatUrlDisplay(item.link)}
                    </a>
                  ) : (
                    <span className="text-neutral-600 no-underline">Empty</span>
                  )}
                </td>

                {/* Raw/Alt Link */}
                <td className="py-2 px-3 border-r border-[#262626] font-mono text-[11px] text-neutral-400 underline decoration-neutral-600 hover:text-neutral-200 truncate max-w-[200px]">
                  {item.rawAltLink ? (
                    <a
                      href={item.rawAltLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {formatUrlDisplay(item.rawAltLink)}
                    </a>
                  ) : (
                    <span className="text-neutral-600 no-underline">Empty</span>
                  )}
                </td>

                {/* Catatan */}
                <td className="py-2 px-3 border-r border-[#262626] text-neutral-400 text-xs truncate max-w-[150px]">
                  {item.notes ? item.notes : <span className="text-neutral-600">Empty</span>}
                </td>

                <td className="py-2 px-3 text-center text-neutral-600"></td>
              </tr>
            );
          })}
        </tbody>

        {/* Footer */}
        <tfoot className="bg-[#191919] text-neutral-400 text-[11px] border-t border-[#262626] select-none sticky bottom-0">
          <tr>
            <td className="py-2 px-3 border-r border-[#262626]">
              <button
                onClick={onOpenNewModal}
                className="text-neutral-400 hover:text-white flex items-center space-x-1"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4v16m8-8H4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                </svg>
                <span>+ Baru</span>
              </button>
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500 font-mono text-center">
              {totalCount} items
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Count {totalCount}
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Count {totalCount}
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Calculate
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Earliest: May 1
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Latest: Today
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              {uniqueUsers} user
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Calculate
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Calculate
            </td>
            <td className="py-2 px-3 border-r border-[#262626] text-neutral-500">
              Calculate
            </td>
            <td className="py-2 px-3"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
