import { Globe } from "lucide-react";
import { forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface RegionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const regions = [
  { value: "GLOBAL", label: "Global" },
  { value: "ASIA", label: "Asia" },
  { value: "EUROPE", label: "Europe" },
  { value: "NORTH_AMERICA", label: "North America" },
  { value: "SOUTH_AMERICA", label: "South America" },
  { value: "AFRICA", label: "Africa" },
  { value: "ANTARCTICA", label: "Antarctica" },
  { value: "OCEANIA", label: "Oceania" },
];

export const RegionSelector = forwardRef<HTMLDivElement, RegionSelectorProps>(
  ({ value, onChange }, ref) => {
    return (
      <div ref={ref} className="flex items-center justify-center gap-3">
        <Globe className="w-6 h-6 text-emerald-600" />
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[200px] border-emerald-200 focus:ring-emerald-500 bg-white">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);

RegionSelector.displayName = "RegionSelector";