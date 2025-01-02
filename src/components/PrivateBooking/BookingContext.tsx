import React, { createContext, useContext, useState } from 'react';
import { Instructor } from './types';

interface BookingContextType {
  selectedInstructor: Instructor | null;
  setSelectedInstructor: (instructor: Instructor | null) => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);

  return (
    <BookingContext.Provider value={{ selectedInstructor, setSelectedInstructor }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};