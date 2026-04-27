import { siteConfig } from '../data/siteData';
import { Award, Music, Heart } from 'lucide-react';

const highlights = [
  {
    icon: Award,
    title: 'Years of Training',
    value: '10+',
    description: 'Years of dedicated dance education',
  },
  {
    icon: Music,
    title: 'Dance Styles',
    value: '6',
    description: 'Mastered disciplines across genres',
  },
  {
    icon: Heart,
    title: 'Students Taught',
    value: '100+',
    description: 'Inspiring the next generation',
  },
];

export default function About() {
  return (
    <section id="about" className="section-padding relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            About Me
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            The <span className="gradient-text">Story</span> Behind the Dance
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image side */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden glow-border">
              <img
                src="/crystal-hero.jpg"
                alt="Crystal Huang dancing"
                className="w-full h-[500px] object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f]/60 via-transparent to-transparent" />
            </div>
            {/* Decorative frame */}
            <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl border border-blue-500/20 -z-10" />
          </div>

          {/* Text side */}
          <div className="space-y-6">
            {siteConfig.aboutParagraphs.map((paragraph, i) => (
              <p
                key={i}
                className="text-gray-300 leading-relaxed text-lg"
              >
                {paragraph}
              </p>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="text-center p-4 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <item.icon className="w-6 h-6 mx-auto mb-2 text-blue-400" />
                  <div className="text-2xl font-bold gradient-text">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{item.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
