import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AuthUser,
  authenticateWithGoogleCredential,
  authenticateAsOwner,
  checkBackendStatus,
} from '../services/api';
import {
  getAuthSession,
  saveAuthSession,
  clearAuthSession,
} from '../utils/persistentStorage';
import {
  performGoogleSignIn,
  performOwnerWhitelistSignIn,
  testNonWhitelistedEmail,
  performGoogleSignOut,
  isNativeGoogleSignInAvailable,
  configureGoogleSignIn,
  WHITELISTED_EMAIL,
} from '../services/googleAuth';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  backendOnline: boolean;
  isNativeGoogleSignIn: boolean;
  whitelistedEmail: string;
  signInWithGoogle: () => Promise<boolean>;
  signInAsWhitelistedOwner: () => Promise<boolean>;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  testWhitelistReject: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  backendOnline: false,
  isNativeGoogleSignIn: false,
  whitelistedEmail: WHITELISTED_EMAIL,
  signInWithGoogle: async () => false,
  signInAsWhitelistedOwner: async () => false,
  loginWithGoogleCredential: async () => false,
  testWhitelistReject: async () => ({ success: false, message: '' }),
  logout: () => {},
  clearError: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(true);

  // Configure native Google Sign-In on mount
  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  // Check backend health on mount
  useEffect(() => {
    checkBackendStatus()
      .then((status) => {
        setBackendOnline(status.isConfigured);
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  // Restore session from persistent storage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedSession = await getAuthSession();
        if (savedSession && savedSession.token && savedSession.user) {
          setToken(savedSession.token);
          setUser(savedSession.user);
        }
      } catch (_) {
        // Fallback to unauthenticated state
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  /**
   * Primary Sign-In with Google:
   * Uses native Google Account picker if in dev build,
   * or authenticates the whitelisted account aryadzaky8494@gmail.com with backend
   */
  const signInWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await performGoogleSignIn();
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await saveAuthSession({ token: res.token, user: res.user });
        setIsLoading(false);
        return true;
      } else {
        setError(res.message || 'Login gagal. Akun tidak memiliki izin akses whitelist.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menghubungi server backend.');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Quick Owner Authentication directly for aryadzaky8494@gmail.com
   */
  const signInAsWhitelistedOwner = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await performOwnerWhitelistSignIn();
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await saveAuthSession({ token: res.token, user: res.user });
        setIsLoading(false);
        return true;
      } else {
        setError(res.message || 'Login gagal.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menghubungi server backend.');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Direct credential login
   */
  const loginWithGoogleCredential = useCallback(async (credential: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authenticateWithGoogleCredential(credential);
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        await saveAuthSession({ token: res.token, user: res.user });
        setIsLoading(false);
        return true;
      } else {
        setError(res.message || 'Login gagal. Akun tidak memiliki izin akses whitelist.');
        setIsLoading(false);
        return false;
      }
    } catch (err: any) {
      setError(err?.message || 'Tidak dapat terhubung ke server backend');
      setIsLoading(false);
      return false;
    }
  }, []);

  /**
   * Test a non-whitelisted email against the backend to verify 403 Forbidden enforcement
   */
  const testWhitelistReject = useCallback(async (email: string) => {
    try {
      const res = await testNonWhitelistedEmail(email);
      return {
        success: res.success,
        message: res.message || (res.success ? 'Akses diberikan' : 'Akses ditolak (403 Forbidden)'),
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Gagal menghubungi backend',
      };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    setError(null);
    await performGoogleSignOut();
    await clearAuthSession();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        error,
        backendOnline,
        isNativeGoogleSignIn: isNativeGoogleSignInAvailable(),
        whitelistedEmail: WHITELISTED_EMAIL,
        signInWithGoogle,
        signInAsWhitelistedOwner,
        loginWithGoogleCredential,
        testWhitelistReject,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
