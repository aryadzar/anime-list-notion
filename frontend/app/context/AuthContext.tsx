import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import { API_BASE } from "../lib/api";

export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  loginWithGoogleCredential: (credential: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    } catch (_) {}
  }, []);

  // Restore and maintain persistent session on mount
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (!storedToken || !storedUser) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        if (isMounted) {
          setToken(storedToken);
          setUser(parsedUser);
          setIsLoading(false);
        }

        // Verify session with backend in background
        try {
          let verifyRes: Response;
          try {
            verifyRes = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
              credentials: "include",
            });
          } catch (_) {
            verifyRes = await fetch("http://localhost:3001/api/auth/me", {
              headers: { Authorization: `Bearer ${storedToken}` },
              credentials: "include",
            });
          }

          if (verifyRes.ok) {
            const data = await verifyRes.json();
            if (data.success && data.user && isMounted) {
              setUser(data.user);
              localStorage.setItem(USER_KEY, JSON.stringify(data.user));
            }
          } else if (verifyRes.status === 401 || verifyRes.status === 403) {
            if (isMounted) {
              setAuthError("Sesi Anda telah berakhir atau akun tidak memiliki izin. Silakan login kembali.");
              logout();
            }
          }
        } catch (_) {
          // Keep offline session if server is temporarily unreachable
        }
      } catch (err) {
        console.error("Gagal membaca session dari localStorage:", err);
        if (isMounted) setIsLoading(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [logout]);

  const loginWithGoogleCredential = useCallback(async (credential: string) => {
    try {
      let res: Response;
      try {
        res = await fetch(`${API_BASE}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential }),
        });
      } catch (_) {
        res = await fetch("http://localhost:3001/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ credential }),
        });
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        const errorMsg =
          data.message ||
          (res.status === 403
            ? "Akses ditolak: Akun Google Anda tidak terdaftar dalam whitelist."
            : "Gagal masuk dengan Google. Pastikan email Anda terdaftar.");
        setAuthError(errorMsg);
        return {
          success: false,
          message: errorMsg,
        };
      }

      setAuthError(null);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      const errorMsg = err.message || "Terjadi kesalahan jaringan saat login.";
      setAuthError(errorMsg);
      return {
        success: false,
        message: errorMsg,
      };
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        authError,
        setAuthError,
        loginWithGoogleCredential,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
