import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Show, Screening } from '../types/types';
import { fetchShow } from '../api/shows';
import { fetchScreeningsByShow } from '../api/screenings';
import { TheatreCard } from '../components/TheatreCard';
import { PageLoader } from '../components/Spinner';

export function ShowDetailPage() {
  const { showId } = useParams<{ showId: string }>();
  const [show, setShow] = useState<Show | null>(null);
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!showId) return;
    Promise.all([fetchShow(showId), fetchScreeningsByShow(showId)]).then(
      ([showData, screeningData]) => {
        setShow(showData);
        setScreenings(screeningData);
        setIsLoading(false);
      }
    );
  }, [showId]);

  if (isLoading) return <PageLoader />;
  if (!show) return <p className="p-6 text-dust">Show not found.</p>;

  const byTheatre = screenings.reduce<Record<string, Screening[]>>((acc, s) => {
    if (!acc[s.theatreId]) acc[s.theatreId] = [];
    acc[s.theatreId].push(s);
    return acc;
  }, {});

  const theatreIds = Object.keys(byTheatre);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Link
        to="/shows"
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back to shows
      </Link>

      {/* Show hero */}
      <div className="mt-4 mb-8 flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* Poster */}
        <div className="w-full shrink-0 overflow-hidden rounded-lg sm:w-40">
          <div className="relative aspect-[2/3] bg-velvet-800">
            {show.posterUrl ? (
              <img src={show.posterUrl} alt={show.title} className="h-full w-full object-cover" />
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
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-col justify-center">
          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">NOW SHOWING</p>
          <h1 className="mt-1 font-display text-4xl tracking-wide text-ivory">{show.title}</h1>
          <p className="mt-1 font-mono text-xs text-dust">{show.durationMinutes} min</p>
          {show.description && (
            <p className="mt-3 max-w-md text-sm leading-relaxed text-dust">{show.description}</p>
          )}
        </div>
      </div>

      <p className="mb-4 font-mono text-[10px] tracking-[0.3em] text-dust">SELECT A THEATRE</p>

      {theatreIds.length === 0 ? (
        <p className="text-center text-dust">No screenings available for this show.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {theatreIds.map((theatreId) => {
            const group = byTheatre[theatreId]!;
            const first = group[0]!;
            return (
              <TheatreCard
                key={theatreId}
                id={theatreId}
                name={first.theatreName}
                city={first.theatreCity}
                to={`/shows/${showId}/theatres/${theatreId}`}
                subtitle={`${group.length} screening${group.length > 1 ? 's' : ''}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}