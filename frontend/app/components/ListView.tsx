import type { NotionItem } from "../types/notion";
import { NotionStatusSelect } from "./NotionStatusSelect";
import { getTipeBadgeClass, formatDate } from "../lib/utils";

interface ListViewProps {
  items: NotionItem[];
  selectedItem: NotionItem | null;
  onSelectItem: (item: NotionItem) => void;
  onOpenNewModal: () => void;
  onItemStatusChange?: (itemId: string, newStatus: string) => void;
}

export function ListView({
  items,
  selectedItem,
  onSelectItem,
  onOpenNewModal,
  onItemStatusChange,
}: ListViewProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-1 pr-1">
      {items.map((item) => {
        const isSelected = selectedItem?.id === item.id;

        return (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className={`flex items-center justify-between p-2.5 rounded-md border cursor-pointer transition ${
              isSelected
                ? "bg-[#222222] border-neutral-400"
                : "bg-[#181818] border-[#262626] hover:bg-[#1e1e1e] hover:border-[#333333]"
            }`}
          >
            <div className="flex items-center space-x-3 truncate">
              <span className="text-base">{item.icon || "📖"}</span>
              <div className="truncate">
                <span className="text-sm font-medium text-white mr-2 truncate">
                  {item.title}
                </span>
                {item.notes && (
                  <span className="text-xs text-neutral-400 truncate hidden md:inline">
                    • {item.notes}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs flex-shrink-0">
              <span className={`${getTipeBadgeClass(item.tipe)} notion-tag text-[10px]`}>
                {item.tipe}
              </span>
              <NotionStatusSelect
                itemId={item.id}
                currentStatus={item.status}
                size="sm"
                onStatusChange={(newStatus) => {
                  item.status = newStatus;
                  if (onItemStatusChange) onItemStatusChange(item.id, newStatus);
                }}
              />
              <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
                {formatDate(item.lastEditedTime)}
              </span>
            </div>
          </div>
        );
      })}

      <button
        onClick={onOpenNewModal}
        className="w-full py-2.5 border border-dashed border-[#2a2a2a] hover:border-neutral-500 rounded-md text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition"
      >
        <span>+ Baris Baru</span>
      </button>
    </div>
  );
}
