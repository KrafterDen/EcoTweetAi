import { useMemo, useState } from "react";
import { Twitter } from "lucide-react";
import { Badge } from "./ui/badge";
import activistsData from "../data/environmental_activists.json";
import profilePayload from "../data/environmental_activists_profiles.json";
import type {
  Activist,
  ActivistProfile,
  ActivistProfilesFile,
  HandleConfidence,
} from "../types";

type ContinentFilter = string | "ALL";

const profileMap: Record<string, ActivistProfile> =
  (profilePayload as ActivistProfilesFile)?.profiles ?? {};

const uniqueContinents = Array.from(
  new Set((activistsData as Activist[]).map((activist) => activist.continent))
).sort();

const formatHandle = (handle: string) => handle.trim().replace(/^@/, "");

const confidenceClasses: Record<
  HandleConfidence,
  string
> = {
  high: "bg-emerald-50 text-emerald-900 border border-emerald-100",
  medium: "bg-amber-50 text-amber-900 border border-amber-100",
  low: "bg-rose-50 text-rose-900 border border-rose-100",
};

const confidenceCopy: Record<HandleConfidence, string> = {
  high: "handle verified by multiple sources",
  medium: "handle verified by one trusted source",
  low: "handle confidence needs review",
};

const getInitials = (value: string) => {
  if (!value) {
    return "?";
  }
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
};

export function ActivistResources() {
  const [continentFilter, setContinentFilter] = useState<ContinentFilter>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivists = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return (activistsData as Activist[])
      .filter((activist) => {
        if (continentFilter === "ALL") {
          return true;
        }
        return activist.continent === continentFilter;
      })
      .filter((activist) => {
        if (!normalizedSearch) {
          return true;
        }
        const handle = formatHandle(activist.x_handle).toLowerCase();
        return (
          activist.name.toLowerCase().includes(normalizedSearch) ||
          handle.includes(normalizedSearch)
        );
      });
  }, [continentFilter, searchTerm]);

  return (
    <section id="resources" className="scroll-mt-24 w-full">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
        <label className="w-full lg:max-w-sm">
          <span className="sr-only">Search activists</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search by name or handle"
            className="w-full rounded-xl border border-emerald-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <div className="flex gap-2 overflow-x-auto">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              continentFilter === "ALL"
                ? "bg-emerald-600 text-white shadow"
                : "bg-white border border-emerald-200 text-emerald-700"
            }`}
            onClick={() => setContinentFilter("ALL")}
          >
            All Regions
          </button>
          {uniqueContinents.map((continent) => (
            <button
              key={continent}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                continentFilter === continent
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white border border-emerald-200 text-emerald-700"
              }`}
              onClick={() => setContinentFilter(continent)}
            >
              {continent}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredActivists.map((activist) => {
          const normalizedHandle = formatHandle(activist.x_handle).toLowerCase();
          const profile = profileMap[normalizedHandle];
          const initials = getInitials(profile?.displayName ?? activist.name);
          const bio =
            profile?.description ||
            "We have not been able to sync this biography from X yet. Follow the profile to learn more.";

          return (
            <article
              key={`${activist.name}-${activist.x_handle}`}
              className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm hover:border-emerald-200 hover:shadow-lg transition-all duration-200 flex flex-col h-full"
            >
              <div className="flex items-start gap-4 mb-4">
                {profile?.profileImageUrl ? (
                  <img
                    src={profile.profileImageUrl}
                    alt={`Profile of ${profile.displayName}`}
                    loading="lazy"
                    className="w-16 h-16 rounded-xl object-cover border border-emerald-100 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-semibold text-lg border border-emerald-100">
                    {initials}
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <a
                    href={`https://twitter.com/${formatHandle(activist.x_handle)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-900"
                  >
                    {profile?.displayName ?? activist.name}
                    <Twitter className="w-4 h-4" aria-hidden />
                  </a>
                  <p className="text-sm text-gray-500">
                    @{formatHandle(activist.x_handle)}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-800 border-emerald-100"
                    >
                      {activist.continent}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={confidenceClasses[activist.handle_confidence]}
                      title={confidenceCopy[activist.handle_confidence]}
                    >
                      {activist.handle_confidence} confidence
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {bio}
              </p>
              {profile?.fetchedAt && (
                <div className="text-xs text-gray-400 mt-4 pt-4 border-t border-emerald-50">
                  Synced from X on{" "}
                  {new Date(profile.fetchedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              )}
            </article>
          );
        })}
      </div>

      {filteredActivists.length === 0 && (
        <div className="text-center py-12 border border-dashed border-emerald-200 rounded-2xl mt-8">
          <p className="text-lg font-medium text-emerald-900">
            No activists match your filters yet
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Try selecting a different region or clearing the search field.
          </p>
        </div>
      )}
    </section>
  );
}
