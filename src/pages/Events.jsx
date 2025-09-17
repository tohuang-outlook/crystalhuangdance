
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, MapPin, Clock, Users, 
  Ticket, ExternalLink, Filter, Plus 
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const events = [
  {
    id: 1,
    title: "Press Play Dance Convention, Workshop & Competition.",
    date: "2024-03-15",
    time: "7:30 PM",
    venue: "Metropolitan Arts Center",
    location: "New York, NY",
    type: "Solo Performance",
    style: "Dance Convention",
    duration: "90 minutes",
    capacity: 150,
    ticketsAvailable: 45,
    price: "$35-65",
    description: "A NEW ERA OF DANCE EVENTS, it's more than just a bold statement—it's a promise. For over 80 combined years, our journeys have taken us through every facet of the dance world. Ray began his teaching career alongside the legendary Joe Tremaine on Tremaine Dance Convention, Danny started as an assistant to the iconic Mia Michaels, and Brad, our CEO, cut his teeth as the Associate General Manager for the hit show STOMP before going on to shape some of the largest dance events globally.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/346907192_pressplay.jpg",
    status: "on-sale",
    featured: true
  },
  {
    id: 2,
    title: "Urban Dance Showcase",
    date: "2024-03-28",
    time: "8:00 PM",
    venue: "Brooklyn Dance Studio",
    location: "Brooklyn, NY",
    type: "Group Performance",
    style: "Hip-Hop",
    duration: "2 hours",
    capacity: 200,
    ticketsAvailable: 12,
    price: "$25-40",
    description: "High-energy hip-hop and street dance showcase featuring original choreography and guest performers from the NYC dance scene.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "nearly-sold-out"
  },
  {
    id: 3,
    title: "Spring Ballet Gala",
    date: "2024-04-12",
    time: "7:00 PM",
    venue: "Grand Theater",
    location: "Manhattan, NY",
    type: "Gala Performance",
    style: "Ballet",
    duration: "2.5 hours",
    capacity: 500,
    ticketsAvailable: 320,
    price: "$50-150",
    description: "Classical ballet gala featuring variations from Swan Lake, Giselle, and original contemporary ballet pieces.",
    image: "https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "on-sale"
  },
  {
    id: 4,
    title: "Private Wedding Performance",
    date: "2024-04-20",
    time: "6:00 PM",
    venue: "Private Venue",
    location: "Long Island, NY",
    type: "Private Event",
    style: "Contemporary",
    duration: "30 minutes",
    capacity: 80,
    ticketsAvailable: 0,
    price: "Private",
    description: "Intimate contemporary dance performance for a wedding celebration, featuring custom choreography created for the couple.",
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "private"
  },
  {
    id: 5,
    title: "Dance Fusion Workshop & Performance",
    date: "2024-05-05",
    time: "2:00 PM",
    venue: "Community Arts Center",
    location: "Queens, NY",
    type: "Workshop + Performance",
    style: "Fusion",
    duration: "3 hours",
    capacity: 50,
    ticketsAvailable: 25,
    price: "$45",
    description: "Interactive workshop followed by a fusion performance blending contemporary, hip-hop, and ballet elements.",
    image: "https://images.unsplash.com/photo-1594736797933-d0cb71b2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "on-sale"
  },
  {
    id: 6,
    title: "Summer Dance Intensive Showcase",
    date: "2024-06-15",
    time: "7:30 PM",
    venue: "Lincoln Center Plaza",
    location: "New York, NY",
    type: "Outdoor Performance",
    style: "Mixed",
    duration: "2 hours",
    capacity: 300,
    ticketsAvailable: 180,
    price: "Free",
    description: "Free outdoor performance showcasing the best of summer dance intensive programs, featuring multiple dance styles.",
    image: "https://images.unsplash.com/photo-1547153760-18fc86324498?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "free"
  },
  {
    id: 7,
    title: "Jazz Dance Jam Session",
    date: "2024-07-20",
    time: "6:00 PM",
    venue: "The Jazz Loft",
    location: "Harlem, NY",
    type: "Group Performance",
    style: "Jazz",
    duration: "1.5 hours",
    capacity: 80,
    ticketsAvailable: 50,
    price: "$20",
    description: "An energetic evening of classic and contemporary jazz dance, featuring improvised solos and group numbers.",
    image: "https://images.unsplash.com/photo-1543781326-764acb364817?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "on-sale"
  }
];

const eventTypes = ["All", "Solo Performance", "Group Performance", "Private Event", "Workshop + Performance", "Gala Performance", "Outdoor Performance"];
const danceStyles = ["All", "Contemporary", "Hip-Hop", "Ballet", "Fusion", "Mixed", "Jazz", "Dance Convention"];

