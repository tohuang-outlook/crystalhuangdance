
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Play, ExternalLink, Filter, Grid, 
  Video, Camera, Award, Heart 
} from "lucide-react";

const mediaItems = [
  {
    type: "video",
    title: "Do you care - Contemporary Solo",
    style: "Contemporary",
    venue: "Lincoln Center",
    year: "2024",
    duration: "4:32",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/f388c1b90_doucare.jpg",
    description: "A deeply personal contemporary piece exploring the journey from heartbreak to healing.",
    featured: true,
    awards: ["Best Solo Performance 2024"],
    video_url: "https://www.youtube.com/watch?v=e2Z9UXevvIg"
  },
  {
    type: "video",
    title: "Urban Rhythms - Hip-Hop Showcase",
    style: "Hip-Hop",
    venue: "Brooklyn Dance Center",
    year: "2024",
    duration: "3:45",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/87546e8d0_con.jpg",
    description: "High-energy hip-hop performance celebrating street culture and individual expression."
  },
  {
    type: "video",
    title: "La Esmeralda - Ballet Variation",
    style: "Ballet",
    venue: "Metropolitan Opera House",
    year: "2023",
    duration: "6:12",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/0e42ab5b1_front.jpg",
    description: "Classical ballet variation showcasing technical precision and artistic interpretation.",
    awards: ["Award Winner"],
    video_url: "https://www.youtube.com/watch?v=LCSPksYxP6U"
  },
  {
    type: "photo",
    title: "Contemporary Expression",
    style: "Contemporary",
    venue: "Studio Portrait",
    year: "2024",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/103cb8ad5_Jazz.png",
    description: "Professional portrait capturing the essence of contemporary movement."
  },
  {
    type: "video",
    title: "Wedding Dance Performance",
    style: "Contemporary",
    venue: "Private Event",
    year: "2023",
    duration: "5:28",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/3a6de7483_1.jpg",
    description: "Romantic contemporary piece performed at an intimate wedding ceremony."
  },
  {
    type: "photo",
    title: "Hip-Hop Energy",
    style: "Hip-Hop",
    venue: "Street Performance",
    year: "2024",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/f388c1b90_doucare.jpg",
    description: "Capturing the raw energy and attitude of street dance culture."
  },
  {
    type: "video",
    title: "Fusion Performance - Mixed Styles",
    style: "Fusion",
    venue: "Arts Festival",
    year: "2024",
    duration: "7:15",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/87546e8d0_con.jpg",
    description: "Innovative choreography blending contemporary, hip-hop, and ballet elements."
  },
  {
    type: "photo",
    title: "Ballet Grace",
    style: "Ballet",
    venue: "Dance Studio",
    year: "2023",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/3a6de7483_1.jpg",
    description: "Showcasing the timeless elegance and technical precision of classical ballet."
  },
  {
    type: "video",
    title: "Broadway Jazz - Live",
    style: "Jazz",
    venue: "Downtown Theater",
    year: "2024",
    duration: "3:05",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/103cb8ad5_Jazz.png",
    description: "Upbeat jazz number with classic lines and expressive musicality."
  }
];

const styles = ["All", "Contemporary", "Hip-Hop", "Ballet", "Fusion", "Jazz"];

