"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  User,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const mainNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/sales", label: "Sales", icon: Receipt },
];

const bottomNav = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const linkClass = (href: string) =>
    cn(
      "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive(href)
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    );

  const iconLinkClass = (href: string) =>
    cn(
      "flex items-center justify-center rounded-lg p-2 transition-colors",
      isActive(href)
        ? "bg-sidebar-accent text-sidebar-accent-foreground"
        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
    );

  return (
    <>
      {/* ── Mobile: overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 sm:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* ── Mobile: slide-in drawer ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 sm:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4 shrink-0">
          <Link
            href="/dashboard"
            className="font-semibold text-sidebar-foreground"
            onClick={onMobileClose}
          >
            JMB Ledger
          </Link>
          <button
            onClick={onMobileClose}
            className="text-sidebar-foreground p-1 rounded-md hover:bg-sidebar-accent/50 transition-colors"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-auto p-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={linkClass(item.href)}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border space-y-0.5 p-2 shrink-0">
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={linkClass(item.href)}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Tablet: icon-only sidebar ── */}
      <aside className="hidden sm:flex md:hidden h-full w-14 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="flex h-14 items-center justify-center border-b border-sidebar-border shrink-0">
          <Link
            href="/dashboard"
            className="font-bold text-sidebar-foreground text-sm"
            title="JMB Ledger"
          >
            J
          </Link>
        </div>
        <nav className="flex-1 flex flex-col items-center space-y-0.5 overflow-auto py-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={iconLinkClass(item.href)}
            >
              <item.icon className="size-5" />
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border flex flex-col items-center space-y-0.5 py-2 shrink-0">
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={iconLinkClass(item.href)}
            >
              <item.icon className="size-5" />
            </Link>
          ))}
        </div>
      </aside>

      {/* ── Desktop: full sidebar ── */}
      <aside className="hidden md:flex h-full w-56 flex-col border-r border-sidebar-border bg-sidebar shrink-0">
        <div className="flex h-14 items-center border-b border-sidebar-border px-4 shrink-0">
          <Link href="/dashboard" className="font-semibold text-sidebar-foreground">
            JMB Ledger
          </Link>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-auto p-2">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border space-y-0.5 p-2 shrink-0">
          {bottomNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={linkClass(item.href)}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </div>
      </aside>
    </>
  );
}