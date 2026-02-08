import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowLeft, ChevronUp, ChevronDown, Send, Users, Clock, AlertTriangle, X } from "lucide-react";
import { fetchSolutions, createSolution, voteSolution } from "../utils/api";
import type { Solution, SolutionRecord, EcoProblem } from "../types";
import { useI18n } from "../i18n";

interface ProblemSolutionPageProps {
  problem: EcoProblem;
  onClose: () => void;
}

const formatPostDate = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const mapRecordToSolution = (solution: SolutionRecord): Solution => ({
  id: solution.id,
  author: solution.author,
  timePosted: formatPostDate(solution.time_posted),
  content: solution.content,
  votes: solution.votes,
  upvoted: false,
  downvoted: false,
});

export function ProblemSolutionPage({ problem, onClose }: ProblemSolutionPageProps) {
  const { 
    id, 
    title, 
    description, 
    imageUrl, 
    urgencyLevel, 
    impactedPopulation, 
    timeframe, 
    tags 
  } = problem;

  const { t } = useI18n();
  

  const [inputValue, setInputValue] = useState("");
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [loading, setLoading] = useState(false);
  

  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const allSolutions = await fetchSolutions();
        if (!active) return;
        
        const relevantSolutions = allSolutions
          .filter(s => Number(s.problemId) === Number(id))
          .map(mapRecordToSolution);
          
        setSolutions(relevantSolutions);
      } catch (error) {
        console.error("Failed to load solutions", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [id]);

  const getUrgencyColor = (level: number) => {
    if (level >= 90) return "text-red-600";
    if (level >= 70) return "text-orange-600";
    return "text-yellow-600";
  };

  const handleVote = async (solutionId: string, direction: 'up' | 'down') => {
    setSolutions((prevSolutions) => {
      return prevSolutions.map((solution) => {
        if (solution.id !== solutionId) return solution;

        const currentlyUpvoted = solution.upvoted;
        const currentlyDownvoted = solution.downvoted;
        let newVotes = solution.votes;

        if (direction === 'up') {
            if (currentlyUpvoted) newVotes -= 1;
            else {
                newVotes += 1;
                if (currentlyDownvoted) newVotes += 1;
            }
        } else {
            if (currentlyDownvoted) newVotes += 1;
            else {
                newVotes -= 1;
                if (currentlyUpvoted) newVotes -= 1;
            }
        }

        return {
          ...solution,
          votes: newVotes,
          upvoted: direction === 'up' ? !currentlyUpvoted : false,
          downvoted: direction === 'down' ? !currentlyDownvoted : false,
        };
      });
    });

    try {
      await voteSolution(solutionId, direction === 'up' ? 1 : -1);
    } catch (error) {
      console.error("Vote failed", error);
    }
  };

  const handleInitialSubmit = () => {
    if (!inputValue.trim()) return;
    setIsNameModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    const contentTrimmed = inputValue.trim();
    const authorTrimmed = authorName.trim() || "Anonymous Hero"; // Дефолтне ім'я, якщо пусте

    if (!contentTrimmed) return;

    try {
      const newRecord = await createSolution({
        problemId: id,
        content: contentTrimmed,
        author: authorTrimmed, 
      });

      const newSolution = mapRecordToSolution(newRecord);
      setSolutions(prev => [newSolution, ...prev]);
      

      setInputValue("");
      setAuthorName("");
      setIsNameModalOpen(false);

    } catch (error) {
      console.error("Failed to post solution", error);
      alert("Error posting solution. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white pb-32 relative">

      <div className="bg-white border-b border-emerald-100 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-emerald-900 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("solutions.back", "Back to All Issues")}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-white rounded-b-2xl overflow-hidden shadow-lg">

          <div className="relative h-80 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className={`w-5 h-5 ${getUrgencyColor(urgencyLevel)} bg-white rounded-full p-1`} />
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-900">
                  {urgencyLevel}% Urgency
                </span>
              </div>
              <h1 className="text-white mb-2">{title}</h1>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-gray-700">{description}</p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">{t("card.population", "Affected Population")}</p>
                  <p className="text-sm">{impactedPopulation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <div>
                  <p className="text-xs text-gray-500">{t("card.timeframe", "Critical Timeframe")}</p>
                  <p className="text-sm">{timeframe}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        <div className="mb-6">
          <h2 className="text-emerald-900 mb-2">{t("solutions.community", "Community Solutions")}</h2>
          <p className="text-gray-600">
            {t("solutions.communitySub", "Share and discover actionable solutions from people around the world")}
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
             <div className="text-center py-10 text-gray-500">Loading solutions...</div>
          ) : solutions.length === 0 ? (
            <div className="bg-white border border-dashed border-emerald-200 rounded-xl p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-emerald-900 mb-2">{t("solutions.noneTitle", "No shared solutions yet")}</p>
              <p className="text-gray-600">{t("solutions.noneSub", "Be the first to suggest an action plan for this challenge.")}</p>
            </div>
          ) : (
            solutions.map((solution) => (
              <div
                key={solution.id}
                className="bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 p-6">
                  <div className="flex flex-col items-center gap-1 min-w-[40px]">
                    <button
                      onClick={() => handleVote(solution.id, 'up')}
                      className={`p-1 rounded hover:bg-emerald-50 transition-colors ${
                        solution.upvoted ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      <ChevronUp className="w-6 h-6" />
                    </button>
                    <span className={`${
                      solution.upvoted ? 'text-emerald-600' : solution.downvoted ? 'text-red-600' : 'text-gray-700'
                    }`}>
                      {solution.votes}
                    </span>
                    <button
                      onClick={() => handleVote(solution.id, 'down')}
                      className={`p-1 rounded hover:bg-red-50 transition-colors ${
                        solution.downvoted ? 'text-red-600' : 'text-gray-400'
                      }`}
                    >
                      <ChevronDown className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-emerald-700 font-medium">{solution.author}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-500">{solution.timePosted}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{solution.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 shadow-lg z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleInitialSubmit(); // Викликаємо відкриття модалки
                  }
                }}
                placeholder={t("solutions.placeholder", "Share your solution or idea...")}
                className="w-full px-4 py-3 pr-12 rounded-2xl border border-emerald-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-none bg-white transition-all"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
              />
            </div>
            <Button
              onClick={handleInitialSubmit}
              disabled={!inputValue.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-12 px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {t("solutions.hint", "Press Enter to send, Shift + Enter for new line")}
          </p>
        </div>
      </div>

      {isNameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-emerald-50/50">
              <h3 className="font-semibold text-emerald-900">Майже готово!</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 text-gray-500" 
                onClick={() => setIsNameModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Як вас підписати під цим рішенням?
              </p>
              
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Ваше ім'я</label>
                <input 
                  type="text" 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Олексій, Марія або Нікнейм"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        handleFinalSubmit();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setIsNameModalOpen(false)}
                >
                    Скасувати
                </Button>
                <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={handleFinalSubmit}
                >
                    Опублікувати
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}