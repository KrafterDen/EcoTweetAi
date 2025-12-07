import React, { useEffect, useState, useRef, useMemo } from 'react';
import Globe from 'react-globe.gl';
import { ArrowRight, Leaf } from 'lucide-react';
import { useI18n } from '../i18n';

// --- ТИПИ ПРОПСІВ (Синхронізовано з App.tsx) ---
interface HeroSectionProps {
  highlightTakeAction: boolean;
  onSavePlanetClick: () => void;
  onTakeActionClick: () => void;
}

// --- ДАНІ ДЛЯ ГЛОБУСА ---
const SOLUTIONS_HUBS = [
  { lat: 50.45, lng: 30.52 }, { lat: 49.83, lng: 24.02 }, // Ukraine
  { lat: 52.52, lng: 13.40 }, { lat: 48.85, lng: 2.35 },  // Germany, France
  { lat: 51.50, lng: -0.12 }, { lat: 41.90, lng: 12.49 }, // UK, Italy
  { lat: 40.71, lng: -74.00 }, { lat: 34.05, lng: -118.24 }, // USA
  { lat: 35.67, lng: 139.65 }, { lat: 1.35, lng: 103.81 }, // Asia
];

const PROBLEMS_DATA = [
  { lat: 48.01, lng: 37.80, label: "Industrial Damage (Donbas)" },
  { lat: 51.27, lng: 30.22, label: "Radiation Risk (North)" },
  { lat: 40.41, lng: -3.70, label: "Drought (Spain)" },
  { lat: -3.46, lng: -62.21, label: "Amazon Fire" },
  { lat: 28.61, lng: 77.20, label: "Smog (India)" },
  { lat: -75.0, lng: 0.0, label: "Ice Melting" }
].map(p => ({ ...p, type: 'problem' }));

