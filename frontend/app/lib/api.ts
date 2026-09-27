import type { ApiResponse, NotionItem, BackendStatus } from "../types/notion";
import { TOKEN_KEY } from "../context/AuthContext";

// Base API URL supporting custom backend URL in production Vercel
export const API_BASE =
  import.meta.env.VITE_BACKEND_URL
    ? `${import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")}/api`
    : "/api";

function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchNotionItems(): Promise<ApiResponse<NotionItem[]>> {
  const headers = getAuthHeaders();

  try {
    const res = await fetch(`${API_BASE}/items`, { headers, credentials: "include" });
    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      if (res.status === 401 || res.status === 403) {
        throw new Error(errJson.message || "Sesi Anda telah kedaluwarsa atau akses ditolak. Silakan login kembali.");
      }
      // Try direct localhost:3001 if proxy failed
      const directRes = await fetch("http://127.0.0.1:3001/api/items", { headers });
      if (!directRes.ok) {
        const directErr = await directRes.json().catch(() => ({}));
        throw new Error(directErr.message || `HTTP error! status: ${res.status}`);
      }
      return await directRes.json();
    }
    return await res.json();
  } catch (error) {
    throw error;
  }
}

export async function fetchBackendStatus(): Promise<BackendStatus> {
  try {
    const res = await fetch(`${API_BASE}/status`, { credentials: "include" });
    if (!res.ok) {
      const directRes = await fetch("http://127.0.0.1:3001/api/status");
      return await directRes.json();
    }
    return await res.json();
  } catch (error) {
    try {
      const directRes = await fetch("http://127.0.0.1:3001/api/status");
      if (directRes.ok) {
        return await directRes.json();
      }
    } catch (_) {}
    return {
      isConfigured: false,
      hasKey: false,
      hasDatabaseId: false,
      message: "Tidak dapat terhubung ke backend server (http://localhost:3001).",
    };
  }
}

// Request preview of manga titles from backend enricher
export async function previewMangaImport(
  rawText: string
): Promise<{ success: boolean; count: number; data: import("../types/notion").MangaPreviewItem[]; message?: string }> {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE}/manga/preview`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ rawText }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal mengambil preview: HTTP ${res.status}`);
  }

  return await res.json();
}

// Save a single item into Notion database
export async function createNotionItem(
  payload: import("../types/notion").CreateItemPayload
): Promise<ApiResponse<NotionItem>> {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE}/items`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal menyimpan ke Notion: HTTP ${res.status}`);
  }

  return await res.json();
}

// Save a batch of selected items into Notion database
export async function createNotionItemsBatch(
  items: import("../types/notion").CreateItemPayload[]
): Promise<{ success: boolean; count: number; created: NotionItem[]; errors: string[]; message: string }> {
  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  };

  const res = await fetch(`${API_BASE}/items/batch`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Gagal batch simpan ke Notion: HTTP ${res.status}`);
  }

  return await res.json();
}

