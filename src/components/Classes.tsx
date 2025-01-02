import React from 'react';
import { Music2, Users, Star, Trophy } from 'lucide-react';

const classes = [
  {
    title: 'Ballet',
    description: 'Classical ballet training for all levels',
    icon: Music2,
    color: 'text-pink-500',
  },
  {
    title: 'Contemporary',
    description: 'Modern dance techniques and expression',
    icon: Users,
    color: 'text-purple-500',
  },
  {
    title: 'Jazz',
    description: 'Energetic and rhythmic dance styles',
    icon: Star,
    color: 'text-blue-500',
  },
  {
    title: 'Competition Team',
    description: 'Advanced training for competitions',
    icon: Trophy,
    color: 'text-yellow-500',
  },
];

const Classes = () => {
  return (
    <section id="classes" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Dance Classes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explore our diverse range of dance classes taught by experienced instructors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {classes.map((classItem, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className={`${classItem.color} mb-4`}>
                <classItem.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{classItem.title}</h3>
              <p className="text-gray-600">{classItem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Classes;