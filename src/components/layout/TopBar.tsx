"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, User, Moon, Sun, Menu } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useUser } from "@/lib/supabase/useUser";
import Link from "next/link";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const userEmail = user?.email ?? null;

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-3 sm:px-4 shrink-0">
      {/* Left side: hamburger + brand on mobile, empty on sm+ */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onClick={onMobileMenuOpen}
          className="p-1 rounded-md text-foreground hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/dashboard" className="font-semibold text-foreground">
          JMB Ledger
        </Link>
      </div>

      {/* Spacer on sm+ to push right-side controls to the end */}
      <div className="hidden sm:block" />

      {/* Right side: theme toggle + user dropdown (always visible) */}
      <div className="flex items-center gap-1 sm:gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          className="shrink-0"
        >
          {theme === "dark" ? (
            <Sun className="size-4" />
          ) : (
            <Moon className="size-4" />
          )}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-1 sm:gap-2 px-2 sm:px-3">
              <User className="size-4 shrink-0" />
              <span className="hidden sm:inline max-w-[140px] md:max-w-[200px] truncate text-sm">
                {userEmail ?? "Account"}
              </span>
              <ChevronDown className="size-4 shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 sm:w-56">
            {userEmail && (
              <div className="px-2 py-1.5 sm:hidden">
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              </div>
            )}
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}