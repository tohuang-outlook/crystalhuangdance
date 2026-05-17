import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import DanceStyles from './components/DanceStyles';
import Achievements from './components/Achievements';
import Videos from './components/Videos';
import Gallery from './components/Gallery';
import Contact from './components/Contact';
import Footer from './components/Footer';

export default function App() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-transparent">
        <Navbar />
        <main>
          <Hero />
          <Achievements />
          <About />
          <DanceStyles />
          <Videos />
          <Gallery />
          <Contact />
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
}
