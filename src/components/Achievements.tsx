import { achievements } from '../data/siteData';
import { Trophy } from 'lucide-react';

export default function Achievements() {
  return (
    <section id="achievements" className="section-padding relative">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-500/[0.02] to-transparent" />

      <div className="container-max relative z-10">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            Milestones
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            <span className="gold-text">Achievements</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            A timeline of dedication, hard work, and moments of glory.
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Timeline line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-500/40 via-yellow-500/40 to-purple-500/40 md:-translate-x-px" />

          <div className="space-y-12">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`relative flex flex-col md:flex-row gap-6 md:gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                {/* Timeline dot */}
                <div className="absolute left-4 md:left-1/2 top-0 w-4 h-4 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/30 z-10" />

                {/* Year badge - moves to appropriate side */}
                <div
                  className={`md:w-1/2 pl-12 md:pl-0 ${
                    index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'
                  }`}
                >
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 text-yellow-300 text-sm font-bold">
                    <Trophy size={14} />
                    {achievement.year}
                  </div>
                </div>

                {/* Content */}
                <div
                  className={`md:w-1/2 pl-12 md:pl-0 ${
                    index % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'
                  }`}
                >
                  <div className="p-5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all duration-300">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {achievement.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
