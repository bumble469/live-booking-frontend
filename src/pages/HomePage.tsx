import { Link } from 'react-router-dom';
import { useState } from 'react';

type Tab = 'shows' | 'theatres';

export function HomePage() {
  const [tab, setTab] = useState<Tab>('shows');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex items-center gap-3">
        <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
        <span className="font-mono text-xs tracking-[0.35em] text-dust">NOW BOOKING</span>
        <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
      </div>

      <h1 className="font-display text-6xl leading-none tracking-wide text-ivory sm:text-7xl">
        SHOW<span className="text-marquee-gold">AHOLIC</span>
      </h1>

      <p className="max-w-sm text-dust">Book seats for your favourite shows.</p>

      {/* Tab toggle */}
      <div className="flex overflow-hidden rounded-md border border-velvet-700">
        <button
          type="button"
          onClick={() => setTab('shows')}
          className={`px-6 py-2.5 font-mono text-xs tracking-[0.2em] transition-colors ${
            tab === 'shows'
              ? 'bg-marquee-gold text-velvet-950'
              : 'bg-velvet-900 text-dust hover:bg-velvet-800'
          }`}
        >
          BROWSE SHOWS
        </button>
        <button
          type="button"
          onClick={() => setTab('theatres')}
          className={`px-6 py-2.5 font-mono text-xs tracking-[0.2em] transition-colors ${
            tab === 'theatres'
              ? 'bg-marquee-gold text-velvet-950'
              : 'bg-velvet-900 text-dust hover:bg-velvet-800'
          }`}
        >
          BROWSE THEATRES
        </button>
      </div>

      <Link
        to={tab === 'shows' ? '/shows' : '/theatres'}
        className="group inline-flex items-center gap-2 rounded-md bg-marquee-gold px-8 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.03] hover:bg-amber-300"
      >
        {tab === 'shows' ? 'Explore Shows' : 'Explore Theatres'}
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