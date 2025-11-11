const fs = require("fs");
const path = require("path");

const ACTIVISTS_PATH = path.resolve(
  __dirname,
  "../src/data/environmental_activists.json"
);
const OUTPUT_PATH = path.resolve(
  __dirname,
  "../src/data/environmental_activists_profiles.json"
);
const SOURCE_BASE = "https://r.jina.ai/https://twitter.com/";

const activists = require(ACTIVISTS_PATH);

const normalizeHandle = (handle) => handle.replace(/^@/, "").trim();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchProfileMarkdown = async (handle) => {
  const response = await fetch(`${SOURCE_BASE}${handle}`);
  if (!response.ok) {
    throw new Error(
      `Failed to scrape https://twitter.com/${handle} (${response.status})`
    );
  }
  return response.text();
};

const cleanupLine = (line) =>
  line
    .replace(/\!\[.*?\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

const extractProfile = (handle, markdown) => {
  const lines = markdown.split(/\r?\n/);
  const targetHandle = `@${handle.toLowerCase()}`;
  const handleIndex = lines.findIndex(
    (line) => line.trim().toLowerCase() === targetHandle
  );

  if (handleIndex === -1) {
    return null;
  }

  const displayName =
    [...lines.slice(0, handleIndex)].reverse().find((line) => line.trim()) ??
    handle;

  const imageMatch = markdown.match(
    /https:\/\/pbs\.twimg\.com\/profile_images\/[^\s\)"]+/i
  );
  const profileImageUrl = imageMatch
    ? imageMatch[0]
        .replace("_normal", "_400x400")
        .replace("_200x200", "_400x400")
    : null;

  const bioLines = [];
  for (let i = handleIndex + 1; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    if (!line) {
      const nextLine = lines.slice(i + 1).find((l) => l.trim());
      if (nextLine && nextLine.includes("’s posts")) {
        break;
      }
      continue;
    }

    const plain = cleanupLine(rawLine);

    if (!plain) {
      const nextLine = lines.slice(i + 1).find((l) => cleanupLine(l));
      if (nextLine && cleanupLine(nextLine).includes("’s posts")) {
        break;
      }
      continue;
    }

    if (
      plain.includes("’s posts") ||
      plain.includes("'s posts") ||
      plain.includes("’s Posts")
    ) {
      break;
    }

    if (
      line.includes("’s posts") ||
      line.includes("'s posts") ||
      line.includes("’s Posts") ||
      plain.startsWith("Pinned") ||
      plain.startsWith("Posts and replies") ||
      plain.startsWith("Media") ||
      plain.startsWith("Highlights") ||
      plain.startsWith("New to X?") ||
      plain.startsWith("Sign up now") ||
      /Posts$/i.test(plain) ||
      plain.startsWith("Joined ") ||
      plain.includes(" Following") ||
      plain.includes(" Followers")
    ) {
      break;
    }

    bioLines.push(plain);
  }

  const description = bioLines.join(" ").trim();

  return {
    username: handle,
    displayName: displayName.trim(),
    description,
    profileImageUrl,
    fetchedAt: new Date().toISOString(),
  };
};

const main = async () => {
  const handles = [
    ...new Set(
      activists
        .map((activist) => normalizeHandle(activist.x_handle))
        .filter(Boolean)
    ),
  ];

  let existingProfiles: Record<string, ActivistProfile> = {};
  try {
    if (fs.existsSync(OUTPUT_PATH)) {
      const payload = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
      existingProfiles = payload.profiles ?? {};
    }
  } catch {
    existingProfiles = {};
  }

  const profiles = { ...existingProfiles };
  const shouldRefreshAll =
    process.env.REFRESH_ALL === "1" || process.env.REFRESH_ALL === "true";

  if (!shouldRefreshAll) {
    console.log(
      `Loaded ${Object.keys(existingProfiles).length} cached profiles.`
    );
  }

  for (const handle of handles) {
    const normalized = handle.toLowerCase();
    if (!shouldRefreshAll && profiles[normalized]) {
      continue;
    }

    console.log(`Scraping @${handle}…`);
    try {
      const markdown = await fetchProfileMarkdown(handle);
      const profile = extractProfile(handle.toLowerCase(), markdown);
      if (!profile) {
        console.warn(`Unable to parse profile for @${handle}`);
      } else {
        profiles[profile.username.toLowerCase()] = profile;
      }
    } catch (error) {
      console.error(error.message);
    }

    await sleep(1200);
  }

  fs.writeFileSync(
    OUTPUT_PATH,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: SOURCE_BASE,
        profiles,
      },
      null,
      2
    )
  );

  console.log(
    `Saved ${Object.keys(profiles).length} profiles to ${OUTPUT_PATH}`
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
