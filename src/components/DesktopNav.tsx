"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/schedule", label: "Schedule" },
  { href: "/standings", label: "Standings" },
  { href: "/documents", label: "Documents" }
];

export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden flex-wrap gap-2 text-sm font-semibold xl:flex">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
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
