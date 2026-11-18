import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BellOff,
  CalendarCheck,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Loader2,
  MessageCircle,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StarRating } from "@/components/reviews/StarRating";
import { useAgentNotifications, type AgentNotificationFilter } from "@/hooks/useAgentNotifications";
import { packageReviewPath } from "@/lib/routes";
import { formatReviewDate } from "@/lib/reviews";
import { cn, formatINR, formatRelativeTime } from "@/lib/utils";
import { layoutText } from "@/lib/text";
import type {
  AgentNotificationInterface,
  BookingNotificationInterface,
  ReviewNotificationInterface,
} from "@/lib/interface";

const text = layoutText.header.notifications;
const MAX_BADGE = 9;
const AGENT_BOOKINGS_PATH = "/admin/bookings";
const FILTERS: AgentNotificationFilter[] = ["all", "booking", "review"];
const EMPTY_TEXT: Record<AgentNotificationFilter, string> = {
  all: text.empty,
  booking: text.emptyBookings,
  review: text.emptyReviews,
};

/** Colour and icon per notification kind, so the two read apart at a glance. */
const KIND_STYLES = {
  booking: { icon: CalendarCheck, tile: "bg-emerald-500/10 text-emerald-600", label: "text-emerald-700" },
  review: { icon: Star, tile: "bg-amber-500/10 text-amber-600", label: "text-amber-700" },
} satisfies Record<AgentNotificationInterface["type"], { icon: LucideIcon; tile: string; label: string }>;

interface ItemShellProps {
  item: AgentNotificationInterface;
  href: string;
  label: string;
  onNavigate: () => void;
  children: ReactNode;
}

/** Shared row: kind tile, label with time and unread dot, package name, then kind-specific details. */
function ItemShell({ item, href, label, onNavigate, children }: ItemShellProps) {
  const style = KIND_STYLES[item.type];
  const Icon = style.icon;
  const time = formatRelativeTime(item.created_at) ?? text.justNow;

  return (
    <li>
      <Link
        to={href}
        onClick={onNavigate}
        className={cn(
          "group relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 outline-none",
          item.is_unread && "bg-primary/[0.03]",
        )}
      >
        {item.is_unread && <span className="absolute left-0 top-3.5 bottom-3.5 w-0.5 rounded-r bg-primary" aria-hidden />}

        <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", style.tile)} aria-hidden>
          <Icon className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className={cn("text-caption fw-semibold", style.label)}>{label}</span>
            <span className="flex shrink-0 items-center gap-1.5 text-caption text-muted-foreground">
              <time dateTime={item.created_at} title={formatReviewDate(item.created_at)}>
                {time}
              </time>
              {item.is_unread && <span className="size-1.5 rounded-full bg-primary" aria-hidden />}
            </span>
          </div>

          <p className="mt-0.5 text-body-sm fw-semibold leading-snug line-clamp-2">{item.package_name}</p>
          {children}
        </div>
      </Link>
    </li>
  );
}

function BookingItem({ item, onNavigate }: { item: BookingNotificationInterface; onNavigate: () => void }) {
  // Date-only value: parse as local midnight so it never shifts a day across time zones.
  const travelDate = formatReviewDate(`${item.travel_date}T00:00:00`);

  return (
    <ItemShell item={item} href={AGENT_BOOKINGS_PATH} label={text.newBooking} onNavigate={onNavigate}>
      <p className="text-caption text-muted-foreground truncate">{text.bookedBy(item.actor_name)}</p>

      <div className="mt-2.5 flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
        <div className="flex min-w-0 items-center gap-3 text-caption text-muted-foreground">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <CalendarDays className="size-3.5" /> {travelDate}
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Users className="size-3.5" /> {text.guests(item.guests)}
          </span>
        </div>
        <span className="text-body-sm fw-semibold whitespace-nowrap">{formatINR(item.amount)}</span>
      </div>

      <span className="mt-2 inline-flex items-center gap-0.5 text-caption fw-medium text-primary">
        {text.viewBooking}
        <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </span>
    </ItemShell>
  );
}

