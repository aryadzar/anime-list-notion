import { useState, useEffect } from "react";

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstallPwaModal({ isOpen, onClose }: InstallPwaModalProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (typeof window !== "undefined") {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check iOS
      const ua = window.navigator.userAgent.toLowerCase();
      const isIosDevice = /iphone|ipad|ipod/.test(ua);
      setIsIOS(isIosDevice);

      // Listen for Android / Chrome PWA prompt
      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      return () => {
        window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setDeferredPrompt(null);
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs anim-backdrop p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#FAF8F5] border border-[#DDD5C7] rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 anim-sheet-spring text-[#171717] select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle for mobile */}
        <div className="w-12 h-1.5 bg-[#DDD5C7] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D8] mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#171717] text-white flex items-center justify-center text-lg shadow-2xs">
              📱
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-[#171717] font-sans">
                Pasang di Layar Utama (PWA)
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                Akses cepat layar penuh tanpa browser bar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-[#EAE5DC] text-neutral-600 hover:text-black flex items-center justify-center text-xs font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content based on state */}
        {isStandalone ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 mb-3">
            <span className="text-2xl block">🎉</span>
            <strong className="text-xs text-emerald-900 block font-bold">
              Aplikasi Sudah Terpasang!
            </strong>
            <p className="text-[11px] text-emerald-700">
              Anda sedang membuka aplikasi ini dalam mode layar penuh (PWA Standalone).
            </p>
          </div>
        ) : isIOS ? (
          /* iOS Safari Step-by-Step Instructions */
          <div className="space-y-3 mb-4">
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
              <strong className="text-xs text-amber-900 block font-bold flex items-center gap-1.5">
                <span>🍎</span>
                <span>Panduan untuk Safari di iPhone / iPad:</span>
              </strong>
              <div className="space-y-2 text-xs text-neutral-700">
                <div className="flex items-start gap-2.5 bg-white p-2 rounded-lg border border-amber-100">
                  <span className="w-5 h-5 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>
                    Tekan tombol <strong>Bagikan (Share 📤)</strong> di menu bar bawah Safari.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-2 rounded-lg border border-amber-100">
                  <span className="w-5 h-5 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>
                    Geser ke bawah lalu pilih menu <strong>"Tambahkan ke Layar Utama" (Add to Home Screen ➕)</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-2 rounded-lg border border-amber-100">
                  <span className="w-5 h-5 rounded-full bg-[#171717] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>
                    Tekan <strong>Tambah (Add)</strong> di kanan atas. Selesai!
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Android / Chrome / Edge 1-Click Install or Manual Guide */
          <div className="space-y-3 mb-4">
            <div className="p-3.5 bg-white border border-[#DDD5C7] rounded-xl space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-neutral-800">
                <span className="text-emerald-600">⚡</span>
                <span>Keuntungan Memasang Aplikasi:</span>
              </div>
              <ul className="text-[11px] text-neutral-600 space-y-1 list-disc pl-4">
                <li>Buka langsung dari layar utama HP seperti aplikasi asli.</li>
                <li>Layar penuh tanpa bilah URL browser yang mengganggu.</li>
                <li>Tetap tersinkronisasi otomatis dengan Notion database Anda.</li>
              </ul>
            </div>

            {deferredPrompt ? (
              <button
                onClick={handleInstallClick}
                className="w-full py-3 bg-[#F5C518] hover:bg-[#E5B508] active:scale-98 text-black font-extrabold text-xs rounded-xl shadow-md border border-[#DDB000] flex items-center justify-center gap-2 transition cursor-pointer font-mono"
              >
                <span>📥</span>
                <span>PASANG KE LAYAR UTAMA SEKARANG</span>
              </button>
            ) : (
              <div className="p-3 bg-neutral-100 rounded-xl text-[11px] text-neutral-600 space-y-1.5 border border-[#DDD5C7]">
                <strong className="block text-neutral-800 font-bold">Cara Memasang di Browser Chrome:</strong>
                <p>
                  1. Ketuk ikon titik tiga (<strong>⋮</strong>) di pojok kanan atas browser.
                </p>
                <p>
                  2. Pilih <strong>"Tambahkan ke Layar Utama"</strong> atau <strong>"Install Aplikasi"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#EAE5DC] hover:bg-[#DDD5C7] text-neutral-800 font-bold text-xs rounded-xl transition cursor-pointer font-mono"
        >
          TUTUP
        </button>
      </div>
    </div>
  );
}
