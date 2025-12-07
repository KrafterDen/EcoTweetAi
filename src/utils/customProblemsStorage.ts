import type { EcoProblem } from "../types";

const STORAGE_KEY = "eco-custom-problems";
const isBrowser = typeof window !== "undefined";

const safeParse = (value: string | null): EcoProblem[] | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as EcoProblem[]) : null;
  } catch {
    return null;
  }
};

export const getCustomProblems = (): EcoProblem[] => {
  if (!isBrowser) {
    return [];
  }
  return safeParse(window.localStorage.getItem(STORAGE_KEY)) ?? [];
};

export const addCustomProblem = (problem: EcoProblem): EcoProblem[] => {
  if (!isBrowser) {
    return [];
  }
  const updated = [problem, ...getCustomProblems()];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
