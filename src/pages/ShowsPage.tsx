import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Show } from '../types/types';
import { fetchShows } from '../api/shows';

export function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchShows().then((data) => {
      setShows(data);
      setIsLoading(false);
    });
  }, []);

  const filtered = shows.filter((s) =>
    s.title.toLowerCase().includes(query.toLowerCase())
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
        <h1 className="font-display text-4xl tracking-wide text-ivory">Now Showing</h1>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-dust">⌕</span>
          <input
            type="text"
            placeholder="Search shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-velvet-700 bg-velvet-900 py-2 pl-8 pr-3 font-mono text-xs text-ivory placeholder-dust outline-none transition focus:border-marquee-gold-dim focus:ring-1 focus:ring-marquee-gold-dim"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-dust">Loading shows...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-dust">
          {query ? `No shows matching "${query}"` : 'No shows available right now.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}

function ShowCard({ show }: { show: Show }) {
  return (
    <Link
      to={`/shows/${show.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900 transition-all hover:border-marquee-gold-dim hover:scale-[1.02]"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-velvet-800">
        {show.posterUrl ? (
          <img
            src={show.posterUrl}
            alt={show.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background:
                'radial-gradient(ellipse at 30% 30%, rgba(227,178,60,0.15), transparent 70%), linear-gradient(160deg, #3b232c, #1c1014)',
            }}
          >
            <span className="font-display text-6xl text-marquee-gold opacity-30 select-none">
              {show.title[0]}
            </span>
          </div>
        )}

        {/* Duration badge */}
        <span className="absolute bottom-2 right-2 rounded bg-velvet-950/80 px-2 py-0.5 font-mono text-[10px] text-dust backdrop-blur-sm">
          {show.durationMinutes} min
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between p-3">
        <p className="font-display text-base leading-tight tracking-wide text-ivory line-clamp-2">
          {show.title}
        </p>
        {show.description && (
          <p className="mt-1 font-mono text-[10px] leading-relaxed text-dust line-clamp-2">
            {show.description}
          </p>
        )}
        <p className="mt-2 font-mono text-[10px] text-marquee-gold">Book Now →</p>
      </div>
    </Link>
  );
}