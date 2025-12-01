import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { Leaf } from "lucide-react";

export function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    experience: "",
    motivation: "",
    availability: "",
    agreeToTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-center gap-2 mb-6">
        <Leaf className="size-8 text-emerald-600" />
        <h1 className="text-emerald-800">EcoTweetAI</h1>
      </div>

      <h2 className="text-center text-emerald-900 mb-2">
        Content Moderator Application
      </h2>
      <p className="text-center text-slate-600 mb-6">
        Join our team of volunteer moderators
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="experience">Prior Moderation Experience</Label>
          <Input
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            placeholder="Years or platforms you've moderated"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motivation">
            Why do you want to be a moderator? *
          </Label>
          <Textarea
            id="motivation"
            name="motivation"
            value={formData.motivation}
            onChange={handleChange}
            placeholder="Tell us about your motivation..."
            rows={4}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="availability">
            Weekly Availability (hours) *
          </Label>
          <Input
            id="availability"
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            placeholder="e.g., 5-10 hours per week"
            required
          />
        </div>

        <div className="flex items-start gap-2 pt-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({
                ...prev,
                agreeToTerms: Boolean(checked),
              }))
            }
          />
          <Label
            htmlFor="agreeToTerms"
            className="cursor-pointer leading-tight"
          >
            I agree to the terms and conditions and community guidelines *
          </Label>
        </div>

        <Button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700"
          disabled={!formData.agreeToTerms}
        >
          Submit Application
        </Button>
      </form>
    </div>
  );
}

