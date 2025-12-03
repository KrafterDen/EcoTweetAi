import rawSolutions from "../data/EcoProblemSolutions.json";
import type { SolutionRecord } from "../types";
export type { SolutionRecord } from "../types";

const STORAGE_KEY = "eco-problem-solutions";
const baseSolutions = rawSolutions as SolutionRecord[];
const isBrowser = typeof window !== "undefined";
const shouldSyncWithFile =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env.DEV
    : false;
const SYNC_ENDPOINT = "/api/solutions";

const safeParse = (value: string | null): SolutionRecord[] | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed as SolutionRecord[];
    }
    return null;
  } catch {
    return null;
  }
};

const syncSolutionsToFile = (solutions: SolutionRecord[]) => {
  if (!isBrowser || !shouldSyncWithFile) {
    return;
  }

  const payload = JSON.stringify({ solutions });

  if ("sendBeacon" in navigator) {
    const blob = new Blob([payload], { type: "application/json" });
    navigator.sendBeacon(SYNC_ENDPOINT, blob);
    return;
  }

  fetch(SYNC_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
  }).catch(() => {
    // Ignore failures in prototype mode; localStorage copy still exists.
  });
};

const persistSolutions = (
  solutions: SolutionRecord[],
  { sync = true }: { sync?: boolean } = {}
) => {
  if (!isBrowser) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(solutions));
  if (sync) {
    syncSolutionsToFile(solutions);
  }
};

export const getAllSolutions = (): SolutionRecord[] => {
  if (!isBrowser) {
    return baseSolutions;
  }

  const stored = safeParse(window.localStorage.getItem(STORAGE_KEY));
  if (stored && stored.length) {
    return stored;
  }

  persistSolutions(baseSolutions, { sync: false });
  return baseSolutions;
};

export const getSolutionsByProblem = (problemId: string): SolutionRecord[] => {
  return getAllSolutions().filter(
    (solution) => solution.problem_id === problemId
  );
};

export const addSolutionRecord = (record: SolutionRecord) => {
  const updated = [record, ...getAllSolutions()];
  persistSolutions(updated);
  return updated;
};

export const updateSolutionVotes = (solutionId: string, votes: number) => {
  const updated = getAllSolutions().map((solution) =>
    solution.id === solutionId ? { ...solution, votes } : solution
  );
  persistSolutions(updated);
  return updated;
};
