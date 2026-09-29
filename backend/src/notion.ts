import type { NotionItem, TagItem, ApiResponse } from "./types";
import { MOCK_ITEMS } from "./mockData";

// Helper to generate initials from title (e.g. "Omniscient Reader's Viewpoint" -> "ORV")
function getInitials(title: string): string {
  if (!title) return "DB";
  const words = title.trim().split(/\s+/);
  if (words.length === 1) {
    return title.slice(0, 3).toUpperCase();
  }
  return words
    .slice(0, 3)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

// Clean helper to extract text from Notion rich text array
function getPlainText(richTextList?: any[]): string {
  if (!Array.isArray(richTextList) || richTextList.length === 0) return "";
  return richTextList.map((item) => item.plain_text || "").join("");
}

// Normalize a single Notion page into our standard NotionItem
export function parseNotionPage(page: any): NotionItem {
  const props = page.properties || {};

  // Find properties by type or case-insensitive name matching
  let title = "";
  let status = "Reading/Watching";
  let statusColor = "purple";
  let tipe = "Manhwa";
  let tipeColor = "brown";
  let tags: TagItem[] = [];
  let link: string | null = null;
  let rawAltLink: string | null = null;
  let notes = "";
  let coverUrl: string | null = null;
  let customCreatedTime: string | null = null;
  let customLastEditedTime: string | null = null;
  let customCreatedByName: string | null = null;

  // 1. Title property
  for (const key of Object.keys(props)) {
    const prop = props[key];
    if (prop.type === "title") {
      title = getPlainText(prop.title);
      break;
    }
  }

  // 2. Cover: check page.cover first (external or file)
  if (page.cover) {
    if (page.cover.type === "external" && page.cover.external?.url) {
      coverUrl = page.cover.external.url;
    } else if (page.cover.type === "file" && page.cover.file?.url) {
      coverUrl = page.cover.file.url;
    }
  }

  // 3. Icon: check page.icon (emoji or external)
  let icon = "📖";
  if (page.icon) {
    if (page.icon.type === "emoji" && page.icon.emoji) {
      icon = page.icon.emoji;
    }
  }

  // 4. Iterate over properties for other fields
  for (const [key, prop] of Object.entries<any>(props)) {
    const lowerKey = key.toLowerCase();

    // Check files property for cover if not found yet
    if (
      !coverUrl &&
      prop.type === "files" &&
      (lowerKey.includes("cover") || lowerKey.includes("gambar") || lowerKey.includes("image"))
    ) {
      if (Array.isArray(prop.files) && prop.files.length > 0) {
        const firstFile = prop.files[0];
        coverUrl = firstFile.file?.url || firstFile.external?.url || null;
      }
    }

    // Status
    if (prop.type === "status" || (prop.type === "select" && lowerKey.includes("status"))) {
      const val = prop.status || prop.select;
      if (val?.name) {
        status = val.name;
        statusColor = val.color || "purple";
      }
    }

    // Tipe / Format
    if (
      prop.type === "select" &&
      (lowerKey.includes("tipe") || lowerKey.includes("type") || lowerKey.includes("kategori") || lowerKey.includes("format"))
    ) {
      if (prop.select?.name) {
        tipe = prop.select.name;
        tipeColor = prop.select.color || "brown";
      }
    }

    // Tags / Genres
    if (
      prop.type === "multi_select" &&
      (lowerKey.includes("tag") || lowerKey.includes("genre") || lowerKey.includes("kategori"))
    ) {
      if (Array.isArray(prop.multi_select)) {
        tags = prop.multi_select.map((m: any) => ({
          name: m.name,
          color: m.color,
        }));
      }
    }

    // Link / URL
    if (
      (lowerKey === "link" || lowerKey === "url" || lowerKey === "baca") &&
      (prop.type === "url" || prop.type === "rich_text")
    ) {
      if (prop.type === "url" && prop.url) {
        link = prop.url;
      } else if (prop.type === "rich_text") {
        const text = getPlainText(prop.rich_text);
        if (text) link = text;
      }
    }

    // Raw/Alt Link
    if (
      (lowerKey.includes("raw") || lowerKey.includes("alt")) &&
      (prop.type === "url" || prop.type === "rich_text")
    ) {
      if (prop.type === "url" && prop.url) {
        rawAltLink = prop.url;
      } else if (prop.type === "rich_text") {
        const text = getPlainText(prop.rich_text);
        if (text) rawAltLink = text;
      }
    }

    // Catatan / Notes
    if (
      prop.type === "rich_text" &&
      (lowerKey.includes("catatan") || lowerKey.includes("note") || lowerKey.includes("keterangan"))
    ) {
      notes = getPlainText(prop.rich_text);
    }

    // Ditambahkan (Created Time)
    if (
      (lowerKey.includes("ditambahkan") || lowerKey.includes("created")) &&
      (prop.type === "created_time" || prop.type === "date")
    ) {
      if (prop.type === "created_time" && prop.created_time) {
        customCreatedTime = prop.created_time;
      } else if (prop.type === "date" && prop.date?.start) {
        customCreatedTime = prop.date.start;
      }
    }

    // Terakhir diedit (Last Edited Time)
    if (
      (lowerKey.includes("diedit") || lowerKey.includes("edited")) &&
      (prop.type === "last_edited_time" || prop.type === "date")
    ) {
      if (prop.type === "last_edited_time" && prop.last_edited_time) {
        customLastEditedTime = prop.last_edited_time;
      } else if (prop.type === "date" && prop.date?.start) {
        customLastEditedTime = prop.date.start;
      }
    }

    // Created by property
    if (
      (lowerKey.includes("created by") || lowerKey.includes("creator") || lowerKey.includes("dibuat")) &&
      (prop.type === "people" || prop.type === "created_by")
    ) {
      if (prop.type === "created_by" && prop.created_by?.name) {
        customCreatedByName = prop.created_by.name;
      } else if (prop.type === "people" && Array.isArray(prop.people) && prop.people.length > 0) {
        customCreatedByName = prop.people[0].name || prop.people[0].id || customCreatedByName;
      }
    }
  }

  // Created By info
  const createdByName =
    customCreatedByName ||
    page.created_by?.name ||
    page.created_by?.id ||
    "arya";

  return {
    id: page.id,
    title: title || "Untitled",
    icon,
    cover: coverUrl,
    initials: getInitials(title || "Untitled"),
    status,
    statusColor,
    tipe,
    tipeColor,
    tags,
    createdTime: customCreatedTime || page.created_time || new Date().toISOString(),
    lastEditedTime: customLastEditedTime || page.last_edited_time || page.created_time || new Date().toISOString(),
    createdBy: {
      id: page.created_by?.id,
      name: createdByName,
      avatarUrl: page.created_by?.avatar_url,
    },
    link,
    rawAltLink,
    notes,
    notionUrl: page.url,
  };
}

// Helper to query pages from a Notion data source (2025-09-03 API)
async function queryDataSourcePages(dataSourceId: string, apiKey: string): Promise<any[]> {
  const pages: any[] = [];
  let hasMore = true;
  let cursor: string | undefined = undefined;

  while (hasMore && pages.length < 500) {
    const body: Record<string, any> = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;

    const res = await fetch(`https://api.notion.com/v1/data_sources/${dataSourceId}/query`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as any;
      throw new Error(err?.message || `Data source query failed: HTTP ${res.status}`);
    }

    const data = (await res.json()) as any;
    if (Array.isArray(data.results)) {
      pages.push(...data.results);
    }
    hasMore = Boolean(data.has_more && data.next_cursor);
    cursor = data.next_cursor || undefined;
  }

  return pages;
}

// Fallback helper for legacy single-source database (2022-06-28 API)
async function queryLegacyDatabase(cleanDbId: string, apiKey: string): Promise<any[]> {
  const res = await fetch(`https://api.notion.com/v1/databases/${cleanDbId}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ page_size: 100 }),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as any;
    throw new Error(err?.message || `Legacy database query failed: HTTP ${res.status}`);
  }

  const data = (await res.json()) as any;
  return data.results || [];
}

export async function fetchNotionItems(): Promise<ApiResponse<NotionItem[]>> {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();

  // If credentials are not set, return mock data with status
  if (!apiKey || !databaseId) {
    return {
      success: true,
      isMock: true,
      message:
        "Notion API Key atau Database ID belum disetel di backend/.env. Menampilkan data katalog mockup.",
      data: MOCK_ITEMS,
      total: MOCK_ITEMS.length,
    };
  }

  try {
    // Clean database ID (strip dashes if any or keep as is)
    const cleanDbId = databaseId.replace(/-/g, "");
    let rawPages: any[] = [];

    // Step 1: Discover database container & its data_sources using Notion API 2025-09-03
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${cleanDbId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
    });

    if (dbRes.ok) {
      const dbData = (await dbRes.json()) as any;
      const dataSources = Array.isArray(dbData.data_sources) ? dbData.data_sources : [];

      if (dataSources.length > 0) {
        console.log(`[BACKEND] Database ditemukan dengan ${dataSources.length} data source.`);
        for (const ds of dataSources) {
          console.log(`[BACKEND] Mengambil entri dari data source: ${ds.name || ds.id}`);
          const dsPages = await queryDataSourcePages(ds.id, apiKey);
          rawPages.push(...dsPages);
        }
      } else {
        // In case data_sources is empty, attempt querying as data_source directly
        try {
          const dsPages = await queryDataSourcePages(cleanDbId, apiKey);
          rawPages.push(...dsPages);
        } catch (_) {
          rawPages = await queryLegacyDatabase(cleanDbId, apiKey);
        }
      }
    } else {
      // If GET /databases/{id} fails (e.g. if the ID provided was already a data_source_id)
      const errJson = (await dbRes.json().catch(() => ({}))) as any;

      try {
        rawPages = await queryDataSourcePages(cleanDbId, apiKey);
      } catch {
        try {
          rawPages = await queryLegacyDatabase(cleanDbId, apiKey);
        } catch {
          let msg = errJson?.message || `HTTP ${dbRes.status} ${dbRes.statusText}`;
          if (dbRes.status === 404 || msg.includes("Could not find database")) {
            msg = `Database Notion tidak ditemukan (${cleanDbId}). Pastikan Anda sudah membagikan akses ke integrasi: Buka database di Notion > klik '•••' di kanan atas > 'Connect to' > pilih integrasi Anda.`;
          } else if (dbRes.status === 401 || msg.includes("API token is invalid")) {
            msg = "Notion API Key tidak valid. Periksa kembali NOTION_API_KEY di file backend/.env.";
          }
          throw new Error(msg);
        }
      }
    }

    // Deduplicate pages by id in case of overlap
    const seen = new Set<string>();
    const uniquePages = rawPages.filter((p) => {
      if (!p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    const items = uniquePages.map((page: any) => parseNotionPage(page));

    return {
      success: true,
      isMock: false,
      message: `Berhasil mengambil ${items.length} entri langsung dari database Notion.`,
      data: items,
      total: items.length,
    };
  } catch (error: any) {
    console.error("Gagal query Notion database:", error?.message || error);
    return {
      success: false,
      isMock: true,
      message: `Gagal mengakses Notion API: ${error?.message || "Error tidak diketahui"}. Menampilkan data mockup sementara.`,
      data: MOCK_ITEMS,
      total: MOCK_ITEMS.length,
    };
  }
}

// Cached parent configuration for page creation
let cachedTargetParent: Record<string, string> | null = null;

export async function getTargetParent(apiKey: string, cleanDbId: string): Promise<Record<string, string>> {
  if (cachedTargetParent) return cachedTargetParent;

  try {
    const dbRes = await fetch(`https://api.notion.com/v1/databases/${cleanDbId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
    });

    if (dbRes.ok) {
      const dbData = (await dbRes.json()) as any;
      const dataSources = Array.isArray(dbData.data_sources) ? dbData.data_sources : [];
      if (dataSources.length > 0) {
        cachedTargetParent = { data_source_id: dataSources[0].id };
        return cachedTargetParent;
      }
    }
  } catch (err) {
    console.warn("[NOTION] Could not retrieve data_sources from database, falling back to database_id", err);
  }

  cachedTargetParent = { database_id: cleanDbId };
  return cachedTargetParent;
}

