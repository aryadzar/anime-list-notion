import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type LayoutMode = "auto" | "web" | "mobile";
export type MobileTab = "vault" | "gallery" | "stats" | "settings";

interface LayoutContextType {
  layoutMode: LayoutMode;
  setLayoutMode: (mode: LayoutMode) => void;
  isMobileView: boolean;
  mobileTab: MobileTab;
  setMobileTab: (tab: MobileTab) => void;
  phoneFrame: boolean;
  setPhoneFrame: (frame: boolean) => void;
  isTrackLinkOpen: boolean;
  trackLinkInitialUrl: string;
  openTrackLink: (initialUrl?: string) => void;
  closeTrackLink: () => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const LAYOUT_MODE_KEY = "notion_vault_layout_mode";
const PHONE_FRAME_KEY = "notion_vault_phone_frame";

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layoutMode, setLayoutModeState] = useState<LayoutMode>("auto");
  const [mobileTab, setMobileTab] = useState<MobileTab>("vault");
  const [phoneFrame, setPhoneFrameState] = useState<boolean>(true);
  const [windowWidth, setWindowWidth] = useState<number>(1024);
  const [isTrackLinkOpen, setIsTrackLinkOpen] = useState(false);
  const [trackLinkInitialUrl, setTrackLinkInitialUrl] = useState("");

  // Initialize from localStorage and handle resize
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(LAYOUT_MODE_KEY) as LayoutMode | null;
      if (savedMode && ["auto", "web", "mobile"].includes(savedMode)) {
        setLayoutModeState(savedMode);
      }

      const savedFrame = localStorage.getItem(PHONE_FRAME_KEY);
      if (savedFrame !== null) {
        setPhoneFrameState(savedFrame === "true");
      }

      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const setLayoutMode = (mode: LayoutMode) => {
    setLayoutModeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(LAYOUT_MODE_KEY, mode);
    }
  };

  const setPhoneFrame = (frame: boolean) => {
    setPhoneFrameState(frame);
    if (typeof window !== "undefined") {
      localStorage.setItem(PHONE_FRAME_KEY, frame.toString());
    }
  };

  const isMobileView =
    layoutMode === "mobile" || (layoutMode === "auto" && windowWidth < 800);

  const openTrackLink = (initialUrl?: string) => {
    setTrackLinkInitialUrl(initialUrl || "");
    setIsTrackLinkOpen(true);
  };

  const closeTrackLink = () => {
    setIsTrackLinkOpen(false);
    setTrackLinkInitialUrl("");
  };

  return (
    <LayoutContext.Provider
      value={{
        layoutMode,
        setLayoutMode,
        isMobileView,
        mobileTab,
        setMobileTab,
        phoneFrame,
        setPhoneFrame,
        isTrackLinkOpen,
        trackLinkInitialUrl,
        openTrackLink,
        closeTrackLink,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
