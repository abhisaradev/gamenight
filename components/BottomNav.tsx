"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", icon: "🏠", label: "Home" },
  { href: "/game/trivia", icon: "🧠", label: "Trivia" },
  { href: "/game/wyr", icon: "⚡", label: "WYR" },
  { href: "/game/agree", icon: "🗣️", label: "Agree" },
  { href: "/game/beige", icon: "🏳️", label: "Beige" },
  { href: "/admin", icon: "✏️", label: "Admin" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {NAV.map((item) => {
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname === item.href ||
              (item.href === "/admin" && pathname.startsWith("/admin"));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item${active ? " active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