// Upload image directly to Notion internal storage (AWS S3) via Notion File Upload API
export async function uploadFileToNotion(
  apiKey: string,
  fileUrl: string,
  cleanTitle: string
): Promise<string | null> {
  try {
    const filename = `${cleanTitle.toLowerCase().replace(/[^a-z0-9_-]+/g, "_")}.jpg`;

    const uploadRes = await fetch("https://api.notion.com/v1/file_uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2025-09-03",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "external_url",
        external_url: fileUrl,
        filename,
      }),
    });

    if (!uploadRes.ok) {
      console.warn("[NOTION] file_uploads creation failed:", uploadRes.status);
      return null;
    }

    const uploadObj = (await uploadRes.json()) as any;
    const fileUploadId = uploadObj.id;
    if (!fileUploadId) return null;

    // Poll until status is 'uploaded' (typically 500ms - 1.5s)
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 600));
      const chkRes = await fetch(`https://api.notion.com/v1/file_uploads/${fileUploadId}`, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Notion-Version": "2025-09-03",
        },
      });

      if (chkRes.ok) {
        const chkData = (await chkRes.json()) as any;
        if (chkData.status === "uploaded") {
          console.log(`[NOTION] Gambar "${filename}" berhasil diunggah langsung ke penyimpanan internal Notion!`);
          return fileUploadId;
        }
        if (chkData.status === "failed") {
          console.warn("[NOTION] File upload failed in Notion:", chkData);
          return null;
        }
      }
    }
    return null;
  } catch (err) {
    console.warn("[NOTION] Error uploading file to Notion internal storage:", err);
    return null;
  }
}

