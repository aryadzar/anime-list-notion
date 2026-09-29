import { useLayout, type MobileTab } from "../../context/LayoutContext";

export function MobileBottomNav() {
  const { mobileTab, setMobileTab, openTrackLink } = useLayout();

  const navItems: { id: MobileTab; label: string; icon: string }[] = [
    { id: "vault", label: "VAULT", icon: "🗳️" },
    { id: "gallery", label: "GALLERY", icon: "⊞" },
    { id: "stats", label: "STATS", icon: "📈" },
    { id: "settings", label: "SETTINGS", icon: "⚙️" },
  ];

  return (
    <div className="relative shrink-0 select-none">
      {/* Floating Action Button: TRACK LINK (Matches React Native App) */}
      <div className="absolute -top-14 right-4 z-20">
        <button
          onClick={() => openTrackLink()}
          className="bg-[#F5C518] hover:bg-[#E5B508] active:scale-95 text-[#171717] font-extrabold text-xs px-4 py-2.5 rounded-full shadow-lg border border-[#DDB000] flex items-center gap-1.5 transition-all cursor-pointer tracking-wider font-mono"
          title="Track Link Komik / Anime Baru"
        >
          <span className="text-sm">⚡</span>
          <span>TRACK LINK</span>
        </button>
      </div>

      {/* Sticky Bottom Navigation Bar (Image 6 & Image 3 exact match) */}
      <nav className="bg-[#FAF8F5] border-t border-[#E8E2D8] flex items-center justify-around px-2 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] shadow-lg">
        {navItems.map((item) => {
          const isActive = mobileTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setMobileTab(item.id)}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-[#F3E7C4] text-[#171717] font-extrabold shadow-2xs"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-[#EFECE4]"
              }`}
            >
              <span className="text-base leading-none mb-1">{item.icon}</span>
              <span className="text-[10px] tracking-wider uppercase font-mono font-bold leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
