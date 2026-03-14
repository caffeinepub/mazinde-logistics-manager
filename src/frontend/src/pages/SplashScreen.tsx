export default function SplashScreen() {
  return (
    <div
      data-ocid="splash.section"
      className="fixed inset-0 gradient-navy flex flex-col items-center justify-center"
    >
      <div className="flex flex-col items-center gap-6 animate-slide-up">
        <div className="relative">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
            <img
              src="/assets/generated/mazinde-logo-transparent.dim_200x200.png"
              alt="Mazinde Logistics"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-amber-500/20 blur-lg -z-10" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">
            Mazinde Logistics
          </h1>
          <p className="text-sm text-white/60 mt-1 font-body tracking-wider uppercase">
            Manager
          </p>
        </div>
        <p className="text-white/50 text-sm font-body text-center px-8">
          Reliable Transport Across East Africa
        </p>
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/30"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