export async function createNotionPage(payload: any): Promise<NotionItem> {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  const databaseId = process.env.NOTION_DATABASE_ID?.trim();

  if (!apiKey || !databaseId) {
    throw new Error("Notion API Key atau Database ID belum disetel di backend/.env.");
  }

  const cleanDbId = databaseId.replace(/-/g, "");
  const parent = await getTargetParent(apiKey, cleanDbId);

  const properties: Record<string, any> = {
    Judul: {
      title: [
        {
          text: {
            content: payload.title,
          },
        },
      ],
    },
    Tipe: {
      select: {
        name: payload.tipe || "Manhwa",
      },
    },
    Status: {
      select: {
        name: payload.status || "Reading/Watching",
      },
    },
  };

  if (Array.isArray(payload.tags) && payload.tags.length > 0) {
    properties.Tags = {
      multi_select: payload.tags
        .map((t: any) => ({ name: typeof t === "string" ? t.trim() : t.name?.trim() }))
        .filter((t: any) => Boolean(t.name)),
    };
  }

  if (payload.link?.trim()) {
    properties.Link = {
      url: payload.link.trim(),
    };
  }

  if (payload.notes?.trim()) {
    properties.Catatan = {
      rich_text: [
        {
          text: {
            content: payload.notes.slice(0, 2000),
          },
        },
      ],
    };
  }

  // Upload image to Notion internal storage if a cover URL is provided
  let fileUploadId: string | null = null;
  const rawCover = (payload.cover || payload.coverUrl)?.trim();
  if (rawCover) {
    fileUploadId = await uploadFileToNotion(apiKey, rawCover, payload.title || "cover");

    if (fileUploadId) {
      // 1. Direct Notion internal file upload (stored in Notion's AWS S3 bucket)
      properties.Cover = {
        files: [
          {
            type: "file_upload",
            file_upload: {
              id: fileUploadId,
            },
          },
        ],
      };
    } else {
      // Fallback to external URL if direct upload timed out or failed
      properties.Cover = {
        files: [
          {
            name: "Cover",
            type: "external",
            external: {
              url: rawCover,
            },
          },
        ],
      };
    }
  }

  const body: Record<string, any> = {
    parent,
    properties,
    icon: {
      type: "emoji",
      emoji: payload.icon || (payload.tipe === "Anime" ? "🎬" : "📖"),
    },
  };

  if (fileUploadId) {
    // 2. Set page banner with the internal file upload
    body.cover = {
      type: "file_upload",
      file_upload: {
        id: fileUploadId,
      },
    };
  } else if (rawCover) {
    // Fallback external URL
    body.cover = {
      type: "external",
      external: {
        url: rawCover,
      },
    };
  }

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": "2025-09-03",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as any;
    throw new Error(err.message || `Gagal membuat halaman di Notion: HTTP ${res.status}`);
  }

  const page = await res.json();
  return parseNotionPage(page);
}

