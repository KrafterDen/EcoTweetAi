import type { RegionValue } from "../types";

export const regions: { value: RegionValue; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "EUROPE", label: "Europe" },
  { value: "ASIA", label: "Asia" },
  { value: "NORTH_AMERICA", label: "North America" },
  { value: "SOUTH_AMERICA", label: "South America" },
  { value: "AFRICA", label: "Africa" },
  { value: "ANTARCTICA", label: "Antarctica" },
  { value: "OCEANIA", label: "Oceania" },
];

export const regionToContinentMap: Record<RegionValue, string | null> = {
  GLOBAL: null,
  ASIA: "Asia",
  EUROPE: "Europe",
  NORTH_AMERICA: "North America",
  SOUTH_AMERICA: "South America",
  AFRICA: "Africa",
  ANTARCTICA: "Antarctica",
  OCEANIA: "Oceania",
};

export const countriesByRegion: Partial<Record<RegionValue, string[]>> = {
  EUROPE: ["Ukraine", "Poland", "Germany", "France", "United Kingdom", "Italy", "Spain"],
  ASIA: ["China", "Japan", "India", "South Korea", "Indonesia", "Vietnam"],
  NORTH_AMERICA: ["USA", "Canada", "Mexico"],
  SOUTH_AMERICA: ["Brazil", "Argentina", "Chile", "Colombia"],
  AFRICA: ["Egypt", "South Africa", "Nigeria", "Kenya"],
  OCEANIA: ["Australia", "New Zealand"],
};

export const citiesByCountry: Record<string, string[]> = {
  Ukraine: ["Kyiv", "Lviv", "Odesa", "Kharkiv", "Dnipro", "Zaporizhzhia"],
};
