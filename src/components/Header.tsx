import { useState } from "react";
import { Button } from "./ui/button";
import { Globe, Menu, X, Leaf, TrendingUp, Users, BookOpen } from "lucide-react";

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
          <div className="flex items-center gap-2">
            <div className="relative">
              <Globe className="w-8 h-8 text-emerald-600" />
              <Leaf className="w-4 h-4 text-teal-500 absolute -bottom-1 -right-1" />
            </div>
            <div className="flex flex-col">
              <span className="text-emerald-900 tracking-tight">EcoAlert</span>
              <span className="text-xs text-emerald-600 -mt-1">Environmental Awareness</span>
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
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Take Action
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
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white w-full mt-2">
                Take Action
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
