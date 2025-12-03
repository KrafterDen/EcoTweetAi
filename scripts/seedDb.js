const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const readJson = (relativePath) => {
  const absolute = path.resolve(__dirname, "..", relativePath);
  return JSON.parse(fs.readFileSync(absolute, "utf-8"));
};

const safeDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const seedProblems = async () => {
  const problems = readJson("src/data/EcoProblems.json");
  for (const problem of problems) {
    await prisma.problem.upsert({
      where: { id: problem.id },
      update: {
        continent: problem.continent,
        country: problem.country ?? null,
        city: problem.city ?? null,
        title: problem.title,
        description: problem.description,
        urgencyPercent: problem.urgency_percent,
        affectedPopulation: problem.affected_population,
        criticalTimeframe: problem.critical_timeframe,
        tagsJson: JSON.stringify(problem.tags ?? []),
        imageUrl: problem.image_url,
        lastUpdated: safeDate(problem.last_updated),
      },
      create: {
        id: problem.id,
        continent: problem.continent,
        country: problem.country ?? null,
        city: problem.city ?? null,
        title: problem.title,
        description: problem.description,
        urgencyPercent: problem.urgency_percent,
        affectedPopulation: problem.affected_population,
        criticalTimeframe: problem.critical_timeframe,
        tagsJson: JSON.stringify(problem.tags ?? []),
        imageUrl: problem.image_url,
        lastUpdated: safeDate(problem.last_updated),
      },
    });
  }
};

const seedSolutions = async () => {
  const solutions = readJson("src/data/EcoProblemSolutions.json");
  for (const solution of solutions) {
    await prisma.solution.upsert({
      where: { id: solution.id },
      update: {
        problemId: solution.problem_id,
        author: solution.author,
        timePosted: safeDate(solution.time_posted),
        content: solution.content,
        votes: solution.votes ?? 0,
      },
      create: {
        id: solution.id,
        problemId: solution.problem_id,
        author: solution.author,
        timePosted: safeDate(solution.time_posted),
        content: solution.content,
        votes: solution.votes ?? 0,
      },
    });
  }
};

const seedActivists = async () => {
  const activists = readJson("src/data/environmental_activists.json");
  for (const activist of activists) {
    await prisma.activist.upsert({
      where: { xHandle: activist.x_handle },
      update: {
        name: activist.name,
        continent: activist.continent,
        handleConfidence: activist.handle_confidence,
      },
      create: {
        name: activist.name,
        continent: activist.continent,
        xHandle: activist.x_handle,
        handleConfidence: activist.handle_confidence,
      },
    });
  }

  const profilesPayload = readJson("src/data/environmental_activists_profiles.json");
  const profiles = profilesPayload.profiles ?? {};
  for (const [username, profile] of Object.entries(profiles)) {
    await prisma.activistProfile.upsert({
      where: { username },
      update: {
        displayName: profile.displayName,
        description: profile.description ?? "",
        profileImageUrl: profile.profileImageUrl ?? null,
        fetchedAt: profile.fetchedAt ? safeDate(profile.fetchedAt) : null,
      },
      create: {
        username,
        displayName: profile.displayName,
        description: profile.description ?? "",
        profileImageUrl: profile.profileImageUrl ?? null,
        fetchedAt: profile.fetchedAt ? safeDate(profile.fetchedAt) : null,
      },
    });
  }
};

async function main() {
  await seedProblems();
  await seedSolutions();
  await seedActivists();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
