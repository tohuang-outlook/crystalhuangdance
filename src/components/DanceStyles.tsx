import { danceStyles } from '../data/siteData';

export default function DanceStyles() {
  return (
    <section id="styles" className="section-padding bg-white/[0.02]">
      <div className="container-max">
        <div className="text-center mb-16">
          <p className="text-blue-300 tracking-[0.2em] uppercase text-sm mb-4 font-medium">
            What I Do
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Dance <span className="gradient-text">Styles</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            From classical foundations to contemporary expression, here are the
            disciplines I've mastered and teach.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {danceStyles.map((style, index) => (
            <div
              key={style.name}
              className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/30 transition-all duration-500"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 opacity-0 group-hover:opacity-100" />

              <div className="relative z-10">
                <span className="text-4xl block mb-4">{style.icon}</span>
                <h3 className="text-xl font-semibold mb-3 text-white group-hover:gradient-text transition-all">
                  {style.name}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {style.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
