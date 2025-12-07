const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

const PORT = process.env.API_PORT || 4174;
const API_TOKEN = process.env.API_TOKEN || "dev-token";

const regionToContinentMap = {
  GLOBAL: null,
  ASIA: "Asia",
  EUROPE: "Europe",
  NORTH_AMERICA: "North America",
  SOUTH_AMERICA: "South America",
  AFRICA: "Africa",
  ANTARCTICA: "Antarctica",
  OCEANIA: "Oceania",
};

app.use(cors());
app.use(bodyParser.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.replace(/Bearer\s+/i, "").trim();
  if (token !== API_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage });

const formatProblem = (problem) => ({
  id: problem.id,
  continent: problem.continent,
  country: problem.country,
  city: problem.city,
  title: problem.title,
  description: problem.description,
  imageUrl: problem.imageUrl,
  urgencyLevel: problem.urgencyPercent,
  impactedPopulation: problem.affectedPopulation,
  timeframe: problem.criticalTimeframe,
  tags: Array.isArray(problem.tagsJson)
    ? problem.tagsJson
    : (() => {
        try {
          return JSON.parse(problem.tagsJson || "[]");
        } catch {
          return [];
        }
      })(),
  lastUpdated: problem.lastUpdated?.toISOString?.() || problem.lastUpdated,
});

const formatSolution = (solution) => ({
  id: solution.id,
  problem_id: solution.problemId,
  author: solution.author,
  time_posted: solution.timePosted?.toISOString?.() || solution.timePosted,
  content: solution.content,
  votes: solution.votes,
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/problems", async (_req, res) => {
  const problems = await prisma.problem.findMany({
    orderBy: { urgencyPercent: "desc" },
  });
  res.json({ problems: problems.map(formatProblem) });
});

app.post("/api/problems", requireAuth, async (req, res) => {
  const {
    title,
    description,
    region = "GLOBAL",
    country = null,
    city = null,
    urgency = 50,
    tags = [],
    timeframe = "next_5_years",
    imageUrl,
    affectedPopulation = null,
  } = req.body || {};

  if (!title || !description) {
    return res.status(400).json({ error: "Title and description are required" });
  }

  const continent = regionToContinentMap[region] ?? "Global";
  const id = `api-${Date.now()}`;

  const created = await prisma.problem.create({
    data: {
      id,
      continent,
      country,
      city,
      title,
      description,
      urgencyPercent: Number(urgency) || 0,
      affectedPopulation: affectedPopulation ? Number(affectedPopulation) : 0,
      criticalTimeframe: timeframe,
      tagsJson: JSON.stringify(tags ?? []),
      imageUrl:
        imageUrl ||
        "https://images.pexels.com/photos/2409022/pexels-photo-2409022.jpeg",
      lastUpdated: new Date(),
    },
  });

  res.status(201).json({ problem: formatProblem(created) });
});

app.get("/api/solutions", async (req, res) => {
  const { problemId } = req.query;
  const where = problemId ? { problemId } : {};
  const solutions = await prisma.solution.findMany({
    where,
    orderBy: { timePosted: "desc" },
  });
  res.json({ solutions: solutions.map(formatSolution) });
});

app.post("/api/solutions", requireAuth, async (req, res) => {
  const { problemId, author = "Community Member", content } = req.body || {};
  if (!problemId || !content) {
    return res.status(400).json({ error: "problemId and content are required" });
  }

  const id = `sol-${Date.now()}`;
  const created = await prisma.solution.create({
    data: {
      id,
      problemId,
      author,
      content,
      votes: 1,
      timePosted: new Date(),
    },
  });

  res.status(201).json({ solution: formatSolution(created) });
});

app.post("/api/solutions/:id/vote", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body || {};
  if (!["up", "down"].includes(direction)) {
    return res.status(400).json({ error: "direction must be 'up' or 'down'" });
  }

  const existing = await prisma.solution.findUnique({ where: { id } });
  if (!existing) {
    return res.status(404).json({ error: "Solution not found" });
  }

  const delta = direction === "up" ? 1 : -1;
  const updated = await prisma.solution.update({
    where: { id },
    data: { votes: Math.max(0, (existing.votes || 0) + delta) },
  });

  res.json({ solution: formatSolution(updated) });
});

app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const relative = `/uploads/${req.file.filename}`;
  const absolute = `${req.protocol}://${req.get("host")}${relative}`;
  res.status(201).json({ url: absolute });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
