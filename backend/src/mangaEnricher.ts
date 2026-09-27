import type { TagItem, MangaPreviewItem } from "./types";

// Helper to clean and format title
export function cleanTitle(raw: string): string {
  let s = raw.trim();
  // Strip leading list numbering like "1. ", "1) ", "[1] ", "- ", "• ", "* "
  s = s.replace(/^\s*(?:\d+[\.\)]|\[\d+\]|[-•*])\s*/, "");
  // Remove markdown formatting like **bold** or *italic*
  s = s.replace(/[*_~`]/g, "");
  // Remove parenthesized or bracketed annotations like (Ch. 120), [Chapter 5], (Ongoing), [ENG]
  s = s.replace(/\[[^\]]*\]|\([^\)]*\)/g, " ");
  // Remove trailing patterns like "- Ongoing", "Ch. 120"
  s = s.replace(/\s*[-–—]\s*(?:ch(?:apter)?\.?\s*\d+|vol(?:ume)?\.?\s*\d+|ongoing|completed|tamat).*$/i, "");
  s = s.replace(/\b(?:ch(?:apter)?\.?\s*\d+|vol(?:ume)?\.?\s*\d+)\b.*$/i, "");
  // Remove trailing punctuation
  s = s.replace(/[\s\-_:,;.]+$/, "");
  // Normalize whitespace
  s = s.replace(/\s+/g, " ").trim();
  return s;
}

// Extract individual titles and optional URLs from raw text
export function extractTitlesFromText(text: string): { title: string; link?: string }[] {
  if (!text || !text.trim()) return [];

  const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const candidateLines: string[] = [];

  for (const line of rawLines) {
    // If line has multiple commas and doesn't look like a URL or single title with a comma
    if (line.includes(",") && !line.startsWith("http") && line.split(",").length > 2) {
      const parts = line.split(",").map((p) => p.trim()).filter(Boolean);
      candidateLines.push(...parts);
    } else {
      candidateLines.push(line);
    }
  }

  const results: { title: string; link?: string }[] = [];
  const seen = new Set<string>();

  for (const rawLine of candidateLines) {
    let line = rawLine;
    let originalUrl: string | undefined = undefined;

    // Check if line is a URL
    if (/^https?:\/\//i.test(line)) {
      originalUrl = line;
      try {
        const u = new URL(line);
        const segments = u.pathname.split("/").filter(Boolean);

        // 1. Detect MangaGo / Webtoon / Manga reading URLs / Anime streaming & database URLs:
        // E.g. https://www.mangago.me/read-manga/perfect_spiral/
        // E.g. https://myanimelist.net/anime/52991/Sousou_no_Frieren
        // E.g. https://anilist.co/anime/154587/Sousou-no-Frieren/
        const prefixIndex = segments.findIndex((s) =>
          ["read-manga", "manga", "series", "comic", "manhwa", "anime"].includes(s.toLowerCase())
        );

        if (prefixIndex !== -1 && segments[prefixIndex + 1] && !/^\d+$/.test(segments[prefixIndex + 1])) {
          line = segments[prefixIndex + 1].replace(/[-_]+/g, " ");
        } else if (prefixIndex !== -1 && segments[prefixIndex + 2] && /^\d+$/.test(segments[prefixIndex + 1])) {
          // URLs like /anime/52991/Sousou_no_Frieren
          line = segments[prefixIndex + 2].replace(/[-_]+/g, " ");
        } else if (segments.includes("home") && segments.includes("people")) {
          // If the user pasted a profile/bookmark list URL like /home/people/1319448/manga/1/
          line = "Daftar Bookmark MangaGo";
        } else {
          // General slug extraction
          const slug = segments.pop() || segments.pop() || "";
          if (slug && !/^(home|people|\d+|manga|read-manga|chapter|series|anime)$/i.test(slug)) {
            line = slug.replace(/[-_]+/g, " ");
          } else if (segments.length > 0) {
            line = segments[segments.length - 1].replace(/[-_]+/g, " ");
          }
        }
      } catch (_) {}
    }

    // Also check for Markdown link: [Title](https://...)
    const mdMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
    if (mdMatch) {
      line = mdMatch[1];
      originalUrl = mdMatch[2];
    }

    const cleaned = cleanTitle(line);

    if (cleaned.length >= 2) {
      const lower = cleaned.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        results.push({ title: cleaned, link: originalUrl });
      }
    }
  }

  return results;
}

// 1. Query AniList GraphQL API (Excellent for Anime, Korean Manhwa, Japanese Manga, Manhua, Novels)
async function searchAniList(title: string, typeHint?: string): Promise<Partial<MangaPreviewItem> | null> {
  const query = `
    query ($search: String, $type: MediaType) {
      Media (search: $search, type: $type) {
        id
        type
        format
        title {
          romaji
          english
          native
        }
        coverImage {
          extraLarge
          large
          medium
        }
        genres
        countryOfOrigin
        status
        description(asHtml: false)
        siteUrl
      }
    }
  `;

  let anilistType: "ANIME" | "MANGA" | undefined = undefined;
  if (typeHint === "Anime") {
    anilistType = "ANIME";
  } else if (typeHint === "Manga" || typeHint === "Manhwa" || typeHint === "Manhua") {
    anilistType = "MANGA";
  }

  const variables: Record<string, any> = { search: title };
  if (anilistType) {
    variables.type = anilistType;
  }

  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "AnimeNotionVault/2.0",
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) return null;
    const json = (await res.json()) as any;
    const media = json.data?.Media;
    if (!media) return null;

    // Detect type based on media.type, format, and country of origin
    let tipe = "Anime";
    if (media.type === "ANIME") {
      tipe = "Anime";
    } else if (media.format === "NOVEL") {
      tipe = "Novel";
    } else if (media.countryOfOrigin === "KR") {
      tipe = "Manhwa";
    } else if (media.countryOfOrigin === "JP") {
      tipe = "Manga";
    } else if (media.countryOfOrigin === "CN" || media.countryOfOrigin === "TW" || media.countryOfOrigin === "HK") {
      tipe = "Manhua";
    } else {
      tipe = "Manga";
    }

    // Status
    let status = "Reading/Watching";
    if (media.status === "FINISHED") status = "Completed";

    // Clean synopsis
    const rawDesc = media.description || "";
    const cleanDesc = rawDesc
      .replace(/<[^>]+>/g, " ")
      .replace(/\r?\n/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const notes = cleanDesc ? cleanDesc.slice(0, 280) + "..." : "";

    const mainTitle = media.title?.english || media.title?.romaji || media.title?.native || title;
    const coverUrl =
      media.coverImage?.extraLarge ||
      media.coverImage?.large ||
      media.coverImage?.medium ||
      null;

    const rawGenres = media.genres || [];
    const tags: TagItem[] = rawGenres.length > 0
      ? rawGenres.slice(0, 5).map((g: string) => ({ name: g }))
      : [{ name: tipe }];

    return {
      title: mainTitle,
      cover: coverUrl,
      tipe,
      status,
      tags,
      notes,
      link: media.siteUrl,
      matched: true,
    };
  } catch (err) {
    console.warn(`[ANILIST] Error fetching for "${title}":`, err);
    return null;
  }
}

// 2. Query MangaDex API
async function searchMangaDexOnly(title: string): Promise<Partial<MangaPreviewItem> | null> {
  try {
    const searchUrl = `https://api.mangadex.org/manga?title=${encodeURIComponent(
      title
    )}&includes[]=cover_art&limit=5&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica`;

    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "AnimeNotionVault/2.0 (Portfolio Project)",
      },
    });

    if (!res.ok) return null;

    const json = (await res.json()) as any;
    const mangas: any[] = json.data || [];
    if (mangas.length === 0) return null;

    // Find best match among candidates
    let bestManga = mangas[0];
    let bestScore = -1;
    const lowerQuery = title.toLowerCase();

    for (const m of mangas) {
      const enTitle = m.attributes?.title?.en?.toLowerCase() || "";
      const allAltTitles = (m.attributes?.altTitles || [])
        .map((at: any) => at.en || Object.values(at)[0] || "")
        .filter(Boolean)
        .map((s: string) => s.toLowerCase());

      let score = 0;
      if (enTitle === lowerQuery) score = 100;
      else if (allAltTitles.includes(lowerQuery)) score = 95;
      else if (enTitle.includes(lowerQuery) || lowerQuery.includes(enTitle)) score = 80;
      else if (allAltTitles.some((at) => at.includes(lowerQuery) || lowerQuery.includes(at))) score = 70;

      if (score > bestScore) {
        bestScore = score;
        bestManga = m;
      }
    }

    const coverRel = bestManga.relationships?.find((r: any) => r.type === "cover_art");
    const coverFile = coverRel?.attributes?.fileName;
    const coverUrl = coverFile
      ? `https://uploads.mangadex.org/covers/${bestManga.id}/${coverFile}.512.jpg`
      : null;

    const lang = bestManga.attributes?.originalLanguage;
    let tipe = "Manga";
    if (lang === "ja") tipe = "Manga";
    else if (lang === "ko") tipe = "Manhwa";
    else if (lang === "zh" || lang === "zh-hk") tipe = "Manhua";
    else if (lang === "en") tipe = "Manga";

    const enTitle =
      bestManga.attributes?.title?.en ||
      (bestManga.attributes?.altTitles || []).find((at: any) => at.en)?.en ||
      Object.values(bestManga.attributes?.title || {})[0] ||
      title;

    const tags: TagItem[] = (bestManga.attributes?.tags || [])
      .slice(0, 4)
      .map((t: any) => ({
        name: t.attributes?.name?.en,
      }))
      .filter((t: any) => Boolean(t.name));

    const mdStatus = bestManga.attributes?.status;
    let status = "Reading/Watching";
    if (mdStatus === "completed") {
      status = "Completed";
    }

    const rawSynopsis =
      bestManga.attributes?.description?.en ||
      Object.values(bestManga.attributes?.description || {})[0] ||
      "";
    const notes = rawSynopsis ? rawSynopsis.slice(0, 280).replace(/\r?\n/g, " ").trim() + "..." : "";

    return {
      title: typeof enTitle === "string" ? enTitle : title,
      cover: coverUrl,
      tipe,
      status,
      tags: tags.length > 0 ? tags : [{ name: tipe }],
      notes,
      link: `https://mangadex.org/title/${bestManga.id}`,
      matched: true,
    };
  } catch (err) {
    console.warn(`[MANGADEX] Error fetching for "${title}":`, err);
    return null;
  }
}

