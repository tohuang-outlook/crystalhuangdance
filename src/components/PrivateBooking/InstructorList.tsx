import React from 'react';
import { instructors } from './data';
import { useBooking } from './BookingContext';

const InstructorList = () => {
  const { selectedInstructor, setSelectedInstructor } = useBooking();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Select an Instructor</h3>
      <div className="space-y-4">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedInstructor?.id === instructor.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-purple-300'
            }`}
            onClick={() => setSelectedInstructor(instructor)}
          >
            <div className="flex items-center space-x-4">
              <img
                src={instructor.image}
                alt={instructor.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold text-lg">{instructor.name}</h4>
                <p className="text-gray-600">{instructor.specialties.join(', ')}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InstructorList;