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

  problemId: solution.problemId,
  author: solution.author,
  timePosted: solution.timePosted?.toISOString?.() || solution.timePosted,
  content: solution.content,
  votes: solution.votes,
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/problems", async (_req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      orderBy: { urgencyPercent: "desc" },
    });
    res.json({ problems: problems.map(formatProblem) });
  } catch (error) {
    console.error("Error fetching problems:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/api/problems", requireAuth, async (req, res) => {
  const {
    id: _ignoredId, // ignore any id from request - db auto-generates it
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
  

  try {
    const created = await prisma.problem.create({
      data: {

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
  } catch (error) {
    console.error("Error creating problem:", error);
    res.status(500).json({ error: "Failed to create problem" });
  }
});

app.delete("/api/problems/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.problem.delete({
      where: { id: Number(id) },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ error: "Failed to delete problem" });
  }
});

app.get("/api/solutions", async (req, res) => {
  const { problemId } = req.query;

  const where = problemId ? { problemId: Number(problemId) } : {};
  
  try {
    const solutions = await prisma.solution.findMany({
      where,
      orderBy: { timePosted: "desc" },
    });
    res.json({ solutions: solutions.map(formatSolution) });
  } catch (error) {
    console.error("Error fetching solutions:", error);
    res.json({ solutions: [] }); // Повертаємо пустий масив, щоб не ламати фронтенд
  }
});

app.post("/api/solutions", requireAuth, async (req, res) => {
  const { problemId, author = "Community Member", content } = req.body || {};
  if (!problemId || !content) {
    return res.status(400).json({ error: "problemId and content are required" });
  }

  const id = `sol-${Date.now()}`;
  
  try {
    const created = await prisma.solution.create({
      data: {
        id,

        problemId: Number(problemId),
        author,
        content,
        votes: 1,
        timePosted: new Date(),
      },
    });

    res.status(201).json({ solution: formatSolution(created) });
  } catch (error) {
    console.error("Error creating solution:", error);
    res.status(500).json({ error: "Failed to create solution" });
  }
});

app.post("/api/solutions/:id/vote", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { direction } = req.body || {};

  const { value } = req.body || {}; 

  let delta = 0;
  if (value === 1 || direction === "up") delta = 1;
  else if (value === -1 || direction === "down") delta = -1;
  else {
      return res.status(400).json({ error: "Invalid vote value/direction" });
  }

  try {
    const existing = await prisma.solution.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Solution not found" });
    }

    const updated = await prisma.solution.update({
      where: { id },
      data: { votes: (existing.votes || 0) + delta },
    });

    res.json({ solution: formatSolution(updated) });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Vote failed" });
  }
});

app.post("/api/upload", requireAuth, upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ url });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});