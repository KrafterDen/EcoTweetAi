import { ArrowDown, X } from "lucide-react";

interface TutorialTooltipProps {
  step: number;
  onClose: () => void;
}

export function TutorialTooltip({ step, onClose }: TutorialTooltipProps) {
  if (step === 0) return null;

const messages = {
    1: "👋 Ласкаво просимо! Спершу оберіть свій регіон, щоб побачити найактуальніші екологічні проблеми для вашої місцевості.",
    2: "✅ Чудово! Тепер прокрутіть униз, щоб дослідити критичні екологічні питання та дізнатися, як ви можете діяти."
  };

  const message = messages[step as keyof typeof messages];

  if (!message) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40 pointer-events-none" />
      
      {/* Floating tooltip */}
      <div 
        className="fixed left-1/2 -translate-x-2/4 z-50 animate-in fade-in slide-in-from-top-4 duration-500"
        style={{ 
          top: step === 1 ? '40%' : '50%',
        }}
      >
        {/* Arrow pointer pointing down */}
        <div className="flex justify-center mb-[-8px]">
          <div className="w-4 h-4 bg-emerald-700 rotate-45 shadow-lg"></div>
        </div>
        
        {/* Tooltip content */}
        <div className="bg-emerald-700 text-white px-6 py-4 rounded-xl shadow-2xl max-w-[400px]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="leading-relaxed">{message}</p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-emerald-600 rounded transition-colors"
              aria-label="Close tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Animated bounce arrow below */}
        <div className="flex justify-center mt-2 animate-bounce">
          <ArrowDown className="w-5 h-5 text-emerald-700" />
        </div>
      </div>
    </>
  );
}