// --- LIVE FEED COMPONENT ---
const LiveFeed = () => {
  const [items, setItems] = useState<any[]>([]);
  
  useEffect(() => {
    const names = ["Alex", "Maria", "EcoBot", "Helga", "Dmytro", "Yuki", "Carlos"];
    const actions = ["reported problem in", "suggeted solution for problem in" ];
    const locations = ["Kyiv", "Donbas", "Amazon", "Sahara", "Venice", "California"];

    const addNotification = () => {
        const newItem = {
          id: Date.now(),
          name: names[Math.floor(Math.random() * names.length)],
          action: actions[Math.floor(Math.random() * actions.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
        };
        setItems(prev => [newItem, ...prev].slice(0, 3)); 
    };

    const timeout = setTimeout(function run() {
        addNotification();
        setTimeout(run, Math.random() * 4000 + 3000);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="absolute right-4 bottom-32 md:right-10 md:bottom-24 w-72 md:w-80 z-10 flex flex-col gap-3 pointer-events-none">
      {items.map((item) => (
        <div 
            key={item.id} 
            className="flex items-center gap-3 p-3 md:p-4 rounded-lg text-white text-sm shadow-lg animate-in fade-in slide-in-from-right-10 duration-500"
            style={{
                background: 'rgba(1, 50, 32, 0.7)',
                backdropFilter: 'blur(10px)',
                borderLeft: '4px solid #00ff88',
            }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#02452d] flex items-center justify-center font-bold text-[#00ff88] text-xs">
            {item.name[0]}
          </div>
          <div>
            <div className="text-[#88ccaa] text-xs mb-1">
              <span className="text-[#00ff88] font-bold">{item.name}</span> {item.action} <b>{item.location}</b>
            </div>
            <span className="text-gray-400 text-[10px]">Just now</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- ГОЛОВНИЙ КОМПОНЕНТ (ВИПРАВЛЕНО ЕКСПОРТ) ---
export const HeroSection: React.FC<HeroSectionProps> = ({
  highlightTakeAction,
  onSavePlanetClick,
  onTakeActionClick
}) => {
  const { t } = useI18n();
  const globeEl = useRef<any>();
  const [countries, setCountries] = useState({ features: [] });
  const [solutions, setSolutions] = useState<any[]>([]);
  const [arcs, setArcs] = useState<any[]>([]);
  const [dimensions, setDimensions] = useState({ w: 800, h: 720 });
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Ініціалізація даних
  useEffect(() => {
    // Resize handler
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setDimensions({
          w: Math.max(540, Math.floor(width * 0.55)),
          h: Math.max(480, Math.floor(height * 0.9)),
        });
      }
    };
    
    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    // Data Gen
    const solData: any[] = [];
    SOLUTIONS_HUBS.forEach(hub => {
        solData.push({
            lat: hub.lat + (Math.random() - 0.5) * 0.5,
            lng: hub.lng + (Math.random() - 0.5) * 0.5,
            type: 'solution'
        });
    });
    setSolutions(solData);

    const arcData = solData.map(sol => {
        const target = PROBLEMS_DATA[Math.floor(Math.random() * PROBLEMS_DATA.length)];
        return {
            startLat: sol.lat, startLng: sol.lng, endLat: target.lat, endLng: target.lng
        };
    });
    setArcs(arcData);

    // GeoJSON
    fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(data => setCountries(data))
        .catch(err => console.error("Map load error:", err));

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // 2. Налаштування камери глобуса
  useEffect(() => { 
    if (globeEl.current) {
        globeEl.current.pointOfView({ lat: 25, lng: 15, altitude: 1.8 });
        globeEl.current.controls().autoRotate = true;
        globeEl.current.controls().autoRotateSpeed = 0.5;
        globeEl.current.controls().enableZoom = false;
    }
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[85vh] md:h-[90vh] bg-[#013220] overflow-hidden text-white font-sans">
      
      {/* 3D GLOBE */}
      <div
        className="absolute top-0 bottom-0 left-1/2 right-[-6%] md:left-[45%] lg:left-[35%] z-0 opacity-0 animate-[fadeIn_2s_forwards]"
        style={{ animation: "fadeIn 2s forwards" }}
      >
        <Globe
            ref={globeEl}
            width={dimensions.w}
            height={dimensions.h}
            backgroundColor="#013220"
            
            polygonsData={countries.features}
            polygonAltitude={0.01}
            polygonSideColor={() => '#02452d'}
            polygonStrokeColor={() => '#087f5b'}
            polygonCapColor={(d: any) => {
                if (d.properties?.ADM0_A3 === 'RUS' || d.properties?.NAME === 'Russia') return '#3a3a3a';
                return '#02452d';
            }}

            pointsData={solutions}
            pointColor={() => '#00ff88'}
            pointAltitude={0.02}
            pointRadius={0.5}

            htmlElementsData={PROBLEMS_DATA}
            htmlLat={(d: any) => d.lat}
            htmlLng={(d: any) => d.lng}
            htmlElement={(d: any) => {
                const el = document.createElement('div');
                el.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="#ff4d4d" width="24px" height="24px" style="filter: drop-shadow(0 0 5px rgba(255, 77, 77, 0.6));">
                        <path d="M12 2L1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2V8h2v6z"/>
                    </svg>
                `;
                el.style.width = '24px';
                el.style.pointerEvents = 'none';
                return el;
            }}

            ringsData={PROBLEMS_DATA}
            ringColor={() => '#ff4d4d'}
            ringMaxRadius={8}
            ringPropagationSpeed={2}
            ringRepeatPeriod={800}
            ringAltitude={0.03}

            arcsData={arcs}
            arcColor={() => ['#00ff88', 'rgba(255, 77, 77, 0.3)']}
            arcDashLength={0.4}
            arcDashGap={2}
            arcDashInitialGap={() => Math.random()}
            arcDashAnimateTime={2500}
            arcStroke={0.4}
            
            atmosphereColor="#4ade80"
            atmosphereAltitude={0.15}
        />
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute top-0 left-0 w-full md:w-3/5 h-full bg-gradient-to-b md:bg-gradient-to-r from-[#013220] via-[#013220]/80 to-transparent z-0 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto md:ml-[14%] md:mx-0 h-full flex flex-col justify-center px-4 md:px-0 text-center md:text-left pointer-events-none">
        <div className="pointer-events-auto">
            <div className="inline-flex items-center text-[#ff6b6b] font-bold text-xs md:text-sm tracking-wider mb-4 uppercase bg-[#ff6b6b]/10 px-3 py-1 rounded-full border border-[#ff6b6b]/20">
              <span className="flex items-center justify-center w-4 h-4 bg-[#ff6b6b] text-[#013220] rounded-full mr-2 text-[10px] font-bold">!</span>
              {t("hero.badge", "Critical Issues Detected")}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {t("hero.title1", "The place where")} <br className="hidden md:block"/> {t("hero.title2", "problems are solved")} <br className="hidden md:block"/> {t("hero.title3", "")}
            </h1>
            
            <p className="text-base md:text-lg text-[#e0e0e0] leading-relaxed mb-8 md:mb-10 font-light max-w-lg mx-auto md:mx-0">
              {t("hero.subtitle", "EcoTweetAI connects people for solving environmental problems. Watch the world unite in real-time.")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={onTakeActionClick}
                className={`px-8 py-3.5 bg-white text-[#013220] font-bold rounded-lg text-base transition-all hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] flex items-center justify-center ${highlightTakeAction ? 'ring-4 ring-emerald-400 shadow-[0_0_30px_#00ff88]' : ''}`}
              >
                {t("hero.cta.primary", "Take Action")} <ArrowRight className="ml-2 w-5 h-5" />
              </button>

              <button 
                onClick={onSavePlanetClick}
                className="px-8 py-3.5 border border-emerald-500/50 text-emerald-100 font-semibold rounded-lg text-base hover:bg-emerald-900/30 hover:border-emerald-400 transition-all flex items-center justify-center backdrop-blur-sm"
              >
                <Leaf className="mr-2 w-5 h-5" />
                {t("hero.cta.secondary", "Save Planet")}
              </button>
            </div>
        </div>
      </div>

      <LiveFeed />

      <style>{`
        @keyframes fadeIn { to { opacity: 1; } }
      `}</style>
    </div>
  );
};