// Dual-Engine Enricher (AniList Primary + MangaDex Fallback)
export async function searchMangaDex(
  title: string,
  originalUrl?: string,
  typeHint?: string
): Promise<MangaPreviewItem> {
  const tempId = "ENR-" + Math.random().toString(36).slice(2, 9);

  // Auto-detect if URL or title implies Anime
  let effectiveTypeHint = typeHint;
  if (!effectiveTypeHint && originalUrl) {
    if (
      originalUrl.includes("/anime") ||
      originalUrl.includes("myanimelist.net") ||
      originalUrl.includes("crunchyroll") ||
      originalUrl.includes("bilibili")
    ) {
      effectiveTypeHint = "Anime";
    }
  }

  // 1. Try AniList First (Comprehensive metadata: handles Anime, Manga, Manhwa, Manhua, and true genres)
  console.log(`[ENRICHER] Mencari di AniList untuk "${title}" (hint: ${effectiveTypeHint || "auto"})...`);
  const anilistResult = await searchAniList(title, effectiveTypeHint);

  if (anilistResult && anilistResult.cover) {
    return {
      id: tempId,
      title: anilistResult.title || title,
      originalQuery: title,
      cover: anilistResult.cover,
      tipe: anilistResult.tipe || (effectiveTypeHint === "Anime" ? "Anime" : "Manhwa"),
      status: anilistResult.status || "Reading/Watching",
      tags: anilistResult.tags && anilistResult.tags.length > 0 ? anilistResult.tags : [{ name: anilistResult.tipe || "Anime" }],
      link: originalUrl || anilistResult.link || null,
      notes: anilistResult.notes || "",
      matched: true,
      selected: true,
    };
  }

  // 2. Fallback to MangaDex for Manga/Manhwa if not searching specifically for Anime
  if (effectiveTypeHint !== "Anime") {
    console.log(`[ENRICHER] Mencari di MangaDex untuk "${title}"...`);
    const mdResult = await searchMangaDexOnly(title);

    if (mdResult && mdResult.cover) {
      return {
        id: tempId,
        title: mdResult.title || title,
        originalQuery: title,
        cover: mdResult.cover,
        tipe: mdResult.tipe || "Manhwa",
        status: mdResult.status || "Reading/Watching",
        tags: mdResult.tags || [{ name: mdResult.tipe || "Manga" }],
        link: originalUrl || mdResult.link || null,
        notes: mdResult.notes || "",
        matched: true,
        selected: true,
      };
    }

    if (anilistResult) {
      return {
        id: tempId,
        title: anilistResult.title || title,
        originalQuery: title,
        cover: mdResult?.cover || null,
        tipe: anilistResult.tipe || "Manhwa",
        status: anilistResult.status || "Reading/Watching",
        tags: anilistResult.tags && anilistResult.tags.length > 0 ? anilistResult.tags : [{ name: anilistResult.tipe || "Manhwa" }],
        link: originalUrl || anilistResult.link || null,
        notes: anilistResult.notes || "",
        matched: true,
        selected: true,
      };
    }
  } else if (anilistResult) {
    return {
      id: tempId,
      title: anilistResult.title || title,
      originalQuery: title,
      cover: anilistResult.cover || null,
      tipe: anilistResult.tipe || "Anime",
      status: anilistResult.status || "Reading/Watching",
      tags: anilistResult.tags && anilistResult.tags.length > 0 ? anilistResult.tags : [{ name: "Anime" }],
      link: originalUrl || anilistResult.link || null,
      notes: anilistResult.notes || "",
      matched: true,
      selected: true,
    };
  }

  // 3. Clean Default Fallback
  const defaultTipe = effectiveTypeHint === "Anime" ? "Anime" : "Manhwa";
  const defaultTags = effectiveTypeHint === "Anime" ? [{ name: "Anime" }] : [{ name: defaultTipe }];

  return {
    id: tempId,
    title,
    originalQuery: title,
    cover: null,
    tipe: defaultTipe,
    status: "Reading/Watching",
    tags: defaultTags,
    link: originalUrl || null,
    notes: "",
    matched: false,
    selected: true,
  };
}

// Batch preview with controlled concurrency
export async function generateMangaPreview(
  rawText: string,
  typeHint?: string
): Promise<MangaPreviewItem[]> {
  const extracted = extractTitlesFromText(rawText);
  if (extracted.length === 0) return [];

  const itemsToProcess = extracted.slice(0, 25);
  const results: MangaPreviewItem[] = [];

  const chunkSize = 4;
  for (let i = 0; i < itemsToProcess.length; i += chunkSize) {
    const chunk = itemsToProcess.slice(i, i + chunkSize);
    const chunkPromises = chunk.map((item) => searchMangaDex(item.title, item.link, typeHint));
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    if (i + chunkSize < itemsToProcess.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }

  return results;
}
