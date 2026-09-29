import { useState } from "react";
import type { NotionItem } from "../../types/notion";
import { useLayout } from "../../context/LayoutContext";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { MobileVaultView } from "./MobileVaultView";
import { MobileGalleryView } from "./MobileGalleryView";
import { MobileStatsView } from "./MobileStatsView";
import { MobileSettingsView } from "./MobileSettingsView";

interface MobileLayoutProps {
  items: NotionItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefetching?: boolean;
  onItemStatusChange?: (itemId: string, newStatus: string) => void;
}

export function MobileLayout({
  items,
  isLoading,
  onRefresh,
  isRefetching,
  onItemStatusChange,
}: MobileLayoutProps) {
  const {
    mobileTab,
    phoneFrame,
    setPhoneFrame,
    setLayoutMode,
  } = useLayout();

  const [searchQuery, setSearchQuery] = useState("");

  // Search filter applied to items
  const searchedItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      item.tags.some((t) => t.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 md:relative h-full h-dvh w-full flex flex-col items-center justify-center overflow-hidden font-sans bg-[#121212] text-[#e3e2de]">
      {/* Desktop Top Bar: Switcher Controls for Desktop Users */}
      <div className="w-full bg-[#1A1A1A] border-b border-[#2C2C2C] px-4 py-2 hidden md:flex items-center justify-between text-xs text-neutral-300 z-40 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="text-amber-400 font-bold">📱 TAMPILAN MOBILE MODE</span>
          <span className="text-neutral-500">•</span>
          <span className="text-neutral-400">
            Desain Warm Notion Editorial (Image 6 &amp; Image 3)
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Toggle Phone Bezel */}
          <button
            onClick={() => setPhoneFrame(!phoneFrame)}
            className="px-2.5 py-1 bg-[#262626] hover:bg-[#333333] border border-[#3A3A3A] rounded-md text-xs font-mono text-neutral-200 transition cursor-pointer flex items-center gap-1.5"
          >
            <span>{phoneFrame ? "↔ Mode Layar Penuh" : "📱 Mode Bingkai HP"}</span>
          </button>

          {/* Switch back to Web */}
          <button
            onClick={() => setLayoutMode("web")}
            className="px-3 py-1 bg-[#F5C518] hover:bg-[#E5B508] text-black font-extrabold text-xs rounded-md transition cursor-pointer flex items-center gap-1.5 shadow-xs font-mono"
          >
            <span>💻 Beralih ke Tipe Web</span>
          </button>
        </div>
      </div>

      {/* Main Container: On phone, it fills 100% height and width. If phoneFrame on desktop, show phone device frame */}
      <div
        className={`w-full flex-1 flex flex-col min-h-0 h-full overflow-hidden transition-all duration-300 ${
          phoneFrame
            ? "md:max-w-[430px] md:my-auto md:h-[860px] md:max-h-[92vh] md:rounded-[44px] md:border-[10px] md:border-[#222222] md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] md:overflow-hidden md:relative"
            : "max-w-2xl mx-auto h-full"
        }`}
      >
        {/* Simulated Phone Notch / Speaker on Desktop */}
        {phoneFrame && (
          <div className="hidden md:flex justify-center pt-2 pb-1 bg-[#FAF8F5] shrink-0 border-b border-[#E8E2D8]">
            <div className="w-24 h-4 bg-[#121212] rounded-full flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#1F1F1F] ml-auto mr-2"></div>
            </div>
          </div>
        )}

        {/* Mobile Header */}
        <MobileHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isRefetching={isRefetching}
          onRefresh={onRefresh}
        />

        {/* Dynamic Mobile View Tab Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {mobileTab === "vault" && (
            <MobileVaultView
              items={searchedItems}
              isLoading={isLoading}
              onRefresh={onRefresh}
              isRefetching={isRefetching}
              onItemStatusChange={onItemStatusChange}
            />
          )}

          {mobileTab === "gallery" && (
            <MobileGalleryView
              items={searchedItems}
              isLoading={isLoading}
              onRefresh={onRefresh}
              isRefetching={isRefetching}
              onItemStatusChange={onItemStatusChange}
            />
          )}

          {mobileTab === "stats" && <MobileStatsView items={searchedItems} />}

          {mobileTab === "settings" && (
            <MobileSettingsView
              onRefresh={onRefresh}
              isRefetching={isRefetching}
            />
          )}
        </div>

        {/* Mobile Bottom Navigation Bar (Fixed) */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
