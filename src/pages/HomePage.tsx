import { Link } from 'react-router-dom';

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
        <span className="font-mono text-xs tracking-[0.35em] text-dust">NOW BOOKING</span>
        <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
      </div>

      <h1 className="font-display text-6xl leading-none tracking-wide text-ivory sm:text-7xl">
        MINI <span className="text-marquee-gold">BOOKMYSHOW</span>
      </h1>

      <p className="max-w-sm text-dust">Pick a theatre, pick a screen, pick your seats.</p>

      <Link
        to="/theatres"
        className="group mt-2 inline-flex items-center gap-2 rounded-md bg-marquee-gold px-8 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.03] hover:bg-amber-300"
      >
        View Theatres
        <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
      </Link>

      <div
        aria-hidden
        className="mt-4 h-2 w-48 opacity-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, var(--color-velvet-700) 0 6px, transparent 6px 12px)',
        }}
      />
    </div>
  );
}