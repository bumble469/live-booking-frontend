import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Show } from '../types/types';
import { fetchShows } from '../api/shows';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PAGE_LIMIT = 8;

export function ShowsPage() {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input — 350ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // reset to first page on new search
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch whenever page or debouncedQuery changes
  useEffect(() => {
    setIsLoading(true);
    fetchShows(page, PAGE_LIMIT, debouncedQuery).then((data) => {
      setShows(data.shows);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setIsLoading(false);
    });
  }, [page, debouncedQuery]);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Link
        to="/"
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Home
      </Link>

      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-ivory">Now Showing</h1>
          {!isLoading && (
            <p className="mt-1 font-mono text-[10px] tracking-widest text-dust">
              {total} SHOW{total !== 1 ? 'S' : ''}
              {debouncedQuery && ` MATCHING "${debouncedQuery.toUpperCase()}"`}
            </p>
          )}
        </div>

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
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-dust hover:text-ivory"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: PAGE_LIMIT }).map((_, i) => (
            <ShowCardSkeleton key={i} />
          ))}
        </div>
      ) : shows.length === 0 ? (
        <p className="mt-12 text-center font-mono text-sm text-dust">
          {debouncedQuery ? `No shows matching "${debouncedQuery}"` : 'No shows available right now.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {shows.map((show, i) => (
              <ShowCard key={show.id} show={show} index={i} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <PaginationButton
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                label="← Prev"
              />

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded font-mono text-xs transition-all ${
                    p === page
                      ? 'bg-marquee-gold text-velvet-950 font-bold'
                      : 'border border-velvet-700 text-dust hover:border-marquee-gold-dim hover:text-ivory'
                  }`}
                >
                  {p}
                </button>
              ))}

              <PaginationButton
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                label="Next →"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PaginationButton({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded border border-velvet-700 px-3 py-1.5 font-mono text-xs text-dust transition hover:border-marquee-gold-dim hover:text-ivory disabled:cursor-not-allowed disabled:opacity-30"
    >
      {label}
    </button>
  );
}

function ShowCard({ show, index }: { show: Show; index: number }) {
  const { ref, isVisible } = useScrollReveal<HTMLAnchorElement>();

  return (
    <Link
      ref={ref}
      to={`/shows/${show.id}`}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`group flex flex-col overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900
        transition-all duration-500 hover:border-marquee-gold-dim hover:scale-[1.02]
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-velvet-800">
        {show.posterUrl ? (
          <img
            src={show.posterUrl}
            alt={show.title}
            loading="lazy"
            decoding="async"
            width={400}
            height={600}
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

function ShowCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900 animate-pulse">
      <div className="aspect-[2/3] w-full bg-velvet-800" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-velvet-700" />
        <div className="h-3 w-full rounded bg-velvet-800" />
        <div className="h-3 w-1/3 rounded bg-velvet-700" />
      </div>
    </div>
  );
}