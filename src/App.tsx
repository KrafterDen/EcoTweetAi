import { EcoProblemCard } from "./components/EcoProblemCard";
// StatCard больше не нужен для новой сложной верстки, мы сделаем кастомные карточки
// import { StatCard } from "./components/StatCard"; 
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { RegistrationForm } from "./components/RegistrationForm";
import { ProblemSolutionPage } from "./components/ProblemSolutionPage";
import { RegionSelector } from "./components/RegionSelector";
import { TutorialTooltip } from "./components/TutorialTooltip";
import { ReportProblemForm } from "./components/ReportProblemForm";
import { Button } from "./components/ui/button";
import { 
  ArrowLeft, 
  Globe, 
  Leaf, 
  MapPin, 
  AlertTriangle, 
  Lightbulb, 
  Trophy, 
  Activity, 
  ArrowRight,
  User
} from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import ecoProblemsData from "./data/EcoProblems.json";
import { ActivistResources } from "./components/ActivistResources";
import { EcoProblem, EcoProblemRecord, RegionValue } from "./types";
import { regionToContinentMap } from "./data/regions";
import { deriveHighlights } from "./utils/highlights";
import { getCustomProblems, addCustomProblem } from "./utils/customProblemsStorage";
import type { ReportProblemPayload } from "./components/ReportProblemForm";

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
    country: problem.country,
    city: problem.city,
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

type AppView = "home" | "resources" | "involved";

const getInitialView = (): AppView => {
  if (typeof window !== "undefined") {
    if (window.location.hash === "#resources") {
      return "resources";
    }
    if (window.location.hash === "#involved") {
      return "involved";
    }
  }
  return "home";
};

