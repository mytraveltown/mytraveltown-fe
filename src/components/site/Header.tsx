import { useEffect, useRef, useState } from "react";
import { layoutText, commonText } from "@/lib/text";
import { Search, MapPin, Menu, X, LogOut, ChevronRight, Heart } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { profileUrl } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@/assets/mytraveltown-logo.png";
import { ROUTES } from "@/lib/routes";
import { PartnerCta } from "@/components/site/PartnerCta";
import { AddPackageButton } from "@/components/AddPackageButton";
import { AgentNotificationBell } from "@/components/AgentNotificationBell";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchTo, setSearchTo] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isLoggedIn, user, logout } = useAuth();
  const t = layoutText.header;

  const isAdmin = user?.role === "admin";
  const isAgent = isLoggedIn && user?.role === "agent";
  const isMobile = useIsMobile();
  // Visitors and regular users can apply; agents and admins are already partners.
  const showPartnerCta = !isLoggedIn || user?.role === "user";
  const profilePath = isAdmin ? "/admin" : "/profile";
  const isSearchExpanded = searchOpen || searchFocused || Boolean(searchTo.trim());

  useEffect(() => {
    const destination = searchParams.get("to") || searchParams.get("q") || "";
    setSearchTo(destination);
    if (destination) setSearchOpen(true);
  }, [searchParams]);

  const openSearch = () => {
    setSearchOpen(true);
    requestAnimationFrame(() => searchInputRef.current?.focus());
  };

  const closeSearch = () => {
    if (!searchFocused && !searchTo.trim()) setSearchOpen(false);
  };

  const submitHeaderSearch = () => {
    const params = new URLSearchParams();
    if (searchTo.trim()) params.set("to", searchTo.trim());
    navigate(`/search?${params.toString()}`);
    setMenuOpen(false);
    searchInputRef.current?.blur();
  };

  return (
    <header className="print:hidden sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img
              src={logo}
              alt={commonText.brandName}
              width={1163}
              height={210}
              className="h-9 sm:h-10 w-auto"
            />
          </Link>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            {!isAdmin && (
            <div
              className="hidden md:flex flex-1 justify-center max-w-md mx-2"
              onMouseEnter={openSearch}
              onMouseLeave={closeSearch}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitHeaderSearch();
                }}
                className={`flex items-center rounded-full border transition-all duration-300 ease-out overflow-hidden ${isSearchExpanded
                  ? "w-full gap-2 px-3 py-1.5 border-border bg-muted/40 focus-within:border-primary/40 focus-within:bg-background"
                  : "w-10 h-10 border-transparent hover:bg-muted justify-center"
                  }`}
                onClick={() => {
                  if (!isSearchExpanded) openSearch();
                }}
              >
                {isSearchExpanded ? (
                  <>
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <input
                      ref={searchInputRef}
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      onFocus={() => setSearchFocused(true)}
                      onBlur={() => {
                        setSearchFocused(false);
                        if (!searchTo.trim()) setSearchOpen(false);
                      }}
                      placeholder={t.searchPlaceholder}
                      className="flex-1 min-w-0 bg-transparent outline-none text-body-sm placeholder:text-muted-foreground/70"
                    />
                    <button
                      type="submit"
                      className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition shrink-0"
                      aria-label={t.searchAriaLabel}
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <span className="flex items-center justify-center" aria-label={t.searchAriaLabel}>
                    <Search className="h-5 w-5 text-foreground/80" aria-hidden />
                  </span>
                )}
              </form>
            </div>
            )}
            {isAgent && !isMobile && <AgentNotificationBell />}
            {isLoggedIn && user && !isAdmin && (
              <Link
                to="/profile?tab=wishlist"
                aria-label={t.wishlistAriaLabel}
                className="p-2 rounded-md hover:bg-muted transition"
              >
                <Heart className="h-5 w-5 text-foreground/80" />
              </Link>
            )}
            {isAgent ? (
              <AddPackageButton />
            ) : showPartnerCta ? (
              <PartnerCta />
            ) : null}

            {isLoggedIn && user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={profilePath}
                  className="flex items-center gap-2 h-9 pl-1 pr-1 lg:pr-4 rounded-full bg-primary/10 hover:bg-primary/15 border border-primary/20 transition"
                  aria-label={t.profileAriaLabel}
                >
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage src={profileUrl(user.profile)} alt={user.name} />
                    <AvatarFallback className="text-caption fw-semibold">
                      {user.name?.charAt(0).toUpperCase() || t.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-body-sm fw-medium max-w-[120px] truncate hidden lg:inline">
                    {user.name}
                  </span>
                </Link>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-body-sm fw-medium px-4 h-9 border border-transparent rounded-full bg-primary text-primary-foreground hover:opacity-90 transition flex items-center gap-1.5"
              >
                {t.loginSignUp}
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-1">
            {isAgent && isMobile && <AgentNotificationBell />}
            <button
              className="h-10 w-10 flex items-center justify-center rounded-md hover:bg-muted"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t.menuAriaLabel}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {!isAdmin && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitHeaderSearch();
              }}
              className="bg-card rounded-2xl border border-border p-2 flex items-center gap-2"
            >
              <MapPin className="h-4 w-4 text-primary shrink-0 ml-2" />
              <input
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="flex-1 min-w-0 bg-transparent outline-none text-body-sm px-2 py-2.5 placeholder:text-muted-foreground/70"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground fw-semibold flex items-center justify-center gap-2 shrink-0"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
            )}
            <nav className="flex flex-col text-body-sm fw-medium px-2 bg-card rounded-2xl border border-border py-1">
              <Link to="/" className="px-3 py-2.5 rounded-lg hover:bg-muted transition">{t.mobileNav.home}</Link>
              <Link to="/search" className="px-3 py-2.5 rounded-lg hover:bg-muted transition">{t.mobileNav.explore}</Link>
              <Link to={ROUTES.ABOUT} className="px-3 py-2.5 rounded-lg hover:bg-muted transition">{t.mobileNav.about}</Link>
              <Link to={ROUTES.CONTACT} className="px-3 py-2.5 rounded-lg hover:bg-muted transition">{t.mobileNav.contact}</Link>
              {isLoggedIn && !isAdmin && (
                <Link to="/profile?tab=wishlist" className="px-3 py-2.5 rounded-lg hover:bg-muted transition">{t.wishlist}</Link>
              )}
            </nav>

            {showPartnerCta && <PartnerCta variant="block" onClick={() => setMenuOpen(false)} />}

            {isLoggedIn && user ? (
              <div className="bg-card rounded-2xl border border-border p-3 space-y-2">
                <Link
                  to={profilePath}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition"
                >
                  <Avatar className="h-11 w-11 border-2 border-primary/30 shrink-0">
                    <AvatarImage src={profileUrl(user.profile)} alt={user.name} />
                    <AvatarFallback className="text-body-sm fw-semibold bg-primary/20">
                      {user.name?.charAt(0).toUpperCase() || t.avatarFallback}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="fw-semibold truncate">{user.name}</span>
                    <span className="text-caption text-muted-foreground truncate">{user.email}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-body-sm fw-medium text-muted-foreground hover:bg-muted hover:text-foreground transition"
                >
                  <LogOut className="h-4 w-4" />
                  {t.logout}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground fw-semibold hover:opacity-90 transition"
              >
                {t.loginSignUp}
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