function ReviewItem({ item, onNavigate }: { item: ReviewNotificationInterface; onNavigate: () => void }) {
  return (
    <ItemShell
      item={item}
      href={packageReviewPath({ id: item.package_id, slug: item.package_slug }, item.ref_id)}
      label={text.newReview}
      onNavigate={onNavigate}
    >
      <div className="mt-1 flex items-center gap-2 min-w-0">
        <StarRating value={item.rating} size="sm" />
        <span className="text-caption text-muted-foreground truncate">{text.reviewBy(item.actor_name)}</span>
      </div>

      {item.has_replied ? (
        <span className="mt-1.5 inline-flex items-center gap-1 text-caption fw-medium text-emerald-700">
          <CheckCheck className="size-3.5" /> {text.replied}
        </span>
      ) : (
        <span className="mt-1.5 inline-flex items-center gap-1 text-caption fw-medium text-primary">
          <MessageCircle className="size-3.5" /> {text.replyCta}
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </ItemShell>
  );
}

function PanelMessage({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="flex flex-col items-center px-8 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="mt-3 text-body-sm text-muted-foreground">{children}</div>
    </div>
  );
}

interface FilterTabsProps {
  value: AgentNotificationFilter;
  onChange: (value: AgentNotificationFilter) => void;
  counts: Record<AgentNotificationFilter, number>;
}

/** Segmented All / Bookings / Reviews switch; each tab shows how many new items it holds. */
function FilterTabs({ value, onChange, counts }: FilterTabsProps) {
  return (
    <div role="tablist" aria-label={text.tabsAriaLabel} className="grid grid-cols-3 gap-0.5 rounded-lg bg-muted p-0.5">
      {FILTERS.map((filter) => {
        const isActive = filter === value;
        const count = counts[filter];
        return (
          <button
            key={filter}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(filter)}
            className={cn(
              "inline-flex h-7 items-center justify-center gap-1.5 rounded-md px-3 text-caption fw-medium transition",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {text.tabs[filter]}
            {count > 0 && (
              <span
                className={cn(
                  "min-w-[16px] rounded-full px-1 text-[10px] leading-4 fw-semibold",
                  isActive ? "bg-primary text-primary-foreground" : "bg-foreground/10 text-foreground",
                )}
              >
                {count > MAX_BADGE ? `${MAX_BADGE}+` : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Header bell for travel partners: new bookings and reviews on their packages. */
export function AgentNotificationBell() {
  const [open, setOpen] = useState(false);
  const {
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
  } = useAgentNotifications({ enabled: true, paused: open });

  // Items stay marked "new" while the panel is open (switching tabs refetches), and are marked read on close.
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) refresh();
    else markAllRead();
  };
  const close = () => handleOpenChange(false);

  const renderBody = () => {
    if (isLoading && items.length === 0) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 animate-spin text-primary" />
        </div>
      );
    }
    if (error && items.length === 0) {
      return (
        <PanelMessage icon={BellOff}>
          <p className="text-red-600">{error}</p>
          <button type="button" onClick={refresh} className="mt-2 fw-medium text-primary hover:underline">
            {text.retry}
          </button>
        </PanelMessage>
      );
    }
    if (items.length === 0) {
      return <PanelMessage icon={Bell}>{EMPTY_TEXT[filter]}</PanelMessage>;
    }
    return (
      <ul className={cn("divide-y transition-opacity", isLoading && "opacity-60")}>
        {items.map((item) =>
          item.type === "review" ? (
            <ReviewItem key={item.id} item={item} onNavigate={close} />
          ) : (
            <BookingItem key={item.id} item={item} onNavigate={close} />
          ),
        )}
      </ul>
    );
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label={text.ariaLabel(unreadCount)}
        className={cn("relative p-2 rounded-md hover:bg-muted transition", open && "bg-muted")}
      >
        <Bell className="h-5 w-5 text-foreground/80" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] fw-semibold leading-[18px] text-center ring-2 ring-background">
            {unreadCount > MAX_BADGE ? `${MAX_BADGE}+` : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[480px] max-w-[calc(100vw-2rem)] p-0 rounded-2xl overflow-hidden shadow-xl"
      >
        <div className="space-y-2.5 px-4 pt-3.5 pb-3 border-b">
          <p className="text-body fw-semibold">{text.heading}</p>
          <FilterTabs
            value={filter}
            onChange={setFilter}
            counts={{ all: unreadCount, booking: unreadByType.booking, review: unreadByType.review }}
          />
        </div>

        <div className="max-h-[480px] overflow-y-auto overscroll-contain">{renderBody()}</div>

        {pagination?.hasMore && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full flex items-center justify-center gap-2 py-3 border-t text-body-sm fw-medium text-primary hover:bg-muted/60 transition disabled:opacity-60"
          >
            {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
            {text.viewMore}
            {!isLoadingMore && <ChevronDown className="size-4" />}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
