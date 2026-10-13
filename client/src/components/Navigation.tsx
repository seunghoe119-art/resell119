import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { BookOpen, FileEdit, Menu, Music, Save, Settings, Timer, Users, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const NAV_ITEMS = [
  { href: "/", label: "공부 타이머", icon: Timer, testId: "link-study" },
  { href: "/generator", label: "판매글 생성기", icon: FileEdit, testId: "link-generator" },
  { href: "/saved", label: "저장된 글", icon: Save, testId: "link-saved" },
  { href: "/guest", label: "게스트 모집", icon: Users, testId: "link-guest" },
  { href: "/worklog", label: "업무일지", icon: BookOpen, testId: "link-worklog" },
  { href: "/lyrics", label: "가사생성", icon: Music, testId: "link-lyrics" },
] as const;

export default function Navigation() {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Closing the menu never clears browser storage or reloads the running timer.
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;

    // Keyboard users can immediately move through the navigation links.
    firstLinkRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <>
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30"
          aria-hidden="true"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <nav className="fixed inset-x-0 top-0 z-50 h-16 border-b bg-background" aria-label="사이트 메뉴">
        <div className="flex h-full items-center gap-3 px-3 sm:px-6">
          <button
            type="button"
            ref={menuButtonRef}
            data-testid="button-menu"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="site-navigation-links"
            onClick={() => setMenuOpen(open => !open)}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {menuOpen ? <X className="h-6 w-6" aria-hidden="true" /> : <Menu className="h-6 w-6" aria-hidden="true" />}
          </button>
          <Link
            href="/"
            data-testid="link-home"
            className="text-lg font-bold text-foreground hover:text-primary"
            onClick={() => setMenuOpen(false)}
          >
            resell119
          </Link>
        </div>

        {menuOpen && (
          <div
            id="site-navigation-links"
            className="absolute left-3 top-[calc(100%+0.5rem)] max-h-[calc(100dvh-5rem)] w-[calc(100vw-1.5rem)] max-w-72 overflow-y-auto rounded-xl border bg-background p-2 shadow-2xl sm:left-6"
          >
            <div className="flex flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, icon: Icon, testId }, index) => (
                <Link
                  key={href}
                  href={href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  data-testid={testId}
                  aria-current={location === href ? "page" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className={[
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    location === href
                      ? "bg-accent text-primary"
                      : "text-foreground",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              ))}
              <div className="my-1 border-t" />
              <button
                type="button"
                data-testid="button-settings"
                className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-accent"
                onClick={() => {
                  setMenuOpen(false);
                  setShowSettingsDialog(true);
                }}
              >
                <Settings className="h-5 w-5 shrink-0" aria-hidden="true" />
                설정
              </button>
            </div>
          </div>
        )}
      </nav>
      {/* Keep the original content below the fixed top-left menu bar. */}
      <div className="h-16" aria-hidden="true" />

      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent data-testid="dialog-settings">
          <DialogHeader>
            <DialogTitle>개발자 페이지</DialogTitle>
            <DialogDescription>supabase - seunghoe119</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">vercel - seunghoe119</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
