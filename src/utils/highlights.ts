import { getAllSolutions } from "./solutionsStorage";
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
  problems: EcoProblem[],
  solutions: SolutionRecord[]
): SolutionHighlight => {
  if (!solutions.length) {
    return {
      title: "Community solution",
      snippet: "Share your ideas to help solve environmental challenges worldwide.",
      problemTitle: "Any urgent issue",
      author: "@community",
      votes: 0,
    };
  }

  const topSolution = solutions.reduce((best, current) =>
    current.votes > best.votes ? current : best
  );
  const problemMap = new Map(problems.map((p) => [p.id, p]));
  const relatedProblem = problemMap.get(topSolution.problem_id);

  return {
    title: relatedProblem?.title ?? "Solution of the week",
    snippet: buildSnippet(topSolution.content),
    problemTitle: relatedProblem?.title ?? "Priority issue",
    author: topSolution.author,
    votes: topSolution.votes,
  };
};

const getHeroHighlight = (solutions: SolutionRecord[]): HeroHighlight => {
  if (!solutions.length) {
    return {
      handle: "@community",
      initials: "CM",
      issues: 0,
      solutions: 0,
      votes: 0,
    };
  }

  const stats = new Map<
    string,
    { solutions: number; votes: number; issues: Set<string> }
  >();

  for (const solution of solutions) {
    const entry =
      stats.get(solution.author) ??
      { solutions: 0, votes: 0, issues: new Set<string>() };
    entry.solutions += 1;
    entry.votes += solution.votes;
    entry.issues.add(solution.problem_id);
    stats.set(solution.author, entry);
  }

  let topAuthor = "";
  let topVotes = -Infinity;
  for (const [author, entry] of stats.entries()) {
    if (entry.votes > topVotes) {
      topVotes = entry.votes;
      topAuthor = author;
    }
  }

  const topEntry = stats.get(topAuthor)!;

  return {
    handle: `@${topAuthor.replace(/^@/, "")}`,
    initials: makeInitials(topAuthor),
    issues: topEntry.issues.size,
    solutions: topEntry.solutions,
    votes: topEntry.votes,
  };
};

const getImpactHighlight = (
  problems: EcoProblem[],
  solutions: SolutionRecord[]
): ImpactHighlight => {
  const totalVotes = solutions.reduce((sum, solution) => sum + solution.votes, 0);
  return {
    problems: problems.length,
    solutions: solutions.length,
    votes: totalVotes,
  };
};

export const deriveHighlights = (problems: EcoProblem[]): Highlights => {
  const solutions = getAllSolutions();

  return {
    problem: getProblemHighlight(problems),
    solution: getSolutionHighlight(problems, solutions),
    hero: getHeroHighlight(solutions),
    impact: getImpactHighlight(problems, solutions),
  };
};
