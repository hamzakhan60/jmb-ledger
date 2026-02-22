import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

const gameColorHex: Record<string, string> = {
  pokemon: "#00E5FF",
  yugioh: "#6D28D9",
  riftbound: "#D4AF37",
};

export function getGameColor(game: string): string {
  return gameColorHex[game.toLowerCase()] ?? "#00E5FF";
}

export function getGameDisplayName(game: string): string {
  const names: Record<string, string> = {
    pokemon: "Pokémon",
    yugioh: "Yu-Gi-Oh!",
    riftbound: "Riftbound",
  };
  return names[game.toLowerCase()] ?? game;
}
