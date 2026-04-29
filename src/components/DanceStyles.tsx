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
          {danceStyles.map((style) => (
            <div
              key={style.name}
              className="group relative rounded-2xl overflow-hidden bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all duration-500"
            >
              {/* Card image */}
              {style.image ? (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={style.image}
                    alt={style.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/20 to-transparent" />
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center bg-white/[0.02]">
                  <div className="text-center">
                    <span className="text-5xl block mb-2">{style.icon}</span>
                    <p className="text-gray-500 text-xs italic">Photo coming soon</p>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10 p-6">
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
