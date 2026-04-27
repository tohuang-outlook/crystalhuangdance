import { siteConfig } from '../data/siteData';
import { ChevronDown } from 'lucide-react';

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background Image - using contain to show full photo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src="/crystal-hero.jpg"
          alt="Crystal Huang ballet performance"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/60 via-[#0a0a0f]/50 to-[#0a0a0f]" />

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <p className="text-blue-300 tracking-[0.2em] uppercase text-sm sm:text-base mb-6 animate-fade-in-up font-medium">
          {siteConfig.heroSubtitle}
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
          <span className="gradient-text">{siteConfig.name}</span>
        </h1>

        <p className="text-lg sm:text-xl text-gray-300/90 mb-4 italic font-light">
          "{siteConfig.tagline}"
        </p>

        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {siteConfig.bio}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#about"
            className="px-8 py-3.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            Discover My Journey
          </a>
          <a
            href="#contact"
            className="px-8 py-3.5 rounded-full border border-white/20 text-white font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Book a Class
          </a>
        </div>
      </div>

      {/* Scroll indicator */}
      <a
        href="#about"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-400 hover:text-white transition-colors animate-float"
      >
        <ChevronDown size={28} />
      </a>
    </section>
  );
}
