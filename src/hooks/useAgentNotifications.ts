import { useCallback, useEffect, useState } from "react";
import { GET } from "@/lib/request";
import { selectTotalUnread, useAgentUnreadStore } from "@/hooks/useAgentUnreadStore";
import { API } from "@/lib/endpoints";
import { getErrorMessage } from "@/lib/reviews";
import { layoutText } from "@/lib/text";
import type {
  AgentNotificationInterface,
  AgentNotificationsResponse,
  AgentNotificationType,
  ApiResponse,
  PaginationMeta,
} from "@/lib/interface";

/** Items shown when the panel opens. */
const PREVIEW_SIZE = 5;
/** "View more" loads up to this many at a time (the API maximum). */
const EXPANDED_PAGE_SIZE = 50;
/** How often the unread badge refreshes while the tab is visible. */
const POLL_INTERVAL_MS = 60_000;

/** "all" or one notification type. */
export type AgentNotificationFilter = "all" | AgentNotificationType;

const fetchPage = async (page: number, limit: number, filter: AgentNotificationFilter) => {
  const params: Record<string, unknown> = { page, limit };
  if (filter !== "all") params.type = filter;
  const res = await GET<ApiResponse<AgentNotificationsResponse>>(API.AGENT.NOTIFICATIONS, params);
  return res.data;
};

interface Options {
  /** Only travel partners have notifications. */
  enabled: boolean;
  /** Stops polling (e.g. while the list is open) so a refresh does not reshuffle what the partner is reading. */
  paused?: boolean;
}

/**
 * New reviews and paid bookings on the travel partner's packages, for the header bell.
 * Polls while the tab is visible and refetches when the filter changes. Items stay marked
 * "new" while the panel is open; call `markAllRead` when it closes.
 */
export function useAgentNotifications({ enabled, paused = false }: Options) {
  const [filter, setFilter] = useState<AgentNotificationFilter>("all");
  const [items, setItems] = useState<AgentNotificationInterface[]>([]);
  const unreadByType = useAgentUnreadStore((state) => state.unreadByType);
  const unreadCount = useAgentUnreadStore(selectTotalUnread);
  const setUnreadByType = useAgentUnreadStore((state) => state.setUnreadByType);
  const markRead = useAgentUnreadStore((state) => state.markRead);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await fetchPage(1, PREVIEW_SIZE, filter);
      setItems(data.items);
      setUnreadByType(data.unread_by_type);
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(getErrorMessage(err, layoutText.header.notifications.loadFailed));
    } finally {
      setIsLoading(false);
    }
  }, [filter, setUnreadByType]);

  /**
   * First click swaps the 5-item preview for everything (up to 50) in one request;
   * later clicks, only needed beyond 50, append the next 50.
   */
  const loadMore = useCallback(async () => {
    if (!pagination?.hasMore) return;
    setIsLoadingMore(true);
    try {
      const isPreview = pagination.limit === PREVIEW_SIZE;
      const page = isPreview ? 1 : pagination.page + 1;
      const data = await fetchPage(page, EXPANDED_PAGE_SIZE, filter);
      setItems((current) => (isPreview ? data.items : [...current, ...data.items]));
      setPagination(data.pagination);
    } catch (err: unknown) {
      setError(getErrorMessage(err, layoutText.header.notifications.loadFailed));
    } finally {
      setIsLoadingMore(false);
    }
  }, [pagination, filter]);

  const markAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    try {
      await markRead();
      setItems((current) => current.map((item) => ({ ...item, is_unread: false })));
    } catch (err: unknown) {
      // The badge stays until the next successful attempt; the list itself is unaffected.
      console.warn("Agent notifications: mark read failed", err);
    }
  }, [unreadCount, markRead]);

  // Initial load, and a fresh first page whenever the filter changes.
  useEffect(() => {
    if (enabled) refresh();
  }, [enabled, refresh]);

  useEffect(() => {
    if (!enabled || paused) return;
    const poll = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = window.setInterval(poll, POLL_INTERVAL_MS);
    document.addEventListener("visibilitychange", poll);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", poll);
    };
  }, [enabled, paused, refresh]);

  return {
    filter,
    setFilter,
    items,
    unreadCount,
    unreadByType,
    pagination,
    isLoading,
    isLoadingMore,
    error,
    refresh,
    loadMore,
    markAllRead,
  };
}
