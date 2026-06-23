import { Link, useLocation } from 'react-router-dom';

interface ConfirmationState {
  bookingReference?: string;
  seatLabels?: string[];
  fullname?: string;
  email?: string;
  showTitle?: string;
  startsAt?: string;
  theatreName?: string;
}

function formatShowtime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function ConfirmationPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmationState;
  const { bookingReference, seatLabels, fullname, email, showTitle, startsAt, theatreName } = state;

  if (!bookingReference) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-dust">NO BOOKING FOUND</p>
        <h1 className="mt-2 mb-4 font-display text-3xl tracking-wide text-ivory">Nothing to show here</h1>
        <p className="mb-6 text-dust">
          This page only works right after a booking. Hold onto your reference — lookup coming soon.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-marquee-gold px-6 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.03] hover:bg-amber-300"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="h-1.5 w-1.5 rounded-full bg-marquee-gold shadow-[0_0_8px_2px_rgba(227,178,60,0.6)]" />
        <p className="font-mono text-xs tracking-[0.35em] text-dust">BOOKING CONFIRMED</p>
      </div>

      <h1 className="mt-3 mb-8 text-center font-display text-4xl tracking-wide text-ivory">You're All Set</h1>

      <div className="overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900">
        <div className="px-6 py-5">
          {fullname && (
            <>
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">BOOKED FOR</p>
              <p className="mt-1 font-display text-2xl tracking-wide text-ivory">{fullname}</p>
            </>
          )}

          {showTitle && (
            <div className="mt-4">
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SHOW</p>
              <p className="mt-1 font-display text-xl tracking-wide text-ivory">{showTitle}</p>
              {startsAt && <p className="font-mono text-xs text-dust">{formatShowtime(startsAt)}</p>}
              {theatreName && <p className="font-mono text-xs text-dust">{theatreName}</p>}
            </div>
          )}

          {seatLabels && seatLabels.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SEATS</p>
              <p className="mt-1 font-mono text-lg text-marquee-gold">{seatLabels.join(' · ')}</p>
            </div>
          )}

          {email && (
            <p className="mt-4 text-xs text-dust">
              Confirmation sent to <span className="text-ivory">{email}</span>.
            </p>
          )}
        </div>

        <div className="relative border-t-2 border-dashed border-velvet-700 px-6 py-5">
          <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
          <span aria-hidden className="absolute -top-2 right-0 h-4 w-4 translate-x-1/2 rounded-full bg-velvet-950" />
          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">BOOKING REFERENCE</p>
          <p className="mt-1 select-all font-mono text-2xl tracking-[0.15em] text-ivory">{bookingReference}</p>
          <p className="mt-2 text-xs text-dust">You'll need this + your email to cancel.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/"
          className="flex-1 rounded-md border border-velvet-700 px-5 py-3 text-center font-mono text-sm text-dust transition hover:bg-velvet-800"
        >
          Back to Home
        </Link>
        <Link
          to="/shows"
          className="flex-1 rounded-md border border-velvet-700 px-5 py-3 text-center font-mono text-sm text-dust transition hover:bg-velvet-800"
        >
          Browse More Shows
        </Link>
      </div>
    </div>
  );
}