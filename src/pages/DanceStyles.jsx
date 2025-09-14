
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Zap, Crown, Music, Heart, 
  PlayCircle, ArrowRight, Star 
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

// Reordered: Ballet, Contemporary, Jazz, Hip-Hop
const danceStyles = [
  {
    title: "Ballet",
    subtitle: "Classical Grace & Technical Excellence",
    description: "Ballet is the foundation that grounds all my other movement. It's where discipline meets artistry, where years of training culminate in seemingly effortless grace. The classical tradition of ballet provides the technical backbone for all my performances, offering precision, control, and that timeless elegance that has captivated audiences for centuries.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/604b92dbe_ballet.jpg",
    icon: Crown,
    color: "from-indigo-500 to-blue-500",
    techniques: ["Classical Positions", "Port de Bras", "Grand Jetés", "Pirouettes", "Pointe Work"],
    keyFeatures: [
      "Perfect technical execution",
      "Graceful line and form",
      "Traditional choreographic elements",
      "Elegant costume and presentation"
    ],
    perfectFor: ["Classical Concerts", "Luxury Events", "Cultural Celebrations", "Educational Performances"]
  },
  {
    title: "Contemporary",
    subtitle: "Emotional Storytelling Through Movement",
    description: "Contemporary dance is where I find my deepest expression. It's a style that allows for complete emotional vulnerability, where every gesture carries meaning and every movement tells a part of the story. Drawing from ballet foundations while embracing modern expression, contemporary dance becomes a conversation between the dancer and the audience's soul.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/87546e8d0_con.jpg",
    icon: Sparkles,
    color: "from-pink-500 to-rose-500",
    techniques: ["Floor Work", "Emotional Expression", "Improvisation", "Release Technique"],
    keyFeatures: [
      "Fluid transitions between movements",
      "Deep emotional connection",
      "Storytelling through choreography",
      "Integration of breath and movement"
    ],
    perfectFor: ["Corporate Events", "Weddings", "Art Galleries", "Theater Productions"]
  },
  {
    title: "Jazz",
    subtitle: "Broadway Energy & Expressive Musicality",
    description: "Jazz blends classic technique with contemporary flair—syncopated rhythms, expressive lines, and show-stopping stage presence. From vintage Broadway to modern commercial styles, Jazz brings infectious energy and personality to every performance.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/b0f5b3f40_Jazz.png",
    icon: Music,
    color: "from-amber-500 to-pink-500",
    techniques: ["Isolation", "Syncopation", "Turns & Kicks", "Across-the-floor combos"],
    keyFeatures: [
      "Upbeat musicality",
      "Expressive stage presence",
      "Classic jazz lines",
      "Broadway-inspired choreography"
    ],
    perfectFor: ["Theater Shows", "Commercial Events", "Corporate Entertainment", "Music Videos"]
  },
  {
    title: "Hip-Hop",
    subtitle: "Urban Energy & Street Culture",
    description: "Hip-hop brings an entirely different energy to my performances—raw, authentic, and unapologetically bold. This style represents the pulse of the city, the rhythm of street culture, and the power of individual expression. From breaking to popping, from house to krump, hip-hop dance is about attitude, personality, and making the music visible through movement.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    icon: Zap,
    color: "from-purple-500 to-indigo-500",
    techniques: ["Breaking", "Popping", "Locking", "House Dance", "Krump"],
    keyFeatures: [
      "Sharp, isoloated movements",
      "Strong rhythmic foundation",
      "Freestyle and improvisation",
      "Cultural authenticity and respect"
    ],
    perfectFor: ["Music Videos", "Commercial Events", "Youth Programs", "Fashion Shows"]
  },
  {
    title: "Tap",
    subtitle: "Rhythm, Precision, and Musicality",
    description: "Tap is percussion through movement—syncopated rhythms, crisp footwork, and playful musicality that turns the floor into an instrument.",
    image: "https://images.unsplash.com/photo-1594736797933-d0cb71b2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    icon: Music,
    color: "from-sky-500 to-cyan-500",
    techniques: ["Shuffles", "Time Steps", "Wings", "Pullbacks", "Improvisation"],
    keyFeatures: [
      "Live musicality with the feet",
      "Clean, articulate sounds",
      "Playful call-and-response",
      "Solo and ensemble versatility"
    ],
    perfectFor: ["Live Music Events", "Theater Shows", "Corporate Entertainment", "Festivals"]
  },
  {
    title: "Ballroom",
    subtitle: "Elegance, Partnership, and Flow",
    description: "Ballroom highlights classic partner dance forms with refined technique and stunning presentation—from Waltz and Foxtrot to Cha-Cha and Rumba.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    icon: Heart,
    color: "from-rose-500 to-pink-500",
    techniques: ["Waltz", "Foxtrot", "Tango", "Cha-Cha", "Rumba"],
    keyFeatures: [
      "Graceful partnering",
      "Sophisticated lines",
      "Musical phrasing",
      "Classic showcase appeal"
    ],
    perfectFor: ["Weddings", "Galas", "Corporate Events", "Ballroom Showcases"]
  }
];

