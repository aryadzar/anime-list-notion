import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import type { Route } from "./+types/home";
import { useNotionItems, useBackendStatus } from "../lib/useNotionQuery";
import type { NotionItem } from "../types/notion";
import { Header } from "../components/Header";
import { DatabaseSubHeader, type ViewMode } from "../components/DatabaseSubHeader";
import { TableView } from "../components/TableView";
import { GalleryView } from "../components/GalleryView";
import { ListView } from "../components/ListView";
import { StatsView } from "../components/StatsView";
import { ItemDrawer } from "../components/ItemDrawer";
import { GuideModal } from "../components/GuideModal";
import { NewEntryModal } from "../components/NewEntryModal";
import { useAuth } from "../context/AuthContext";
import { LoginPage } from "../components/LoginPage";
import { useLayout } from "../context/LayoutContext";
import { MobileLayout } from "../components/mobile/MobileLayout";
import { TrackLinkModal } from "../components/TrackLinkModal";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Notion Tracker — Manhwa & Manga Database" },
    {
      name: "description",
      content: "Tracking catalog database for Manhwa, Manga, and Anime with Notion",
    },
  ];
}

export default function Home() {
  const { isAuthenticated, isLoading: isAuthLoading, logout } = useAuth();
  const {
    isMobileView,
    isTrackLinkOpen,
    trackLinkInitialUrl,
    openTrackLink,
    closeTrackLink,
  } = useLayout();

  // React Router URL Search Parameters
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL params
  const urlId = searchParams.get("id");
  const selectedType = searchParams.get("type") || "all";
  const selectedStatus = searchParams.get("status") || "all";
  const urlSearch = searchParams.get("q") || "";
  const sortBy = searchParams.get("sort") || "default";
  const viewMode = (searchParams.get("view") as ViewMode) || "table";

  // TanStack React Query (only fetch when authenticated)
  const { data, isLoading, isError, error, refetch, isRefetching } = useNotionItems({
    enabled: isAuthenticated,
  });
  const { data: statusData } = useBackendStatus();

  // Search input state (with immediate feedback)
  const [searchInput, setSearchInput] = useState(urlSearch);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  // Drawer state: open if there's an id in URL or initially true
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [isFullPage, setIsFullPage] = useState(false);

  // Modals
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Local additions
  const [localAddedItems, setLocalAddedItems] = useState<NotionItem[]>([]);

  // Local status overrides for immediate reactive state reflection across views
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});

  const handleItemStatusChange = useCallback((itemId: string, newStatus: string) => {
    const norm = itemId.replace(/-/g, "").toLowerCase();
    setStatusOverrides((prev) => ({
      ...prev,
      [norm]: newStatus,
      [itemId]: newStatus,
    }));

    setLocalAddedItems((prev) =>
      prev.map((it) => {
        const itemNorm = it.id.replace(/-/g, "").toLowerCase();
        return it.id === itemId || itemNorm === norm
          ? { ...it, status: newStatus }
          : it;
      })
    );
  }, []);

  // Base items with reactive status overrides
  const rawItems = useMemo(() => {
    const serverItems = data?.data || [];
    const combined = [...localAddedItems, ...serverItems];
    return combined.map((it) => {
      const norm = it.id.replace(/-/g, "").toLowerCase();
      const override = statusOverrides[norm] || statusOverrides[it.id];
      if (override && override !== it.status) {
        return { ...it, status: override };
      }
      return it;
    });
  }, [data?.data, localAddedItems, statusOverrides]);

  // Helper to update URL search parameters cleanly
  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (
              value === null ||
              value === "" ||
              value === "all" ||
              (key === "sort" && value === "default") ||
              (key === "view" && value === "table")
            ) {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  // Filtered & sorted items
  const filteredItems = useMemo(() => {
    let result = rawItems.filter((item) => {
      // Search query filter
      if (searchInput.trim()) {
        const q = searchInput.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesTag = item.tags?.some((t) => t.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesNotes && !matchesTag) {
          return false;
        }
      }

      // Type filter
      if (selectedType !== "all") {
        if (item.tipe.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== "all") {
        if (item.status.toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === "title-asc") {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === "title-desc") {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === "date-newest") {
      result.sort(
        (a, b) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
      );
    } else if (sortBy === "date-edited") {
      result.sort(
        (a, b) =>
          new Date(b.lastEditedTime).getTime() -
          new Date(a.lastEditedTime).getTime()
      );
    }

    return result;
  }, [rawItems, searchInput, selectedType, selectedStatus, sortBy]);

  // Current active selected item
  const activeItem = useMemo(() => {
    if (urlId) {
      const found = rawItems.find((i) => i.id === urlId);
      if (found) return found;
    }
    // Default fallback to first item
    return filteredItems[0] || rawItems[0] || null;
  }, [urlId, rawItems, filteredItems]);

  // Handle row / card click
  const handleSelectItem = (item: NotionItem) => {
    setIsDrawerOpen(true);
    updateParams({ id: item.id });
  };

  // Handle drawer close
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    updateParams({ id: null });
  };

  // Handle search change
  const handleSearchChange = (query: string) => {
    setSearchInput(query);
    updateParams({ q: query.trim() ? query.trim() : null });
  };

  // Handle type filter change
  const handleTypeChange = (t: string) => {
    updateParams({ type: t === "all" ? null : t });
  };

  // Handle status filter change
  const handleStatusChange = (s: string) => {
    updateParams({ status: s === "all" ? null : s });
  };

  // Handle sort change
  const handleSortChange = (s: string) => {
    updateParams({ sort: s === "default" ? null : s });
  };

  // Handle view change
  const handleViewModeChange = (v: ViewMode) => {
    if (v === "stats") {
      setIsDrawerOpen(false);
    }
    updateParams({ view: v === "table" ? null : v });
  };

  const handleAddNewItem = (item: NotionItem) => {
    setLocalAddedItems((prev) => [item, ...prev]);
    setIsDrawerOpen(true);
    updateParams({ id: item.id });
  };

  // Auth Loading state
  if (isAuthLoading) {
    return (
      <div className="h-screen h-dvh flex flex-col items-center justify-center bg-[#101010] text-[#e3e2de]">
        <div className="w-8 h-8 border-2 border-neutral-700 border-t-white rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-neutral-400 font-mono">Memverifikasi otentikasi...</p>
      </div>
    );
  }

  // Not Authenticated -> Show LoginPage
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const isMock = data?.isMock ?? true;

  if (isMobileView) {
    return (
      <div className="fixed inset-0 h-full h-dvh w-full flex flex-col bg-[#121212] overflow-hidden">
        <MobileLayout
          items={rawItems}
          isLoading={isLoading}
          onRefresh={() => refetch()}
          isRefetching={isRefetching}
          onItemStatusChange={handleItemStatusChange}
        />

        {/* Global Track Link Modal */}
        <TrackLinkModal
          isOpen={isTrackLinkOpen}
          onClose={closeTrackLink}
          initialUrl={trackLinkInitialUrl}
          onItemAdded={handleAddNewItem}
          onRefresh={() => refetch()}
        />

        {/* New Entry Modal */}
        <NewEntryModal
          isOpen={isNewModalOpen}
          onClose={() => setIsNewModalOpen(false)}
          onAddNewItem={handleAddNewItem}
          onRefresh={() => refetch()}
        />

        {/* Guide Modal */}
        <GuideModal
          isOpen={isGuideModalOpen}
          onClose={() => setIsGuideModalOpen(false)}
          isMock={isMock}
        />
      </div>
    );
  }

  return (
    <div className="h-screen h-dvh flex flex-col bg-[#121212] text-[#e3e2de] overflow-hidden">
      {/* BEGIN: NavigationBar (Fixed at top) */}
      <div className="flex-shrink-0">
        <Header
          searchQuery={searchInput}
          onSearchChange={handleSearchChange}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          selectedStatus={selectedStatus}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
          isRefetching={isRefetching}
          onRefresh={() => refetch()}
          isMock={isMock}
          onOpenNewModal={() => setIsNewModalOpen(true)}
          onOpenGuideModal={() => setIsGuideModalOpen(true)}
        />
      </div>
      {/* END: NavigationBar */}

      {/* Notion Banner if in Mock Mode */}
      {isMock && (
        <div className="flex-shrink-0 bg-[#1c1813] border-b border-amber-900/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200/90 select-none">
          <div className="flex items-center space-x-2">
            <span className="text-amber-400">⚡</span>
            <span>
              <strong>Mode Preview / Mock:</strong> Masukkan <code>NOTION_API_KEY</code> &amp; <code>NOTION_DATABASE_ID</code> di file <code>backend/.env</code> untuk membaca data Notion Anda.
            </span>
          </div>
          <button
            onClick={() => setIsGuideModalOpen(true)}
            className="text-[11px] font-medium underline hover:text-white transition cursor-pointer flex-shrink-0 ml-3"
          >
            Lihat Cara Setup ↗
          </button>
        </div>
      )}

      {/* BEGIN: DatabaseSubHeader (Fixed below header) */}
      <div className="flex-shrink-0">
        <DatabaseSubHeader
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          onClearType={() => handleTypeChange("all")}
          onClearStatus={() => handleStatusChange("all")}
        />
      </div>
      {/* END: DatabaseSubHeader */}

      {/* BEGIN: MainContentSplit (Full height remaining space) */}
      <main className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* LEFT SIDE: Catalog Grid with INDEPENDENT SCROLL */}
        <section
          className={`flex-1 overflow-y-auto h-full p-4 sm:p-6 lg:p-8 bg-[#121212] transition-all duration-300 ${
            isDrawerOpen ? "border-r border-[#242424]" : ""
          }`}
          data-purpose="catalog-grid"
        >
          <div className="flex flex-col min-h-full">
            {/* Catalog Top Meta (Header) - Only show in Table/Gallery/List view */}
            {viewMode !== "stats" && (
              <div className="mb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 flex-shrink-0">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                    <span>📖</span> Koleksi Bacaan
                  </h1>
                  <p className="text-xs text-neutral-400 mt-1">
                    Total {filteredItems.length} entri ditampilkan • Terakhir sinkronisasi{" "}
                    {isRefetching ? "sedang memuat..." : "hari ini"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-neutral-500">
                    Notion DB #{statusData?.hasDatabaseId ? "CONNECTED" : "MN-2026"}
                  </span>
                  <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="px-2 py-1 bg-[#202020] hover:bg-[#282828] text-neutral-300 text-xs rounded border border-[#2f2f2f] transition flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                      />
                    </svg>
                    <span>Baris Baru</span>
                  </button>
                  {!isDrawerOpen && activeItem && (
                    <button
                      onClick={() => {
                        setIsDrawerOpen(true);
                        updateParams({ id: activeItem.id });
                      }}
                      className="px-2 py-1 bg-[#202020] hover:bg-[#282828] text-neutral-300 text-xs rounded border border-[#2f2f2f] transition flex items-center gap-1.5"
                      title="Buka panel inspeksi"
                    >
                      <span>Inspect</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-neutral-400">
                <div className="w-8 h-8 border-2 border-neutral-600 border-t-white rounded-full animate-spin mb-3"></div>
                <p className="text-xs">Memuat database dari Notion...</p>
              </div>
            )}

            {/* Error State */}
            {isError && (
              <div className="bg-[#241a1a] border border-red-900/60 p-4 rounded-lg mb-4 text-xs text-red-300 flex items-center justify-between flex-shrink-0">
                <div>
                  <strong className="block text-white mb-1">Gagal memuat data Notion</strong>
                  <span>{error?.message || "Pastikan backend server sedang berjalan di port 3001."}</span>
                </div>
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
                  {(error?.message?.toLowerCase().includes("otentikasi") ||
                    error?.message?.toLowerCase().includes("autentikasi") ||
                    error?.message?.toLowerCase().includes("sesi") ||
                    error?.message?.toLowerCase().includes("izin") ||
                    error?.message?.toLowerCase().includes("401") ||
                    error?.message?.toLowerCase().includes("403")) && (
                    <button
                      onClick={logout}
                      className="px-3 py-1 bg-red-900 hover:bg-red-800 text-white rounded text-xs transition cursor-pointer"
                    >
                      Login Ulang
                    </button>
                  )}
                  <button
                    onClick={() => refetch()}
                    className="px-3 py-1 bg-red-950/60 hover:bg-red-900 border border-red-800 rounded text-xs text-white transition cursor-pointer"
                  >
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* Views rendering */}
            {!isLoading && (
              <div className="flex-1 flex flex-col min-h-0">
                {viewMode === "stats" ? (
                  <StatsView
                    items={rawItems}
                    onSelectItem={handleSelectItem}
                    onOpenNewModal={() => setIsNewModalOpen(true)}
                  />
                ) : filteredItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#262626] rounded-md p-12 text-center my-auto">
                    <span className="text-3xl mb-2">🔍</span>
                    <p className="text-sm font-medium text-neutral-300 mb-1">
                      Tidak ada entri yang cocok
                    </p>
                    <p className="text-xs text-neutral-500 mb-4">
                      Coba ubah kata kunci pencarian atau reset filter.
                    </p>
                    <button
                      onClick={() => {
                        handleSearchChange("");
                        handleTypeChange("all");
                        handleStatusChange("all");
                      }}
                      className="px-3 py-1.5 bg-[#202020] hover:bg-[#282828] text-white text-xs rounded border border-[#333333] transition cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>
                ) : (
                  <>
                    {viewMode === "table" && (
                      <TableView
                        items={filteredItems}
                        selectedItem={activeItem}
                        onSelectItem={handleSelectItem}
                        onOpenNewModal={() => setIsNewModalOpen(true)}
                        onItemStatusChange={handleItemStatusChange}
                      />
                    )}

                    {viewMode === "gallery" && (
                      <GalleryView
                        items={filteredItems}
                        selectedItem={activeItem}
                        onSelectItem={handleSelectItem}
                        onOpenNewModal={() => setIsNewModalOpen(true)}
                        onItemStatusChange={handleItemStatusChange}
                      />
                    )}

                    {viewMode === "list" && (
                      <ListView
                        items={filteredItems}
                        selectedItem={activeItem}
                        onSelectItem={handleSelectItem}
                        onOpenNewModal={() => setIsNewModalOpen(true)}
                        onItemStatusChange={handleItemStatusChange}
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </section>

        {/* RIGHT SIDE: Notion Property Inspection Drawer with FIXED POSITION & INDEPENDENT SCROLL */}
        <ItemDrawer
          item={activeItem}
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          isFullPage={isFullPage}
          onToggleFullPage={() => setIsFullPage(!isFullPage)}
          isMock={isMock}
          onItemStatusChange={handleItemStatusChange}
        />
        {/* END: Notion Property Inspection Drawer */}
      </main>
      {/* END: MainContentSplit */}

      {/* Setup Guide Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        isMock={isMock}
      />

      {/* New Entry Modal */}
      <NewEntryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onAddNewItem={handleAddNewItem}
        onRefresh={() => refetch()}
      />

      {/* Floating Track Link Button for Desktop Web View */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => openTrackLink()}
          className="bg-[#F5C518] hover:bg-[#E5B508] active:scale-95 text-[#171717] font-extrabold text-xs px-4 py-2.5 rounded-full shadow-2xl border border-[#DDB000] flex items-center gap-2 transition cursor-pointer font-mono tracking-wider"
          title="Track Link Komik / Anime via URL (Share Target)"
        >
          <span className="text-base">⚡</span>
          <span>TRACK LINK</span>
        </button>
      </div>

      {/* Global Track Link Modal */}
      <TrackLinkModal
        isOpen={isTrackLinkOpen}
        onClose={closeTrackLink}
        initialUrl={trackLinkInitialUrl}
        onItemAdded={handleAddNewItem}
        onRefresh={() => refetch()}
      />
    </div>
  );
}
