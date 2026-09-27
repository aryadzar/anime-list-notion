export interface TagItem {
  name: string;
  color?: string;
}

export interface NotionUser {
  id?: string;
  name: string;
  avatarUrl?: string;
}

export interface NotionItem {
  id: string;
  title: string;
  icon: string;
  cover: string | null;
  initials?: string;
  status: string;
  statusColor?: string;
  tipe: string;
  tipeColor?: string;
  tags: TagItem[];
  createdTime: string;
  lastEditedTime: string;
  createdBy: NotionUser;
  link: string | null;
  rawAltLink: string | null;
  notes: string;
  notionUrl?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  isMock: boolean;
  message?: string;
  data: T;
  total?: number;
}

export interface BackendStatus {
  isConfigured: boolean;
  hasKey: boolean;
  hasDatabaseId: boolean;
  message: string;
}

export interface MangaPreviewItem {
  id: string;
  title: string;
  originalQuery: string;
  cover: string | null;
  tipe: string;
  status: string;
  tags: TagItem[];
  link: string | null;
  notes: string;
  matched: boolean;
  selected: boolean;
}

export interface CreateItemPayload {
  title: string;
  tipe?: string;
  status?: string;
  tags?: string[];
  link?: string;
  notes?: string;
  cover?: string | null;
  icon?: string;
}

