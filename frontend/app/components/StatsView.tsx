import { useState, useMemo } from "react";
import type { NotionItem } from "../types/notion";

interface StatsViewProps {
  items: NotionItem[];
  onSelectItem?: (item: NotionItem) => void;
  onOpenNewModal?: () => void;
}

// Color palettes for formats and genres
const FORMAT_COLORS: Record<string, { bg: string; text: string; stroke: string; hex: string }> = {
  Anime: { bg: "bg-rose-500/20", text: "text-rose-400", stroke: "#f43f5e", hex: "#f43f5e" },
  Manhwa: { bg: "bg-blue-500/20", text: "text-blue-400", stroke: "#3b82f6", hex: "#3b82f6" },
  Manga: { bg: "bg-emerald-500/20", text: "text-emerald-400", stroke: "#10b981", hex: "#10b981" },
  Manhua: { bg: "bg-amber-500/20", text: "text-amber-400", stroke: "#f59e0b", hex: "#f59e0b" },
  Novel: { bg: "bg-purple-500/20", text: "text-purple-400", stroke: "#a855f7", hex: "#a855f7" },
  Lainnya: { bg: "bg-neutral-500/20", text: "text-neutral-400", stroke: "#737373", hex: "#737373" },
};

const GENRE_GRADIENTS = [
  "from-violet-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  Completed: { label: "Selesai (Completed)", color: "text-emerald-400", bg: "bg-emerald-500", dot: "bg-emerald-400" },
  "Reading/Watching": { label: "Sedang Aktif (Reading/Watching)", color: "text-blue-400", bg: "bg-blue-500", dot: "bg-blue-400" },
  "Plan to Read": { label: "Rencana (Plan to Read/Watch)", color: "text-amber-400", bg: "bg-amber-500", dot: "bg-amber-400" },
  "On Hold": { label: "Tertunda (On Hold)", color: "text-neutral-400", bg: "bg-neutral-600", dot: "bg-neutral-400" },
};

