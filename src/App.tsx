import { EcoProblemCard } from "./components/EcoProblemCard";
import { StatCard } from "./components/StatCard";
import { Header } from "./components/Header";
import { ProblemSolutionPage } from "./components/ProblemSolutionPage";
import { RegionSelector } from "./components/RegionSelector";
import { TutorialTooltip } from "./components/TutorialTooltip";
import { Button } from "./components/ui/button";
import { AlertCircle, ArrowLeft, ArrowRight, Globe, Leaf } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import ecoProblemsData from "./data/EcoProblems.json";
import { ActivistResources } from "./components/ActivistResources";

type RegionValue =
  | "GLOBAL"
  | "ASIA"
  | "EUROPE"
  | "NORTH_AMERICA"
  | "SOUTH_AMERICA"
  | "AFRICA"
  | "ANTARCTICA"
  | "OCEANIA";

interface EcoProblem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  urgencyLevel: number;
  impactedPopulation: string;
  timeframe: string;
  tags: string[];
  continent: string;
  lastUpdated: string;
}

type EcoProblemRecord = {
  id: string;
  continent: string;
  title: string;
  description: string;
  urgency_percent: number;
  affected_population: number;
  critical_timeframe: string;
  tags: string[];
  image_url: string;
  last_updated: string;
};

const regionToContinentMap: Record<RegionValue, string | null> = {
  GLOBAL: null,
  ASIA: "Asia",
  EUROPE: "Europe",
  NORTH_AMERICA: "North America",
  SOUTH_AMERICA: "South America",
  AFRICA: "Africa",
  ANTARCTICA: "Antarctica",
  OCEANIA: "Oceania",
};

const formatPopulation = (value: number) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B people`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M people`;
  }
  return `${value.toLocaleString()} people`;
};

const allEcoProblems: EcoProblem[] = (ecoProblemsData as EcoProblemRecord[]).map(
  (problem) => ({
    id: problem.id,
    continent: problem.continent,
    title: problem.title,
    description: problem.description,
    imageUrl: problem.image_url,
    urgencyLevel: problem.urgency_percent,
    impactedPopulation: formatPopulation(problem.affected_population),
    timeframe: problem.critical_timeframe,
    tags: problem.tags,
    lastUpdated: problem.last_updated,
  })
);

const stats = [
  { value: "1.5°C", label: "Global Temperature Rise Since 1850", trend: "+0.2°C/decade" },
  { value: "1M+", label: "Species at Risk of Extinction", trend: "Accelerating" },
  { value: "8M Tons", label: "Plastic Entering Oceans Yearly", trend: "Increasing" },
  { value: "7M", label: "Annual Deaths from Air Pollution", trend: "Rising" }
];

type AppView = "home" | "resources";

const getInitialView = (): AppView => {
  if (typeof window !== "undefined" && window.location.hash === "#resources") {
    return "resources";
  }
  return "home";
};

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<EcoProblem | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<RegionValue>("GLOBAL");
  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [highlightTakeAction, setHighlightTakeAction] = useState(false);
  const [view, setView] = useState<AppView>(() => getInitialView());
  
  const regionSelectorRef = useRef<HTMLDivElement>(null);
  const problemsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tutorialStep === 1 && regionSelectorRef.current) {
      // Scroll to region selector with some offset
      const elementTop = regionSelectorRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - 150,
        behavior: "smooth"
      });
    } else if (tutorialStep === 2 && problemsGridRef.current) {
      // Scroll to problems grid
      const elementTop = problemsGridRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - 100,
        behavior: "smooth"
      });
    }
  }, [tutorialStep]);

  const handleSavePlanetClick = () => {
    setHighlightTakeAction(true);
    setTimeout(() => setHighlightTakeAction(false), 3000);
  };

  const handleTakeActionClick = () => {
    setTutorialStep(1);
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleHashChange = () => {
      setView(getInitialView());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigateTo = (next: AppView) => {
    setView(next);
    if (typeof window !== "undefined") {
      if (next === "resources") {
        window.location.hash = "#resources";
      } else {
        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value as RegionValue);
    if (tutorialStep === 1) {
      setTutorialStep(2);
    }
  };

  const filteredProblems = useMemo(() => {
    const continent = regionToContinentMap[selectedRegion];
    if (!continent) {
      return allEcoProblems;
    }
    return allEcoProblems.filter((problem) => problem.continent === continent);
  }, [selectedRegion]);

  const closeTutorial = () => {
    setTutorialStep(0);
  };

  if (selectedProblem) {
    return (
      <ProblemSolutionPage
        {...selectedProblem}
        onBack={() => setSelectedProblem(null)}
      />
    );
  }

  if (view === "resources") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <Header onNavigateToResources={() => navigateTo("resources")} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-600">
                Movement Leaders
              </p>
              <h1 className="text-3xl md:text-4xl font-semibold text-emerald-950">
                Global Environmental Activists
              </h1>
              <p className="text-gray-600 max-w-2xl">
                Discover the scientists, organizers, diplomats, and storytellers
                leading the fight for climate justice. Follow them on X to keep
                their work amplified in your network.
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => navigateTo("home")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to main page
            </Button>
          </div>
          <ActivistResources />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navigation Header */}
      <Header onNavigateToResources={() => navigateTo("resources")} />
      
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
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50" onClick={handleSavePlanetClick}>
                Save Planet
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className={`border-white text-white hover:bg-white/10 transition-all ${
                  highlightTakeAction ? 'ring-4 ring-yellow-400 ring-opacity-75 animate-pulse' : ''
                }`}
                onClick={handleTakeActionClick}
              >
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
          <RegionSelector
            value={selectedRegion}
            onChange={handleRegionChange}
            ref={regionSelectorRef}
          />
          <h2 className="mb-4 mt-6">
            Priority Environmental Issues
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These interconnected ecological crises require urgent global cooperation and action. 
            Each problem compounds the others, creating a critical need for comprehensive solutions.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16" ref={problemsGridRef}>
          {filteredProblems.length === 0 ? (
            <div className="col-span-full text-center bg-white border border-dashed border-emerald-200 rounded-2xl p-10 shadow-sm">
              <Globe className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-emerald-900">No data for this localization yet</h3>
              <p className="text-gray-600 mt-2">Try selecting a different region to explore more ecological challenges.</p>
            </div>
          ) : (
            filteredProblems.map((problem) => (
            <EcoProblemCard key={problem.id} {...problem} onTakeAction={() => setSelectedProblem(problem)} />
            ))
          )}
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
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50" onClick={handleTakeActionClick}>
              Get Involved
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Share This Information
            </Button>
          </div>
        </div>
      </main>

      {/* Tutorial Tooltip */}
      {tutorialStep > 0 && (
        <TutorialTooltip
          step={tutorialStep}
          onClose={closeTutorial}
        />
      )}
    </div>
  );
}
