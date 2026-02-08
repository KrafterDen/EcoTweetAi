import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";

import { AlertTriangle, ArrowRight, Check, Flag } from "lucide-react"; 
import { useI18n } from "../i18n";

interface EcoProblemCardProps {
  title: string;
  description: string;
  imageUrl: string;
  urgencyLevel: number;
  impactedPopulation: string;
  timeframe: string;
  tags: string[];
  onTakeAction?: () => void;
  onConfirm?: () => void;
  onReport?: () => void; // Добавил проп для обработки жалобы
}

export function EcoProblemCard({
  title,
  description,
  imageUrl,
  urgencyLevel,
  impactedPopulation,
  timeframe,
  tags,
  onTakeAction,
  onConfirm,
  onReport
}: EcoProblemCardProps) {
  const { t } = useI18n();
  const [isConfirmed, setIsConfirmed] = useState(false);
  
  const getUrgencyColor = (level: number) => {
    if (level >= 90) return "text-red-600";
    if (level >= 70) return "text-orange-600";
    return "text-yellow-600";
  };

  const handleConfirmClick = () => {
    if (!isConfirmed) {
        setIsConfirmed(true);
        if (onConfirm) {
            onConfirm();
        }
    }
  };

  const MAX_LENGTH = 100; // Тут можна змінити кількість символів
  
  const displayDescription = description.length > MAX_LENGTH 
    ? description.slice(0, MAX_LENGTH) + "..." 
    : description;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 relative group">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        

        <Button
          variant="ghost"
          size="icon"
          onClick={onReport}
          className="absolute top-4 left-4 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors z-10"
          title="Поскаржитись" // Подсказка при наведении
        >
          <Flag className="w-4 h-4 fill-current" />
        </Button>

        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${getUrgencyColor(urgencyLevel)}`} />
          <span className={`${getUrgencyColor(urgencyLevel)}`}>{urgencyLevel}%</span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="mb-2 font-bold text-lg">{title}</h3>
          <p className="text-gray-600">{displayDescription}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{t("card.urgency", "Urgency Level")}</span>
            <span className={`${getUrgencyColor(urgencyLevel)} font-medium`}>{urgencyLevel}%</span>
          </div>
          <Progress value={urgencyLevel} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-gray-500">{t("card.population", "Affected Population")}</p>
            <p className="text-sm font-medium">{impactedPopulation}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">{t("card.timeframe", "Critical Timeframe")}</p>
            <p className="text-sm font-medium">{timeframe}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
            <Button 
              onClick={onTakeAction}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all"
            >
              {t("card.takeAction", "Take Action!")}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>

            <Button 
              onClick={handleConfirmClick}
              disabled={isConfirmed} 
              className={`flex-1 transition-all duration-200 border-2 ${
                isConfirmed 
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-inner cursor-default disabled:opacity-100"
                  : "bg-white border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              {isConfirmed ? "Підтверджено" : "Актуально"}
              <Check className={`ml-2 w-4 h-4 ${isConfirmed ? "" : "opacity-70"}`} />
            </Button>
        </div>
      </div>
    </Card>                                                                                                            
  );
}