const crossTrainingBenefits = [
  {
    title: "Versatility",
    description: "Training across multiple styles creates a well-rounded performer capable of adapting to any artistic vision.",
    icon: Star
  },
  {
    title: "Emotional Range",
    description: "Each style offers different emotional vocabularies, expanding the range of stories I can tell.",
    icon: Heart
  },
  {
    title: "Technical Excellence",
    description: "Cross-training strengthens different muscle groups and movement patterns, improving overall technique.",
    icon: Sparkles
  },
  {
    title: "Creative Innovation",
    description: "Blending elements from different styles creates unique, signature choreographic moments.",
    icon: Music
  }
];

export default function DanceStyles() {
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
            <Music className="w-4 h-4 mr-2" />
            Multi-Style Dance Expertise
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Dance <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Styles</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
            Each style of dance is a different language of expression. From the emotional depth of contemporary 
            to the urban energy of hip-hop and the timeless elegance of ballet, discover the artistry behind 
            every movement and find the perfect style for your event.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Gallery")}>
              <Button size="lg" className="dance-gradient text-white px-8 py-4 rounded-full">
                <PlayCircle className="mr-2 w-5 h-5" />
                Watch Performances
              </Button>
            </Link>
            <Link to={createPageUrl("Contact")}>
              <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-8 py-4 rounded-full">
                Book Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Dance Styles Detail */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {danceStyles.map((style, index) => (
              <div key={style.title} className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''
              }`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="relative">
                    <img 
                      src={style.image}
                      alt={style.title}
                      className="w-full h-96 lg:h-[500px] object-cover rounded-2xl elegant-shadow"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${style.color} opacity-20 rounded-2xl`}></div>
                    <div className="absolute top-6 left-6">
                      <div className="w-16 h-16 bg-white/90 rounded-full backdrop-blur-sm flex items-center justify-center">
                        <style.icon className="w-8 h-8 text-pink-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
                        {style.title}
                      </h2>
                      <p className="text-xl text-pink-600 font-medium mb-4">
                        {style.subtitle}
                      </p>
                    </div>

                    <p className="text-gray-700 leading-relaxed text-lg">
                      {style.description}
                    </p>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Key Techniques:</h3>
                      <div className="flex flex-wrap gap-2">
                        {style.techniques.map((technique) => (
                          <Badge key={technique} variant="outline" className="text-purple-600 border-purple-600">
                            {technique}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Performance Features:</h3>
                      <ul className="space-y-2">
                        {style.keyFeatures.map((feature) => (
                          <li key={feature} className="flex items-center text-gray-700">
                            <div className="w-2 h-2 bg-pink-500 rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">Perfect For:</h3>
                      <div className="flex flex-wrap gap-2">
                        {style.perfectFor.map((event) => (
                          <Badge key={event} className="bg-pink-100 text-pink-700 hover:bg-pink-200">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cross-Training Benefits */}
      <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              The Power of <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Cross-Training</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Training across multiple dance styles isn't just about versatility—it's about becoming a complete artist 
              with the ability to tell any story through movement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {crossTrainingBenefits.map((benefit, index) => (
              <Card key={index} className="bg-white elegant-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Dance Artistry?</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Let's discuss which dance style would be perfect for your event. Each performance is customized 
            to create the exact atmosphere and emotional impact you envision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="dance-gradient text-white px-8 py-4 rounded-full">
                Schedule Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to={createPageUrl("Gallery")}>
              <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-8 py-4 rounded-full">
                View Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
