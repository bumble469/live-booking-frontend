import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchTheaters } from '../api/theater';
import type { Theater } from '../types/types';
import { PageLoader } from '../components/Spinner';
import { useScrollReveal } from '../hooks/useScrollReveal';

const PAGE_LIMIT = 6;

export function TheatresPage() {
  const { showId } = useParams<{ showId?: string }>();

  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Fetch on page or query change
  useEffect(() => {
    setIsLoading(true);
    fetchTheaters(page, PAGE_LIMIT, debouncedQuery).then((data) => {
      setTheaters(data.theaters);
      setTotalPages(data.totalPages);
      setTotal(data.total);
      setIsLoading(false);
    });
  }, [page, debouncedQuery]);

  return (
    <div className="mx-auto max-w-2xl p-6">
      <button
        type="button"
        onClick={() => history.back()}
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back
      </button>

      <div className="mt-4 mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SELECT THEATRE</p>
          <h1 className="font-display text-4xl tracking-wide text-ivory">Theatres</h1>
          {!isLoading && (
            <p className="mt-1 font-mono text-[10px] tracking-widest text-dust">
              {total} THEATRE{total !== 1 ? 'S' : ''}
              {debouncedQuery && ` MATCHING "${debouncedQuery.toUpperCase()}"`}
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs text-dust">⌕</span>
          <input
            type="text"
            placeholder="Search by name or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-md border border-velvet-700 bg-velvet-900 py-2 pl-8 pr-3 font-mono text-xs text-ivory placeholder-dust outline-none transition focus:border-marquee-gold"
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
        <PageLoader />
      ) : theaters.length === 0 ? (
        <p className="mt-12 text-center font-mono text-sm text-dust">
          {debouncedQuery
            ? `No theatres matching "${debouncedQuery}"`
            : 'No theatres available.'}
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {theaters.map((theatre, i) => (
              <TheatreCard key={theatre.id} theatre={theatre} showId={showId} index={i} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
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
                      : 'border border-velvet-700 text-dust hover:border-marquee-gold hover:text-ivory'
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

function TheatreCard({
  theatre,
  showId,
  index,
}: {
  theatre: Theater;
  showId?: string;
  index: number;
}) {
  const { ref, isVisible } = useScrollReveal<HTMLAnchorElement>();

  const href = showId
    ? `/shows/${showId}/theatres/${theatre.id}`
    : `/theatres/${theatre.id}`;

  return (
    <Link
      ref={ref}
      to={href}
      style={{ transitionDelay: `${index * 60}ms` }}
      className={`group flex items-center justify-between rounded-lg border border-velvet-800
        bg-velvet-900 px-5 py-4 transition-all duration-500
        hover:border-marquee-gold hover:bg-velvet-800
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <div>
        <p className="font-display text-xl tracking-wide text-ivory transition group-hover:text-marquee-gold">
          {theatre.name}
        </p>
        <p className="mt-0.5 font-mono text-xs text-dust">{theatre.city}</p>
      </div>
      <span className="font-mono text-sm text-dust transition group-hover:text-marquee-gold">→</span>
    </Link>
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
      className="rounded border border-velvet-700 px-3 py-1.5 font-mono text-xs text-dust transition hover:border-marquee-gold hover:text-ivory disabled:cursor-not-allowed disabled:opacity-30"
    >
      {label}
    </button>
  );
}