export default function Gallery() {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  // New: inline players state
  const [showBalletPlayer, setShowBalletPlayer] = useState(false);
  const [playingIndex, setPlayingIndex] = useState(null);
  const [showContemporaryPlayer, setShowContemporaryPlayer] = useState(false);
  // New: inline jazz player state
  const [showJazzPlayer, setShowJazzPlayer] = useState(false);

  const toEmbedUrl = (url) => {
    if (!url) return "";
    try {
      const u = new URL(url);
      // Handle youtu.be short links
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        const t = u.searchParams.get("t") || u.searchParams.get("start");
        const start = t ? parseInt(String(t).replace("s", ""), 10) || 0 : 0;
        const params = new URLSearchParams({ rel: "0", autoplay: "1" });
        if (start > 0) params.set("start", String(start));
        return `https://www.youtube.com/embed/${id}?${params.toString()}`;
      }
      // Handle youtube.com/watch or embed
      let id = "";
      if (u.pathname === "/watch") {
        id = u.searchParams.get("v") || "";
      } else if (u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/embed/")[1];
      }
      const t = u.searchParams.get("t") || u.searchParams.get("start");
      const start = t ? parseInt(String(t).replace("s", ""), 10) || 0 : 0;
      const params = new URLSearchParams({ rel: "0", autoplay: "1" });
      if (start > 0) params.set("start", String(start));
      return id ? `https://www.youtube.com/embed/${id}?${params.toString()}` : url;
    } catch {
      return url;
    }
  };

  const filteredItems = selectedFilter === "All" 
    ? mediaItems 
    : mediaItems.filter(item => item.style === selectedFilter);

  const featuredItem = mediaItems.find(item => item.featured);
  // Ensure the ballet solo item is still correctly identified after title change
  const balletSoloItem = mediaItems.find(item => item.title === "La Esmeralda - Ballet Variation" && item.type === "video");
  // Find the Jazz item from mediaItems for its properties like video_url and thumbnail
  const jazzItemFromMedia = mediaItems.find(item => item.title === "Broadway Jazz - Live" && item.type === "video");

  // Specific featured data for Jazz, overriding details from jazzItemFromMedia if needed for display
  const jazzFeaturedDisplayData = {
    type: "video",
    title: "Give it - Jazz Solo",
    style: "Jazz",
    year: "2021",
    duration: "3:10",
    thumbnail: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/993eb9977_2.jpg", // updated thumbnail
    description: "Award-winning jazz solo highlighting syncopated rhythms and expressive musicality.",
    video_url: "https://www.youtube.com/watch?v=NAx5malU5Jc&t=24s"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl movement-animation"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl movement-animation delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <Badge className="mb-6 bg-pink-100 text-pink-700 hover:bg-pink-200">
            <Camera className="w-4 h-4 mr-2" />
            Performance Portfolio
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Gallery</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
            Experience the artistry and emotion of dance through this curated collection of performances. 
            From intimate solo pieces to grand productions, each video and photo captures a moment of 
            pure artistic expression.
          </p>
        </div>
      </section>

      {/* Featured Performance */}
      {(featuredItem || balletSoloItem || jazzItemFromMedia) && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Performance</span>
              </h2>
              <p className="text-lg text-gray-600">
                Don’t miss these highlighted performances that showcase the range from classical ballet to contemporary dance.
              </p>
            </div>

            <div className="space-y-12">
              {/* Ballet Solo first */}
              {balletSoloItem && (
                <Card className="overflow-hidden elegant-shadow hover:shadow-2xl transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative group">
                      <img 
                        src={balletSoloItem.thumbnail}
                        alt={balletSoloItem.title}
                        className="w-full h-64 lg:h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button 
                          size="lg" 
                          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full p-4"
                          onClick={() => setShowBalletPlayer(!showBalletPlayer)}
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                      {balletSoloItem.awards && balletSoloItem.awards.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-500 text-white">
                            <Award className="w-4 h-4 mr-1" />
                            Award Winner
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-8 lg:p-12">
                      <div className="space-y-6">
                        <div>
                          <Badge className="mb-4 bg-pink-100 text-pink-700">
                            {balletSoloItem.style}
                          </Badge>
                          <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            {balletSoloItem.title}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {balletSoloItem.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Award:</span>
                            <p className="font-semibold text-gray-800">YAGP 2023 Finals Junior Women Bronze Medalist</p>
                          </div>
                          <div>
                            <span className="font-medium">Year:</span>
                            <p>{balletSoloItem.year}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p>{balletSoloItem.duration || "-"}</p>
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>
                            <p>{balletSoloItem.type === 'video' ? 'Video' : 'Photo'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button 
                            size="lg" 
                            className="dance-gradient text-white flex-1"
                            onClick={() => setShowBalletPlayer(!showBalletPlayer)}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            {showBalletPlayer ? "Hide Performance" : "Watch Full Performance"}
                          </Button>
                          <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Share
                          </Button>
                        </div>

                        {showBalletPlayer && balletSoloItem.video_url && (
                          <div className="mt-4 relative w-full" style={{ paddingTop: "56.25%" }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              src={toEmbedUrl(balletSoloItem.video_url)}
                              title={balletSoloItem.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )}

              {/* Existing Contemporary featured card */}
              {featuredItem && (
                <Card className="overflow-hidden elegant-shadow hover:shadow-2xl transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative group">
                      <img 
                        src={featuredItem.thumbnail}
                        alt={featuredItem.title}
                        className="w-full h-64 lg:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button 
                          size="lg" 
                          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full p-4"
                          onClick={() => setShowContemporaryPlayer(!showContemporaryPlayer)}
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                      {featuredItem.awards && featuredItem.awards.length > 0 && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-yellow-500 text-white">
                            <Award className="w-4 h-4 mr-1" />
                            Award Winner
                          </Badge>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-8 lg:p-12">
                      <div className="space-y-6">
                        <div>
                          <Badge className="mb-4 bg-pink-100 text-pink-700">
                            {featuredItem.style}
                          </Badge>
                          <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            {featuredItem.title}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {featuredItem.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Award:</span>
                            <p className="font-semibold text-gray-800">Prix de Lausanne 2024 Contemporary Dance Award</p>
                          </div>
                          <div>
                            <span className="font-medium">Year:</span>
                            <p>{featuredItem.year}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p>{featuredItem.duration}</p>
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>
                            <p>{featuredItem.type === 'video' ? 'Video' : 'Photo'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          {featuredItem.video_url ? (
                            <Button 
                              size="lg" 
                              className="dance-gradient text-white flex-1"
                              onClick={() => setShowContemporaryPlayer(!showContemporaryPlayer)}
                            >
                              <Play className="w-5 h-5 mr-2" />
                              {showContemporaryPlayer ? "Hide Performance" : "Watch Full Performance"}
                            </Button>
                          ) : (
                            <Button size="lg" className="dance-gradient text-white flex-1">
                              <Play className="w-5 h-5 mr-2" />
                              Watch Full Performance
                            </Button>
                          )}
                          <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Share
                          </Button>
                        </div>

                        {showContemporaryPlayer && featuredItem.video_url && (
                          <div className="mt-4 relative w-full" style={{ paddingTop: "56.25%" }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              src={toEmbedUrl(featuredItem.video_url)}
                              title={featuredItem.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )}

              {/* New: Jazz Featured card */}
              {jazzItemFromMedia && (
                <Card className="overflow-hidden elegant-shadow hover:shadow-2xl transition-all duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                    <div className="relative group">
                      <img 
                        src={jazzFeaturedDisplayData.thumbnail}
                        alt={jazzFeaturedDisplayData.title}
                        className="w-full h-64 lg:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Button 
                          size="lg" 
                          className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full p-4"
                          onClick={() => setShowJazzPlayer(!showJazzPlayer)}
                        >
                          <Play className="w-8 h-8" />
                        </Button>
                      </div>
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-yellow-500 text-white">
                          <Award className="w-4 h-4 mr-1" />
                          Award Winner
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-8 lg:p-12">
                      <div className="space-y-6">
                        <div>
                          <Badge className="mb-4 bg-pink-100 text-pink-700">
                            {jazzFeaturedDisplayData.style}
                          </Badge>
                          <h3 className="text-3xl font-bold text-gray-900 mb-4">
                            {jazzFeaturedDisplayData.title}
                          </h3>
                          <p className="text-gray-600 text-lg leading-relaxed">
                            {jazzFeaturedDisplayData.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Award:</span>
                            <p className="font-semibold text-gray-800">Radix 2021 Junior Core Performer Winner</p>
                          </div>
                          <div>
                            <span className="font-medium">Year:</span>
                            <p>{jazzFeaturedDisplayData.year}</p>
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span>
                            <p>{jazzFeaturedDisplayData.duration}</p>
                          </div>
                          <div>
                            <span className="font-medium">Type:</span>
                            <p>{jazzFeaturedDisplayData.type === 'video' ? 'Video' : 'Photo'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button 
                            size="lg" 
                            className="dance-gradient text-white flex-1"
                            onClick={() => setShowJazzPlayer(!showJazzPlayer)}
                          >
                            <Play className="w-5 h-5 mr-2" />
                            {showJazzPlayer ? "Hide Performance" : "Watch Full Performance"}
                          </Button>
                          <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
                            <ExternalLink className="w-5 h-5 mr-2" />
                            Share
                          </Button>
                        </div>

                        {showJazzPlayer && jazzFeaturedDisplayData.video_url && (
                          <div className="mt-4 relative w-full" style={{ paddingTop: "56.25%" }}>
                            <iframe
                              className="absolute top-0 left-0 w-full h-full rounded-lg"
                              src={toEmbedUrl(jazzFeaturedDisplayData.video_url)}
                              title={jazzFeaturedDisplayData.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Filters and Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Complete <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Portfolio</span>
              </h2>
              <p className="text-gray-600">
                Browse through {filteredItems.length} performances across different dance styles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Style Filters */}
              <div className="flex flex-wrap gap-2">
                {styles.map((style) => (
                  <Button
                    key={style}
                    variant={selectedFilter === style ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFilter(style)}
                    className={selectedFilter === style ? "dance-gradient text-white" : ""}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    {style}
                  </Button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Gallery Grid */}
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1'
          }`}>
            {filteredItems.map((item, index) => (
              <Card key={index} className="group overflow-hidden bg-white elegant-shadow hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Media Type Icon */}
                  <div className="absolute top-3 right-3">
                    <div className="w-8 h-8 bg-black/50 rounded-full backdrop-blur-sm flex items-center justify-center">
                      {item.type === 'video' ? (
                        <Video className="w-4 h-4 text-white" />
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </div>
                  </div>

                  {/* Play Button for Videos */}
                  {item.type === 'video' && item.video_url && ( // Only show if it's a video and has a URL
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button 
                        size="sm" 
                        className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full p-3"
                        onClick={() => setPlayingIndex(playingIndex === index ? null : index)} // Toggle play
                      >
                        <Play className="w-5 h-5" />
                      </Button>
                    </div>
                  )}

                  {/* Duration for Videos */}
                  {item.duration && (
                    <div className="absolute bottom-3 right-3">
                      <Badge className="bg-black/70 text-white text-xs">
                        {item.duration}
                      </Badge>
                    </div>
                  )}

                  {/* Awards Badge */}
                  {item.awards && item.awards.length > 0 && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-yellow-500 text-white text-xs">
                        <Award className="w-3 h-3 mr-1" />
                        Award
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-purple-600 border-purple-600">
                        {item.style}
                      </Badge>
                      <span className="text-xs text-gray-500">{item.year}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="text-xs text-gray-500">
                      <span>{item.venue}</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {item.video_url ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-pink-600 hover:text-pink-700 p-0"
                          onClick={() => setPlayingIndex(playingIndex === index ? null : index)}
                        >
                          {playingIndex === index ? "Hide" : (item.type === 'video' ? 'Watch' : 'View')} Full
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-pink-600 hover:text-pink-700 p-0">
                          {/* If no video_url, this button might just link externally or do nothing specific */}
                          {item.type === 'video' ? 'Watch' : 'View'} Full
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-pink-600 p-1">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>

                    {playingIndex === index && item.video_url && (
                      <div className="mt-3 relative w-full" style={{ paddingTop: "56.25%" }}>
                        <iframe
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src={toEmbedUrl(item.video_url)}
                          title={item.title}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
