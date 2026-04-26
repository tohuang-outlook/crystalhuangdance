
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Play, ArrowDown } from "lucide-react";

export default function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-pink-50 to-purple-50">
      {/* Hero Image - Fullscreen Background */}
      <div className="absolute inset-0">
        <img 
          src="/hero-esmeralda.jpg"
          alt="Crystal Huang ballet performance - Esmeralda"
          className="w-full h-full object-cover object-top opacity-90 scale-105 animate-slow-zoom"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 mt-20">
        <div className={`transition-all duration-1000 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <h2 className="text-sm md:text-md uppercase tracking-[0.3em] text-white/80 font-light mb-4">
            Professional Dance Artist
          </h2>
          
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif text-white leading-none mb-8 drop-shadow-2xl font-light tracking-wide">
            Crystal <br className="md:hidden" />
            <span className="font-serif italic text-pink-200">Huang</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-200 font-light max-w-2xl mx-auto mb-12 tracking-wide leading-relaxed">
            Transforming emotion into movement. 
            Exploring the boundless intersection of classical elegance and contemporary raw power.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to={createPageUrl("Gallery")}>
              <Button size="lg" className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-black text-lg px-10 py-6 rounded-none uppercase tracking-widest transition-all duration-500 w-full sm:w-auto">
                <Play className="mr-3 w-4 h-4" />
                View Showreel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 opacity-70">
        <span className="text-white text-xs uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-4 h-4 text-white" />
      </div>
    </section>
  );
}
