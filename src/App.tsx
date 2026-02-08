import { useState, useRef, useEffect, useMemo } from "react";
import { 
  ArrowLeft, Globe, Leaf, MapPin, AlertTriangle, Lightbulb, 
  Trophy, Activity, ArrowRight, User
} from "lucide-react";

import { EcoProblemCard } from "./components/EcoProblemCard";
import { Header } from "./components/Header";
import { HeroSection } from "./components/HeroSection";
import { RegistrationForm } from "./components/RegistrationForm";
import { ProblemSolutionPage } from "./components/ProblemSolutionPage";
import { RegionSelector } from "./components/RegionSelector";
import { TutorialTooltip } from "./components/TutorialTooltip";
import { ReportProblemForm } from "./components/ReportProblemForm";
import { ActivistResources } from "./components/ActivistResources";
import { Button } from "./components/ui/button";

import { AdminPanel } from "./components/AdminPanel"; 
import { AdminLoginModal } from "./components/AdminLoginModal"; 
import { Dialog, DialogContent } from "./components/ui/dialog"; 
import { AdminDemoOverlay } from "./components/AdminDemoOverlay";

import { regionToContinentMap } from "./data/regions";
import { deriveHighlights } from "./utils/highlights";
import { fetchProblems, fetchSolutions, createProblem, uploadAttachment } from "./utils/api";
import { useI18n } from "./i18n";

import type { ReportProblemPayload, EcoProblem, RegionValue, SolutionRecord } from "./types";

const formatPopulation = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} млрд людей`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} млн людей`;
  return `${value.toLocaleString()} людей`;
};

type AppView = "home" | "resources" | "involved";

const getInitialView = (): AppView => {
  if (typeof window !== "undefined") {
    if (window.location.hash === "#resources") return "resources";
    if (window.location.hash === "#involved") return "involved";
  }
  return "home";
};

