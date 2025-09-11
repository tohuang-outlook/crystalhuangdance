
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Event Coordinator",
    company: "Metropolitan Arts Center",
    content: "Crystal's performance was absolutely breathtaking. Her ability to convey emotion through movement left our entire audience in awe. A true professional and artist.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Marcus Rivera",
    role: "Director",
    company: "Brooklyn Dance Collective",
    content: "Working with Crystal has been an incredible experience. Her versatility across dance styles and her creative vision make her an exceptional performer and collaborator.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  },
  {
    name: "Elena Martinez",
    role: "Wedding Planner",
    company: "Elegant Affairs",
    content: "Crystal transformed our client's wedding into a magical experience. Her contemporary piece during the ceremony brought tears to everyone's eyes. Absolutely stunning work.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
  }
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            What Clients <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Say</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The power of dance speaks through the experiences of those who witness it. 
            Here's what collaborators and audiences have to say about working with Crystal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-white elegant-shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <Quote className="w-8 h-8 text-pink-300" />
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                
                <blockquote className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center space-x-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-pink-600 font-medium">{testimonial.company}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
