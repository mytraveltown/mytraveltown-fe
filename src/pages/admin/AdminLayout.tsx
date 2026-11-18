import { useMemo, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
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

type MenuItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  roles: string[];
};

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "agent"],
  },
  {
    title: "Bookings",
    url: "/admin/bookings",
    icon: BookOpen,
    roles: ["admin", "agent"],
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

  const visibleMenu = useMemo(
    () => menuItems.filter((item) => user?.role && item.roles.includes(user.role)),
    [user?.role]
  );

  const SidebarBody = () => (
    <>
      <nav className="flex-1 space-y-1">
        {visibleMenu.map(({ title, url, icon: Icon }) => (
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
            {title}
          </NavLink>
        ))}
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
