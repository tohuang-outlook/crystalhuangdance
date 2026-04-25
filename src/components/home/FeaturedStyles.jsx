
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Sparkles, Zap, Crown, Music, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const danceStyles = [
  {
    title: "Ballet",
    description: "Classical dance featuring grace, precision, and timeless elegance in every movement",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/604b92dbe_ballet.jpg",
    icon: Crown,
    color: "from-indigo-500 to-blue-500",
    tags: ["Classical", "Grace", "Precision"]
  },
  {
    title: "Contemporary",
    description: "Fluid movements that express deep emotions and tell compelling stories through dance",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/87546e8d0_con.jpg", // Updated image URL
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    tags: ["Emotional", "Storytelling", "Fluid"]
  },
  {
    title: "Jazz",
    description: "Stylish, rhythmic movement blending classic technique with modern flair and Broadway energy",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/103cb8ad5_Jazz.png",
    icon: Music,
    color: "from-amber-500 to-pink-500",
    tags: ["Rhythmic", "Expressive", "Broadway"]
  },
  {
    title: "Hip-Hop",
    description: "High-energy urban dance with sharp movements, rhythm, and street-style choreography",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/346907192_pressplay.jpg",
    icon: Zap,
    color: "from-purple-500 to-indigo-500",
    tags: ["Urban", "High-Energy", "Rhythmic"]
  },
  {
    title: "Tap",
    description: "Rhythmic footwork and crisp sounds that turn the floor into an instrument.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/993eb9977_2.jpg",
    icon: Music,
    color: "from-sky-500 to-cyan-500",
    tags: ["Rhythm", "Precision", "Musicality"]
  },
  {
    title: "Ballroom",
    description: "Elegant partner dancing with refined lines and flowing movement.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/0e42ab5b1_front.jpg",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    tags: ["Elegance", "Partnership", "Flow"]
  }
];

export default function FeaturedStyles() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Dance <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Styles</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Each style tells a different story. From the fluid grace of contemporary to the raw energy of hip-hop, 
            discover the artistry behind every movement.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {danceStyles.map((style, index) => (
            <Card key={style.title} className="group overflow-hidden bg-white elegant-shadow hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={style.image}
                  alt={style.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${style.color} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                <div className="absolute top-4 left-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center">
                    <style.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">{style.title}</h3>
                  <div className="flex flex-wrap gap-2">
                    {style.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="bg-white/20 text-white border-white/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <CardContent className="p-6">
                <p className="text-gray-600 leading-relaxed mb-4">
                  {style.description}
                </p>
                <Link 
                  to={createPageUrl("DanceStyles")} 
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium transition-colors group"
                >
                  Learn More
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link to={createPageUrl("DanceStyles")}>
            <button className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-full hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Explore All Styles
              <ArrowRight className="ml-2 w-5 h-5" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