export function StatsView({ items, onSelectItem, onOpenNewModal }: StatsViewProps) {
  const [hoveredFormat, setHoveredFormat] = useState<string | null>(null);
  const [showAllGenres, setShowAllGenres] = useState(false);

  // ==========================================
  // 1. DATA AGGREGATION & CALCULATIONS
  // ==========================================
  const totalItems = items.length;

  // Format Distribution
  const formatStats = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      const t = item.tipe || "Lainnya";
      counts[t] = (counts[t] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return entries.map(([name, count]) => ({
      name,
      count,
      percentage: totalItems > 0 ? (count / totalItems) * 100 : 0,
      color: FORMAT_COLORS[name] || FORMAT_COLORS.Lainnya,
    }));
  }, [items, totalItems]);

  // Top Genres Distribution
  const genreStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let totalGenreMentions = 0;

    items.forEach((item) => {
      item.tags?.forEach((tag) => {
        if (tag.name && tag.name.trim()) {
          const g = tag.name.trim();
          counts[g] = (counts[g] || 0) + 1;
          totalGenreMentions++;
        }
      });
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return {
      topList: sorted.map(([name, count]) => ({
        name,
        count,
        percentage: totalGenreMentions > 0 ? (count / totalGenreMentions) * 100 : 0,
      })),
      totalMentions: totalGenreMentions,
    };
  }, [items]);

  // Status Breakdown
  const statusStats = useMemo(() => {
    const counts: Record<string, number> = {
      Completed: 0,
      "Reading/Watching": 0,
      "Plan to Read": 0,
      "On Hold": 0,
    };

    items.forEach((item) => {
      const s = item.status;
      if (counts[s] !== undefined) {
        counts[s]++;
      } else if (s.toLowerCase().includes("complete")) {
        counts["Completed"]++;
      } else if (s.toLowerCase().includes("read") || s.toLowerCase().includes("watch")) {
        counts["Reading/Watching"]++;
      } else if (s.toLowerCase().includes("plan")) {
        counts["Plan to Read"]++;
      } else {
        counts["On Hold"]++;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      percentage: totalItems > 0 ? (count / totalItems) * 100 : 0,
      config: STATUS_CONFIG[name] || STATUS_CONFIG["On Hold"],
    }));
  }, [items, totalItems]);

  // Total Hours & Chapter Consumption Estimation
  const consumptionStats = useMemo(() => {
    let totalChapters = 0;
    let totalEpisodes = 0;

    items.forEach((item) => {
      const notes = (item.notes || "") + " " + (item.title || "");
      const isAnime = item.tipe?.toLowerCase() === "anime";
      const isCompleted = item.status?.toLowerCase().includes("complete");

      // Check for explicit chapter count in notes
      const chMatch = notes.match(/(?:ch(?:apter)?\.?|bab)\s*(\d+)/i);
      const epMatch = notes.match(/(?:ep(?:isode)?\.?|eps?\.?)\s*(\d+)/i);

      if (isAnime) {
        if (epMatch) {
          totalEpisodes += parseInt(epMatch[1], 10);
        } else if (isCompleted) {
          totalEpisodes += 24; // typical standard season
        } else {
          totalEpisodes += 12; // in-progress default
        }
      } else {
        // Manga / Manhwa / Novel
        if (chMatch) {
          totalChapters += parseInt(chMatch[1], 10);
        } else if (isCompleted) {
          totalChapters += 110; // average completed series
        } else {
          totalChapters += 45; // average in-progress
        }
      }
    });

    // Time calculations
    // 1 episode Anime = ~24 minutes = 0.4 hours
    // 1 chapter Manga/Manhwa = ~6.5 minutes = ~0.108 hours
    const animeWatchHours = Math.round((totalEpisodes * 24) / 60);
    const readingHours = Math.round((totalChapters * 6.5) / 60);
    const totalHours = animeWatchHours + readingHours;
    const totalDaysEquivalent = (totalHours / 24).toFixed(1);

    return {
      totalChapters,
      totalEpisodes,
      animeWatchHours,
      readingHours,
      totalHours,
      totalDaysEquivalent,
    };
  }, [items]);

  // Dynamic Persona / Gamer-Style Badge
  const userPersona = useMemo(() => {
    if (totalItems === 0) return { title: "New Explorer", icon: "🌱", desc: "Mulai isi database katalog Anda!" };

    const topFormat = formatStats[0]?.name || "All-Rounder";
    const topGenre = genreStats.topList[0]?.name || "Generalist";

    if (topFormat === "Manhwa" && ["Action", "Fantasy", "Adventure"].includes(topGenre)) {
      return {
        title: "S-Rank Dungeon Conqueror",
        icon: "🗡️",
        desc: "Katalog Anda didominasi oleh Manhwa aksi fantasi dan leveling bertingkat tinggi.",
      };
    }
    if (topFormat === "Anime") {
      return {
        title: "Otaku Cinema Connoisseur",
        icon: "🎬",
        desc: "Anda memiliki kurasi tontonan serial dan film anime yang sangat kaya.",
      };
    }
    if (topFormat === "Manga" && ["Romance", "Drama", "Slice of Life"].includes(topGenre)) {
      return {
        title: "Hopeless Romantic Reader",
        icon: "🌸",
        desc: "Penikmat cerita menyentuh hati dengan perkembangan relasi karakter mendalam.",
      };
    }
    if (["Mystery", "Psychological", "Horror", "Thriller"].includes(topGenre)) {
      return {
        title: "The Mastermind Strategist",
        icon: "🧠",
        desc: "Tertarik pada misteri kompleks, plot twist tak terduga, dan duel kecerdasan.",
      };
    }

    return {
      title: "Omniscient Catalog Master",
      icon: "👑",
      desc: "Koleksi seimbang lintas genre dan format dengan variasi bacaan yang luas.",
    };
  }, [totalItems, formatStats, genreStats]);

  // Donut Chart SVG Path Calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-neutral-200">
      {/* ========================================================= */}
      {/* 1. HERO WRAPPED BANNER & KPI STATS                        */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1824] via-[#141419] to-[#121214] border border-[#2d283e] p-6 shadow-2xl">
        {/* Ambient Glow Accents */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/60 text-purple-300 text-xs font-mono mb-3">
              <span>{userPersona.icon}</span>
              <span className="font-semibold">{userPersona.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span>Catalog Wrapped &amp; Analytics</span>
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1.5 max-w-xl leading-relaxed">
              {userPersona.desc} Ringkasan analitik visual dari total <strong>{totalItems} entri</strong> pada database Notion Vault Anda.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            {onOpenNewModal && (
              <button
                onClick={onOpenNewModal}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-purple-900/30 transition cursor-pointer flex items-center gap-2"
              >
                <span>✨</span>
                <span>+ Entri Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {/* Card 1: Total Entri */}
          <div className="bg-[#18181f]/80 border border-[#2a2738] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <span>📚</span> Total Vault
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
                {totalItems}
              </span>
              <span className="text-xs text-neutral-500">Judul</span>
            </div>
            <div className="text-[10px] text-neutral-400 mt-2 flex items-center gap-2">
              <span>🎬 {formatStats.find((f) => f.name === "Anime")?.count || 0} Anime</span>
              <span>•</span>
              <span>📖 {totalItems - (formatStats.find((f) => f.name === "Anime")?.count || 0)} Komik/Novel</span>
            </div>
          </div>

          {/* Card 2: Completion Rate */}
          <div className="bg-[#18181f]/80 border border-[#2a2738] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <span>🎯</span> Tingkat Tamat (Completed)
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-400 tracking-tight font-mono">
                {totalItems > 0
                  ? Math.round(
                      ((statusStats.find((s) => s.name === "Completed")?.count || 0) / totalItems) * 100
                    )
                  : 0}
                %
              </span>
              <span className="text-xs text-neutral-500">
                ({statusStats.find((s) => s.name === "Completed")?.count || 0} judul)
              </span>
            </div>
            <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    totalItems > 0
                      ? ((statusStats.find((s) => s.name === "Completed")?.count || 0) / totalItems) * 100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          {/* Card 3: Total Reading Estimation */}
          <div className="bg-[#18181f]/80 border border-[#2a2738] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <span>📖</span> Estimasi Volume Terbaca
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-blue-400 tracking-tight font-mono">
                {consumptionStats.totalChapters.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-neutral-500">Panel/Vol</span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-2">
              ≈ {consumptionStats.readingHours} jam total waktu membaca
            </span>
          </div>

          {/* Card 4: Total Anime Hours */}
          <div className="bg-[#18181f]/80 border border-[#2a2738] rounded-xl p-4 flex flex-col justify-between">
            <span className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5">
              <span>⏱️</span> Total Waktu Dikonsumsi
            </span>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-purple-400 tracking-tight font-mono">
                {consumptionStats.totalHours.toLocaleString("id-ID")}
              </span>
              <span className="text-xs text-neutral-500">Jam</span>
            </div>
            <span className="text-[10px] text-neutral-400 mt-2">
              Setara {consumptionStats.totalDaysEquivalent} hari non-stop entertainment
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DUA KOLOM: FORMAT DISTRIBUTION & TOP 5 GENRES          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Format Distribution (Donut Chart & List) */}
        <div className="bg-[#161618] border border-[#26262a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <span>🍩</span> Distribusi Format Media
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Proporsi jenis konten (Anime, Manhwa, Manga, Novel) di database Anda
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500">{totalItems} Total</span>
          </div>

          {totalItems === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Belum ada data untuk ditampilkan.
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* SVG Donut Chart */}
              <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                  {/* Background Track Circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    fill="transparent"
                    stroke="#222226"
                    strokeWidth="20"
                  />
                  {/* Segment Arcs */}
                  {formatStats.map((item) => {
                    const segmentLength = (item.percentage / 100) * circumference;
                    const strokeDasharray = `${segmentLength} ${circumference - segmentLength}`;
                    const strokeDashoffset = -accumulatedAngle;
                    accumulatedAngle += segmentLength;

                    const isHovered = hoveredFormat === item.name;

                    return (
                      <circle
                        key={item.name}
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="transparent"
                        stroke={item.color.hex}
                        strokeWidth={isHovered ? "24" : "20"}
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="transition-all duration-300 cursor-pointer"
                        onMouseEnter={() => setHoveredFormat(item.name)}
                        onMouseLeave={() => setHoveredFormat(null)}
                      />
                    );
                  })}
                </svg>

                {/* Donut Center Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xs text-neutral-400 font-medium">
                    {hoveredFormat || "Koleksi"}
                  </span>
                  <span className="text-xl font-extrabold text-white font-mono">
                    {hoveredFormat
                      ? `${Math.round(formatStats.find((f) => f.name === hoveredFormat)?.percentage || 0)}%`
                      : totalItems}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    {hoveredFormat
                      ? `${formatStats.find((f) => f.name === hoveredFormat)?.count} judul`
                      : "Entri"}
                  </span>
                </div>
              </div>

              {/* Format Legend & Bar List */}
              <div className="w-full flex-1 space-y-2.5">
                {formatStats.map((item) => (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredFormat(item.name)}
                    onMouseLeave={() => setHoveredFormat(null)}
                    className={`p-2 rounded-xl transition cursor-pointer border ${
                      hoveredFormat === item.name
                        ? "bg-[#202026] border-[#3a3a44]"
                        : "bg-[#19191d] border-transparent hover:bg-[#1d1d22]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: item.color.hex }}
                        />
                        <span className="font-medium text-white">{item.name}</span>
                      </div>
                      <div className="flex items-center space-x-2 font-mono">
                        <span className="text-neutral-400 text-[11px]">{item.count} judul</span>
                        <span className={`font-semibold ${item.color.text}`}>
                          {item.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-neutral-800/80 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color.hex,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Top 5 Favorite Genres (Horizontal Progress Bars) */}
        <div className="bg-[#161618] border border-[#26262a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <span>🔥</span> Top Genre Terfavorit
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Preferensi genre paling dominan yang sering Anda baca atau tonton
              </p>
            </div>
            <span className="text-xs font-mono text-neutral-500">
              {genreStats.totalMentions} Tag Terdata
            </span>
          </div>

          {genreStats.topList.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-500">
              Belum ada genre/tag yang terdaftar di entri Notion Anda.
            </div>
          ) : (
            <div className="space-y-3.5 py-1">
              {(showAllGenres ? genreStats.topList : genreStats.topList.slice(0, 5)).map(
                (genre, idx) => {
                  const gradient = GENRE_GRADIENTS[idx % GENRE_GRADIENTS.length];
                  return (
                    <div key={genre.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-5 font-mono text-neutral-500 text-[11px]">
                            #{idx + 1}
                          </span>
                          <span className="font-medium text-white">{genre.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 font-mono text-[11px]">
                          <span className="text-neutral-400">{genre.count} entri</span>
                          <span className="text-purple-300 font-semibold">
                            {genre.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700`}
                          style={{ width: `${Math.min(100, genre.percentage * 2.2)}%` }}
                        />
                      </div>
                    </div>
                  );
                }
              )}

              {/* Show more genres toggle */}
              {genreStats.topList.length > 5 && (
                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowAllGenres(!showAllGenres)}
                    className="text-[11px] text-neutral-400 hover:text-white transition underline cursor-pointer"
                  >
                    {showAllGenres
                      ? "Tampilkan Hanya Top 5 ▴"
                      : `Lihat Semua (${genreStats.topList.length}) Genre ▾`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. STATUS BREAKDOWN & WATCH/READING DEPTH                 */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-[#161618] border border-[#26262a] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <span>📊</span> Status Breakdown (Progres Baca &amp; Nonton)
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Pembagian status membaca atau menonton dari seluruh entri di database
              </p>
            </div>
          </div>

          {/* GitHub-style Multi-Segment Bar */}
          <div className="w-full bg-neutral-800 rounded-xl h-3.5 overflow-hidden flex mb-5 shadow-inner">
            {statusStats.map((item) => (
              <div
                key={item.name}
                title={`${item.config.label}: ${item.count} (${item.percentage.toFixed(1)}%)`}
                className={`${item.config.bg} h-full transition-all duration-500`}
                style={{ width: `${item.percentage}%` }}
              />
            ))}
          </div>

          {/* 4 Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {statusStats.map((s) => (
              <div
                key={s.name}
                className="bg-[#19191d] border border-[#26262c] rounded-xl p-3 flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1.5 text-xs text-neutral-300">
                  <span className={`w-2 h-2 rounded-full ${s.config.dot}`} />
                  <span className="truncate font-medium">{s.name}</span>
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-xl font-bold text-white font-mono">{s.count}</span>
                  <span className={`text-xs font-semibold ${s.config.color}`}>
                    {s.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Entertainment Hours & Chapter Consumption Widget */}
        <div className="bg-[#161618] border border-[#26262a] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2 mb-1">
              <span>⚡</span> Konsumsi Waktu &amp; Media
            </h2>
            <p className="text-[11px] text-neutral-400 leading-relaxed mb-4">
              Estimasi total jam yang dihabiskan berdasarkan progres membaca komik dan episode anime yang telah diselesaikan.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a20] border border-[#292934]">
                <div className="flex items-center gap-2">
                  <span className="text-base">🎬</span>
                  <div>
                    <span className="text-xs font-medium text-white block">Anime Streamed</span>
                    <span className="text-[10px] text-neutral-400">
                      {consumptionStats.totalEpisodes} episode tercatat
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-rose-400 font-mono">
                  {consumptionStats.animeWatchHours} Jam
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1a20] border border-[#292934]">
                <div className="flex items-center gap-2">
                  <span className="text-base">📖</span>
                  <div>
                    <span className="text-xs font-medium text-white block">Komik &amp; Manga</span>
                    <span className="text-[10px] text-neutral-400">
                      {consumptionStats.totalChapters.toLocaleString("id-ID")} panel terbaca
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-blue-400 font-mono">
                  {consumptionStats.readingHours} Jam
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#26262c] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">Total Gabungan:</span>
            <span className="font-mono font-bold text-purple-400 text-sm">
              ≈ {consumptionStats.totalHours} Jam ({consumptionStats.totalDaysEquivalent} Hari)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. RECENT CATALOG ENTRIES SPOTLIGHT                       */}
      {/* ========================================================= */}
      {items.length > 0 && (
        <div className="bg-[#161618] border border-[#26262a] rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                <span>⭐</span> Entri Terbaru di Database
              </h2>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Koleksi yang baru saja ditambahkan atau diperbarui pada database Notion
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {items.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem && onSelectItem(item)}
                className="group relative bg-[#1c1c22] border border-[#2b2b32] hover:border-blue-500/50 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-950/20"
              >
                {/* Cover Image */}
                <div className="aspect-[3/4] w-full bg-[#121214] relative overflow-hidden">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-3xl opacity-30">
                      {item.icon || "📖"}
                    </div>
                  )}
                  {/* Status Pill on Cover */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-md text-[9px] font-medium text-white border border-white/10">
                    {item.tipe}
                  </div>
                </div>

                {/* Details */}
                <div className="p-2.5">
                  <h3 className="text-xs font-semibold text-white truncate group-hover:text-blue-400 transition">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span className="truncate">{item.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
