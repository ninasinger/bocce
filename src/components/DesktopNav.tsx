"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/standings", label: "Standings" },
  { href: "/schedule", label: "Schedule" },
  { href: "/captain/login", label: "Score Entry", matchPaths: ["/captain"] },
  { href: "/commissioner/login", label: "Commissioner", matchPaths: ["/commissioner"] }
];

export function DesktopNav() {
  const pathname = usePathname();

  const isActive = (item: (typeof navItems)[number]) => {
    if (item.href === "/") return pathname === "/";
    if (item.matchPaths) return item.matchPaths.some((path) => pathname.startsWith(path));
    return pathname.startsWith(item.href);
  };

  return (
    <nav className="hidden flex-wrap gap-2 text-sm font-semibold md:flex">
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`nav-pill ${active ? "nav-pill-active" : "nav-pill-muted"}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