export async function createNotionPagesBatch(
  items: any[]
): Promise<{ success: boolean; created: NotionItem[]; errors: string[] }> {
  const created: NotionItem[] = [];
  const errors: string[] = [];

  for (const item of items) {
    try {
      const page = await createNotionPage(item);
      created.push(page);
      // Small pause to avoid hitting Notion rate limits
      await new Promise((resolve) => setTimeout(resolve, 350));
    } catch (err: any) {
      console.error(`[NOTION] Gagal menyimpan "${item.title}":`, err?.message || err);
      errors.push(`${item.title}: ${err?.message || "Gagal disimpan"}`);
    }
  }

    return {
    success: created.length > 0,
    created,
    errors,
  };
}

export async function updateNotionPageStatus(
  pageId: string,
  newStatus: string
): Promise<any> {
  const apiKey = process.env.NOTION_API_KEY?.trim();
  if (!apiKey || pageId.startsWith("mock-") || pageId.startsWith("MN-")) {
    const mock = MOCK_ITEMS.find((m) => m.id === pageId);
    if (mock) {
      mock.status = newStatus;
      return mock;
    }
    return {
      id: pageId,
      status: newStatus,
    };
  }

  const cleanId = pageId.replace(/-/g, "");

  // Try updating with select property type first
  let res = await fetch(`https://api.notion.com/v1/pages/${cleanId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        Status: {
          select: {
            name: newStatus,
          },
        },
      },
    }),
  });

  if (!res.ok) {
    // If database uses Notion's native "status" type rather than "select"
    res = await fetch(`https://api.notion.com/v1/pages/${cleanId}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          Status: {
            status: {
              name: newStatus,
            },
          },
        },
      }),
    });
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as any;
    throw new Error(err.message || `Gagal update status di Notion: HTTP ${res.status}`);
  }

  const page = await res.json();
  return parseNotionPage(page);
}


