"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Briefcase, BookOpen, Download, Upload, ExternalLink,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Applications", icon: Briefcase },
  { href: "/cv", label: "CV Knowledge Base", icon: BookOpen },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
          <Briefcase className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-sm tracking-tight">Job Tracker</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href || (href !== "/" && pathname.startsWith(href))
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="border-t p-3 space-y-0.5">
        <a
          href="/api/export"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          target="_blank"
        >
          <Download className="h-4 w-4 shrink-0" />
          Export Data
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </a>
        <Link
          href="/jobs"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Upload className="h-4 w-4 shrink-0" />
          Import Data
        </Link>
      </div>
    </aside>
  );
}
