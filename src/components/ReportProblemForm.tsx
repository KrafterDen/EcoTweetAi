import { ChangeEvent, FormEvent, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { AlertTriangle, MapPin } from "lucide-react";

// Список тегов, который ты просил
const AVAILABLE_TAGS = ["Flood", "Coastal", "Critical", "Air", "Health", "Urban"];

export function ReportProblemForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "48.3794° N, 31.1656° E", // Хардкод координат (центр Украины) как заглушка
    affectedPopulation: "",
    urgency: 50, // Слайдер от 0 до 100
    tags: [] as string[],
    timeframe: "next_5_years",
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Problem Report Submitted:", formData);
    // Здесь будет логика отправки на сервер
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

        {/* Локализация */}
        <div className="space-y-2">
          <Label htmlFor="location">Location (Coordinates)</Label>
          <div className="relative">
            <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="pl-9 bg-white"
              placeholder="e.g., 48.3794° N, 31.1656° E or City, Country"
            />
          </div>
          <p className="text-xs text-slate-400">
            * Enter coordinates or a city/region; automatic geolocation is currently disabled.
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
