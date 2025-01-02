import React from 'react';
import InstructorList from './InstructorList';
import BookingForm from './BookingForm';
import { BookingProvider } from './BookingContext';

const PrivateBooking = () => {
  return (
    <section id="private-booking" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Book a Private Class</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Schedule a one-on-one session with our experienced instructors to accelerate your progress.
          </p>
        </div>
        <BookingProvider>
          <div className="grid md:grid-cols-2 gap-8">
            <InstructorList />
            <BookingForm />
          </div>
        </BookingProvider>
      </div>
    </section>
  );
};

export default PrivateBooking;