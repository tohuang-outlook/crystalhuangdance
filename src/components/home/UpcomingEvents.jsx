
import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

const upcomingEvents = [
  {
    title: "Press Play Dance Convention",
    venue: "Loews Hollywood Hotel",
    date: "Oct 24-26, 2025",
    time: "7:30 PM",
    location: "Los Angeles, CA",
    type: "Solo Performance",
    description: "An intimate evening of contemporary dance exploring themes of connection and solitude.",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68c06b01a75c8c986b674f79/346907192_pressplay.jpg",
    status: "Available",
    ticketUrl: "https://www.pressplay.com/tour-dates"
  },
  {
    title: "Urban Dance Showcase",
    venue: "Brooklyn Dance Studio",
    date: "March 28, 2024",
    time: "8:00 PM",
    location: "Brooklyn, NY",
    type: "Group Performance",
    description: "High-energy hip-hop and street dance showcase featuring original choreography.",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    status: "Nearly Sold Out"
  }
];

export default function UpcomingEvents() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl">
              Don't miss these upcoming performances. Each show is a unique journey through movement and emotion.
            </p>
          </div>
          
          <Link to={createPageUrl("Events")} className="mt-6 lg:mt-0">
            <Button variant="outline" size="lg" className="border-pink-600 text-pink-600 hover:bg-pink-600 hover:text-white">
              View All Events
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {upcomingEvents.map((event, index) => (
            <Card key={index} className="group overflow-hidden bg-white elegant-shadow hover:shadow-2xl transition-all duration-500">
              <div className="md:flex">
                <div className="md:w-1/3">
                  <div className="h-48 md:h-full relative overflow-hidden">
                    <img 
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <Badge 
                      className={`absolute top-4 left-4 ${
                        event.status === 'Nearly Sold Out' 
                          ? 'bg-orange-500 hover:bg-orange-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      } text-white`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="md:w-2/3 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-purple-600 border-purple-600">
                      {event.type}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-pink-600 transition-colors">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {event.description}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-pink-500" />
                      <span className="text-sm">{event.date} at {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="text-sm">{event.venue}, {event.location}</span>
                    </div>
                  </div>
                  
                  {event.ticketUrl ? (
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer" className="block">
                      <Button className="w-full dance-gradient text-white hover:opacity-90 transition-opacity">
                        Get Tickets
                      </Button>
                    </a>
                  ) : (
                    <Button className="w-full dance-gradient text-white hover:opacity-90 transition-opacity">
                      Get Tickets
                    </Button>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
