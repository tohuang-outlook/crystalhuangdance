import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Classes from './components/Classes';
import PrivateBooking from './components/PrivateBooking/PrivateBooking';

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Classes />
      <PrivateBooking />
    </div>
  );
}

export default App;