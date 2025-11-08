import { EcoProblemCard } from "./components/EcoProblemCard";
import { StatCard } from "./components/StatCard";
import { Button } from "./components/ui/button";
import { AlertCircle, ArrowRight, Globe, Leaf } from "lucide-react";

const ecologicalProblems = [
  {
    title: "Climate Change & Global Warming",
    description: "Rising global temperatures are causing extreme weather events, melting ice caps, and threatening ecosystems worldwide. The effects are accelerating beyond predicted models.",
    imageUrl: "https://images.unsplash.com/photo-1739968035881-231297cbb5ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjbGltYXRlJTIwY3Jpc2lzJTIwZWFydGh8ZW58MXx8fHwxNzYyMjgzNTcxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    urgencyLevel: 98,
    impactedPopulation: "7.8 Billion",
    timeframe: "Next 10 Years",
    tags: ["Global", "Urgent", "Accelerating"]
  },
  {
    title: "Deforestation",
    description: "Massive loss of forest cover continues globally, destroying habitats, reducing carbon absorption, and threatening indigenous communities and biodiversity.",
    imageUrl: "https://images.unsplash.com/photo-1686005232738-3dd6c18b4ada?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWZvcmVzdGF0aW9uJTIwYWVyaWFsfGVufDF8fHx8MTc2MjI4MzU3MXww&ixlib=rb-4.1.0&q=80&w=1080",
    urgencyLevel: 92,
    impactedPopulation: "1.6 Billion",
    timeframe: "Next 15 Years",
    tags: ["Biodiversity", "Carbon", "Critical"]
  },
  {
    title: "Ocean Pollution & Plastic Crisis",
    description: "Over 8 million tons of plastic enter our oceans annually, creating massive garbage patches and threatening marine life. Microplastics now contaminate the entire food chain.",
    imageUrl: "https://images.unsplash.com/photo-1641040680288-89b2cb3af26f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHBvbGx1dGlvbiUyMHBsYXN0aWN8ZW58MXx8fHwxNzYyMjc2MjkxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    urgencyLevel: 88,
    impactedPopulation: "3 Billion",
    timeframe: "Next 20 Years",
    tags: ["Marine Life", "Pollution", "Health"]
  },
  {
    title: "Air Pollution",
    description: "Toxic air quality affects billions globally, causing respiratory diseases, premature deaths, and contributing to climate change. Urban areas face severe smog and particulate matter.",
    imageUrl: "https://images.unsplash.com/photo-1674753736774-a52048de6fab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhaXIlMjBwb2xsdXRpb24lMjBjaXR5fGVufDF8fHx8MTc2MjI4MzU3Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    urgencyLevel: 85,
    impactedPopulation: "4.2 Billion",
    timeframe: "Ongoing",
    tags: ["Health", "Urban", "Respiratory"]
  },
  {
    title: "Biodiversity Loss & Species Extinction",
    description: "Over 1 million species face extinction due to habitat loss, climate change, and human activity. We're experiencing the sixth mass extinction event in Earth's history.",
    imageUrl: "https://images.unsplash.com/photo-1672586658825-e653341241fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmRhbmdlcmVkJTIwd2lsZGxpZmV8ZW58MXx8fHwxNzYyMjYwMDg4fDA&ixlib=rb-4.1.0&q=80&w=1080",
    urgencyLevel: 90,
    impactedPopulation: "Global Impact",
    timeframe: "Next 50 Years",
    tags: ["Extinction", "Habitat Loss", "Critical"]
  },
  {
    title: "Water Scarcity & Drought",
    description: "Fresh water supplies are depleting rapidly due to overuse, pollution, and climate change. Billions face water stress, affecting agriculture, health, and economic stability.",
    imageUrl: "https://images.unsplash.com/photo-1693563920446-3e77e164827c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlciUyMHNjYXJjaXR5JTIwZHJvdWdodHxlbnwxfHx8fDE3NjIyODM1NzJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    urgencyLevel: 87,
    impactedPopulation: "2.2 Billion",
    timeframe: "Next 25 Years",
    tags: ["Water", "Agriculture", "Scarcity"]
  }
];

const stats = [
  { value: "1.5°C", label: "Global Temperature Rise Since 1850", trend: "+0.2°C/decade" },
  { value: "1M+", label: "Species at Risk of Extinction", trend: "Accelerating" },
  { value: "8M Tons", label: "Plastic Entering Oceans Yearly", trend: "Increasing" },
  { value: "7M", label: "Annual Deaths from Air Pollution", trend: "Rising" }
];

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-r from-emerald-900 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <span className="text-red-400 uppercase tracking-wider">Critical Issues</span>
            </div>
            <h1 className="text-white mb-6">
              The Most Pressing Ecological Problems of Our Time
            </h1>
            <p className="text-xl text-emerald-100 mb-8">
              Understanding the urgent environmental challenges we face is the first step toward meaningful action. 
              These are the critical issues demanding immediate attention.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
                Learn More
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Take Action
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Globe className="w-6 h-6 text-emerald-600" />
            <span className="text-emerald-600 uppercase tracking-wider">Global Challenges</span>
          </div>
          <h2 className="mb-4">
            Priority Environmental Issues
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            These interconnected ecological crises require urgent global cooperation and action. 
            Each problem compounds the others, creating a critical need for comprehensive solutions.
          </p>
        </div>

        {/* Problems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {ecologicalProblems.map((problem, index) => (
            <EcoProblemCard key={index} {...problem} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <Leaf className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-white mb-4">
            Every Action Counts
          </h2>
          <p className="text-xl text-emerald-50 mb-8 max-w-2xl mx-auto">
            While these challenges are daunting, collective action and individual choices can make a difference. 
            Stay informed, reduce your environmental impact, and support sustainable initiatives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50">
              Get Involved
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Share This Information
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white mb-4">About This Initiative</h3>
              <p className="text-sm">
                Raising awareness about critical ecological issues to inspire action and promote sustainable solutions for our planet's future.
              </p>
            </div>
            <div>
              <h3 className="text-white mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Climate Science Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conservation Organizations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sustainable Living Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Policy & Advocacy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white mb-4">Take Action</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Reduce Carbon Footprint</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support Clean Energy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Protect Biodiversity</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Join Local Initiatives</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 Ecological Awareness Initiative. Updated November 2025.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
