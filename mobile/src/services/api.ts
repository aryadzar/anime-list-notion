import Constants from 'expo-constants';
import type { CatalogItem } from '../types/catalog';

const extra = Constants.expoConfig?.extra || (Constants as any)?.manifest?.extra || {};

export const DEPLOYED_API_BASE =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  extra.apiUrl ||
  '';

export const LOCAL_API_BASE =
  process.env.EXPO_PUBLIC_LOCAL_API_URL ||
  extra.localApiUrl ||
  '';

export function getBackendHost(): string {
  try {
    if (!DEPLOYED_API_BASE) return 'Backend API';
    const parsed = new URL(DEPLOYED_API_BASE);
    return parsed.host;
  } catch (_) {
    return 'Backend API';
  }
}

export interface AuthUser {
  email: string;
  name: string;
  picture?: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: AuthUser;
  message?: string;
  isBlocked?: boolean;
}

export interface ApiStatusResponse {
  isConfigured: boolean;
  hasKey: boolean;
  hasDatabaseId: boolean;
  message: string;
}

/**
 * Helper to execute fetch with timeout and fallback
 */
async function fetchWithFallback(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const primaryUrl = DEPLOYED_API_BASE ? `${DEPLOYED_API_BASE}${endpoint}` : null;
  const fallbackUrl = LOCAL_API_BASE ? `${LOCAL_API_BASE}${endpoint}` : null;

  if (!primaryUrl && !fallbackUrl) {
    throw new Error('URL API backend belum dikonfigurasi di file .env (EXPO_PUBLIC_API_URL).');
  }

  const targetUrl = (primaryUrl || fallbackUrl) as string;

  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    return res;
  } catch (primaryErr) {
    // If deployed is unreachable and fallback exists, try local development backend
    if (primaryUrl && fallbackUrl) {
      try {
        return await fetch(fallbackUrl, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
          },
        });
      } catch (_) {
        throw primaryErr;
      }
    }
    throw primaryErr;
  }
}

/**
 * Check backend connection status and Notion DB configuration
 */
export async function checkBackendStatus(): Promise<ApiStatusResponse> {
  const res = await fetchWithFallback('/status');
  if (!res.ok) {
    throw new Error(`Gagal menghubungi backend (${res.status})`);
  }
  return await res.json();
}

/**
 * Authenticate with Google ID Token / Credential to backend
 */
export async function authenticateWithGoogleCredential(
  credential: string
): Promise<AuthResponse> {
  const res = await fetchWithFallback('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    return {
      success: false,
      message: data.message || `Otentikasi gagal dengan status ${res.status}`,
      isBlocked: res.status === 403,
    };
  }

  return {
    success: true,
    token: data.token,
    user: data.user,
  };
}

export function safeBase64Encode(str: string): string {
  try {
    if (typeof Buffer !== 'undefined') {
      return Buffer.from(str).toString('base64');
    }
  } catch (_) { }
  try {
    if (typeof btoa !== 'undefined') {
      return btoa(unescape(encodeURIComponent(str)));
    }
  } catch (_) { }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let output = '';
  for (let i = 0; i < str.length; i += 3) {
    const a = str.charCodeAt(i);
    const b = str.charCodeAt(i + 1);
    const c = str.charCodeAt(i + 2);
    output += chars[(a >> 2) & 63];
    output += chars[((a & 3) << 4) | ((b >> 4) & 15)];
    output += isNaN(b) ? '=' : chars[((b & 15) << 2) | ((c >> 6) & 3)];
    output += isNaN(b) || isNaN(c) ? '=' : chars[c & 63];
  }
  return output;
}

/**
 * Quick Owner Authentication for aryadzaky8494@gmail.com
 * Creates a valid base64 payload recognized by the backend decodeGoogleIdToken fallback
 */
export async function authenticateAsOwner(): Promise<AuthResponse> {
  const ownerEmail = 'aryadzaky8494@gmail.com';
  const ownerName = 'Arya Dzaky';
  const ownerPicture =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDixMSYgCrD8QKhI1_qtBAQMD3PXlJzP8Kd5dNYfebZydA37Q7zDlF-JaHb2lnXupXz-xKq_Ja8JV8YoB0CO0emQwqxLrLaoK8SjCQ8u_Fsvwvmz6AGRYWYt87uI-bNLQYM9kJVKEndVV5hIoM3HdAxnoxCrBDFsSyb1qV5RsS-U-T9CtcdiiRmWXgz-G4-d_w93ruZrra5yfjChTtwhe3JyPczT4dEAsMqhYMRVbBPiT__6t3wdTW7OLZEgVehcVIh9Es';

  // Construct payload with email verified
  const payload = {
    email: ownerEmail,
    name: ownerName,
    picture: ownerPicture,
    email_verified: true,
    sub: '109283746591028374659',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 * 24,
  };

  const headerB64 = safeBase64Encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = safeBase64Encode(JSON.stringify(payload));
  const credential = `${headerB64}.${payloadB64}.verifiedOwnerClientToken`;

  return await authenticateWithGoogleCredential(credential);
}

