import * as FileSystem from 'expo-file-system/legacy';

const AUTH_FILE = `${FileSystem.documentDirectory}auth_session.json`;

export interface StoredSession {
  token: string;
  user: {
    email: string;
    name: string;
    picture?: string;
  };
}

/**
 * Persist authenticated session to device storage
 */
export async function saveAuthSession(data: StoredSession): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(AUTH_FILE, JSON.stringify(data));
  } catch (err) {
    console.warn('[STORAGE] Failed to save auth session:', err);
  }
}

/**
 * Retrieve saved session from device storage
 */
export async function getAuthSession(): Promise<StoredSession | null> {
  try {
    const info = await FileSystem.getInfoAsync(AUTH_FILE);
    if (!info.exists) return null;
    const content = await FileSystem.readAsStringAsync(AUTH_FILE);
    return JSON.parse(content);
  } catch (_) {
    return null;
  }
}

/**
 * Clear saved session on logout
 */
export async function clearAuthSession(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(AUTH_FILE);
    if (info.exists) {
      await FileSystem.deleteAsync(AUTH_FILE, { idempotent: true });
    }
  } catch (err) {
    console.warn('[STORAGE] Failed to clear auth session:', err);
  }
}
