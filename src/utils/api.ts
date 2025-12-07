import type { EcoProblem, ReportProblemPayload } from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "";
const API_TOKEN = import.meta.env.VITE_API_TOKEN || "dev-token";

const formatPopulation = (value?: number | null) => {
  if (!value || Number.isNaN(value)) return "Unknown";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B people`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M people`;
  return `${value.toLocaleString()} people`;
};

const mapProblem = (payload: any): EcoProblem => ({
  id: payload.id,
  continent: payload.continent,
  country: payload.country,
  city: payload.city,
  title: payload.title,
  description: payload.description,
  imageUrl: payload.imageUrl,
  urgencyLevel: payload.urgencyLevel ?? payload.urgencyPercent ?? 0,
  impactedPopulation: formatPopulation(payload.impactedPopulation ?? payload.affectedPopulation),
  timeframe: payload.timeframe ?? payload.criticalTimeframe,
  tags: payload.tags ?? [],
  lastUpdated: payload.lastUpdated,
});

export const fetchProblems = async (): Promise<EcoProblem[]> => {
  const response = await fetch(`${API_BASE}/api/problems`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  const data = await response.json();
  return (data.problems ?? []).map(mapProblem);
};

export const createProblem = async (payload: ReportProblemPayload): Promise<EcoProblem> => {
  const response = await fetch(`${API_BASE}/api/problems`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  const data = await response.json();
  return mapProblem(data.problem);
};

export const uploadAttachment = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Upload failed ${response.status}`);
  }
  const data = await response.json();
  const url = data.url as string;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
};
