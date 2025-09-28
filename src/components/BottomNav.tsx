"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Icon({ name, active }: { name: string; active?: boolean }) {
  const common = "w-6 h-6";
  switch (name) {
    case "home":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.75L12 3l9 6.75V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.75z" />
        </svg>
      );
    case "search":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth={2} />
        </svg>
      );
    case "map":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M9 20l-5-2V6l5 2 7-3 5 2v10l-5-2-7 3z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "reels":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <rect x="3" y="6" width="18" height="12" rx="2" ry="2" />
          <path d="M16 10l-4 2-4-2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "shop":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M3 7h18v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 3v4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 3v4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "community":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M17 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 21v-2a4 4 0 0 1 3-3.87" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "profile":
      return (
        <svg
          className={`${common} ${active ? "text-black" : "text-gray-500"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M6 20a6 6 0 0 1 12 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BottomNav() {
  const pathname = usePathname() || "/";

  const items: { href: string; name: string; key: string }[] = [
    { href: "/now", name: "home", key: "now" },
    { href: "/map", name: "map", key: "map" },
    { href: "/reels", name: "reels", key: "reels" },
    { href: "/community", name: "community", key: "community" },
    { href: "/me", name: "profile", key: "me" },
  ];

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md dark:bg-black/90"
    >
      <div className="mx-auto flex max-w-xl justify-between px-4 py-2 safe-bottom">
        {items.map((it) => {
          const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
          return (
            <Link
              key={it.key}
              href={it.href}
              className="flex flex-col items-center gap-1 px-2 py-1 text-xs text-gray-700"
              aria-current={active ? "page" : undefined}
            >
              <Icon name={it.name} active={active} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
