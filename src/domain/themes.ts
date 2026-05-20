import type { ThemeColors, ThemeId } from "./types";

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  subtitle: string;
  vibe: string;
  colors: ThemeColors;
}

export const DEFAULT_THEME_ID: ThemeId = "raw-dark";

export const THEMES: ThemeDefinition[] = [
  {
    id: "raw-dark",
    name: "Default Dark",
    subtitle: "Original brutalist",
    vibe: "Focused, stark, and private.",
    colors: {
      background: "#141313",
      surface: "#1C1B1B",
      surfaceStrong: "#2A2A2A",
      surfaceMuted: "#353434",
      primary: "#FFFFFF",
      muted: "#C4C7C8",
      outline: "#444748",
      accent: "#FF5F1F",
      secondary: "#007AFF",
      success: "#00FF41",
      danger: "#FF3B30"
    }
  },
  {
    id: "solar-flare",
    name: "Solar Flare",
    subtitle: "Vitality & Energy",
    vibe: "Optimistic and active, like a morning workout.",
    colors: {
      background: "#FFFBF0",
      surface: "#FFFFFF",
      surfaceStrong: "#FFF0DB",
      surfaceMuted: "#FFE0BF",
      primary: "#FF5733",
      muted: "#8A5A44",
      outline: "#FFB088",
      accent: "#FF5733",
      secondary: "#FF9F1C",
      success: "#1F9D55",
      danger: "#D7263D"
    }
  },
  {
    id: "deep-eucalyptus",
    name: "Deep Eucalyptus",
    subtitle: "Zen Discipline",
    vibe: "Grounded and calm, built around harmonious consistency.",
    colors: {
      background: "#1B2623",
      surface: "#24332F",
      surfaceStrong: "#30473F",
      surfaceMuted: "#3E5C52",
      primary: "#A7D7C5",
      muted: "#C5D8D0",
      outline: "#5F8377",
      accent: "#A7D7C5",
      secondary: "#E0B973",
      success: "#7EE0A1",
      danger: "#FF7A7A"
    }
  },
  {
    id: "cyber-punk",
    name: "Cyber Punk",
    subtitle: "Digital Intensity",
    vibe: "High-stakes and futuristic, turning progress into leveling up.",
    colors: {
      background: "#0B0014",
      surface: "#180026",
      surfaceStrong: "#25003A",
      surfaceMuted: "#3A005A",
      primary: "#00FFD1",
      muted: "#BBA7FF",
      outline: "#6F00FF",
      accent: "#00FFD1",
      secondary: "#FF00E5",
      success: "#39FF14",
      danger: "#FF2E63"
    }
  },
  {
    id: "raw-concrete",
    name: "Raw Concrete",
    subtitle: "Industrial Brutalist",
    vibe: "Functional and architectural, with blueprint-like accents.",
    colors: {
      background: "#E0E0E0",
      surface: "#F5F5F5",
      surfaceStrong: "#FFFFFF",
      surfaceMuted: "#C8C8C8",
      primary: "#000000",
      muted: "#4B4B4B",
      outline: "#8A8A8A",
      accent: "#3D5AFE",
      secondary: "#3D5AFE",
      success: "#008A3D",
      danger: "#D50000"
    }
  },
  {
    id: "dusk-violet",
    name: "Dusk Violet",
    subtitle: "Introspective Growth",
    vibe: "Soft and reflective, leaning into journaling and transformation.",
    colors: {
      background: "#2D2A4A",
      surface: "#35325E",
      surfaceStrong: "#46427A",
      surfaceMuted: "#5A558F",
      primary: "#F8BBD0",
      muted: "#D8D0F0",
      outline: "#746FA5",
      accent: "#F8BBD0",
      secondary: "#B39DDB",
      success: "#A5D6A7",
      danger: "#FF8A80"
    }
  }
];

export function getTheme(themeId?: string): ThemeDefinition {
  return THEMES.find((theme) => theme.id === themeId) ?? THEMES[0];
}

export function getDefaultCustomTheme(): ThemeColors {
  return { ...getTheme("raw-dark").colors };
}

export function applyTheme(themeId?: string, customTheme?: ThemeColors): void {
  const theme = getTheme(themeId);
  const colors = themeId === "custom" && customTheme ? customTheme : theme.colors;
  const root = document.documentElement;
  root.dataset.theme = themeId === "custom" ? "custom" : theme.id;
  root.style.setProperty("--color-background", hexToRgb(colors.background));
  root.style.setProperty("--color-surface", hexToRgb(colors.surface));
  root.style.setProperty("--color-surface-strong", hexToRgb(colors.surfaceStrong));
  root.style.setProperty("--color-surface-muted", hexToRgb(colors.surfaceMuted));
  root.style.setProperty("--color-primary", hexToRgb(colors.primary));
  root.style.setProperty("--color-muted", hexToRgb(colors.muted));
  root.style.setProperty("--color-outline", hexToRgb(colors.outline));
  root.style.setProperty("--color-accent", hexToRgb(colors.accent));
  root.style.setProperty("--color-secondary", hexToRgb(colors.secondary));
  root.style.setProperty("--color-success", hexToRgb(colors.success));
  root.style.setProperty("--color-danger", hexToRgb(colors.danger));
}

function hexToRgb(hex: string): string {
  const normalized = hex.replace("#", "");
  const value = Number.parseInt(normalized, 16);
  return `${(value >> 16) & 255} ${(value >> 8) & 255} ${value & 255}`;
}
