import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Screening, Show } from '../types/types';
import { fetchScreeningsByTheatre } from '../api/screenings';
import { fetchShows } from '../api/shows';

export function TheatreShowsPage() {
  const { theatreId } = useParams<{ theatreId: string }>();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [showsMap, setShowsMap] = useState<Record<string, Show>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!theatreId) return;
    Promise.all([fetchScreeningsByTheatre(theatreId), fetchShows()]).then(
      ([screeningData, showsData]) => {
        setScreenings(screeningData);
        setShowsMap(Object.fromEntries(showsData.map((s) => [s.id, s])));
        setIsLoading(false);
      }
    );
  }, [theatreId]);

  // Dedupe shows for this theatre
  const seen = new Set<string>();
  const uniqueShows = screenings.filter((s) => {
    if (seen.has(s.showId)) return false;
    seen.add(s.showId);
    return true;
  });

  const filtered = uniqueShows.filter((s) =>
    s.showTitle.toLowerCase().includes(query.toLowerCase())
  );

  const theatreName = screenings[0]?.theatreName ?? '';
  const theatreCity = screenings[0]?.theatreCity ?? '';

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Link
        to="/theatres"
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back to theatres
      </Link>

      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">NOW SHOWING AT</p>
          <h1 className="font-display text-4xl tracking-wide text-ivory">{theatreName}</h1>
          {theatreCity && <p className="font-mono text-xs text-dust">{theatreCity}</p>}
        </div>
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
          {query ? `No shows matching "${query}"` : 'No shows currently running here.'}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((s) => {
            const show = showsMap[s.showId];
            const count = screenings.filter((sc) => sc.showId === s.showId).length;
            return (
              <Link
                key={s.showId}
                to={`/shows/${s.showId}/theatres/${theatreId}`}
                className="group flex flex-col overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900 transition-all hover:border-marquee-gold-dim hover:scale-[1.02]"
              >
                {/* Poster */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-velvet-800">
                  {show?.posterUrl ? (
                    <img
                      src={show.posterUrl}
                      alt={s.showTitle}
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
                        {s.showTitle[0]}
                      </span>
                    </div>
                  )}
                  <span className="absolute bottom-2 right-2 rounded bg-velvet-950/80 px-2 py-0.5 font-mono text-[10px] text-dust backdrop-blur-sm">
                    {show?.durationMinutes ?? '—'} min
                  </span>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-3">
                  <p className="font-display text-base leading-tight tracking-wide text-ivory line-clamp-2">
                    {s.showTitle}
                  </p>
                  <p className="mt-2 font-mono text-[10px] text-marquee-gold">
                    {count} screening{count > 1 ? 's' : ''} →
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}