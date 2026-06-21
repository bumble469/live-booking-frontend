// src/pages/ConfirmationPage.tsx
import { Link, useLocation, useParams } from 'react-router-dom';

interface ConfirmationState {
  bookingReference?: string;
  seatLabels?: string[];
  fullname?: string;
  email?: string;
}

export function ConfirmationPage() {
  const { theaterId, screenId } = useParams<{ theaterId: string; screenId: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as ConfirmationState;

  const { bookingReference, seatLabels, fullname, email } = state;

  // Direct visits / refreshes lose router state - there's nothing to show
  if (!bookingReference) {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <p className="font-mono text-xs tracking-[0.3em] text-dust">NO BOOKING FOUND</p>
        <h1 className="mt-2 mb-4 font-display text-3xl tracking-wide text-ivory">
          Nothing to show here
        </h1>
        <p className="mb-6 text-dust">
          This page only works right after a booking. If you have a reference already, hold onto it —
          a way to look bookings up will be added soon.
        </p>
        <Link
          to="/theatres"
          className="inline-flex items-center gap-2 rounded-md bg-marquee-gold px-6 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.03] hover:bg-amber-300"
        >
          Book Another Show
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

      <h1 className="mt-3 mb-8 text-center font-display text-4xl tracking-wide text-ivory">
        You're All Set
      </h1>

      {/* Ticket */}
      <div className="overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900">
        <div className="px-6 py-5">
          {fullname && (
            <>
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">BOOKED FOR</p>
              <p className="mt-1 font-display text-2xl tracking-wide text-ivory">{fullname}</p>
            </>
          )}

          {seatLabels && seatLabels.length > 0 && (
            <div className="mt-4">
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SEATS</p>
              <p className="mt-1 font-mono text-lg text-marquee-gold">{seatLabels.join(' · ')}</p>
            </div>
          )}

          {email && (
            <p className="mt-4 text-xs text-dust">
              A copy of this ticket has been sent to <span className="text-ivory">{email}</span>.
            </p>
          )}
        </div>

        {/* Tear line */}
        <div className="relative border-t-2 border-dashed border-velvet-700 px-6 py-5">
          <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
          <span aria-hidden className="absolute -top-2 right-0 h-4 w-4 translate-x-1/2 rounded-full bg-velvet-950" />

          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">BOOKING REFERENCE</p>
          <p className="mt-1 select-all font-mono text-2xl tracking-[0.15em] text-ivory">
            {bookingReference}
          </p>
          <p className="mt-2 text-xs text-dust">
            Keep this safe — you'll need it along with your email to cancel.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/theatres"
          className="flex-1 rounded-md border border-velvet-700 px-5 py-3 text-center font-mono text-sm text-dust transition hover:bg-velvet-800"
        >
          Book Another Show
        </Link>
        <Link
          to={`/theatres/${theaterId}/screens/${screenId}`}
          className="flex-1 rounded-md border border-velvet-700 px-5 py-3 text-center font-mono text-sm text-dust transition hover:bg-velvet-800"
        >
          Back to Seats
        </Link>
      </div>
    </div>
  );
}