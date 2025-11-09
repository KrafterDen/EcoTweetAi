import { useMemo, useRef, useLayoutEffect, useState } from "react";
import { EcoProblemCard } from "./components/EcoProblemCard";
import { StatCard } from "./components/StatCard";
import { Header } from "./components/Header";
import { Button } from "./components/ui/button";
import ecoProblemsData from "./data/EcoProblems.json";
import { AlertCircle, ArrowRight, Globe, Leaf } from "lucide-react";

const selectableRegions = [
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Africa",
  "Antarctica",
  "Oceania",
  "GLOBAL"
] as const;

type RegionOption = (typeof selectableRegions)[number];
type Continent = Exclude<RegionOption, "GLOBAL">;

type RawEcoProblem = {
  id: string;
  continent: Continent;
  title: string;
  description: string;
  urgency_percent: number;
  affected_population: number;
  critical_timeframe: string;
  tags: string[];
  image_url?: string;
  last_updated: string;
};

const rawEcoProblems = ecoProblemsData as RawEcoProblem[];

const continentImageMap: Record<Continent, string> = {
  Asia: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80",
  Europe: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1080&q=80",
  "North America": "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1080&q=80",
  "South America": "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1080&q=80",
  Africa: "https://images.unsplash.com/photo-1491897554428-130a60dd4757?auto=format&fit=crop&w=1080&q=80",
  Antarctica: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
  Oceania: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80"
};

const defaultRegionImage = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1080&q=80";

const stats = [
  { value: "1.5°C", label: "Global Temperature Rise Since 1850", trend: "+0.2°C/decade" },
  { value: "1M+", label: "Species at Risk of Extinction", trend: "Accelerating" },
  { value: "8M Tons", label: "Plastic Entering Oceans Yearly", trend: "Increasing" },
  { value: "7M", label: "Annual Deaths from Air Pollution", trend: "Rising" }
];

const formatPopulation = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
};

export default function App() {
  const [selectedRegion, setSelectedRegion] = useState<RegionOption>("GLOBAL");

  const filteredProblems = useMemo(() => {
    const relevantProblems =
      selectedRegion === "GLOBAL"
        ? rawEcoProblems
        : rawEcoProblems.filter((problem) => problem.continent === selectedRegion);

    return relevantProblems.map((problem) => ({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      urgencyLevel: problem.urgency_percent,
      impactedPopulation: formatPopulation(problem.affected_population),
      timeframe: problem.critical_timeframe,
      tags: problem.tags,
      imageUrl: problem.image_url || continentImageMap[problem.continent] || defaultRegionImage
    }));
  }, [selectedRegion]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navigation Header */}
      <Header />
      
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-emerald-900 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span className="text-red-400 uppercase tracking-wider">Critical Issues</span>
            </div>
            <h1 className="text-white mb-6">
              The Most Pressing Ecological Problems of Our Time
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Understanding the urgent environmental challenges we face is the first step toward meaningful action. 
              These are the critical issues demanding immediate attention.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                Save Planet
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Take Action!
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-emerald-600" />
            {(() => {
              const MeasureableSelect = () => {
                const measureRef = useRef<HTMLSpanElement | null>(null);
                const [selectWidth, setSelectWidth] = useState<number>();

                useLayoutEffect(() => {
                  if (measureRef.current) {
                    const rect = measureRef.current.getBoundingClientRect();
                    // Add room for the caret/check icon and borders
                    setSelectWidth(rect.width + 28);
                  }
                }, [selectedRegion]);

                return (
                  <div
                    className="relative inline-block align-middle group"
                    style={selectWidth ? { width: `${selectWidth}px` } : undefined}
                  >
                    {/* Invisible measurement span to size select to content */}
                    <span
                      ref={measureRef}
                      className="invisible absolute -z-10 whitespace-nowrap uppercase tracking-wider text-base font-semibold px-3 py-1"
                    >
                      {selectedRegion}
                    </span>

                    <select
                      aria-label="Select region"
                      className="appearance-none w-full bg-transparent border border-transparent text-emerald-700 uppercase tracking-wider text-base font-semibold px-3 py-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 hover:bg-white hover:border-emerald-200 transition-colors"
                      value={selectedRegion}
                      onChange={(event) => setSelectedRegion(event.target.value as RegionOption)}
                    >
                      {selectableRegions.map((region) => (
                        <option key={region} value={region} className="text-emerald-900">
                          {region}
                        </option>
                      ))}
                    </select>

                    {/* Intentionally no dropdown icon per request */}
                  </div>
                );
              };

              return <MeasureableSelect />;
            })()}
          </div>
          <h2 className="mb-4">
            Priority Environmental Issues
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These interconnected ecological crises require urgent global cooperation and action. 
            Each problem compounds the others, creating a critical need for comprehensive solutions.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filteredProblems.map((problem) => (
            <EcoProblemCard key={problem.id} {...problem} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <Leaf className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-white mb-4">
            Every Action Counts
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            While these challenges are daunting, collective action and individual choices can make a difference. 
            Stay informed, reduce your environmental impact, and support sustainable initiatives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
              Get Involved
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Share This Information
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white mb-4">About This Initiative</h3>
              <p className="text-sm">
                Raising awareness about critical ecological issues to inspire action and promote sustainable solutions for our planet's future.
              </p>
            </div>
            <div>
              <h3 className="text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Climate Science Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conservation Organizations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainable Living Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Policy & Advocacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white mb-4">Take Action</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Reduce Carbon Footprint</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Clean Energy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Protect Biodiversity</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Join Local Initiatives</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Ecological Awareness Initiative. Updated November 2025.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
