import React from "react";
import { Award, Users, Calendar, Heart } from "lucide-react";

const stats = [
  {
    icon: Calendar,
    number: "500+",
    label: "Performances",
    description: "Shows across venues worldwide",
    color: "text-pink-600"
  },
  {
    icon: Users,
    number: "10K+",
    label: "Audience Members",
    description: "Touched by dance artistry",
    color: "text-purple-600"
  },
  {
    icon: Award,
    number: "15+",
    label: "Awards",
    description: "Recognition for excellence",
    color: "text-indigo-600"
  },
  {
    icon: Heart,
    number: "8+",
    label: "Years",
    description: "Professional dance experience",
    color: "text-rose-600"
  }
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Dance by the <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">Numbers</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every statistic represents a moment of connection, artistry, and the power of movement to inspire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 movement-animation">
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-4xl md:text-5xl font-bold text-gray-900">
                    {stat.number}
                  </h3>
                  <p className="text-xl font-semibold text-gray-800">
                    {stat.label}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {stat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}