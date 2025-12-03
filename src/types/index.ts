export type RegionValue =
  | "GLOBAL"
  | "ASIA"
  | "EUROPE"
  | "NORTH_AMERICA"
  | "SOUTH_AMERICA"
  | "AFRICA"
  | "ANTARCTICA"
  | "OCEANIA";

export interface EcoProblemRecord {
  id: string;
  continent: string;
  country?: string;
  city?: string;
  title: string;
  description: string;
  urgency_percent: number;
  affected_population: number;
  critical_timeframe: string;
  tags: string[];
  image_url: string;
  last_updated: string;
}

export interface EcoProblem {
  id: string;
  continent: string;
  country?: string;
  city?: string;
  title: string;
  description: string;
  imageUrl: string;
  urgencyLevel: number;
  impactedPopulation: string;
  timeframe: string;
  tags: string[];
  lastUpdated: string;
}

export type HandleConfidence = "high" | "medium" | "low";

export interface Activist {
  name: string;
  continent: string;
  x_handle: string;
  handle_confidence: HandleConfidence;
}

export interface ActivistProfile {
  username: string;
  displayName: string;
  description: string;
  profileImageUrl?: string;
  fetchedAt?: string;
}

export interface ActivistProfilesFile {
  profiles?: Record<string, ActivistProfile>;
  generatedAt?: string;
  source?: string;
}

export interface SolutionRecord {
  id: string;
  problem_id: string;
  author: string;
  time_posted: string;
  content: string;
  votes: number;
}

export interface Solution {
  id: string;
  author: string;
  timePosted: string;
  content: string;
  votes: number;
  upvoted?: boolean;
  downvoted?: boolean;
}
