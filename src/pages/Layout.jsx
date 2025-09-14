

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Menu, X, Instagram, Youtube, Twitter, 
  Calendar, User, Palette, Camera, Phone, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import BackgroundMusic from "@/components/music/BackgroundMusic";

const navigationItems = [
  { title: "Home", url: createPageUrl("Home"), icon: Home },
  { title: "About", url: createPageUrl("About"), icon: User },
  { title: "Dance Styles", url: createPageUrl("DanceStyles"), icon: Palette },
  { title: "Gallery", url: createPageUrl("Gallery"), icon: Camera },
  { title: "Events", url: createPageUrl("Events"), icon: Calendar },
  { title: "Contact", url: createPageUrl("Contact"), icon: Phone },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(true); // open by default on mobile
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set the browser tab title
  useEffect(() => {
    document.title = "Crystal Huang Dance";
  }, [currentPageName]);

  // Adjust ONLY the Base44 badge to be tiny (font-size 1px); do not hide containers
  useEffect(() => {
    const lower = (v) => (v || "").toLowerCase();

    const isEditBadge = (el) => {
      if (!el || el === document.body || el === document.documentElement) return false;
      const txt = lower(el.textContent);
      const aria = lower(el.getAttribute?.("aria-label"));
      const title = lower(el.getAttribute?.("title"));
      const role = lower(el.getAttribute?.("role"));
      const styles = window.getComputedStyle(el);
      const isFloating = styles.position === "fixed" || styles.position === "sticky";
      const rect = el.getBoundingClientRect();
      const area = Math.max(1, rect.width) * Math.max(1, rect.height);
      const hasBadgeText = txt.includes("edit with base44") || txt.includes("edit with base 44");
      const hasBadgeAttr = (aria + " " + title).includes("edit with base44") || (aria + " " + title).includes("edit with base 44");
      const clickable = ["A", "BUTTON"].includes(el.tagName) || role === "button" || typeof el.onclick === "function";
      return (hasBadgeText || hasBadgeAttr) && (isFloating || clickable) && area < 120000;
    };

    const shrinkBadge = (el) => {
      if (!el) return;
      el.style.display = ""; // ensure visible (revert display:none if any parent or self had it)
      el.style.visibility = "visible";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
      el.style.fontSize = "1px"; // changed from 6px to 1px
      el.style.lineHeight = "1";
    };

    const scan = (root) => {
      const scope = root instanceof Document || root instanceof DocumentFragment ? root : document;
      const nodes = scope.querySelectorAll("*");
      nodes.forEach((el) => {
        if (isEditBadge(el)) {
          shrinkBadge(el);
        }
        if (el.shadowRoot) scan(el.shadowRoot);
      });
    };

    scan(document); // Run immediately
    const obs = new MutationObserver(() => scan(document));
    obs.observe(document.body, { childList: true, subtree: true });

    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50">
      <style>{`
        :root {
          --primary-50: #fdf2f8;
          --primary-100: #fce7f3;
          --primary-500: #ec4899;
          --primary-600: #db2777;
          --primary-900: #831843;
          --accent-500: #8b5cf6;
          --accent-600: #7c3aed;
        }
        
        .elegant-shadow {
          box-shadow: 0 10px 40px -15px rgba(0, 0, 0, 0.1);
        }
        
        .dance-gradient {
          background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-500) 100%);
        }
        
        .movement-animation {
          animation: gentle-float 6s ease-in-out infinite;
        }
        
        @keyframes gentle-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(1deg); }
        }
        
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Hide scrollbar for horizontal icon bar */
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* OVERRIDE: make the Base44 edit badge visible but tiny (font-size 1px) */
        [id*="base44-badge" i],
        [class*="base44-badge" i],
        [data-base44-badge],
        [aria-label*="Edit with Base44" i],
        [aria-label*="Edit with Base 44" i],
        [title*="Edit with Base44" i],
        [title*="Edit with Base 44" i] {
          display: inline-flex !important;
          visibility: visible !important;
          pointer-events: auto !important;
          opacity: 1 !important;
          font-size: 1px !important; /* changed from 6px to 1px */
          line-height: 1 !important;
        }
      `}</style>

      {/* Navigation Header */}
      <header 
        className={`relative lg:fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'glass-effect elegant-shadow' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center space-x-2 group">
              <div className="w-10 h-10 dance-gradient rounded-full flex items-center justify-center movement-animation group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900 text-shadow">Crystal Huang</h1>
                <p className="text-sm text-gray-600">Professional Dancer</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`text-sm font-medium transition-all duration-300 hover:text-pink-600 relative group ${
                    location.pathname === item.url
                      ? 'text-pink-600'
                      : 'text-gray-700'
                  }`}
                >
                  {item.title}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Social Links & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors duration-200">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-red-600 transition-colors duration-200">
                  <Youtube className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors duration-200">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="hidden md:inline-flex dance-gradient text-white border-0 hover:opacity-90"
              >
                Schedule Private
              </Button>

              {/* Mobile menu button hidden (menu always visible horizontally below) */}
              <button onClick={() => {}} className="hidden">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - horizontal icon bar */}
        {isMenuOpen && (
          <div className="lg:hidden glass-effect border-t border-gray-200">
            <div className="py-3">
              <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar px-4">
                {navigationItems.map((item) => {
                  const active = location.pathname === item.url;
                  return (
                    <Link
                      key={item.title}
                      to={item.url}
                      className={`flex flex-col items-center justify-center min-w-[72px] px-3 py-2 rounded-lg transition-all duration-200 ${
                        active ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-[11px] mt-1 font-medium truncate max-w-[72px]">{item.title}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Social + CTA */}
              <div className="px-4 pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4 px-1">
                  <a href="#" className="text-gray-600 hover:text-pink-600">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-red-600">
                    <Youtube className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    <Twitter className="w-6 h-6" />
                  </a>
                </div>
                <Button className="w-full mt-4 dance-gradient text-white border-0">
                  Schedule Private
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-4 lg:pt-20">
        {children}
      </main>

      {/* Background Music - subtle floating control */}
      <BackgroundMusic />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 dance-gradient rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">C</span>
                </div>
                <span className="text-xl font-bold">Crystal Huang</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Professional dancer bringing artistry and passion to every performance. 
                Specializing in contemporary, hip-hop, and ballet.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to={createPageUrl("About")} className="text-gray-400 hover:text-white transition-colors">About Crystal</Link></li>
                <li><Link to={createPageUrl("DanceStyles")} className="text-gray-400 hover:text-white transition-colors">Dance Styles</Link></li>
                <li><Link to={createPageUrl("Gallery")} className="text-gray-400 hover:text-white transition-colors">Performance Gallery</Link></li>
                <li><Link to={createPageUrl("Events")} className="text-gray-400 hover:text-white transition-colors">Upcoming Events</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4 mb-4">
                <a href="#" className="text-gray-400 hover:text-pink-500 transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-red-500 transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-500 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
              </div>
              <p className="text-gray-400 text-sm">
                Ready to book a performance?<br />
                <a href="mailto:crystal@danceartist.com" className="text-pink-400 hover:text-pink-300 transition-colors">
                  crystal@danceartist.com
                </a>
              </p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2024 Crystal Huang. All rights reserved. | Professional Dance Performer
          </div>
        </div>
      </footer>
    </div>
  );
}

