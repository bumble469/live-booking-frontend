import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Theater } from '../types/types';
import { fetchTheaters } from '../api/theater';

export function TheatresPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTheaters().then((data) => {
      setTheaters(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <p className="p-6 text-dust">Loading theatres...</p>;

  return (
    <div className="mx-auto max-w-xl p-6">
      <p className="mb-1 font-mono text-xs tracking-[0.3em] text-dust">STEP 1 OF 3</p>
      <h1 className="mb-6 font-display text-4xl tracking-wide text-ivory">Theatres</h1>

      <div className="flex flex-col gap-4">
        {theaters.map((theater) => (
          <Link
            key={theater.id}
            to={`/theatres/${theater.id}`}
            className="group relative flex items-center justify-between overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900 transition-colors hover:border-marquee-gold-dim hover:bg-velvet-800"
          >
            <div className="flex-1 px-5 py-4">
              <div className="font-display text-2xl tracking-wide text-ivory">{theater.name}</div>
              <div className="font-mono text-xs text-dust">{theater.city}</div>
            </div>

            <div className="relative flex h-full items-center px-5">
              <span aria-hidden className="absolute inset-y-0 left-0 border-l-2 border-dashed border-velvet-700" />
              <span className="font-display text-xl text-marquee-gold transition-transform group-hover:translate-x-1">→</span>
              <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
              <span aria-hidden className="absolute -bottom-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}