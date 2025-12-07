import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AlertTriangle, MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { regions, countriesByRegion, citiesByCountry } from "../data/regions";
import type { RegionValue, ReportProblemPayload } from "../types";

// Список тегов, который ты просил
const AVAILABLE_TAGS = ["Flood", "Coastal", "Critical", "Air", "Health", "Urban"];

interface ReportProblemFormProps {
  onSubmit?: (payload: ReportProblemPayload) => void;
}

export function ReportProblemForm({ onSubmit }: ReportProblemFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    affectedPopulation: "",
    urgency: 50, // Слайдер от 0 до 100
    tags: [] as string[],
    timeframe: "next_5_years",
    imageUrl: "",
  });
  const [selectedRegion, setSelectedRegion] = useState<RegionValue>("GLOBAL");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const availableCountries = useMemo(
    () => countriesByRegion[selectedRegion] || [],
    [selectedRegion]
  );
  const availableCities = useMemo(
    () => (selectedCountry ? citiesByCountry[selectedCountry] || [] : []),
    [selectedCountry]
  );

  const regionLabel = regions.find((r) => r.value === selectedRegion)?.label ?? "Global";
  const locationSummary = [selectedCity, selectedCountry, regionLabel]
    .filter(Boolean)
    .join(", ");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const payload: ReportProblemPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      location: locationSummary || regionLabel,
      region: selectedRegion,
      country: selectedCountry,
      city: selectedCity,
      affectedPopulation: formData.affectedPopulation
        ? Number(formData.affectedPopulation)
        : null,
      urgency: Number(formData.urgency),
      tags: formData.tags,
      timeframe: formData.timeframe,
      imageUrl: formData.imageUrl.trim() || undefined,
    };

    onSubmit?.(payload);

    setFormData({
      title: "",
      description: "",
      affectedPopulation: "",
      urgency: 50,
      tags: [],
      timeframe: "next_5_years",
      imageUrl: "",
    });
    setSelectedRegion("GLOBAL");
    setSelectedCountry(null);
    setSelectedCity(null);
    setFileError(null);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Обработчик для слайдера (так как event target может отличаться)
  const handleSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, urgency: Number(e.target.value) }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setFileError("Please upload an image file");
      return;
    }
    setFileError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Логика добавления/удаления тегов
  const toggleTag = (tag: string) => {
    setFormData((prev) => {
      const isSelected = prev.tags.includes(tag);
      if (isSelected) {
        return { ...prev, tags: prev.tags.filter((t) => t !== tag) };
      } else {
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border-t-4 border-rose-500">
      {/* Заголовок с красным акцентом */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <AlertTriangle className="size-8 text-rose-600" />
        <h1 className="text-xl font-bold text-slate-800">Report an Issue</h1>
      </div>

      <h2 className="text-center text-slate-900 mb-2 font-semibold">
        Environmental Alert
      </h2>
      <p className="text-center text-slate-500 mb-6 text-sm">
        Help us identify and track ecological threats.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Название проблемы */}
        <div className="space-y-2">
          <Label htmlFor="title">Problem Title *</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., River Pollution near Factory"
            required
            className="focus-visible:ring-rose-500"
          />
        </div>

        {/* Описание проблемы */}
        <div className="space-y-2">
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the issue in detail..."
            rows={3}
            required
            className="focus-visible:ring-rose-500"
          />
        </div>

        {/* Изображение */}
        <div className="space-y-2">
          <Label htmlFor="imageUrl">Image (URL or upload)</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            placeholder="https://example.com/photo.jpg"
            className="focus-visible:ring-rose-500"
          />
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {fileError && <p className="text-xs text-rose-600">{fileError}</p>}
        </div>

        {/* Локализация */}
        <div className="space-y-2">
          <Label>Location</Label>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-500" />
              <Select
                value={selectedRegion}
                onValueChange={(value) => {
                  setSelectedRegion(value as RegionValue);
                  setSelectedCountry(null);
                  setSelectedCity(null);
                }}
              >
                <SelectTrigger className="w-full">
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
            <Select
              value={selectedCountry ?? ""}
              onValueChange={(value) => {
                setSelectedCountry(value);
                setSelectedCity(null);
              }}
              disabled={availableCountries.length === 0}
            >
              <SelectTrigger className="w-full">
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
            <Select
              value={selectedCity ?? ""}
              onValueChange={setSelectedCity}
              disabled={availableCities.length === 0}
            >
              <SelectTrigger className="w-full">
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
            <p className="text-xs text-slate-500">
              Selected: {locationSummary || "No location selected"}
            </p>
          </div>
          <p className="text-xs text-slate-400">
            * Select region and (optionally) country/city to localize the issue.
          </p>
        </div>

        {/* Affected Population & Timeframe (в одну строку для компактности) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="affectedPopulation">Affected People</Label>
            <Input
              id="affectedPopulation"
              name="affectedPopulation"
              type="number"
              value={formData.affectedPopulation}
              onChange={handleChange}
              placeholder="Est. number"
              className="focus-visible:ring-rose-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Critical Timeframe</Label>
            <select
              id="timeframe"
              name="timeframe"
              value={formData.timeframe}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="next_5_years">Next 5 years</option>
              <option value="next_10_years">Next 10 years</option>
              <option value="next_20_years">Next 20 years</option>
            </select>
          </div>
        </div>

        {/* Urgency Level Slider */}
        <div className="space-y-3 p-4 bg-rose-50 rounded-lg border border-rose-100">
          <div className="flex justify-between items-center">
            <Label htmlFor="urgency" className="text-rose-900 font-semibold">
              Urgency Level
            </Label>
            <span className="text-sm font-bold text-rose-600">
              {formData.urgency}%
            </span>
          </div>
          <input
            id="urgency"
            type="range"
            min="0"
            max="100"
            value={formData.urgency}
            onChange={handleSliderChange}
            className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
          />
          <div className="flex justify-between text-xs text-rose-400 px-1">
            <span>Low</span>
            <span>Critical</span>
          </div>
        </div>

        {/* Tags Selection */}
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_TAGS.map((tag) => {
              const isSelected = formData.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border ${
                    isSelected
                      ? "bg-rose-600 text-white border-rose-600 shadow-md transform scale-105"
                      : "bg-white text-slate-600 border-slate-200 hover:border-rose-300 hover:text-rose-500"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Кнопка отправки */}
        <Button
          type="submit"
          className="w-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200 mt-4"
        >
          Submit Report
        </Button>
      </form>
    </div>
  );
}
