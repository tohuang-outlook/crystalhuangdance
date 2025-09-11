import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, ArrowRight, Star, Calendar, MapPin, 
  Award, Users, Heart, Quote
} from "lucide-react";

import HeroSection from "../components/home/HeroSection";
import FeaturedStyles from "../components/home/FeaturedStyles";
import UpcomingEvents from "../components/home/UpcomingEvents";
import TestimonialsSection from "../components/home/TestimonialsSection";
import StatsSection from "../components/home/StatsSection";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Dance Styles */}
      <FeaturedStyles />

      {/* Stats Section */}
      <StatsSection />

      {/* Upcoming Events */}
      <UpcomingEvents />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 text-shadow">
            Ready to Bring Your Vision to Life?
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto leading-relaxed">
            Let's create something extraordinary together. From intimate performances to grand productions, 
            every movement tells a story worth sharing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-pink-50 text-lg px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105">
                Book a Performance
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            
            <Link to={createPageUrl("Gallery")}>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-2 border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-4 rounded-full backdrop-blur-sm"
              >
                Watch Performances
                <Play className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-pink-100">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Award-Winning Performances</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">500+ Shows Performed</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">Passionate Artistry</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}