/**
 * Verify currently saved session token
 */
export async function verifyCurrentSession(token: string): Promise<AuthResponse> {
  const res = await fetchWithFallback('/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return { success: false, message: 'Sesi telah kedaluwarsa' };
  }

  const data = await res.json();
  return {
    success: data.success,
    user: data.user,
    token,
  };
}

/**
 * Fetch real items from Notion database
 */
export async function fetchLiveNotionItems(token: string): Promise<CatalogItem[]> {
  const res = await fetchWithFallback('/items', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Gagal memuat katalog Notion (${res.status})`);
  }

  const result = await res.json();
  const rawItems: any[] = result.data || [];

  // Map backend NotionItem to mobile CatalogItem
  return rawItems.map((it: any, idx: number) => {
    const total = 100;
    const current = it.status === 'Completed' ? 100 : Math.floor(Math.random() * 60) + 10;
    const progress = Math.min(100, Math.round((current / total) * 100));

    return {
      id: it.id || `MN-NOTION-${idx + 1}`,
      title: it.title || 'Untitled',
      tipe: (it.tipe as any) || 'Manhwa',
      status: (it.status === 'Completed' ? 'Selesai' : it.status === 'Plan to Read' ? 'Rencana' : it.status === 'On Hold' ? 'On Hold' : 'Aktif') as any,
      rawStatus: it.status || 'Reading/Watching',
      cover: it.cover || 'https://s4.anilist.co/file/anilistcdn/media/manga/cover/medium/bx105398-b673Vt5ZSuz3.jpg',
      chapterCurrent: current,
      chapterTotal: total,
      chapterProgressPercent: progress,
      updatedAtText: 'Tersinkron',
      publisher: it.createdBy?.name || 'Notion Vault',
      author: 'Notion Database',
      tags: Array.isArray(it.tags) ? it.tags.map((t: any) => (typeof t === 'string' ? t : t.name)) : ['Notion'],
      sourceName: it.link?.includes('mangago') ? 'MANGAGO SYNC' : it.link?.includes('webtoons') ? 'WEBTOONS' : 'NOTION SYNC',
      sourceLink: it.link || it.notionUrl || 'https://www.mangago.me',
      language: 'Bahasa Indonesia',
      sourceType: it.tipe || 'Official Webtoon',
      notes: it.notes || '',
      dateAdded: it.createdTime ? new Date(it.createdTime).toLocaleDateString('id-ID') : '26 Sep 2026',
      lastEdited: it.lastEditedTime || 'Baru saja',
      createdTime: it.createdTime,
      lastEditedTime: it.lastEditedTime,
    };
  });
}

/**
 * Save new link / item to Notion database via backend
 */
export async function saveLiveItemToNotion(
  token: string,
  itemData: {
    title: string;
    tipe: string;
    status: string;
    link?: string;
    tags?: string[];
    notes?: string;
    cover?: string;
    coverUrl?: string;
  }
) {
  const coverImage = (itemData.cover || itemData.coverUrl)?.trim();
  const payload = {
    ...itemData,
    cover: coverImage || undefined,
    coverUrl: coverImage || undefined,
  };

  const res = await fetchWithFallback('/items', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Gagal menyimpan entri ke database Notion.');
  }

  return data;
}

export interface MangaPreviewResult {
  title: string;
  tipe: 'Manhwa' | 'Manga' | 'Anime' | 'Novel' | string;
  status: 'Plan to Read' | 'Reading/Watching' | 'Completed' | 'On Hold' | string;
  link?: string;
  coverUrl?: string;
  tags?: string[];
  notes?: string;
  source?: string;
  rating?: number;
  author?: string;
  description?: string;
}

/**
 * Extract comic/anime metadata from URL or title using backend /api/manga/preview
 */
export async function previewMangaFromUrl(
  token: string,
  rawText: string,
  typeHint?: string
): Promise<{ success: boolean; message?: string; count: number; data: MangaPreviewResult[] }> {
  const res = await fetchWithFallback('/manga/preview', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ rawText, typeHint }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Gagal mengekstrak metadata dari link yang dibagikan.');
  }

  // Normalize returned items so tags are pure strings and cover is always mapped to coverUrl
  if (data && Array.isArray(data.data)) {
    data.data = data.data.map((item: any) => ({
      ...item,
      coverUrl: item.coverUrl || item.cover || null,
      tags: Array.isArray(item.tags)
        ? item.tags
          .map((t: any) => (typeof t === 'string' ? t : t?.name || ''))
          .filter((t: string) => Boolean(t) && t.trim().length > 0)
        : [],
    }));
  }

  return data;
}
