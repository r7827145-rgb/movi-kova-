import { Link, useLocation } from "wouter";
import { Menu, Search, LogIn, LogOut, User, MapPin, ChevronDown, Sun, Moon } from "lucide-react";
import MobileMenu from "./MobileMenu";
import { useState } from "react";
import { useUser, useClerk, Show } from "@clerk/react";
import { clsx } from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className="relative w-14 h-7 rounded-full flex items-center px-0.5 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f84464] flex-shrink-0"
      style={{
        background: isDark
          ? "linear-gradient(135deg, #1a1a2e, #16213e)"
          : "linear-gradient(135deg, #c8daff, #e8f0ff)",
        border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(13,30,80,0.15)",
        boxShadow: isDark
          ? "inset 0 1px 0 rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.4)"
          : "inset 0 1px 0 rgba(255,255,255,0.8), 0 2px 8px rgba(13,30,80,0.12)",
      }}
      data-testid="button-theme-toggle"
    >
      {/* Track icons */}
      <Moon
        className="absolute left-1.5 w-3.5 h-3.5 text-[#42a5f5] transition-opacity duration-200"
        style={{ opacity: isDark ? 0.9 : 0.3 }}
      />
      <Sun
        className="absolute right-1.5 w-3.5 h-3.5 text-amber-400 transition-opacity duration-200"
        style={{ opacity: isDark ? 0.3 : 0.9 }}
      />
      {/* Thumb */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="w-6 h-6 rounded-full shadow-md flex items-center justify-center z-10"
        style={{
          background: isDark
            ? "linear-gradient(135deg, #1565c0, #1e88e5)"
            : "linear-gradient(135deg, #f59e0b, #fbbf24)",
          marginLeft: isDark ? 0 : "auto",
          marginRight: isDark ? "auto" : 0,
          boxShadow: isDark
            ? "0 0 8px rgba(30,136,229,0.5)"
            : "0 0 8px rgba(251,191,36,0.5)",
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ duration: 0.18 }}
            >
              <Moon className="w-3 h-3 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ duration: 0.18 }}
            >
              <Sun className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [location, setLocation] = useLocation();

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || "U"
    : "?";

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 w-full bg-[#1a1a2e] border-b border-white/10 h-16">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-6">
          <Link href="/" className="font-display font-bold text-xl tracking-tighter text-white flex items-center gap-1.5 shrink-0" data-testid="link-home">
            MOVI KOVA
            <div className="w-1.5 h-1.5 rounded-full bg-[#f84464]" />
          </Link>

          <button className="hidden lg:flex items-center gap-1.5 text-sm text-white border border-white/15 px-3 py-1.5 rounded cursor-pointer shrink-0">
            <MapPin className="w-3.5 h-3.5 text-[#f84464]" />
            Mumbai
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <div className="flex-1 max-w-xl mx-auto hidden md:block relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              placeholder="Search for Movies, Events, Plays, Sports and Activities"
              className="w-full bg-white/8 border border-white/15 text-sm text-white placeholder-gray-500 rounded-md pl-9 pr-4 py-2 focus:outline-none focus:border-[#f84464] transition-colors"
            />
          </div>

          <div className="hidden md:flex items-center gap-6 text-[13px] font-semibold tracking-widest uppercase ml-auto">
            <Link href="/" className={clsx("transition-colors", location === "/" ? "bms-tab-active" : "bms-tab")} data-testid="link-nav-movies">MOVIES</Link>
            <Link href="/subscribe" className={clsx("transition-colors flex items-center gap-1 text-[#f84464] hover:text-white font-bold", location === "/subscribe" ? "bms-tab-active" : "")} data-testid="link-nav-subscribe">VIP/STREAM</Link>
            <Link href="/events" className={clsx("transition-colors", location === "/events" ? "bms-tab-active" : "bms-tab")}>EVENTS</Link>
            <Link href="/plays" className={clsx("transition-colors", location === "/plays" ? "bms-tab-active" : "bms-tab")}>PLAYS</Link>
            <Link href="/sports" className={clsx("transition-colors", location === "/sports" ? "bms-tab-active" : "bms-tab")}>SPORTS</Link>
          </div>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <ThemeToggle />
            {!isLoaded ? null : (
              <>
                <Show when="signed-out">
                  <Link href="/sign-in" data-testid="link-sign-in">
                    <button className="flex items-center gap-2 text-sm font-semibold border border-[#f84464] text-[#f84464] hover:bg-[#f84464] hover:text-white px-4 py-1.5 rounded transition-all">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </button>
                  </Link>
                </Show>
                <Show when="signed-in">
                  <Link href="/profile" data-testid="link-nav-profile">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c62828] to-[#f84464] flex items-center justify-center text-white text-xs font-bold hover:scale-105 transition-transform cursor-pointer shadow-[0_0_12px_rgba(248,68,100,0.4)]">
                      {initials}
                    </div>
                  </Link>
                  <button
                    data-testid="button-sign-out"
                    onClick={() => signOut({ redirectUrl: basePath || "/" })}
                    className="text-white/50 hover:text-white/80 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </Show>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="flex md:hidden items-center gap-3 ml-auto">
            <ThemeToggle />
            <button className="text-white/60 hover:text-white transition-colors" data-testid="button-search">
              <Search className="w-5 h-5" />
            </button>
            <Show when="signed-out">
              <Link href="/sign-in" data-testid="link-mobile-sign-in">
                <User className="w-5 h-5 text-white/70" />
              </Link>
            </Show>
            <Show when="signed-in">
              <Link href="/profile">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c62828] to-[#f84464] flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              </Link>
            </Show>
            <button
              className="text-white p-1 -mr-1"
              onClick={() => setMenuOpen(true)}
              data-testid="button-mobile-menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} />
    </>
  );
}
