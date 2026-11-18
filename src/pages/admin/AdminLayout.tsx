import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  MessageCircleQuestion,
  Inbox,
  Users,
  UserCheck,
  Boxes,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { AddPackageButton } from "@/components/AddPackageButton";
import { useAgentUnreadStore } from "@/hooks/useAgentUnreadStore";
import type { AgentNotificationType } from "@/lib/interface";

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: string[];
  /** Agents see a count of new items of this type next to the link. */
  unreadType?: AgentNotificationType;
};

const AGENT_BOOKINGS_PATH = "/admin/bookings";
const MAX_BADGE = 9;

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "agent"],
  },
  {
    title: "Bookings",
    url: AGENT_BOOKINGS_PATH,
    icon: BookOpen,
    roles: ["admin", "agent"],
    unreadType: "booking",
  },
  {
    title: "Contacts",
    url: "/admin/contacts",
    icon: Inbox,
    roles: ["admin"],
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    title: "Agents",
    url: "/admin/agents",
    icon: UserCheck,
    roles: ["admin"],
  },
  {
    title: "My Packages",
    url: "/admin/mypackages",
    icon: Package,
    roles: ["agent"],
  },
  {
    title: "All Packages",
    url: "/admin/packages",
    icon: Boxes,
    roles: ["admin"],
  },
  {
    title: "FAQs",
    url: "/admin/faqs",
    icon: MessageCircleQuestion,
    roles: ["admin"],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    roles: ["admin", "agent"],
  },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { pathname } = useLocation();
  const isAgent = user?.role === "agent";
  const unreadByType = useAgentUnreadStore((state) => state.unreadByType);
  const markRead = useAgentUnreadStore((state) => state.markRead);
  const unreadBookings = unreadByType.booking;

  // Opening the Bookings page counts as seeing the new bookings.
  useEffect(() => {
    if (!isAgent || unreadBookings === 0 || !pathname.startsWith(AGENT_BOOKINGS_PATH)) return;
    markRead("booking").catch((err: unknown) => console.warn("Marking bookings seen failed", err));
  }, [isAgent, unreadBookings, pathname, markRead]);

  const visibleMenu = useMemo(
    () => menuItems.filter((item) => user?.role && item.roles.includes(user.role)),
    [user?.role]
  );

  const SidebarBody = () => (
    <>
      <nav className="flex-1 space-y-1">
        {visibleMenu.map(({ title, url, icon: Icon, unreadType }) => {
          const unread = isAgent && unreadType ? unreadByType[unreadType] : 0;
          return (
          <NavLink
            key={url}
            to={url}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm fw-medium transition ${isActive ? "bg-blue-50 text-blue-600" : "text-neutral-600 hover:bg-neutral-50"
 }`
            }
          >
            <Icon size={18} />
            <span className="flex-1">{title}</span>
            {unread > 0 && (
              <span
                className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-600 text-white text-[11px] fw-semibold leading-5 text-center"
                aria-label={`${unread} new`}
              >
                {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
              </span>
            )}
          </NavLink>
          );
        })}
      </nav>

      {user?.role === "agent" && (
        <AddPackageButton className="mt-4 w-full" onClick={() => setOpen(false)} />
      )}

      <div className="mt-4 space-y-1">
        <Link
          to="/" onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-body-sm text-neutral-600 hover:bg-neutral-50"
        >
          <LogOut size={18} /> Logout
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      <aside className="hidden lg:flex w-64 bg-white border-r border-neutral-200 flex-col p-5 shrink-0 sticky top-16 self-start h-[calc(100vh-4rem)]">
        <SidebarBody />
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-white p-5 flex flex-col">
            <button type="button" onClick={() => setOpen(false)} className="absolute top-3 right-3 p-2">
              <X size={18} />
            </button>
            <div className="mb-6 pr-8">
              <h1 className="text-blue-600 fw-bold text-body-lg">Admin Panel</h1>
            </div>
            <SidebarBody />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="lg:hidden p-3 border-b border-neutral-200 bg-white flex items-center gap-3 sticky top-16 z-20">
          <button type="button" onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-neutral-100">
            <Menu size={20} />
          </button>
          <span className="fw-semibold text-neutral-700">Admin Panel</span>
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
