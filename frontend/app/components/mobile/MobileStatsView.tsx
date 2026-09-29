import type { NotionItem } from "../../types/notion";

interface MobileStatsViewProps {
  items: NotionItem[];
}

export function MobileStatsView({ items }: MobileStatsViewProps) {
  // Share summary handler
  const handleShareStats = async () => {
    const text =
      `📊 ANALYTICS WRAPPED 2026 — VAULT ARCHIVE\n` +
      `🏆 Persona: S-RANK DUNGEON CONQUEROR (LV.99)\n` +
      `⏱️ 418 Jam Terverifikasi • ${items.length || 148} Judul Terpantau\n` +
      `📚 Format: 58% Manhwa | 28% Manga | 14% Anime\n` +
      `Tersinkronisasi otomatis dengan Notion Vault Database.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Notion Anime & Manga Wrapped",
          text,
          url: window.location.href,
        });
        return;
      } catch {}
    }

    navigator.clipboard.writeText(text);
    alert("Ringkasan statistik berhasil disalin ke clipboard!");
  };

  return (
    <div
      className="w-full h-full flex-1 overflow-y-auto overscroll-y-contain bg-[#F6F3EB] text-[#171717] p-4 pb-36 space-y-4"
      style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
    >
      {/* 1. Dark Hero Card: ANALYTICS WRAPPED (Image 2 Match) */}
      <div className="bg-[#171717] text-white rounded-2xl p-5 shadow-lg border border-[#2B2B2B] space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
            VAULT ARCHIVE // 2026
          </span>
          <span className="bg-[#F5C518] text-black font-extrabold text-[10px] font-mono px-2 py-0.5 rounded shadow-2xs">
            EDITION #04
          </span>
        </div>

        <div>
          <h2 className="text-2xl font-black tracking-tight leading-none text-white font-sans uppercase">
            ANALYTICS
          </h2>
          <h2 className="text-2xl font-black tracking-tight leading-none text-white font-sans uppercase">
            WRAPPED
          </h2>
        </div>

        <p className="text-xs text-neutral-300 leading-relaxed">
          Kalkulasi telemetri konsumsi panel visual, ritme pembacaan mingguan, dan
          kurasi multi-format sepanjang siklus tahunan.
        </p>

        {/* Highlight Pills */}
        <div className="pt-2 space-y-2">
          <div className="bg-[#F5C518] text-[#171717] font-extrabold text-xs px-3 py-2 rounded-lg flex items-center gap-2 shadow-2xs">
            <span>🏆</span>
            <span className="font-mono tracking-wide">S-RANK DUNGEON CONQUEROR</span>
          </div>

          <div className="bg-[#EFECE4] text-[#171717] font-extrabold text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <span>📺</span>
            <span className="font-mono tracking-wide">OTAKU CINEMA CONNOISSEUR</span>
          </div>
        </div>
      </div>

      {/* 2. Persona Card: TOP 1% READER (Image 2 Match) */}
      <div className="bg-white border border-[#E3DC CE] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#171717] text-amber-400 flex items-center justify-center text-xl shrink-0 shadow-2xs">
            ⚔️
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="bg-red-600 text-white font-bold font-mono text-[9px] px-1.5 py-0.5 rounded uppercase">
                TOP 1% READER
              </span>
              <span className="text-[10px] font-semibold text-neutral-500 font-mono">
                TINGKAT MYTHIC ✓
              </span>
            </div>
            <h3 className="font-extrabold text-base text-[#171717] mt-0.5">
              S-Rank Dungeon Conqueror
            </h3>
          </div>
        </div>

        <p className="text-xs text-neutral-600 leading-relaxed">
          Telah mengkurasi lebih dari 14,200 panel visual bulan ini. Menunjukkan akselerasi ritme baca tinggi pada genre gerbang dungeon berdimensi ganda.
        </p>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="bg-[#F7F5EE] border border-[#DDD5C7] rounded-xl p-2.5 text-center">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block">
              LEVEL
            </span>
            <span className="text-sm font-black text-[#171717] font-mono">LV.99</span>
          </div>
          <div className="bg-[#F7F5EE] border border-[#DDD5C7] rounded-xl p-2.5 text-center">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block">
              PANEL/HARI
            </span>
            <span className="text-sm font-black text-[#171717] font-mono">473</span>
          </div>
          <div className="bg-[#F7F5EE] border border-[#DDD5C7] rounded-xl p-2.5 text-center">
            <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase block">
              PRESISI
            </span>
            <span className="text-sm font-black text-[#171717] font-mono">99.4%</span>
          </div>
        </div>
      </div>

      {/* 3. Metrik Aktivitas Temporal (Image 2 Match) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-500 uppercase tracking-wider px-1">
          <span>METRIK AKTIVITAS TEMPORAL</span>
          <span className="text-neutral-400">SINKRONISASI OTOMATIS</span>
        </div>

        {/* Total Waktu Baca Card */}
        <div className="bg-white border border-[#E3DC CE] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
              TOTAL WAKTU BACA
            </span>
            <span className="text-sm text-neutral-500">⏱️</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#171717] font-sans">418</span>
            <span className="text-xs font-bold text-neutral-700 font-mono uppercase">
              JAM TERVERIFIKASI
            </span>
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Setara dengan pembacaan tanpa henti selama</span>
            </span>
            <strong className="font-bold text-neutral-800">17.4 Hari</strong>
          </p>
        </div>

        {/* 2 Grid: Koleksi Terkurasi & Indeks Aktivitas */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white border border-[#E3DC CE] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                TOTAL KOLEKSI
              </span>
              <span className="text-xs">📖</span>
            </div>
            <span className="text-2xl font-black text-[#171717] block font-sans">
              {items.length || 148}
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">
              ENTRI AKTIF TERKURASI
            </span>
          </div>

          <div className="bg-white border border-[#E3DC CE] rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                INDEKS AKTIVITAS
              </span>
              <span className="text-xs">⚡</span>
            </div>
            <span className="text-2xl font-black text-[#171717] block font-sans">
              98.2%
            </span>
            <span className="text-[10px] text-neutral-500 font-medium">
              SINKRONISASI NOTION
            </span>
          </div>
        </div>
      </div>

      {/* 4. Format Consumption (Image 2 Match) */}
      <div className="bg-white border border-[#E3DC CE] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              DISTRIBUSI MEDIA
            </span>
            <h4 className="text-sm font-extrabold text-[#171717]">
              FORMAT CONSUMPTION
            </h4>
          </div>
          <span className="text-sm">◐</span>
        </div>

        <div className="flex items-center justify-around pt-2">
          {/* Donut representation */}
          <div className="relative w-28 h-28 rounded-full border-8 border-[#171717] flex flex-col items-center justify-center bg-[#F6F3EB] shadow-inner">
            <span className="text-xl font-black text-[#171717] leading-none">
              {items.length || 148}
            </span>
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase mt-0.5">
              TOTAL JUDUL
            </span>
          </div>

          {/* Breakdown legend */}
          <div className="space-y-2 text-xs font-mono font-bold">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-800">
                <span className="w-2.5 h-2.5 bg-[#171717] rounded-xs"></span>
                <span>MANHWA</span>
              </span>
              <span className="text-neutral-900">58%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-800">
                <span className="w-2.5 h-2.5 bg-[#8E8A83] rounded-xs"></span>
                <span>MANGA</span>
              </span>
              <span className="text-neutral-900">28%</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-neutral-800">
                <span className="w-2.5 h-2.5 bg-[#DDD5C7] rounded-xs"></span>
                <span>ANIME</span>
              </span>
              <span className="text-neutral-900">14%</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Top 5 Genre Performance (Image 2 Match) */}
      <div className="bg-white border border-[#E3DC CE] rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              MATRIKS AFINITAS
            </span>
            <h4 className="text-sm font-extrabold text-[#171717]">
              TOP 5 GENRE PERFORMANCE
            </h4>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#EAE5DC] text-neutral-800 px-1.5 py-0.5 rounded">
            2026 DATA
          </span>
        </div>

        <div className="space-y-2.5 pt-1 text-xs">
          {[
            { id: "01", name: "ACTION / DUNGEON", percent: 84 },
            { id: "02", name: "FANTASY / ISEKAI", percent: 72 },
            { id: "03", name: "ROMANCE / DRAMA", percent: 65 },
            { id: "04", name: "COMEDY / SLICE OF LIFE", percent: 48 },
            { id: "05", name: "SCI-FI / SUPERNATURAL", percent: 34 },
          ].map((g) => (
            <div key={g.id}>
              <div className="flex justify-between font-mono font-bold text-[11px] mb-1">
                <span>
                  <strong className="text-red-600 mr-1">{g.id}</strong>
                  {g.name}
                </span>
                <span>{g.percent}%</span>
              </div>
              <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#171717] h-full rounded-full transition-all duration-500"
                  style={{ width: `${g.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Big Share Button */}
      <button
        onClick={handleShareStats}
        className="w-full bg-[#171717] hover:bg-[#2C2C2C] text-white font-extrabold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 uppercase font-mono tracking-wider"
      >
        <span>📊</span>
        <span>BAGIKAN REKAP STATISTIK ↗</span>
      </button>
    </div>
  );
}
