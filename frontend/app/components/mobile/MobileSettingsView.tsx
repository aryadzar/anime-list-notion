import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLayout, type LayoutMode } from "../../context/LayoutContext";
import { InstallPwaModal } from "./InstallPwaModal";

interface MobileSettingsViewProps {
  onRefresh?: () => void;
  isRefetching?: boolean;
}

export function MobileSettingsView({
  onRefresh,
  isRefetching,
}: MobileSettingsViewProps) {
  const { user, logout } = useAuth();
  const {
    layoutMode,
    setLayoutMode,
    phoneFrame,
    setPhoneFrame,
    openTrackLink,
    setMobileTab,
  } = useLayout();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleTestSync = () => {
    if (onRefresh) {
      onRefresh();
      alert("Sinkronisasi database Notion sedang diproses...");
    }
  };

  return (
    <div
      className="w-full h-full flex-1 overflow-y-auto overscroll-y-contain bg-[#F6F3EB] text-[#171717] p-4 pb-36 space-y-4"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {/* 0. Back button to Vault Collection */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => setMobileTab("vault")}
          className="bg-white border border-[#DDD5C7] hover:border-[#171717] text-neutral-800 hover:text-black px-3.5 py-2 rounded-xl text-xs font-bold font-mono uppercase flex items-center gap-2 shadow-2xs transition cursor-pointer"
        >
          <span className="text-sm leading-none">←</span>
          <span>Kembali ke Koleksi (Vault)</span>
        </button>
      </div>

      {/* 0b. Card: Pasang di Layar Utama (PWA Install) */}
      <div className="bg-gradient-to-r from-amber-50 to-[#FAF6ED] border-2 border-[#E5B508] rounded-2xl p-4 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#F5C518] text-black font-extrabold flex items-center justify-center text-lg shadow-2xs">
              📲
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-amber-900 tracking-wider block">
                APLIKASI BERANDA HP
              </span>
              <h3 className="text-xs font-black text-neutral-900">
                Pasang ke Layar Utama (PWA)
              </h3>
            </div>
          </div>
          <button
            onClick={() => setIsInstallModalOpen(true)}
            className="px-3 py-1.5 bg-[#171717] hover:bg-[#2c2c2c] text-white text-xs font-bold font-mono rounded-lg shadow-xs transition cursor-pointer"
          >
            PASANG ↗
          </button>
        </div>
        <p className="text-[11px] text-neutral-600 leading-relaxed">
          Tambahkan aplikasi ini langsung ke beranda HP Anda untuk akses instan tanpa bilah navigasi browser.
        </p>
      </div>

      {/* Modal Install PWA */}
      <InstallPwaModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
      />
      {/* 1. Share Sheet Extension Banner (Image 1 Style) */}
      <div className="bg-white border-2 border-[#171717] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#171717] text-white flex items-center justify-center text-sm font-bold">
              ⚡
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase text-neutral-800 tracking-wider block">
                MOBILE SHARE SHEET TARGET
              </span>
              <span className="text-xs font-bold text-neutral-900">
                Koleksi Manhwa - Notion Extension
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#EFECE4] text-neutral-700 px-2 py-0.5 rounded border border-[#DDD5C7]">
            V2.4.1
          </span>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Gunakan fitur Track Link untuk mem-parsing tautan komik dari Mangago, Webtoon, MangaPlus, atau Kakaopage secara otomatis ke Notion.
        </p>

        <button
          onClick={() => openTrackLink()}
          className="w-full bg-[#F5C518] hover:bg-[#E5B508] active:bg-[#D5A500] text-[#171717] font-extrabold text-xs py-3 px-4 rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-2 border border-[#E0B000]"
        >
          <span>⚡</span>
          <span className="font-mono tracking-wide">BUKA FITUR TRACK LINK (SHARE TARGET)</span>
        </button>
      </div>

      {/* 2. Layout Mode Selection (Permintaan Utama User) */}
      <div className="bg-white border border-[#E3DC CE] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-base">🎨</span>
          <h3 className="font-extrabold text-xs uppercase font-mono tracking-wider text-neutral-900">
            PILIHAN TIPE DESAIN CSS &amp; LAYOUT
          </h3>
        </div>

        <p className="text-xs text-neutral-600">
          Pilih gaya tampilan yang Anda sukai. Preferensi tersimpan otomatis di perangkat Anda:
        </p>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setLayoutMode("mobile")}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
              layoutMode === "mobile"
                ? "bg-[#171717] text-white border-black shadow-xs font-bold"
                : "bg-[#F7F5EE] border-[#DDD5C7] text-neutral-800 hover:bg-[#EAE5DC]"
            }`}
          >
            <span className="text-lg mb-1">📱</span>
            <span className="text-[11px] font-mono leading-tight">Tipe Mobile</span>
            <span className="text-[9px] text-neutral-400 mt-0.5 font-normal">
              Image 6 &amp; 3
            </span>
          </button>

          <button
            onClick={() => setLayoutMode("web")}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
              layoutMode === "web"
                ? "bg-[#171717] text-white border-black shadow-xs font-bold"
                : "bg-[#F7F5EE] border-[#DDD5C7] text-neutral-800 hover:bg-[#EAE5DC]"
            }`}
          >
            <span className="text-lg mb-1">💻</span>
            <span className="text-[11px] font-mono leading-tight">Tipe Web</span>
            <span className="text-[9px] text-neutral-400 mt-0.5 font-normal">
              Notion Desktop
            </span>
          </button>

          <button
            onClick={() => setLayoutMode("auto")}
            className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
              layoutMode === "auto"
                ? "bg-[#171717] text-white border-black shadow-xs font-bold"
                : "bg-[#F7F5EE] border-[#DDD5C7] text-neutral-800 hover:bg-[#EAE5DC]"
            }`}
          >
            <span className="text-lg mb-1">⚡</span>
            <span className="text-[11px] font-mono leading-tight">Otomatis</span>
            <span className="text-[9px] text-neutral-400 mt-0.5 font-normal">
              Sesuai Layar
            </span>
          </button>
        </div>

        {/* Toggle Simulated Phone Frame on PC */}
        <div className="pt-2 border-t border-[#F0EBE0] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-800 block">
              Bingkai HP di Layar Komputer
            </span>
            <span className="text-[10px] text-neutral-500">
              Tampilkan mock frame smartphone jika membuka di monitor desktop
            </span>
          </div>

          <button
            onClick={() => setPhoneFrame(!phoneFrame)}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
              phoneFrame ? "bg-[#171717]" : "bg-neutral-300"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                phoneFrame ? "left-6" : "left-1"
              }`}
            ></span>
          </button>
        </div>
      </div>

      {/* 3. Notion Bridge & Vault Auth (Image 1 Style) */}
      <div className="bg-white border border-[#E3DC CE] rounded-2xl p-4 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase text-neutral-800">
            <span>🛡️</span>
            <span>VAULT AUTH &amp; NOTION BRIDGE</span>
          </div>
          <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">
            NOTION INTEGRATION
          </span>
        </div>

        {/* User Card */}
        <div className="bg-[#F7F5EE] border border-[#DDD5C7] rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-neutral-200 border border-neutral-300 flex items-center justify-center font-bold text-neutral-800 overflow-hidden">
              {user?.picture ? (
                <img src={user.picture} alt={user.name || "User"} className="w-full h-full object-cover" />
              ) : (
                <span>G</span>
              )}
            </div>
            <div>
              <div className="font-bold text-xs text-neutral-900 truncate max-w-[200px]">
                {user?.email || "arya.notion@gmail.com"}
              </div>
              <div className="text-[10px] text-neutral-600 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Whitelisted Vault Member</span>
              </div>
            </div>
          </div>
          <span className="text-emerald-600 font-bold text-base">✓</span>
        </div>

        {/* SecureStore & Target DB Box */}
        <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-3 space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center text-[10px] pb-1.5 border-b border-[#EFECE4]">
            <span className="font-bold text-neutral-500 uppercase">SECURE SESSION</span>
            <span className="font-bold text-emerald-600">ACTIVE • ENCRYPTED</span>
          </div>

          <div className="text-[11px] text-neutral-600 flex items-center gap-1.5 truncate">
            <span>🔑</span>
            <span>Local Vault Bridge: AES-256 JWT Token</span>
          </div>

          <div className="pt-1.5 border-t border-[#EFECE4] flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 font-bold uppercase">TARGET NOTION DB</span>
            <span className="text-red-700 font-extrabold text-[11px]">#MN-2026</span>
          </div>

          <div className="text-[11px] font-bold text-neutral-900 flex items-center gap-1.5">
            <span>🏛️</span>
            <span>Koleksi Bacaan (#MN-2026)</span>
          </div>
        </div>

        {/* Action Buttons: Uji Sinkron & Atur Whitelist */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleTestSync}
            disabled={isRefetching}
            className="bg-[#EAE5DC] hover:bg-[#DDD5C7] text-neutral-900 text-xs font-bold py-2.5 px-3 rounded-xl border border-[#D5CDC0] transition cursor-pointer flex items-center justify-center gap-1.5 font-mono"
          >
            <span>🔄</span>
            <span>{isRefetching ? "Memuat..." : "UJI SINKRON"}</span>
          </button>

          <button
            onClick={() => alert("Pengaturan whitelist dikelola langsung di server backend.")}
            className="bg-[#EAE5DC] hover:bg-[#DDD5C7] text-neutral-900 text-xs font-bold py-2.5 px-3 rounded-xl border border-[#D5CDC0] transition cursor-pointer flex items-center justify-center gap-1.5 font-mono"
          >
            <span>🛡️</span>
            <span>ATUR WHITELIST</span>
          </button>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-extrabold py-3 px-4 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider"
        >
          <span>↳</span>
          <span>KELUAR AKUN GOOGLE</span>
        </button>
      </div>
    </div>
  );
}
