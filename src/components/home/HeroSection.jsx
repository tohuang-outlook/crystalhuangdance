
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
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/30 to-indigo-300/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-200/20 to-purple-200/20 rounded-full blur-2xl movement-animation"></div>
      </div>

      {/* Hero Image - Desktop */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block bg-pink-100">
        <div className="relative h-full">
          <img 
            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/3a6de7483_1.jpg"
            alt="Crystal Huang ballet performance - dance performer"
            className="w-full h-full object-cover object-center movement-animation"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-50/90"></div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl lg:max-w-2xl">
          <div className={`transition-all duration-1000 transform ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
          }`}>
            <div className="mb-6">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-pink-100 text-pink-700 text-sm font-medium mb-4">
                ✨ Award-Winning Dance Artist
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6 text-shadow">
              Crystal
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Huang
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-8 max-w-xl">
              Professional dancer transforming emotions into movement. 
              Bringing stories to life through contemporary, hip-hop, and ballet performances.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to={createPageUrl("Gallery")}>
                <Button size="lg" className="dance-gradient text-white text-lg px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 w-full sm:w-auto">
                  <Play className="mr-2 w-5 h-5" />
                  Watch Performances
                </Button>
              </Link>
              
              <Link to={createPageUrl("Contact")}>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white text-lg px-8 py-4 rounded-full transition-all duration-300 w-full sm:w-auto"
                >
                  Schedule Private
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-[20px]">Ballet</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-200"></div>
                <span className="font-medium text-[20px]">Contemporary</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse delay-400"></div>
                <span className="font-medium text-[20px]">Jazz</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-600"></div>
                <span className="font-medium text-[20px]">Hip-Hop</span>
              </div>
              {/* Added Tap and Ballroom */}
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-sky-500 rounded-full animate-pulse delay-800"></div>
                <span className="font-medium text-[20px]">Tap</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse delay-1000"></div>
                <span className="font-medium text-[20px]">Ballroom</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <ArrowDown className="w-6 h-6 text-gray-400" />
      </div>

      {/* Mobile Hero Image */}
      <div className="absolute inset-0 lg:hidden opacity-40 bg-pink-100">
        <img 
          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/3a6de7483_1.jpg"
          alt="Crystal Huang ballet performance - dance performer"
          className="w-full h-full object-cover object-center"
        />
      </div>
    </section>
  );
}
