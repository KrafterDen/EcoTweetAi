import { useState } from "react";
import { Button } from "./ui/button";
import { Menu, X, TrendingUp, Users, BookOpen, Sparkles } from "lucide-react";

interface HeaderProps {
  onNavigateToResources?: () => void;
}

export function Header({ onNavigateToResources }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Issues", href: "#issues", icon: TrendingUp },
    { name: "Resources", href: "#resources", icon: BookOpen },
    { name: "Get Involved", href: "#involved", icon: Users },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="EcoTweetAI logo"
              className="w-10 h-10 rounded-lg object-contain shadow-sm"
            />
            <div className="flex flex-col">
              <span className="text-emerald-900 tracking-tight">EcoTweetAI</span>
              <span className="text-xs text-emerald-600 -mt-1">Crowd platform</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors group"
                  onClick={(event) => {
                    if (link.href === "#resources" && onNavigateToResources) {
                      event.preventDefault();
                      onNavigateToResources();
                    }
                  }}
                >
                  <Icon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>{link.name}</span>
                </a>
              );
            })}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button className="group relative overflow-hidden rounded-full border border-red-200 bg-red-600 px-4 text-white shadow-[0_12px_35px_-18px_rgba(239,68,68,0.8)] transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-700 hover:shadow-[0_14px_45px_-16px_rgba(220,38,38,0.85)]">
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-rose-200/20 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="relative flex items-center font-semibold">
                <Sparkles className="mr-2 h-4 w-4 text-white" />
                Report problem
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-emerald-900" />
            ) : (
              <Menu className="w-6 h-6 text-emerald-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className="flex items-center gap-3 text-gray-700 hover:text-emerald-600 transition-colors py-2"
                    onClick={(event) => {
                      if (link.href === "#resources" && onNavigateToResources) {
                        event.preventDefault();
                        onNavigateToResources();
                      }
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.name}</span>
                  </a>
                );
              })}
              <Button className="group relative mt-2 w-full overflow-hidden rounded-full border border-red-200 bg-red-600 px-4 text-white shadow-[0_12px_35px_-18px_rgba(239,68,68,0.8)] transition-all hover:-translate-y-0.5 hover:border-red-300 hover:bg-red-700 hover:shadow-[0_14px_45px_-16px_rgba(220,38,38,0.85)]">
                <span
                  className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/10 via-rose-200/20 to-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="relative flex items-center justify-center font-semibold">
                  <Sparkles className="mr-2 h-4 w-4 text-white" />
                  Suggest a problem
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
