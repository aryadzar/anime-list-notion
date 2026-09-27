export type ViewMode = "table" | "gallery" | "list";

interface DatabaseSubHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (view: ViewMode) => void;
  selectedType: string;
  selectedStatus: string;
  onClearType: () => void;
  onClearStatus: () => void;
}

export function DatabaseSubHeader({
  viewMode,
  onViewModeChange,
  selectedType,
  selectedStatus,
  onClearType,
  onClearStatus,
}: DatabaseSubHeaderProps) {
  return (
    <section className="border-b border-[#242424] bg-[#141414] px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-neutral-400 select-none">
      {/* View Switcher */}
      <div className="flex items-center space-x-1">
        {/* Gallery Button */}
        <button
          onClick={() => onViewModeChange("gallery")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition ${
            viewMode === "gallery"
              ? "text-neutral-100 border-b-2 border-neutral-200 font-medium bg-[#1d1d1d]"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>Board &amp; Gallery</span>
        </button>

        {/* Table View Button */}
        <button
          onClick={() => onViewModeChange("table")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition ${
            viewMode === "table"
              ? "text-neutral-100 border-b-2 border-neutral-200 font-medium bg-[#1d1d1d]"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>Table View</span>
        </button>

        {/* List View Button */}
        <button
          onClick={() => onViewModeChange("list")}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition ${
            viewMode === "list"
              ? "text-neutral-100 border-b-2 border-neutral-200 font-medium bg-[#1d1d1d]"
              : "text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              d="M4 6h16M4 12h16M4 18h7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span>List</span>
        </button>
      </div>

      {/* Active Filter Tags */}
      <div className="hidden lg:flex items-center space-x-2">
        <span className="text-neutral-500 text-[11px]">Filter aktif:</span>
        <button
          onClick={onClearType}
          title="Klik untuk reset tipe"
          className="bg-[#202020] hover:bg-[#282828] border border-[#2f2f2f] text-neutral-300 px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 transition"
        >
          <span>Tipe: {selectedType === "all" ? "Semua" : selectedType}</span>
          {selectedType !== "all" && <span className="text-neutral-500 hover:text-white">✕</span>}
        </button>
        <button
          onClick={onClearStatus}
          title="Klik untuk reset status"
          className="bg-[#202020] hover:bg-[#282828] border border-[#2f2f2f] text-neutral-300 px-2 py-0.5 rounded text-[11px] flex items-center space-x-1 transition"
        >
          <span>Status: {selectedStatus === "all" ? "Semua" : selectedStatus}</span>
          {selectedStatus !== "all" && <span className="text-neutral-500 hover:text-white">✕</span>}
        </button>
      </div>
    </section>
  );
}
