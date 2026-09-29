import type { CatalogItem } from '../types/catalog';

export type SortOption =
  | 'default'
  | 'title-asc'
  | 'title-desc'
  | 'date-newest'
  | 'date-edited';

export const SORT_LABELS: Record<SortOption, string> = {
  default: 'Default Notion',
  'title-asc': 'Judul (A - Z)',
  'title-desc': 'Judul (Z - A)',
  'date-newest': 'Terbaru Ditambahkan',
  'date-edited': 'Terakhir Diedit',
};

export const TYPE_OPTIONS = [
  { id: 'all', label: 'Semua Tipe' },
  { id: 'Manhwa', label: 'Manhwa' },
  { id: 'Manga', label: 'Manga' },
  { id: 'Anime', label: 'Anime' },
  { id: 'Novel', label: 'Novel' },
];

export const STATUS_OPTIONS = [
  { id: 'all', label: 'Semua Status' },
  { id: 'Reading/Watching', label: 'Reading/Watching' },
  { id: 'Completed', label: 'Completed' },
  { id: 'On Hold', label: 'On Hold' },
  { id: 'Plan to Read', label: 'Plan to Read' },
];

/**
 * Filter and sort catalog items exactly matching the web frontend behavior
 */
export function filterAndSortCatalogItems(
  items: CatalogItem[],
  searchQuery: string,
  selectedType: string,
  selectedStatus: string,
  sortBy: SortOption
): CatalogItem[] {
  let result = items.filter((item) => {
    // 1. Search Query filter (matches title, notes, tags, link)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchNotes = item.notes ? item.notes.toLowerCase().includes(q) : false;
      const matchTags = Array.isArray(item.tags)
        ? item.tags.some((t) => t.toLowerCase().includes(q))
        : false;
      const matchLink = item.sourceLink ? item.sourceLink.toLowerCase().includes(q) : false;

      if (!matchTitle && !matchNotes && !matchTags && !matchLink) {
        return false;
      }
    }

    // 2. Type Filter (Manhwa, Manga, Anime, Novel)
    if (selectedType !== 'all' && selectedType !== 'SEMUA') {
      if (item.tipe.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }
    }

    // 3. Status Filter (Reading/Watching, Completed, On Hold, Plan to Read)
    if (selectedStatus !== 'all' && selectedStatus !== 'SEMUA') {
      const s = selectedStatus.toLowerCase();
      const itemStatus = (item.status || '').toLowerCase();
      const rawStatus = (item.rawStatus || '').toLowerCase();

      if (s === 'reading' || s === 'reading/watching' || s === 'aktif') {
        if (itemStatus !== 'aktif' && !rawStatus.includes('reading')) return false;
      } else if (s === 'completed' || s === 'selesai') {
        if (itemStatus !== 'selesai' && !rawStatus.includes('completed')) return false;
      } else if (s === 'plan' || s === 'plan to read' || s === 'rencana') {
        if (itemStatus !== 'rencana' && !rawStatus.includes('plan')) return false;
      } else if (s === 'on hold') {
        if (itemStatus !== 'on hold' && !rawStatus.includes('hold')) return false;
      } else {
        if (itemStatus !== s && rawStatus !== s) return false;
      }
    }

    return true;
  });

  // 4. Sorting
  if (sortBy === 'title-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'title-desc') {
    result = [...result].sort((a, b) => b.title.localeCompare(a.title));
  } else if (sortBy === 'date-newest') {
    result = [...result].sort((a, b) => {
      const timeA = a.createdTime ? new Date(a.createdTime).getTime() : 0;
      const timeB = b.createdTime ? new Date(b.createdTime).getTime() : 0;
      return timeB - timeA;
    });
  } else if (sortBy === 'date-edited') {
    result = [...result].sort((a, b) => {
      const timeA = a.lastEditedTime ? new Date(a.lastEditedTime).getTime() : 0;
      const timeB = b.lastEditedTime ? new Date(b.lastEditedTime).getTime() : 0;
      return timeB - timeA;
    });
  }

  return result;
}
