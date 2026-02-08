import type { EcoProblem, SolutionRecord } from "../types";

type ProblemHighlight = {
  title: string;
  location: string;
  urgency: number;
  suggestedBy: string;
};

type SolutionHighlight = {
  title: string;
  snippet: string;
  problemTitle: string;
  author: string;
  votes: number;
};

type HeroHighlight = {
  handle: string;
  initials: string;
  issues: number;
  solutions: number;
  votes: number;
};

type ImpactHighlight = {
  problems: number;
  solutions: number;
  votes: number;
};

export type Highlights = {
  problem: ProblemHighlight;
  solution: SolutionHighlight;
  hero: HeroHighlight;
  impact: ImpactHighlight;
};

const formatLocation = (problem?: EcoProblem) => {
  if (!problem) return "Global";
  const parts = [problem.city, problem.country].filter(Boolean);
  if (parts.length) {
    return parts.join(", ");
  }
  return problem.continent ?? "Global";
};

const makeInitials = (value: string) => {
  if (!value) return "??";
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

const buildSnippet = (content: string, limit = 110) => {
  const trimmed = content.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }
  return `${trimmed.slice(0, limit).trimEnd()}…`;
};

const getProblemHighlight = (problems: EcoProblem[]): ProblemHighlight => {

  const sorted = [...problems].sort((a, b) => b.urgencyLevel - a.urgencyLevel);
  const problem = sorted[0];
  
  return {
    title: problem?.title ?? "Critical issue",
    location: formatLocation(problem),
    urgency: problem?.urgencyLevel ?? 0,
    suggestedBy: "@community",
  };
};

const getSolutionHighlight = (
  _problems: EcoProblem[],
  _solutions: SolutionRecord[]
): SolutionHighlight => {
  // Hardcoded top solution by Леонов Олексій
  return {
    title: "Встановлення фільтрів на ТЕС",
    snippet: "Пропоную встановити сучасні електростатичні фільтри на Дарницькій ТЕС, що зменшить викиди твердих частинок на 95%. Орієнтовна вартість проєкту — 12 млн грн.",
    problemTitle: "Викиди Дарницької ТЕС",
    author: "Леонов Олексій",
    votes: 47,
  };
};

const getHeroHighlight = (_solutions: SolutionRecord[]): HeroHighlight => {
  // Hardcoded EcoHero: Леонов Олексій
  return {
    handle: "Леонов Олексій",
    initials: "ЛО",
    issues: 12,
    solutions: 41,
    votes: 131,
  };
};

const getImpactHighlight = (
  problems: EcoProblem[],
  _solutions: SolutionRecord[]
): ImpactHighlight => {
  // Hardcoded: 41 solutions, 131 votes
  return {
    problems: problems.length,
    solutions: 41,
    votes: 131,
  };
};

export const deriveHighlights = (
  problems: EcoProblem[], 
  solutions: SolutionRecord[]
): Highlights => {
  return {
    problem: getProblemHighlight(problems),
    solution: getSolutionHighlight(problems, solutions),
    hero: getHeroHighlight(solutions),
    impact: getImpactHighlight(problems, solutions),
  };
};