import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Theater } from '../types/types';
import { fetchTheaters } from '../api/theater';
import { TheatreCard } from '../components/TheatreCard';

export function TheatresPage() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchTheaters().then((data) => {
      setTheaters(data);
      setIsLoading(false);
    });
  }, []);

  const filtered = theaters.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.city.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Home
      </Link>

      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-4xl tracking-wide text-ivory">Theatres</h1>
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-dust">⌕</span>
          <input
            type="text"
            placeholder="Search by name or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-velvet-700 bg-velvet-900 py-2 pl-8 pr-3 font-mono text-xs text-ivory placeholder-dust outline-none transition focus:border-marquee-gold-dim focus:ring-1 focus:ring-marquee-gold-dim"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-dust">Loading theatres...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-dust">
          {query ? `No theatres matching "${query}"` : 'No theatres found.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <TheatreCard
              key={t.id}
              id={t.id}
              name={t.name}
              city={t.city}
              to={`/theatres/${t.id}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}