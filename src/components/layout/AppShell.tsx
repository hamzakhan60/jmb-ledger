"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col sm:flex-row overflow-hidden bg-background">
      {/* On sm+: Sidebar renders a fixed-width column beside the content.
          On mobile: only the slide-in drawer is rendered (no top bar here). */}
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Content area: TopBar always on top, then main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 min-h-0">
        <TopBar onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="app-main flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}