const getStatusColor = (status) => {
  switch (status) {
    case "on-sale":
      return "bg-green-100 text-green-800";
    case "nearly-sold-out":
      return "bg-orange-100 text-orange-800";
    case "sold-out":
      return "bg-red-100 text-red-800";
    case "private":
      return "bg-purple-100 text-purple-800";
    case "free":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "on-sale":
      return "Tickets Available";
    case "nearly-sold-out":
      return "Nearly Sold Out";
    case "sold-out":
      return "Sold Out";
    case "private":
      return "Private Event";
    case "free":
      return "Free Event";
    default:
      return "Coming Soon";
  }
};

export default function Events() {
  const [typeFilter, setTypeFilter] = useState("All");
  const [styleFilter, setStyleFilter] = useState("All");

  const filteredEvents = events.filter(event => {
    const typeMatch = typeFilter === "All" || event.type === typeFilter;
    const styleMatch = styleFilter === "All" || event.style === styleFilter;
    return typeMatch && styleMatch;
  });

  const upcomingEvents = filteredEvents.filter(event => new Date(event.date) >= new Date());
  const featuredEvent = events.find(event => event.featured);

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
            <Calendar className="w-4 h-4 mr-2" />
            Upcoming Performances
          </Badge>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Dance <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Events</span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed mb-12 max-w-4xl mx-auto">
            Join me for unforgettable dance experiences. From intimate solo performances to grand galas, 
            each event is crafted to create meaningful connections through the power of movement.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Contact")}>
              <Button size="lg" className="dance-gradient text-white px-8 py-4 rounded-full">
                <Plus className="mr-2 w-5 h-5" />
                Book Private Performance
              </Button>
            </Link>
            <a href="#upcoming-events">
              <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white px-8 py-4 rounded-full">
                View All Events
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Featured Event */}
      {featuredEvent && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Featured <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Event</span>
              </h2>
              <p className="text-lg text-gray-600">
                Don't miss this special performance that promises to be an evening of pure artistry.
              </p>
            </div>

            <Card className="overflow-hidden elegant-shadow hover:shadow-2xl transition-all duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                <div className="relative">
                  <img 
                    src={featuredEvent.image}
                    alt={featuredEvent.title}
                    className="w-full h-64 lg:h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-yellow-500 text-white">
                      Featured Event
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge className={getStatusColor(featuredEvent.status)}>
                      {getStatusText(featuredEvent.status)}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-8 lg:p-12">
                  <div className="space-y-6">
                    <div>
                      <Badge className="mb-4 bg-pink-100 text-pink-700">
                        {featuredEvent.style}
                      </Badge>
                      <h3 className="text-3xl font-bold text-gray-900 mb-4">
                        {featuredEvent.title}
                      </h3>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {featuredEvent.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                        <span>{new Date(featuredEvent.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{featuredEvent.time}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                        <span>{featuredEvent.venue}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-green-500" />
                        <span>{featuredEvent.ticketsAvailable} tickets left</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <a href="https://www.pressplay.com/" target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button size="lg" className="w-full dance-gradient text-white">
                          <Ticket className="w-5 h-5 mr-2" />
                          Get Tickets
                        </Button>
                      </a>
                      <a href="https://www.pressplay.com/" target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="lg" className="w-full border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
                          <ExternalLink className="w-5 h-5 mr-2" />
                          More Details
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* All Events */}
      <section id="upcoming-events" className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                All <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Events</span>
              </h2>
              <p className="text-gray-600">
                {upcomingEvents.length} upcoming events across different venues and styles.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Type Filter */}
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Style Filter */}
              <select 
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                {danceStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="group overflow-hidden bg-white elegant-shadow hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1">
                <div className="relative">
                  <img 
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-3 left-3">
                    <Badge className={getStatusColor(event.status)}>
                      {getStatusText(event.status)}
                    </Badge>
                  </div>

                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="bg-black/50 text-white border-white/30">
                      {event.style}
                    </Badge>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg mb-1 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {event.description}
                    </p>

                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-purple-500" />
                        <span>{event.time} • {event.duration}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                        <span>{event.venue}, {event.location}</span>
                      </div>
                      {event.status !== 'private' && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-green-500" />
                          <span>{event.ticketsAvailable} tickets available</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      {event.status === 'private' ? (
                        <span className="font-semibold text-purple-600">Private Event</span>
                      ) : (
                        <span className="font-semibold text-pink-600">
                          {event.price === 'Free' ? 'Free Event' : `From ${event.price}`}
                        </span>
                      )}
                      
                      <Button 
                        size="sm" 
                        className={
                          event.status === 'sold-out' 
                            ? "bg-gray-400 cursor-not-allowed" 
                            : "dance-gradient text-white"
                        }
                        disabled={event.status === 'sold-out'}
                      >
                        {event.status === 'sold-out' ? 'Sold Out' : 
                         event.status === 'private' ? 'Details' :
                         event.price === 'Free' ? 'RSVP' : 'Get Tickets'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {upcomingEvents.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your filters or check back later for new events.
              </p>
              <Link to={createPageUrl("Contact")}>
                <Button className="dance-gradient text-white">
                  Request Private Performance
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
