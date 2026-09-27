import { useQuery } from "@tanstack/react-query";
import { fetchNotionItems, fetchBackendStatus } from "./api";
import type { ApiResponse, NotionItem, BackendStatus } from "../types/notion";

export const NOTION_ITEMS_QUERY_KEY = ["notion-items"] as const;
export const BACKEND_STATUS_QUERY_KEY = ["backend-status"] as const;

/**
 * useQuery hook to fetch Notion database items via backend API with pagination support
 */
export function useNotionItems(options?: { enabled?: boolean }) {
  return useQuery<ApiResponse<NotionItem[]>, Error>({
    queryKey: NOTION_ITEMS_QUERY_KEY,
    queryFn: fetchNotionItems,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: options?.enabled ?? true,
  });
}

/**
 * useQuery hook to check Notion API configuration status
 */
export function useBackendStatus() {
  return useQuery<BackendStatus, Error>({
    queryKey: BACKEND_STATUS_QUERY_KEY,
    queryFn: fetchBackendStatus,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
}
