
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Award, MapPin, Calendar, Heart, 
  Sparkles, Users, BookOpen, Target 
} from "lucide-react";

const achievements = [
  { year: "2024", title: "SAIBC International Finals Senior Women Grand Prix Winner", organization: "" },
  { year: "2024", title: "YAGP NYC Finals Senior Women Silver Medal Winner", organization: "" },
  { year: "2024", title: "Prix de Lausanne Prize Winner #4 and Contemporary Dance Award Winner", organization: "" },
  { year: "2024", title: "Young Arts Winner of Distinction in Ballet", organization: "" },
  { year: "2023", title: "NYCDA NYC National Teen Female Outstanding Dancer Winner", organization: "" },
  { year: "2023", title: "The Dance Awards Las Vegas Nationals Teen Female Best Dancer Winner", organization: "" },
  { year: "2023", title: "YAGP Tampa Finals Junior Bronze Medal Winner", organization: "" },
  { year: "2022", title: "YAGP Tampa Finals Junior Bronze Medal Winner", organization: "" },
  { year: "2021", title: "The Dance Awards Las Vegas Nationals Junior Female Best Dancer Winner", organization: "" },
  { year: "2021", title: "Radix National Junior Female Core Performer Winner", organization: "" },
  { year: "2019", title: "The Dance Awards Las Vegas Nationals Mini Female Best Dancer Winner", organization: "" },
  { year: "2019", title: "Radix National Mini Female Core Performer Winner", organization: "" },
  { year: "2019", title: "KAR Anaheim Finals Junior Intermediate Solo National Champion & Miss Junior Dance America", organization: "" },
  { year: "2019", title: "Showstopper Anaheim Finals - Junior Competitive National Champion", organization: "" },
  { year: "2019", title: "StarPower Anaheim Finals Junior Competitive Grand Champion and Title Winner", organization: "" },
  { year: "2018", title: "KAR Nationals Anaheim Junior Solo 1st Overall and Miss Junior KAR", organization: "" },
  { year: "2018", title: "Showbiz Nationals Anaheim Junior Solo Grand Champion and Miss Showbiz", organization: "" },
  { year: "2018", title: "Showstopper Nationals Anaheim Junior Solo 1st Overall", organization: "" },
  { year: "2017", title: "Starpower Talent Nationals Las Vegas Mini Solo Grand Champion and Miss Petite Starpower", organization: "" },
  { year: "2017", title: "KAR Nationals Biloxi Mini Solo 1st Overall and Mini Petite KAR", organization: "" }
];

const timeline = [
  { year: "2024", event: "Unite Ballet Festival of The Joyce Theater (8/13-18)", location: "Manhattan, NY" },
  { year: "2024", event: "YAGP Sicily “Stars of today meet the stars of tomorrow”", location: "Sicily, Italy" },
  { year: "2024", event: "YAGP Gala at Nervi Ballet Festival", location: "Parchi de Nervi, Italy" },
  { year: "2024", event: "South Africa International Competition Gala", location: "Cape Town, Africa" },
  { year: "2024", event: "AEDC 10th Anniversary Gala", location: "Beijing, China" },
  { year: "2024", event: "NYCDA New York Finals Gala", location: "Manhattan, NY" },
  { year: "2024", event: "The Dance Awards Las Vegas Nationals Gala", location: "Las Vegas, NV" },
  { year: "2024", event: "YAGP 25th Anniversary NYC Finals Rising Stars Gala", location: "Manhattan, NY" },
  { year: "2024", event: "YAGP 25th Anniversary NYC Gala at Koch Theater", location: "Manhattan, NY" },
  { year: "2024", event: "Hivernales de la Danse Festival Galas", location: "Belgium" },
  { year: "2024", event: "Prix de Lausanne Rising Stars Gala", location: "Beaulieu, Switzerland" },
  { year: "2024", event: "Young Arts Gala @ Miami Performing Arts", location: "Miami, FL" },
  { year: "2024", event: "YAGP 25th Tampa Regional Gala at Straz Theater", location: "Tampa, FL" },
  { year: "2023", event: "Snow Queen Production at Mountain View Performing Art", location: "Mountain View, CA" },
  { year: "2023", event: "Petipa Awards Gala at Herbst Theater", location: "San Francisco, CA" },
  { year: "2023", event: "YAGP 25th Anniversary Opening Gala at Lincoln Center", location: "Manhattan, NY" },
  { year: "2022", event: "YAGP Fundraising Gala", location: "San Francisco, CA" },
  { year: "2021", event: "Radio City Christmas Spectacular in NYC (Role: Clara & Ellie)", location: "Manhattan, NY" },
  { year: "2021, 2022, 2023", event: "YAGP Stars of Today Meet the Stars of Tomorrow", location: "Tampa, FL" },
  { year: "2021, 2022", event: "Nervi Ballet Festival & YAGP Genoa Italy Gala (Soloist)", location: "Parchi di Nervi, Italy" },
  { year: "2019", event: "Academy of Country Music Awards (Andrew Winghart/Little Big Town)", location: "Las Vegas, NV" },
  { year: "2018, 2019", event: "Christmas Spectacular at Central Church", location: "Henderson, NV" },
  { year: "2013-2017", event: "Nutcracker: Yoko’s Dance / Fremont Symphony", location: "Fremont, CA" }
];

