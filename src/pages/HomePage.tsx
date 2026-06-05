import About from '../components/About';
import Achievements from '../components/Achievements';
import Contact from '../components/Contact';
import DanceStyles from '../components/DanceStyles';
import Gallery from '../components/Gallery';
import Hero from '../components/Hero';
import PressHighlight from '../components/PressHighlight';
import Videos from '../components/Videos';

export default function HomePage() {
  return (
    <>
      <Hero />
      <PressHighlight />
      <Achievements />
      <About />
      <DanceStyles />
      <Videos />
      <Gallery />
      <Contact />
    </>
  );
}
