import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { AlertTriangle } from "lucide-react";

interface EcoProblemCardProps {
  title: string;
  description: string;
  imageUrl: string;
  urgencyLevel: number;
  impactedPopulation: string;
  timeframe: string;
  tags: string[];
}

export function EcoProblemCard({
  title,
  description,
  imageUrl,
  urgencyLevel,
  impactedPopulation,
  timeframe,
  tags
}: EcoProblemCardProps) {
  const getUrgencyColor = (level: number) => {
    if (level >= 90) return "text-red-600";
    if (level >= 70) return "text-orange-600";
    return "text-yellow-600";
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full flex items-center gap-2">
          <AlertTriangle className={`w-4 h-4 ${getUrgencyColor(urgencyLevel)}`} />
          <span className={`${getUrgencyColor(urgencyLevel)}`}>{urgencyLevel}%</span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div>
          <h3 className="mb-2">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Urgency Level</span>
            <span className={`${getUrgencyColor(urgencyLevel)}`}>{urgencyLevel}%</span>
          </div>
          <Progress value={urgencyLevel} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <p className="text-xs text-gray-500">Affected Population</p>
            <p className="text-sm">{impactedPopulation}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Critical Timeframe</p>
            <p className="text-sm">{timeframe}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div >
          <button
            data-slot="button"
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive h-9 px-4 py-2 has-[>svg]:px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Take Action
          </button>
        </div>
      </div>
    </Card>
  );
}
