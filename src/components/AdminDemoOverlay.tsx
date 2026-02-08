import { useState } from "react";
import { Button } from "./ui/button";
import { Sparkles, X, Loader2, Link as LinkIcon, BrainCircuit, Check } from "lucide-react";
import { EcoProblemCard } from "./EcoProblemCard";
import { MOCK_AI_PROBLEMS } from "../data/mockAiData";
import { createProblem } from "../utils/api";
import type { EcoProblem, RegionValue } from "../types";

interface AdminDemoOverlayProps {
  onClose: () => void;
  onProblemApproved?: () => void;
}

const continentToRegion: Record<string, RegionValue> = {
  "Asia": "ASIA",
  "Europe": "EUROPE",
  "North America": "NORTH_AMERICA",
  "South America": "SOUTH_AMERICA",
  "Africa": "AFRICA",
  "Antarctica": "ANTARCTICA",
  "Oceania": "OCEANIA",
  "Global": "GLOBAL",
};

const parsePopulation = (pop: string | number | undefined): number | null => {
  if (typeof pop === "number") return pop;
  if (!pop) return null;
  const cleaned = pop.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return null;
  if (pop.toLowerCase().includes("m") || pop.includes("M")) return Math.round(num * 1_000_000);
  if (pop.toLowerCase().includes("b") || pop.includes("B")) return Math.round(num * 1_000_000_000);
  if (pop.includes("тис")) return Math.round(num * 1_000);
  return Math.round(num);
};

export function AdminDemoOverlay({ onClose, onProblemApproved }: AdminDemoOverlayProps) {
  const [urlInput, setUrlInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [moderationQueue, setModerationQueue] = useState<EcoProblem[]>([]);
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const handleReject = (problemId: number) => {
    setModerationQueue(prev => prev.filter(p => p.id !== problemId));
  };

  const handleApprove = async (problem: EcoProblem) => {
    setLoadingIds(prev => new Set(prev).add(problem.id));

    try {
      const region = continentToRegion[problem.continent] || "GLOBAL";
      const affectedPopulation = parsePopulation(problem.impactedPopulation);

      await createProblem({
        title: problem.title,
        description: problem.description,
        location: problem.city || problem.country || problem.continent,
        region,
        country: problem.country || null,
        city: problem.city || null,
        affectedPopulation,
        urgency: problem.urgencyLevel,
        tags: problem.tags,
        timeframe: problem.timeframe,
        imageUrl: problem.imageUrl,
      });

      setModerationQueue(prev => prev.filter(p => p.id !== problem.id));
      onProblemApproved?.();
    } catch (error) {
      console.error("Failed to approve problem:", error);
      alert("Не вдалося опублікувати. Спробуйте ще раз.");
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(problem.id);
        return next;
      });
    }
  };

  const startSimulation = () => {
    if (!urlInput) return;
    setIsAnalyzing(true);
    setProgress(0);

    const duration = 1_000; 
    const interval = 100;   
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.round((currentStep / steps) * 100));

      if (currentStep >= steps) {
        clearInterval(timer);
        finishSimulation();
      }
    }, interval);
  };

  const finishSimulation = () => {
    setIsAnalyzing(false);
    setProgress(100);
    setUrlInput("");
    

    setTimeout(() => {
        setModerationQueue(prev => [...MOCK_AI_PROBLEMS, ...prev]);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white animate-in fade-in duration-300 overflow-y-auto">

      <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-emerald-100 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">AI Control Center <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-2">Demo Mode</span></h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 rounded-full">
          <X className="w-6 h-6 text-gray-500" />
        </Button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-12 pb-24">
        

        <section className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl border border-indigo-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Sparkles className="w-64 h-64 text-indigo-600" />
            </div>
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-indigo-900 mb-3">ШІ-Аналіз Джерел</h1>
                <p className="text-gray-600 mb-8">Вставте посилання на пост у соцмережі, новину або фото. Наш ШІ проаналізує контент, визначить локацію, критичність та сформує картку проблеми автоматично.</p>

                <div className="bg-white p-2 rounded-2xl shadow-md border border-indigo-100 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-400 transition-all">
                    <LinkIcon className="w-5 h-5 text-gray-400 ml-3 shrink-0" />
                    <input 
                        type="text" 
                        placeholder="Вставте посилання (наприклад: https://x.com/...)" 
                        className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 py-3"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        disabled={isAnalyzing}
                    />
                    <Button 
                        onClick={startSimulation} 
                        disabled={isAnalyzing || !urlInput}
                        className={`rounded-xl px-6 py-6 text-lg font-medium transition-all ${isAnalyzing ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} text-white shadow-lg hover:shadow-indigo-500/30 shrink-0`}
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                                Аналіз... {progress}%
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6 mr-2" />
                                Запустити AI
                            </>
                        )}
                    </Button>
                </div>

                {isAnalyzing && (
                    <div className="mt-8">
                        <div className="flex justify-between text-sm text-indigo-700 mb-2 font-medium">
                            <span>Обробка даних...</span>
                            <span>AI Engine v2.1</span>
                        </div>
                        <div className="h-3 bg-indigo-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-200 ease-out rounded-full relative"
                                style={{ width: `${progress}%` }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-pulse w-full h-full"></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3 animate-pulse">Це може зайняти деякий час залежно від обсягу даних...</p>
                    </div>
                )}
            </div>
        </section>

        <section>
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-lg">
                    <BrainCircuit className="w-5 h-5 text-yellow-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Черга Модерації (AI Результати)</h2>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                    {moderationQueue.length} нових
                </span>
            </div>

            {moderationQueue.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <p className="text-gray-500 text-lg">Черга порожня. Запустіть AI аналіз, щоб отримати результати.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {moderationQueue.map((problem, index) => (
                        <div 
                            key={problem.id} 
                            className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both flex flex-col h-full relative group"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >

                            <div className="flex-1 bg-white rounded-t-2xl shadow-sm border-x border-t border-gray-200 overflow-hidden relative z-0">

                                <div className="pointer-events-none"> 
                                    <EcoProblemCard 
                                        {...problem}
                                        tags={Array.isArray(problem.tags) ? problem.tags : JSON.parse(problem.tagsJson || "[]")}
                                    />
                                </div>
                            </div>

                            <div className="h-14 flex border-x border-b border-gray-200 rounded-b-2xl overflow-hidden shadow-sm mt-[-1px] z-10 relative bg-white">
                                

                                <button
                                    className="flex-1 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 border-r border-gray-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium group/reject disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleReject(problem.id)}
                                    disabled={loadingIds.has(problem.id)}
                                >
                                    <div className="p-1.5 rounded-full bg-gray-100 group-hover/reject:bg-red-200 transition-colors">
                                        <X className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm">Відхилити</span>
                                </button>

                                <button
                                    className="flex-1 bg-white hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-all duration-200 flex items-center justify-center gap-2 font-bold group/approve disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() => handleApprove(problem)}
                                    disabled={loadingIds.has(problem.id)}
                                >
                                    {loadingIds.has(problem.id) ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Публікація...</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-sm">Опублікувати</span>
                                        <div className="p-1.5 rounded-full bg-emerald-100 group-hover/approve:bg-emerald-600 group-hover/approve:text-white transition-colors">
                                            <Check className="w-4 h-4" />
                                        </div>
                                      </>
                                    )}
                                </button>
                            </div>

                            <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur text-indigo-600 text-xs font-bold px-2 py-1 rounded border border-indigo-100 shadow-sm flex items-center gap-1">
                                <BrainCircuit className="w-3 h-3" />
                                AI Confidence: 98%
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>

      </div>
    </div>
  );
}