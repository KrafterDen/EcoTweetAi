import { Globe, MapPin, Building2 } from "lucide-react";
import { forwardRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

import type { RegionValue } from "../types";
export type { RegionValue } from "../types";
import { regions, countriesByRegion, citiesByCountry } from "../data/regions";

interface RegionSelectorProps {
  selectedRegion: RegionValue;
  selectedCountry: string | null;
  selectedCity: string | null;
  onRegionChange: (value: RegionValue) => void;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
}

export const RegionSelector = forwardRef<HTMLDivElement, RegionSelectorProps>(
  (
    {
      selectedRegion,
      selectedCountry,
      selectedCity,
      onRegionChange,
      onCountryChange,
      onCityChange,
    },
    ref
  ) => {
    // Получаем список стран для выбранного региона
    const availableCountries = countriesByRegion[selectedRegion] || [];
    
    // Получаем список городов для выбранной страны
    const availableCities = selectedCountry ? citiesByCountry[selectedCountry] || [] : [];

    const isCountryDisabled = selectedRegion === "GLOBAL" || availableCountries.length === 0;
    const isCityDisabled = !selectedCountry || availableCities.length === 0;

    return (
      <div
        ref={ref}
        className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 bg-white/50 backdrop-blur-sm rounded-2xl border border-emerald-100/50 shadow-sm inline-flex"
      >
        {/* Region Selector */}
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-600" />
          <Select
            value={selectedRegion}
            onValueChange={(val) => onRegionChange(val as RegionValue)}
          >
            <SelectTrigger className="w-[180px] border-emerald-200 focus:ring-emerald-500 bg-white">
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

        {/* Country Selector */}
        <div className={`flex items-center gap-2 transition-opacity duration-200 ${isCountryDisabled ? 'opacity-50' : 'opacity-100'}`}>
          <MapPin className="w-5 h-5 text-emerald-600" />
          <Select
            value={selectedCountry || ""}
            onValueChange={onCountryChange}
            disabled={isCountryDisabled}
          >
            <SelectTrigger className="w-[180px] border-emerald-200 focus:ring-emerald-500 bg-white">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {availableCountries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* City Selector */}
        <div className={`flex items-center gap-2 transition-opacity duration-200 ${isCityDisabled ? 'opacity-50' : 'opacity-100'}`}>
          <Building2 className="w-5 h-5 text-emerald-600" />
          <Select
            value={selectedCity || ""}
            onValueChange={onCityChange}
            disabled={isCityDisabled}
          >
            <SelectTrigger className="w-[180px] border-emerald-200 focus:ring-emerald-500 bg-white">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  }
);

RegionSelector.displayName = "RegionSelector";