export default function App() {
  const { t } = useI18n();

  const [selectedProblem, setSelectedProblem] = useState<EcoProblem | null>(null);
  const [problems, setProblems] = useState<EcoProblem[]>([]);
  const [solutions, setSolutions] = useState<SolutionRecord[]>([]);

  const [selectedRegion, setSelectedRegion] = useState<RegionValue>("EUROPE");
  const [selectedCountry, setSelectedCountry] = useState<string | null>("Ukraine");
  const [selectedCity, setSelectedCity] = useState<string | null>("Kyiv");

  const [tutorialStep, setTutorialStep] = useState<number>(0);
  const [highlightTakeAction, setHighlightTakeAction] = useState(false);
  const [view, setView] = useState<AppView>(() => getInitialView());
  const [reportProblemOpen, setReportProblemOpen] = useState(false);

  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminDemo, setShowAdminDemo] = useState(false);

  const highlights = deriveHighlights(problems, solutions);
  
  const regionSelectorRef = useRef<HTMLDivElement>(null);
  const problemsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [apiProblems, apiSolutions] = await Promise.all([
          fetchProblems(),
          fetchSolutions()
        ]);
        if (!active) return;
        setProblems(apiProblems);
        setSolutions(apiSolutions);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (tutorialStep === 1 && regionSelectorRef.current) {
      const elementTop = regionSelectorRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementTop - 150, behavior: "smooth" });
    } else if (tutorialStep === 2 && problemsGridRef.current) {
      const elementTop = problemsGridRef.current.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: elementTop - 100, behavior: "smooth" });
    }
  }, [tutorialStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHashChange = () => setView(getInitialView());
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateTo = (next: AppView) => {
    setView(next);
    if (typeof window !== "undefined") {
      if (next === "resources") window.location.hash = "#resources";
      else if (next === "involved") window.location.hash = "#involved";
      else window.history.replaceState(null, "", window.location.pathname + window.location.search);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRegionChange = (value: RegionValue) => {
    setSelectedRegion(value);
    setSelectedCountry(null);
    setSelectedCity(null);
    if (tutorialStep === 1) setTutorialStep(2);
  };

  const handleCountryChange = (value: string) => {
    setSelectedCountry(value);
    setSelectedCity(null);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  const handleProblemSubmit = async (payload: ReportProblemPayload) => {
    try {
      let imageUrl = payload.imageUrl;
      if (!imageUrl && payload.imageFile) {
        try {
          imageUrl = await uploadAttachment(payload.imageFile);
        } catch (e) {
          console.error("Image upload failed:", e);
        }
      }
      const created = await createProblem({ ...payload, imageUrl });
      setProblems((prev) => [created, ...prev]);
    } catch (error) {
      console.error("Failed to create problem:", error);
      alert("Не вдалося зберегти проблему.");
    } finally {
      setReportProblemOpen(false);
    }
  };

  const filteredProblems = useMemo(() => {
    const continent = regionToContinentMap[selectedRegion];
    let currentProblems = !continent
      ? problems
      : problems.filter((p) => p.continent === continent);

    if (selectedCountry) {
      currentProblems = currentProblems.filter((p) => p.country === selectedCountry);
    }
    if (selectedCity) {
      currentProblems = currentProblems.filter((p) => p.city === selectedCity);
    }
    return currentProblems;
  }, [problems, selectedRegion, selectedCountry, selectedCity]);

  const handleSavePlanetClick = () => {
    setHighlightTakeAction(true);
    setTimeout(() => setHighlightTakeAction(false), 3000);
  };

  const closeTutorial = () => {
    setTutorialStep(0);
  };

  if (showAdminPanel) {
    return <AdminPanel onClose={() => setShowAdminPanel(false)} />;
  }

  if (selectedProblem) {
    return (
      <ProblemSolutionPage
        problem={selectedProblem}
        onClose={() => setSelectedProblem(null)}
      />
    );
  }

  if (view === "resources") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
        <Header
          onNavigateToResources={() => navigateTo("resources")}
          onNavigateToInvolved={() => navigateTo("involved")}
          onReportProblem={() => setReportProblemOpen(true)}
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
           <ActivistResources onBack={() => navigateTo("home")} />
        </main>
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
          onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center items-center">
          <RegistrationForm />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white text-gray-900 font-sans selection:bg-emerald-200">
      

      <Header
        onNavigateToResources={() => navigateTo("resources")}
        onNavigateToInvolved={() => navigateTo("involved")}
        onReportProblem={() => setReportProblemOpen(true)}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
      />

      <AdminLoginModal 
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLoginSuccess={() => setShowAdminPanel(true)}
      />
      
      {showAdminDemo && (
        <AdminDemoOverlay onClose={() => setShowAdminDemo(false)} />
      )}

      <Dialog open={reportProblemOpen} onOpenChange={setReportProblemOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <ReportProblemForm
            onSubmit={handleProblemSubmit}
          />
        </DialogContent>
      </Dialog>

      <HeroSection 
        onTakeActionClick={() => setTutorialStep(1)} 
        highlight={highlightTakeAction} 
        onSavePlanetClick={handleSavePlanetClick}
      />

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          

          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/60 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {t("highlights.problem", "Problem of the Week")}
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

          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/60 hover:shadow-md transition-all flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  {t("highlights.solution", "Solution of the Week")}
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

          <div className="bg-white p-5 rounded-xl shadow-sm border border-emerald-100/60 hover:shadow-md transition-all flex flex-col justify-between h-full bg-gradient-to-br from-white to-purple-50/30">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {t("highlights.hero", "Eco-Hero")}
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

          {highlights.impact && (
            <div className="bg-emerald-600 p-5 rounded-xl shadow-sm border border-emerald-600 hover:shadow-md transition-all flex flex-col justify-between h-full text-white">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-emerald-50 leading-tight">
                    {t("highlights.impact", "Community Impact")}
                  </h3>
                  <Activity className="w-4 h-4 text-emerald-200" />
                </div>
                <div className="space-y-1.5 mb-3">
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-100">{t("highlights.newProblems", "New Problems")}</span>
                      <span className="font-bold">+{highlights.impact.problems}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-100">{t("highlights.newSolutions", "New Solutions")}</span>
                      <span className="font-bold">+{highlights.impact.solutions}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                      <span className="text-emerald-100">{t("highlights.votesCast", "Votes Cast")}</span>
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
          )}

        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        

        <div className="text-center mb-12">
          
          <RegionSelector
            selectedRegion={selectedRegion}
            selectedCountry={selectedCountry}
            selectedCity={selectedCity}
            onRegionChange={handleRegionChange}
            onCountryChange={handleCountryChange}
            onCityChange={handleCityChange}
            ref={regionSelectorRef}
          />
          

          <h2 className="mb-4 mt-6 text-2xl font-bold text-emerald-950">
            {t("section.title", "Priority Environmental Issues")}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("section.subtitle", "These interconnected ecological crises require urgent global cooperation and action. Each problem compounds the others, creating a critical need for comprehensive solutions.")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 relative" ref={problemsGridRef}>

          {filteredProblems.length === 0 ? (

            <div className="col-span-full text-center bg-white border border-dashed border-emerald-200 rounded-2xl p-10 shadow-sm">
              <Globe className="w-12 h-12 mx-auto text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold text-emerald-900">{t("empty.title", "No data for this localization yet")}</h3>
              <p className="text-gray-600 mt-2">{t("empty.subtitle", "Try selecting a different region to explore more ecological challenges.")}</p>
              <Button 
                  variant="link" 
                  className="text-emerald-600 mt-2"
                  onClick={() => setReportProblemOpen(true)}
                >
                  Be the first to report one
              </Button>
            </div>
          ) : (
            filteredProblems.map((problem: any) => {

              const rawPop = 
                problem.impactedPopulation || 
                problem.affectedPopulation || 
                problem.impacted_population || 
                problem.affected_population || 
                problem.population;

              let displayPop = "Невідомо";
              
              if (rawPop) {

                if (typeof rawPop === 'string' && isNaN(Number(rawPop))) {
                  displayPop = rawPop;
                } else {

                  displayPop = formatPopulation(Number(rawPop));
                }
              }

              let tags = [];
              try {
                tags = Array.isArray(problem.tags) 
                  ? problem.tags 
                  : (problem.tagsJson ? JSON.parse(problem.tagsJson) : []);
              } catch (e) {
                console.error("Error parsing tags", e);
              }

              return (
                <div key={problem.id} className="h-full">
                  <EcoProblemCard 
                    {...problem} 
                    impactedPopulation={displayPop}
                    tags={tags}
                    onTakeAction={() => setSelectedProblem(problem)} 
                  />
                </div>
              );
            })
          )}
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <Leaf className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-white mb-4 text-3xl font-bold">
            {t("cta.title", "Every Action Counts")}
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            {t("cta.subtitle", "While these challenges are daunting, collective action and individual choices can make a difference. Stay informed, reduce your environmental impact, and support sustainable initiatives.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-white text-emerald-900 hover:bg-emerald-50"
              onClick={() => navigateTo("involved")}
            >
              {t("cta.primary", "Get Involved")}
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              {t("cta.secondary", "Share This Information")}
            </Button>
          </div>
        </div>
      </main>

      {tutorialStep > 0 && (
        <TutorialTooltip
          step={tutorialStep}
          onClose={closeTutorial}
        />
      )}

      <footer className="bg-emerald-900 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-5 h-5" /> EcoTweetAI
            </h3>
            <p className="text-emerald-200 text-sm mt-1">Empowering communities through data.</p>
          </div>  
          <div className="text-emerald-200 text-sm">
            © 2026 EcoTweetAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}