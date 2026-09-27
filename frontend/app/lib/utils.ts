export function formatDate(dateStr?: string): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function formatFullDate(dateStr?: string): string {
  if (!dateStr) return "Empty";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function getStatusBadgeClass(status?: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("reading") || s.includes("watching") || s.includes("baca")) {
    return "badge-status-reading";
  }
  if (s.includes("completed") || s.includes("selesai") || s.includes("tamat")) {
    return "badge-status-completed";
  }
  if (s.includes("hold") || s.includes("tunda")) {
    return "badge-status-onhold";
  }
  if (s.includes("plan") || s.includes("rencana")) {
    return "badge-status-plan";
  }
  if (s.includes("drop")) {
    return "badge-status-dropped";
  }
  return "bg-neutral-800 text-neutral-300";
}

export function getTipeBadgeClass(tipe?: string): string {
  const t = (tipe || "").toLowerCase();
  if (t.includes("manhwa")) {
    return "badge-tipe-manhwa";
  }
  if (t.includes("manga")) {
    return "badge-tipe-manga";
  }
  if (t.includes("anime")) {
    return "badge-tipe-anime";
  }
  return "bg-neutral-800 text-neutral-300";
}

export function getTagBadgeClass(tag?: string): string {
  const t = (tag || "").toLowerCase();
  if (t === "bl" || t.includes("boys love")) {
    return "badge-tag-bl";
  }
  if (t === "comedy" || t.includes("komedi")) {
    return "badge-tag-comedy";
  }
  if (t === "romance" || t.includes("romantis")) {
    return "badge-tag-romance";
  }
  return "bg-neutral-800 text-neutral-300";
}

export function formatUrlDisplay(url?: string | null): string {
  if (!url) return "Empty";
  try {
    const parsed = new URL(url);
    const domain = parsed.hostname.replace(/^www\./, "");
    const path = parsed.pathname;
    if (path.length > 20) {
      return `${domain}/...${path.slice(-15)}`;
    }
    return `${domain}${path}`;
  } catch {
    if (url.length > 30) {
      return url.slice(0, 25) + "...";
    }
    return url;
  }
}