const training = [
  { period: "2025-Current", school: "San Francisco Ballet School" },
  { period: "2024-2025", school: "American Ballet Theatre School" },
  { period: "2024 summer", school: "Nederlands Dans Theater Summer Intensive" },
  { period: "2023-2024", school: "Bayer Ballet Academy" },
  { period: "2023 summer", school: "Juilliard Summer Intensive" },
  { period: "2018-2024", school: "The Rock Center for Dance Las Vegas" },
  { period: "2020-2023", school: "Nevada School of Ballet" },
  { period: "2011-2018", school: "Yoko’s Dance and Performing Arts Academy" },
  { period: "2015-2024", school: "Nuvo, Jump, 24 seven, Radix, NYCDA dance conventions" }
];

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-50">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-gradient-to-r from-pink-300/20 to-purple-300/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-6 bg-pink-100 text-pink-700 hover:bg-pink-200">
                <Sparkles className="w-4 h-4 mr-2" />
                Professional Dancer & Choreographer
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                About <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Crystal</span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Dance isn't just what I do—it's who I am. For over eight years, I've dedicated my life to 
                the art of movement, transforming emotions into stories that resonate with audiences worldwide.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white rounded-lg elegant-shadow">
                  <Calendar className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">8+ Years</h3>
                  <p className="text-sm text-gray-600">Professional Experience</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg elegant-shadow">
                  <Users className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-gray-900">500+</h3>
                  <p className="text-sm text-gray-600">Performances Worldwide</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/243c0f545_IMG_6742.jpg"
                alt="Crystal Huang portrait"
                className="w-full rounded-2xl elegant-shadow movement-animation"
              />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full blur-2xl opacity-60"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              My <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Story</span>
            </h2>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed mb-6">
              Born in Fremont, California, I began dancing at age 3 at Yoko’s Dance and Performing Arts Academy. My early training spanned multiple styles—hip hop, jazz, tap, contemporary, and ballet—typical of commercial dance studios. But around age 13, I pivoted toward classical ballet, realizing it was my true passion.
            </p>

            <p className="text-gray-700 leading-relaxed mb-6">
              I trained at The Rock Center for Dance in Las Vegas and later enrolled at Bayer Ballet Academy, known for its rigorous Vaganova method. This shift helped me refine my technique and prepare for elite competitions.
            </p>

            <p className="text-gray-700 leading-relaxed">
              In 2024, I won a Prize at the prestigious Prix de Lausanne in Switzerland, one of the most respected ballet competitions globally. I also earned the Female Contemporary Dance Award at the same event. That same year, I placed second in the senior division at the Youth America Grand Prix finals in New York and won the Grand Prix at the South Africa International Ballet Competition.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Journey</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Each milestone represents growth, learning, and the endless pursuit of artistic excellence.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 to-purple-500"></div>
            
            <div className="space-y-8">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full border-4 border-white"></div>
                  
                  <Card className={`w-full md:w-5/12 ml-12 md:ml-0 ${
                    index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                  } bg-white elegant-shadow hover:shadow-xl transition-all duration-300`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-100 text-purple-700">{item.year}</Badge>
                        <MapPin className="w-4 h-4 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.event}</h3>
                      <p className="text-gray-600">{item.location}</p>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Training Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Training</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A journey of disciplined study and growth across world-class programs and intensives.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 transform md:-translate-x-px top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-500 to-purple-500"></div>
            
            <div className="space-y-8">
              {training.map((item, index) => (
                <div key={index} className={`relative flex items-center ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}>
                  <div className="absolute left-4 md:left-1/2 transform md:-translate-x-1/2 w-4 h-4 bg-pink-500 rounded-full border-4 border-white"></div>
                  
                  <Card className={`w-full md:w-5/12 ml-12 md:ml-0 ${
                    index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                  } bg-white elegant-shadow hover:shadow-xl transition-all duration-300`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-purple-100 text-purple-700">{item.period}</Badge>
                        <BookOpen className="w-4 h-4 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.school}</h3>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Awards & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Recognition</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Recognition from peers and industry leaders for dedication to the art of dance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <Card key={index} className="bg-gradient-to-r from-pink-50 to-purple-50 border-0 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="text-purple-600 border-purple-600">
                          {achievement.year}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-600">{achievement.organization}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="relative">
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pink-300/20 rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10">
              <Target className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-4xl md::text-5xl font-bold text-white mb-8">
                My Mission
              </h2>
              <p className="text-xl text-pink-100 leading-relaxed max-w-3xl mx-auto">
                To create transformative experiences through dance that connect people to their emotions, 
                to each other, and to the universal language of movement. Every performance is an opportunity 
                to inspire, heal, and bring beauty into the world.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
