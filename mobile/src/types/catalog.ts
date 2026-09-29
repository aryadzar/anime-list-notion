export type MediaType = 'Manhwa' | 'Manga' | 'Anime' | 'Novel';
export type MediaStatus = 'Aktif' | 'Selesai' | 'Rencana' | 'On Hold';
export type TabName = 'vault' | 'gallery' | 'stats' | 'settings';

export interface CatalogItem {
  id: string;
  title: string;
  tipe: MediaType;
  status: MediaStatus;
  cover: string;
  chapterCurrent: number;
  chapterTotal: number;
  chapterProgressPercent: number;
  updatedAtText: string;
  publisher?: string;
  author?: string;
  tags: string[];
  sourceName: string;
  sourceLink: string;
  language: string;
  sourceType: string;
  notes?: string;
  isBookmarked?: boolean;
  dateAdded?: string;
  lastEdited?: string;
  createdTime?: string;
  lastEditedTime?: string;
  rawStatus?: string;
}

export interface UserStats {
  personaTitle: string;
  personaIcon: string;
  personaSubtitle: string;
  edition: string;
  level: string;
  panelsPerDay: number;
  precision: string;
  totalReadingHours: number;
  totalReadingDays: number;
  chaptersCompleted: number;
  averageSpeed: number; // chapter / 24 jam
  formatBreakdown: {
    manhwa: number; // percentage
    manga: number;
    anime: number;
    totalTitles: number;
  };
  topGenres: {
    rank: string;
    name: string;
    percentage: number;
  }[];
  longestStreak: {
    title: string;
    cover: string;
    hours: number;
    chaptersPerDay: number;
  };
}
