import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getFeaturedShows } from '../api/home';
import type { FeaturedShow } from '../types/types';

type Tab = 'shows' | 'theatres';

const TYPEWRITER_TEXT = 'SHOWAHOLIC';
const GOLD_BREAK = 4;

export function HomePage() {
  const [tab, setTab] = useState<Tab>('shows');
  const [index, setIndex] = useState(0);
  const [featured, setFeatured] = useState<FeaturedShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [typed, setTyped] = useState(0);
  const typedRef = useRef(0);

  useEffect(() => {
    getFeaturedShows()
      .then((res) => setFeatured(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (featured.length === 0) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % featured.length), 4000);
    return () => clearInterval(id);
  }, [featured]);

  useEffect(() => {
    if (typed >= TYPEWRITER_TEXT.length) return;
    const id = setTimeout(() => {
      typedRef.current += 1;
      setTyped(typedRef.current);
    }, 90);
    return () => clearTimeout(id);
  }, [typed]);

  const whiteChars = TYPEWRITER_TEXT.slice(0, Math.min(typed, GOLD_BREAK));
  const goldChars = typed > GOLD_BREAK ? TYPEWRITER_TEXT.slice(GOLD_BREAK, typed) : '';
  const showCursor = typed < TYPEWRITER_TEXT.length;
  const currentShow = featured[index];

  return (
    <div className="relative min-h-screen w-full overflow-hidden lg:flex">

      {/* ── LEFT — CAROUSEL (desktop only as a panel, mobile as bg) ── */}

      {/* Mobile background */}
      <div className="absolute inset-0 lg:hidden">
        {!loading && featured.map((show, i) => (
          <div
            key={show.id}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: i === index ? 1 : 0 }}
          >
            <img
              src={show.posterUrl ?? ''}
              alt={show.title}
              className="h-full w-full object-cover object-center"
              loading={i === index ? "eager" : "lazy"}
              decoding="async"
              fetchPriority={i === index ? "high" : "low"}
            />
            <div className="absolute inset-0" style={{ background: 'rgba(28,16,20,0.78)' }} />
          </div>
        ))}
      </div>

      {/* Desktop left panel */}
      <div className="relative hidden lg:block lg:w-[45%] xl:w-[40%] shrink-0">
        <div className="relative h-full min-h-screen overflow-hidden">

          {/* Slides */}
          {loading ? (
            <div className="h-full w-full bg-velvet-800 animate-pulse" />
          ) : (
            featured.map((show, i) => (
              <div
                key={show.id}
                className="absolute inset-0 transition-opacity duration-1000"
                style={{ opacity: i === index ? 1 : 0 }}
              >
                <img
                  src={show.posterUrl ?? ''}
                  alt={show.title}
                  className="h-full w-full object-cover object-center"
                  loading={i === index ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === index ? "high" : "low"}
                />
                {/* subtle right-side fade so it bleeds into the content panel */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to right, transparent 60%, #1C1014 100%)',
                  }}
                />
                {/* top fade for dot controls readability */}
                <div
                  className="absolute inset-x-0 top-0 h-24"
                  style={{ background: 'linear-gradient(to bottom, rgba(28,16,20,0.6), transparent)' }}
                />
              </div>
            ))
          )}

          {/* Dot controls — top left */}
          {featured.length > 1 && (
            <div className="absolute top-6 left-6 z-10 flex gap-2">
              {featured.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? 'w-6 bg-marquee-gold'
                      : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Bottom show name label */}
          {currentShow && (
            <div className="absolute bottom-8 left-6 right-6 z-10">
              <div
                className="inline-flex items-center gap-3 rounded-lg px-4 py-2.5"
                style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-marquee-gold shadow-[0_0_6px_2px_rgba(227,178,60,0.5)]" />
                <span className="font-mono text-xs tracking-[0.2em] text-ivory">
                  WATCH{' '}
                  <span className="text-marquee-gold font-semibold">
                    {currentShow.title.toUpperCase()}
                  </span>
                </span>
              </div>
              {currentShow.description && (
                <p className="mt-2 px-1 font-mono text-[11px] leading-relaxed text-white/50 line-clamp-2">
                  {currentShow.description}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT — CONTENT ── */}
      <div className="relative z-10 flex flex-1 items-center px-8 py-12 lg:px-14">
        <div className="w-full max-w-lg">

          {/* Badge */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
            <span className="font-mono text-xs tracking-[0.35em] text-dust">NOW BOOKING</span>
            <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
          </div>

          {/* Title */}
          <h1 className="font-display text-6xl sm:text-7xl leading-none tracking-wide text-ivory mb-3">
            <span>{whiteChars}</span>
            <span className="text-marquee-gold">{goldChars}</span>
            {showCursor && (
              <span
                className="inline-block w-[3px] h-[0.85em] bg-marquee-gold align-middle ml-1"
                style={{ animation: 'blink 0.8s step-end infinite' }}
              />
            )}
          </h1>

          <p className="text-dust max-w-sm mb-8">
            Book seats for your favourite shows instantly.
          </p>

          {/* Mobile dots */}
          {featured.length > 1 && (
            <div className="flex gap-2 mb-6 lg:hidden">
              {featured.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-marquee-gold' : 'w-1.5 bg-velvet-700 hover:bg-dust'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          )}

          {/* Tab switch */}
          <div className="flex overflow-hidden rounded-md border border-velvet-700 w-fit mb-6">
            <button
              type="button"
              onClick={() => setTab('shows')}
              className={`px-6 py-2.5 font-mono text-xs tracking-[0.2em] transition-colors ${
                tab === 'shows'
                  ? 'bg-marquee-gold text-velvet-950'
                  : 'bg-velvet-900/80 text-dust hover:bg-velvet-800'
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
                  : 'bg-velvet-900/80 text-dust hover:bg-velvet-800'
              }`}
            >
              BROWSE THEATRES
            </button>
          </div>

          {/* CTA */}
          <Link
            to={tab === 'shows' ? '/shows' : '/theatres'}
            className="group inline-flex items-center gap-2 rounded-md bg-marquee-gold px-8 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.03] hover:bg-amber-300"
          >
            {tab === 'shows' ? 'Explore Shows' : 'Explore Theatres'}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </Link>

        </div>
      </div>
    </div>
  );
}