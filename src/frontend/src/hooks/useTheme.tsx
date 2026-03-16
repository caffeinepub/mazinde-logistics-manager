import { createContext, useContext, useEffect, useState } from "react";

export interface Theme {
  id: string;
  name: string;
  primary: string;
  accent: string;
  bg: string;
}

export const THEMES: Theme[] = [
  {
    id: "navy-amber",
    name: "Navy Amber",
    primary: "0.25 0.12 250",
    accent: "0.75 0.20 55",
    bg: "0.10 0.05 250",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    primary: "0.25 0.14 160",
    accent: "0.70 0.22 145",
    bg: "0.08 0.04 160",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    primary: "0.25 0.14 290",
    accent: "0.72 0.20 290",
    bg: "0.10 0.05 290",
  },
  {
    id: "ocean-blue",
    name: "Ocean Blue",
    primary: "0.22 0.12 230",
    accent: "0.65 0.22 210",
    bg: "0.08 0.05 230",
  },
  {
    id: "sunset-red",
    name: "Sunset Red",
    primary: "0.25 0.12 20",
    accent: "0.70 0.22 25",
    bg: "0.10 0.04 20",
  },
];

function parseLCH(raw: string): { l: number; c: number; h: number } {
  const [l, c, h] = raw.split(" ").map(Number);
  return { l, c, h };
}

/** Returns raw "L C H" string (no oklch wrapper) -- for CSS var storage */
function rawOffset(raw: string, deltaL: number): string {
  const { l, c, h } = parseLCH(raw);
  return `${Math.min(1, Math.max(0, l + deltaL))} ${c} ${h}`;
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  // Store raw values so Tailwind's oklch(var(--x)) works correctly
  root.style.setProperty("--primary", theme.primary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--background", theme.bg);
  root.style.setProperty("--card", rawOffset(theme.bg, 0.05));
  root.style.setProperty("--ring", theme.accent);
  root.style.setProperty("--secondary", rawOffset(theme.bg, 0.08));
  root.style.setProperty("--border", rawOffset(theme.bg, 0.12));
  root.style.setProperty("--input", rawOffset(theme.bg, 0.12));
  root.style.setProperty("--sidebar", rawOffset(theme.bg, 0.02));
  root.style.setProperty("--sidebar-primary", theme.accent);
  root.style.setProperty("--sidebar-ring", theme.accent);
  root.style.setProperty("--muted", rawOffset(theme.bg, 0.07));
  root.style.setProperty("--muted-foreground", rawOffset(theme.bg, 0.5));
  root.style.setProperty("--popover", rawOffset(theme.bg, 0.03));
  root.style.setProperty("--popover-foreground", "0.95 0.01 0");
  root.style.setProperty("--card-foreground", "0.95 0.01 0");
  root.style.setProperty("--foreground", "0.95 0.01 0");

  // Extra raw vars for CSS utility classes that need custom gradients
  const bg = parseLCH(theme.bg);
  const acc = parseLCH(theme.accent);
  root.style.setProperty(
    "--bg-dark",
    `${Math.max(0, bg.l - 0.02)} ${bg.c} ${bg.h}`,
  );
  root.style.setProperty("--bg-mid", theme.bg);
  root.style.setProperty(
    "--bg-light",
    `${Math.min(1, bg.l + 0.06)} ${Math.min(0.18, bg.c + 0.04)} ${bg.h}`,
  );
  root.style.setProperty("--acc-l", String(acc.l));
  root.style.setProperty("--acc-c", String(acc.c));
  root.style.setProperty("--acc-h", String(acc.h));
}

interface ThemeContextValue {
  themes: Theme[];
  currentTheme: Theme;
  setTheme: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem("mazinde-theme") ?? "navy-amber";
  });

  const currentTheme = THEMES.find((t) => t.id === themeId) ?? THEMES[0];

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = (id: string) => {
    localStorage.setItem("mazinde-theme", id);
    setThemeId(id);
  };

  return (
    <ThemeContext.Provider value={{ themes: THEMES, currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