export default function App() {
  const [selectedProblem, setSelectedProblem] = useState<EcoProblem | null>(null);
  const [problems, setProblems] = useState<EcoProblem[]>(() => [
    ...allEcoProblems,
    ...getCustomProblems(),
  ]);
  
  // Состояние для сложного селектора
  const [selectedRegion, setSelectedRegion] = useState<RegionValue>("GLOBAL");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [highlightTakeAction, setHighlightTakeAction] = useState(false);
  const [view, setView] = useState<AppView>(() => getInitialView());
  const [reportProblemOpen, setReportProblemOpen] = useState(false);
  const highlights = deriveHighlights(problems);
  
  const regionSelectorRef = useRef<HTMLDivElement>(null);
  const problemsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tutorialStep === 1 && regionSelectorRef.current) {
      const elementTop = regionSelectorRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementTop - 150,
        behavior: "smooth"
      });
    } else if (tutorialStep === 2 && problemsGridRef.current) {
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
      } else if (next === "involved") {
        window.location.hash = "#involved";
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

  // Хендлеры для обновления состояния селектора
  const handleRegionChange = (value: RegionValue) => {
    setSelectedRegion(value);
    // При смене региона сбрасываем страну и город
    setSelectedCountry(null);
    setSelectedCity(null);
    
    if (tutorialStep === 1) {
      setTutorialStep(2);
    }
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    // При смене страны сбрасываем город
    setSelectedCity(null);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  const timeframeLabels: Record<string, string> = {
    next_5_years: "Next 5 years",
    next_10_years: "Next 10 years",
    next_20_years: "Next 20 years",
  };

  const handleProblemSubmit = (payload: ReportProblemPayload) => {
    const affected = payload.affectedPopulation ?? null;
    const continent =
      regionToContinentMap[payload.region] ?? "Global";

    const newProblem: EcoProblem = {
      id: `custom-${Date.now()}`,
      continent: continent || "Global",
      country: payload.country ?? null,
      city: payload.city ?? null,
      title: payload.title,
      description: payload.description,
      imageUrl:
        payload.imageUrl ||
        "https://images.pexels.com/photos/2409022/pexels-photo-2409022.jpeg",
      urgencyLevel: payload.urgency,
      impactedPopulation: affected ? formatPopulation(affected) : "Unknown",
      timeframe: timeframeLabels[payload.timeframe] || payload.timeframe,
      tags: payload.tags,
      lastUpdated: new Date().toISOString(),
    };

    const updatedCustom = addCustomProblem(newProblem);
    setProblems([...allEcoProblems, ...updatedCustom]);
    setReportProblemOpen(false);
  };

  const filteredProblems = useMemo(() => {
    const continent = regionToContinentMap[selectedRegion];
    let currentProblems = !continent
      ? problems
      : problems.filter((problem) => problem.continent === continent);

    if (selectedCountry && currentProblems.some((problem) => problem.country)) {
      currentProblems = currentProblems.filter((problem) => problem.country === selectedCountry);
    }

    if (selectedCity && currentProblems.some((problem) => problem.city)) {
      currentProblems = currentProblems.filter((problem) => problem.city === selectedCity);
    }

    return currentProblems;
  }, [selectedRegion, selectedCountry, selectedCity, problems]);

  const closeTutorial = () => {
    setTutorialStep(0);
  };

  const reportProblemOverlay = reportProblemOpen ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={() => setReportProblemOpen(false)}
    >
          <div
            className="max-h-[90vh] overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
        <ReportProblemForm onSubmit={handleProblemSubmit} />
      </div>
    </div>
  ) : null;

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
        <Header
          onNavigateToResources={() => navigateTo("resources")}
          onReportProblem={() => setReportProblemOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Resource View Content */}
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
        {reportProblemOverlay}
      </div>
    );
  }

  if (view === "involved") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <Header
          onNavigateToResources={() => navigateTo("resources")}
          onNavigateToInvolved={() => navigateTo("involved")}
          onReportProblem={() => setReportProblemOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
          <RegistrationForm />
        </main>
        {reportProblemOverlay}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Navigation Header */}
      <Header
        onNavigateToResources={() => navigateTo("resources")}
        onNavigateToInvolved={() => navigateTo("involved")}
        onReportProblem={() => setReportProblemOpen(true)}
      />

      <HeroSection
        highlightTakeAction={highlightTakeAction}
        onSavePlanetClick={handleSavePlanetClick}
        onTakeActionClick={handleTakeActionClick}
      />

      {/* NEW STATS SECTION (Custom Layout) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Problem of the Week */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/60 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  Problem of the Week
                </span>
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-900 leading-tight mb-1">
                {highlights.problem.title}
              </h3>
              <div className="flex items-center text-xs text-gray-500 mb-3 space-x-2">
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-0.5" />
                  {highlights.problem.location}
                </div>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <div className="text-amber-600 font-medium">{highlights.problem.urgency}% Urgency</div>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500">
              <span className="bg-gray-100 p-1 rounded-full mr-2">
                 <User className="w-3 h-3 text-gray-600"/>
              </span>
              Suggested by <span className="font-medium text-gray-900 ml-1">{highlights.problem.suggestedBy}</span>
            </div>
          </div>

          {/* Card 2: Solution of the Week */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/60 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  Solution of the Week
                </span>
                <Lightbulb className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="font-semibold text-gray-900 leading-tight mb-1">
                {highlights.solution.title}
              </h3>
              <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                {highlights.solution.snippet}
              </p>
              <div className="text-[10px] text-gray-400">
                Fix for: <span className="text-gray-600">{highlights.solution.problemTitle}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100 flex items-center text-xs text-gray-500 mt-2">
              <span className="bg-gray-100 p-1 rounded-full mr-2">
                 <User className="w-3 h-3 text-gray-600"/>
              </span>
              Proposed by <span className="font-medium text-gray-900 ml-1">{highlights.solution.author}</span>
            </div>
          </div>

          {/* Card 3: Eco-Hero of the Week */}
          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/60 hover:shadow-md transition-all flex flex-col justify-between h-full bg-gradient-to-br from-white to-purple-50/30">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  Eco-Hero
                </span>
                <Trophy className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex items-center space-x-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border-2 border-white shadow-sm">
                   {highlights.hero.initials}
                 </div>
                 <div>
                    <h3 className="font-bold text-gray-900">{highlights.hero.handle}</h3>
                    <div className="text-xs text-gray-500">Most active contributor</div>
                 </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="bg-white rounded border border-gray-100 py-1">
                      <div className="text-xs font-bold text-gray-800">{highlights.hero.issues}</div>
                      <div className="text-xs text-gray-400">Issues</div>
                  </div>
                  <div className="bg-white rounded border border-gray-100 py-1">
                      <div className="text-xs font-bold text-gray-800">{highlights.hero.solutions}</div>
                      <div className="text-xs text-gray-400">Sols</div>
                  </div>
                  <div className="bg-white rounded border border-gray-100 py-1">
                      <div className="text-xs font-bold text-gray-800">{highlights.hero.votes}</div>
                      <div className="text-xs text-gray-400">Votes</div>
                  </div>
              </div>
            </div>
          </div>

          {/* Card 4: Community Impact */}
          <div className="bg-emerald-600 p-5 rounded-xl shadow-sm border border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between h-full text-white">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-emerald-50 leading-tight">
                  Community Impact
                </h3>
                <Activity className="w-4 h-4 text-emerald-200" />
              </div>
              <div className="space-y-1.5 mb-3">
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">New Problems</span>
                    <span className="font-bold">+{highlights.impact.problems}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">New Solutions</span>
                    <span className="font-bold">+{highlights.impact.solutions}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="text-emerald-100">Votes Cast</span>
                    <span className="font-bold">{highlights.impact.votes}</span>
                 </div>
              </div>
            </div>
            <button 
                onClick={() => navigateTo("involved")}
                className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-white transition-colors flex items-center justify-center"
            >
              Join the action
              <ArrowRight className="w-3 h-3 ml-1.5" />
            </button>
          </div>

        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="text-center mb-12">
          
          {/* ОБНОВЛЕННЫЙ КОМПОНЕНТ СЕЛЕКТОРА */}
          <RegionSelector
            selectedRegion={selectedRegion}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            onRegionChange={handleRegionChange}
            onCountryChange={handleCountryChange}
            onCityChange={handleCityChange}
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
            <Button
              size="lg"
              className="bg-white text-emerald-900 hover:bg-emerald-50"
              onClick={() => navigateTo("involved")}
            >
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
      {reportProblemOverlay}
    </div>
  );
}
