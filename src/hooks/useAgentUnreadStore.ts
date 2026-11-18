import { create } from "zustand";
import { POST } from "@/lib/request";
import { API } from "@/lib/endpoints";
import type { AgentNotificationType } from "@/lib/interface";

type UnreadByType = Record<AgentNotificationType, number>;

const NO_UNREAD: UnreadByType = { booking: 0, review: 0 };

interface AgentUnreadState {
  /** New items per type since the partner last saw them; fed by the header bell's polling. */
  unreadByType: UnreadByType;
  setUnreadByType: (unread: UnreadByType) => void;
  /** Marks one type (or every type) as seen on the server, then clears its count. */
  markRead: (type?: AgentNotificationType) => Promise<void>;
}

/** Unread counts shared by the header bell and the dashboard sidebar, so they never disagree. */
export const useAgentUnreadStore = create<AgentUnreadState>((set) => ({
  unreadByType: NO_UNREAD,
  setUnreadByType: (unreadByType) => set({ unreadByType }),
  markRead: async (type) => {
    await POST(type ? `${API.AGENT.NOTIFICATIONS_READ}?type=${type}` : API.AGENT.NOTIFICATIONS_READ);
    set((state) => ({ unreadByType: type ? { ...state.unreadByType, [type]: 0 } : NO_UNREAD }));
  },
}));

export const selectTotalUnread = (state: AgentUnreadState) =>
  state.unreadByType.booking + state.unreadByType.review;
