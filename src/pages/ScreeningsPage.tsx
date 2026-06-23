import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Screening, Show } from '../types/types';
import { fetchScreeningsByShowAndTheatre } from '../api/screenings';
import { fetchShow } from '../api/shows';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

export function ScreeningsPage() {
  const { showId, theatreId } = useParams<{ showId: string; theatreId: string }>();
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState<Screening[]>([]);
  const [show, setShow] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!showId || !theatreId) return;
    Promise.all([
      fetchScreeningsByShowAndTheatre(showId, theatreId),
      fetchShow(showId),
    ]).then(([screeningData, showData]) => {
      setScreenings(screeningData);
      setShow(showData);
      setIsLoading(false);
    });
  }, [showId, theatreId]);

  if (isLoading) return <p className="p-6 text-dust">Loading screenings...</p>;

  const byDate = screenings.reduce<Record<string, Screening[]>>((acc, s) => {
    const date = new Date(s.startsAt).toDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  const dates = Object.keys(byDate);
  const theatreName = screenings[0]?.theatreName ?? '';
  const showTitle = show?.title ?? screenings[0]?.showTitle ?? '';

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Link
        to={`/shows/${showId}`}
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back to theatres
      </Link>

      {/* Main layout: poster left, content right */}
      <div className="mt-4 flex flex-col gap-8 lg:flex-row lg:items-start">

        {/* Poster — sticky on desktop so it stays visible while scrolling times */}
        <div className="w-full shrink-0 lg:sticky lg:top-6 lg:w-56">
          <div className="overflow-hidden rounded-xl border border-velvet-800">
            <div className="relative aspect-[2/3] bg-velvet-800">
              {show?.posterUrl ? (
                <img
                  src={show.posterUrl}
                  alt={showTitle}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    background:
                      'radial-gradient(ellipse at 30% 30%, rgba(227,178,60,0.15), transparent 70%), linear-gradient(160deg, #3b232c, #1c1014)',
                  }}
                >
                  <span className="font-display text-7xl text-marquee-gold opacity-30 select-none">
                    {showTitle[0]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Show info under poster */}
          <div className="mt-3 px-1">
            <p className="font-display text-xl tracking-wide text-ivory">{showTitle}</p>
            {show?.durationMinutes && (
              <p className="font-mono text-xs text-dust">{show.durationMinutes} min</p>
            )}
            <p className="mt-1 font-mono text-xs text-dust">{theatreName}</p>
          </div>
        </div>

        {/* Timings */}
        <div className="flex-1">
          <div className="mb-6">
            <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SELECT A TIME</p>
            <h2 className="font-display text-3xl tracking-wide text-ivory">{theatreName}</h2>
          </div>

          {dates.length === 0 ? (
            <p className="text-dust">No upcoming screenings.</p>
          ) : (
            <div className="flex flex-col gap-8">
              {dates.map((date) => (
                <div key={date}>
                  <p className="mb-3 border-b border-velvet-800 pb-2 font-mono text-[10px] tracking-[0.25em] text-dust">
                    {formatDate(byDate[date]![0]!.startsAt)}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {byDate[date]!.map((screening) => (
                      <button
                        key={screening.id}
                        type="button"
                        onClick={() =>
                          navigate(`/screenings/${screening.id}/seats`, {
                            state: {
                              showTitle: screening.showTitle,
                              screenName: screening.screenName,
                              theatreName: screening.theatreName,
                              startsAt: screening.startsAt,
                            },
                          })
                        }
                        className="group flex flex-col items-start rounded-lg border border-velvet-800 bg-velvet-900 px-5 py-3 transition-all hover:border-marquee-gold-dim hover:bg-velvet-800 hover:scale-[1.02]"
                      >
                        <span className="font-display text-2xl tracking-wide text-ivory">
                          {formatTime(screening.startsAt)}
                        </span>
                        <span className="font-mono text-[10px] text-dust">{screening.screenName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}