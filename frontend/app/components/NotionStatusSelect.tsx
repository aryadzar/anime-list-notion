import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { updateItemStatus } from "../lib/api";
import { NOTION_ITEMS_QUERY_KEY } from "../lib/useNotionQuery";
import { useLayout } from "../context/LayoutContext";
import type { ApiResponse, NotionItem } from "../types/notion";

interface NotionStatusSelectProps {
  itemId: string;
  currentStatus: string;
  onStatusChange?: (newStatus: string) => void;
  size?: "sm" | "md";
  className?: string;
}

interface StatusOption {
  value: string;
  label: string;
  group: "to-do" | "in-progress" | "complete";
  colorClass: string;
  dotColor: string;
  icon: string;
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: "Plan to Read",
    label: "Plan to Read",
    group: "to-do",
    colorClass: "bg-[#263140] text-[#93c5fd] hover:bg-[#2d3a4d]",
    dotColor: "bg-[#93c5fd]",
    icon: "○",
  },
  {
    value: "Reading/Watching",
    label: "Reading / Watching",
    group: "in-progress",
    colorClass: "bg-[#3b2d54] text-[#d8b4fe] hover:bg-[#463664]",
    dotColor: "bg-[#d8b4fe]",
    icon: "◐",
  },
  {
    value: "On Hold",
    label: "On Hold",
    group: "in-progress",
    colorClass: "bg-[#3b3322] text-[#fef08a] hover:bg-[#473d29]",
    dotColor: "bg-[#fef08a]",
    icon: "⏸",
  },
  {
    value: "Completed",
    label: "Completed",
    group: "complete",
    colorClass: "bg-[#1e3a2f] text-[#86efac] hover:bg-[#254739]",
    dotColor: "bg-[#86efac]",
    icon: "✓",
  },
  {
    value: "Dropped",
    label: "Dropped",
    group: "complete",
    colorClass: "bg-[#3a2222] text-[#fca5a5] hover:bg-[#472a2a]",
    dotColor: "bg-[#fca5a5]",
    icon: "✕",
  },
];

