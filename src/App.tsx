import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import DanceStyles from './components/DanceStyles';
import Achievements from './components/Achievements';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <About />
      <DanceStyles />
      <Achievements />
      <Gallery />
      <Contact />
      <Footer />
    </div>
  );
}
