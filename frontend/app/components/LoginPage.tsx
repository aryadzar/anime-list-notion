import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID;

export function LoginPage() {
  const { loginWithGoogleCredential, authError, setAuthError } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(authError);
  const [isProcessing, setIsProcessing] = useState(false);
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Sync authError from context
  useEffect(() => {
    if (authError) {
      setErrorMessage(authError);
    }
  }, [authError]);

  // Initialize and render Google Identity Services button
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let timer: any;
    let isMounted = true;

    const tryInitGoogleButton = () => {
      if (!isMounted) return false;
      const google = (window as any).google;

      if (google?.accounts?.id && googleBtnRef.current) {
        try {
          google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            use_fedcm_for_prompt: true,
            callback: async (response: any) => {
              if (response.credential) {
                setIsProcessing(true);
                setErrorMessage(null);
                setAuthError(null);
                const res = await loginWithGoogleCredential(response.credential);
                if (!res.success) {
                  setErrorMessage(res.message || "Akses ditolak: Akun Anda tidak memiliki izin.");
                }
                setIsProcessing(false);
              }
            },
            error_callback: (err: any) => {
              console.error("Google Identity Services Error:", err);
              setErrorMessage("Google Sign-In: " + (err.message || err.type || "Gagal menghubungkan ke akun Google."));
            },
          });

          // Clear previous render if any and render official button
          if (googleBtnRef.current) {
            googleBtnRef.current.innerHTML = "";
            google.accounts.id.renderButton(googleBtnRef.current, {
              theme: "filled_black",
              size: "large",
              shape: "rectangular",
              width: 320,
              text: "signin_with",
              logo_alignment: "left",
            });
          }
          return true;
        } catch (err: any) {
          console.error("Gagal inisialisasi tombol Google Sign-In:", err);
          return false;
        }
      }
      return false;
    };

    // Try immediately
    if (!tryInitGoogleButton()) {
      // If window.google is still downloading asynchronously, poll every 150ms
      timer = setInterval(() => {
        if (tryInitGoogleButton()) {
          clearInterval(timer);
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      if (timer) clearInterval(timer);
    };
  }, [loginWithGoogleCredential, setAuthError]);

  return (
    <div className="min-h-screen bg-[#101010] text-[#e3e2de] flex flex-col justify-between items-center px-4 py-8 select-none font-sans relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Logo */}
      <div className="flex items-center space-x-2 text-sm text-neutral-400 z-10">
        <span className="text-xl">📚</span>
        <span className="font-semibold text-neutral-200">Catalog Database</span>
        <span>/</span>
        <span className="text-neutral-400">Vault Authentication</span>
      </div>

      {/* Central Login Card */}
      <div className="w-full max-w-md bg-[#181818] border border-[#2b2b2b] rounded-2xl p-8 shadow-2xl z-10 relative">
        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#222222] border border-[#333333] flex items-center justify-center text-3xl shadow-inner mb-4">
            📖
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Notion Tracker Vault
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Database Katalog Pribadi Manhwa, Manga &amp; Anime
          </p>
        </div>

        {/* Warning if Client ID missing */}
        {!GOOGLE_CLIENT_ID && (
          <div className="mb-5 bg-[#251f15] border border-amber-800/60 rounded-xl p-3.5 text-xs text-amber-200 flex items-start gap-2.5">
            <span className="text-base text-amber-400 mt-0.5">⚙️</span>
            <div>
              <strong className="block font-semibold text-amber-300 mb-0.5">
                Konfigurasi Diperlukan
              </strong>
              <p className="text-amber-200/90 leading-relaxed text-[11px]">
                Silakan pastikan <code>VITE_GOOGLE_CLIENT_ID</code> telah diatur pada file <code>frontend/.env</code>.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert Message */}
        {errorMessage && (
          <div className="mb-5 bg-[#251515] border border-red-800/80 rounded-xl p-3.5 text-xs text-red-200 flex items-start justify-between gap-3 shadow-lg shadow-red-950/20 animate-fadeIn">
            <div className="flex items-start gap-2.5">
              <span className="text-base text-red-400 mt-0.5">⚠️</span>
              <div>
                <strong className="block font-semibold text-white mb-0.5">
                  Autentikasi Gagal
                </strong>
                <p className="text-red-300/90 leading-relaxed text-[11px]">
                  {errorMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setErrorMessage(null);
                setAuthError(null);
              }}
              className="text-neutral-400 hover:text-white text-xs p-1 rounded hover:bg-neutral-800/50 transition cursor-pointer"
              title="Tutup pesan"
            >
              ✕
            </button>
          </div>
        )}

        {/* Google Sign In Area */}
        <div className="flex flex-col items-center justify-center my-4 min-h-[48px]">
          {isProcessing && (
            <div className="flex items-center space-x-2.5 text-xs text-neutral-300 py-2 mb-2">
              <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin"></div>
              <span>Memverifikasi akun Google...</span>
            </div>
          )}
          <div
            ref={googleBtnRef}
            className={`flex justify-center w-full transition-opacity ${
              isProcessing ? "opacity-40 pointer-events-none" : ""
            }`}
          />
        </div>
      </div>

      {/* Page Footer */}
      <footer className="text-center text-[11px] text-neutral-600 z-10">
        <span>Notion Tracker</span>
      </footer>
    </div>
  );
}