export function NotionStatusSelect({
  itemId,
  currentStatus,
  onStatusChange,
  size = "md",
  className = "",
}: NotionStatusSelectProps) {
  const queryClient = useQueryClient();
  const { isMobileView } = useLayout();
  const [status, setStatus] = useState(currentStatus);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal state whenever currentStatus prop changes
  useEffect(() => {
    setStatus(currentStatus);
  }, [currentStatus]);

  // Calculate desktop popover position relative to viewport
  const updatePosition = () => {
    if (buttonRef.current && typeof window !== "undefined") {
      const rect = buttonRef.current.getBoundingClientRect();
      const popoverHeight = 280;
      const popoverWidth = 220;

      // Vertical flip check
      const spaceBelow = window.innerHeight - rect.bottom;
      const showAbove = spaceBelow < popoverHeight && rect.top > popoverHeight;
      const top = showAbove
        ? Math.max(10, rect.top - popoverHeight - 4)
        : Math.min(window.innerHeight - popoverHeight - 10, rect.bottom + 4);

      // Horizontal flip / clamp check
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 10) {
        left = window.innerWidth - popoverWidth - 10;
      }
      left = Math.max(10, left);

      setPopoverPos({ top, left });
    }
  };

  // Close on Escape or update position on scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen]);

  // Find matching option using local status state
  const currentOption =
    STATUS_OPTIONS.find(
      (opt) =>
        opt.value.toLowerCase() === status.toLowerCase() ||
        (opt.value.includes("Reading") &&
          (status.toLowerCase().includes("reading") ||
            status.toLowerCase().includes("aktif") ||
            status.toLowerCase().includes("baca"))) ||
        (opt.value.includes("Completed") &&
          (status.toLowerCase().includes("completed") ||
            status.toLowerCase().includes("selesai") ||
            status.toLowerCase().includes("tamat"))) ||
        (opt.value.includes("Plan") &&
          (status.toLowerCase().includes("plan") ||
            status.toLowerCase().includes("rencana")))
    ) || STATUS_OPTIONS[1];

  const handleSelectStatus = async (newVal: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setIsOpen(false);

    if (newVal === status) {
      return;
    }

    const previousStatus = status;
    const normTarget = itemId.replace(/-/g, "").toLowerCase();

    // 1. Immediate local button state update
    setStatus(newVal);

    // 2. Immediate parent callback
    if (onStatusChange) {
      onStatusChange(newVal);
    }

    // 3. Immediate optimistic update in TanStack Query Cache across the entire app
    queryClient.setQueryData<ApiResponse<NotionItem[]>>(
      NOTION_ITEMS_QUERY_KEY,
      (old) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((item) => {
            const norm = item.id.replace(/-/g, "").toLowerCase();
            return item.id === itemId || norm === normTarget
              ? { ...item, status: newVal }
              : item;
          }),
        };
      }
    );

    setIsUpdating(true);

    try {
      await updateItemStatus(itemId, newVal);

      // Revalidate cache in background after small delay to ensure Notion sync
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: NOTION_ITEMS_QUERY_KEY });
      }, 6000);
    } catch (err: any) {
      console.error("Gagal update status Notion:", err);

      // Revert if error occurs
      setStatus(previousStatus);
      if (onStatusChange) {
        onStatusChange(previousStatus);
      }
      queryClient.setQueryData<ApiResponse<NotionItem[]>>(
        NOTION_ITEMS_QUERY_KEY,
        (old) => {
          if (!old || !old.data) return old;
          return {
            ...old,
            data: old.data.map((item) => {
              const norm = item.id.replace(/-/g, "").toLowerCase();
              return item.id === itemId || norm === normTarget
                ? { ...item, status: previousStatus }
                : item;
            }),
          };
        }
      );
      alert(`Gagal mengubah status di Notion: ${err?.message || "Kesalahan jaringan"}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div
      className={`relative inline-block select-none ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Notion Status Pill Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (!isOpen) {
            updatePosition();
          }
          setIsOpen(!isOpen);
        }}
        disabled={isUpdating}
        className={`group inline-flex items-center gap-1.5 rounded-md font-medium font-sans transition-all cursor-pointer shadow-2xs hover:brightness-110 active:scale-[0.98] border border-black/15 ${
          currentOption.colorClass
        } ${
          size === "sm"
            ? "px-2 py-0.5 text-[10px]"
            : "px-2.5 py-1 text-xs"
        }`}
        title="Klik untuk mengubah status (Notion Select)"
      >
        <span className="text-[11px] leading-none">{currentOption.icon}</span>
        <span className="truncate">{currentOption.label}</span>
        <span className="text-[9px] opacity-40 group-hover:opacity-100 transition-opacity">
          ▾
        </span>

        {isUpdating && (
          <span className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin ml-0.5" />
        )}
      </button>

      {/* Desktop Popover rendered via Portal into body so it is NEVER clipped */}
      {isOpen && !isMobileView && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] pointer-events-auto">
          {/* Transparent Backdrop to exit immediately when clicking anywhere outside */}
          <div
            className="fixed inset-0 bg-transparent cursor-default"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          {/* Popover Menu Card */}
          <div
            className="anim-popover-spring fixed w-52 bg-[#1E1E1E] text-[#E3E2DE] border border-[#333333] rounded-xl shadow-2xl p-1.5 text-xs font-sans overflow-hidden select-none z-[100000]"
            style={{
              top: popoverPos ? `${popoverPos.top}px` : "100px",
              left: popoverPos ? `${popoverPos.left}px` : "100px",
              minWidth: "190px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400 border-b border-[#2C2C2C] mb-1 flex items-center justify-between">
              <span>Ubah Status Notion</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white text-xs px-1 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Group 1: To-Do */}
            <div className="mb-1">
              <div className="px-2 py-0.5 text-[9px] font-mono text-neutral-500 uppercase">
                Rencana / To-Do
              </div>
              {STATUS_OPTIONS.filter((s) => s.group === "to-do").map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleSelectStatus(opt.value, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    opt.value === status
                      ? "bg-[#2A2A2A] text-white font-bold"
                      : "hover:bg-[#262626] text-neutral-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded text-[11px] font-bold ${opt.colorClass}`}
                    >
                      {opt.icon}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {opt.value === status && (
                    <span className="text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Group 2: In-Progress */}
            <div className="mb-1 pt-1 border-t border-[#2A2A2A]">
              <div className="px-2 py-0.5 text-[9px] font-mono text-neutral-500 uppercase">
                Sedang Berjalan / Reading
              </div>
              {STATUS_OPTIONS.filter((s) => s.group === "in-progress").map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleSelectStatus(opt.value, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    opt.value === status
                      ? "bg-[#2A2A2A] text-white font-bold"
                      : "hover:bg-[#262626] text-neutral-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded text-[11px] font-bold ${opt.colorClass}`}
                    >
                      {opt.icon}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {opt.value === status && (
                    <span className="text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>

            {/* Group 3: Complete */}
            <div className="pt-1 border-t border-[#2A2A2A]">
              <div className="px-2 py-0.5 text-[9px] font-mono text-neutral-500 uppercase">
                Selesai / Tamat
              </div>
              {STATUS_OPTIONS.filter((s) => s.group === "complete").map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => handleSelectStatus(opt.value, e)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition text-left cursor-pointer ${
                    opt.value === status
                      ? "bg-[#2A2A2A] text-white font-bold"
                      : "hover:bg-[#262626] text-neutral-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center justify-center w-4 h-4 rounded text-[11px] font-bold ${opt.colorClass}`}
                    >
                      {opt.icon}
                    </span>
                    <span>{opt.label}</span>
                  </div>
                  {opt.value === status && (
                    <span className="text-emerald-400 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Mobile-Optimized Status Action Sheet rendered via Portal into body */}
      {isOpen && isMobileView && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex flex-col justify-end bg-black/75 backdrop-blur-xs anim-backdrop"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div
            className="w-full max-w-md mx-auto bg-[#18181B] text-[#EDEDED] rounded-t-3xl border-t border-white/15 p-4 pb-8 shadow-2xl anim-sheet-spring max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-neutral-600 rounded-full mx-auto mb-3" />

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div>
                <h3 className="font-mono text-sm font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                  <span>⚡</span> Ubah Status Notion
                </h3>
                <p className="text-[11px] text-neutral-400 font-sans mt-0.5">
                  Pilih status progress untuk memperbarui Notion
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center text-sm font-bold active:scale-90 transition cursor-pointer"
                title="Tutup Modal"
              >
                ✕
              </button>
            </div>

            {/* Status Options */}
            <div className="space-y-2">
              {STATUS_OPTIONS.map((opt) => {
                const isSelected = opt.value === status;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={(e) => {
                      handleSelectStatus(opt.value, e);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left cursor-pointer active:scale-[0.98] ${
                      isSelected
                        ? "bg-white/15 border-white/30 text-white font-semibold shadow-md"
                        : "bg-white/5 border-white/5 text-neutral-300 hover:bg-white/10 active:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold shadow-xs ${opt.colorClass}`}
                      >
                        {opt.icon}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-white">{opt.label}</div>
                        <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                          {opt.group === "to-do"
                            ? "Rencana / To-Do"
                            : opt.group === "in-progress"
                            ? "Sedang Berjalan / In Progress"
                            : "Selesai / Tamat"}
                        </div>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/40">
                        ✓
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full border border-neutral-700" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Big Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full mt-4 py-3 bg-white/10 hover:bg-white/15 active:bg-white/20 text-neutral-300 rounded-xl font-mono text-xs font-bold uppercase tracking-wider text-center transition cursor-pointer"
            >
              TUTUP
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
