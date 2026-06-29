import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import type { Seat } from '../types/types';
import { fetchSeats } from '../api/seats';
import { lockSeat, unlockSeat } from '../api/locks';
import { createBooking } from '../api/bookings';
import { SeatMap } from '../components/SeatMap';
import { socket } from '../sockets/socket';
import { getSessionId } from '../utils/session';
import { BookingConfirmationDialog } from '../components/BookingConfirmationDialog';
import { useSnackbar } from '../components/Snackbar';
import { PageLoader } from '../components/Spinner';

interface SeatsPageState {
  showTitle?: string;
  screenName?: string;
  theatreName?: string;
  startsAt?: string;
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

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SeatsPage() {
  const { screeningId } = useParams<{ screeningId: string }>();
  const location = useLocation();
  const state = (location.state ?? {}) as SeatsPageState;
  const navigate = useNavigate();
  const sessionId = getSessionId();
  const { showSnackbar } = useSnackbar();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myLockedSeatIds, setMyLockedSeatIds] = useState<Set<string>>(new Set());
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const [lockSecondsLeft, setLockSecondsLeft] = useState<number | null>(null);
  const [locksExpired, setLocksExpired] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!screeningId) return;
    fetchSeats(screeningId).then((data) => {
      setSeats(data);
      const mine = data
        .filter((s) => s.status === 'LOCKED' && s.lockedBy === sessionId)
        .map((s) => s.id);
      if (mine.length > 0) setMyLockedSeatIds(new Set(mine));
      setIsLoading(false);
    });
  }, [screeningId]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (!lockExpiresAt) {
      setLockSecondsLeft(null);
      setLocksExpired(false);
      return;
    }

    const tick = () => {
      const diff = Math.max(0, Math.floor((lockExpiresAt.getTime() - Date.now()) / 1000));
      setLockSecondsLeft(diff);
      if (diff === 0) {
        setLocksExpired(true);
        setLockExpiresAt(null); // stops this effect loop
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    tick(); 
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockExpiresAt]);

  useEffect(() => {
    if (!screeningId) return;

    socket.connect();
    socket.emit('join_screening', screeningId);

    socket.on('seat_locked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, status: 'LOCKED' } : s)));
    });

    socket.on('seat_unlocked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, status: 'AVAILABLE' } : s)));

      setMyLockedSeatIds((prev) => {
        if (!prev.has(seatId)) return prev;
        const next = new Set(prev);
        next.delete(seatId);
        if (next.size === 0) setLockExpiresAt(null);
        return next;
      });
    });

    socket.on('seat_booked', ({ seatIds }: { seatIds: string[] }) => {
      setSeats((prev) =>
        prev.map((s) => (seatIds.includes(s.id) ? { ...s, status: 'BOOKED' } : s))
      );
    });

    return () => {
      socket.emit('leave_screening', screeningId);
      socket.off('seat_locked');
      socket.off('seat_unlocked');
      socket.off('seat_booked');
      socket.disconnect();
    };
  }, [screeningId]);

  async function handleSeatClick(seat: Seat) {
    if (!screeningId) return;
    if (seat.status === 'BOOKED') return;
    if (seat.status === 'LOCKED' && !myLockedSeatIds.has(seat.id)) return;

    if (myLockedSeatIds.has(seat.id)) {
      try {
        await unlockSeat(seat.id, screeningId, sessionId);
        setMyLockedSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seat.id);
          if (next.size === 0) {
            setLockExpiresAt(null);
            setLocksExpired(false);
          }
          return next;
        });
        setSeats((prev) =>
          prev.map((s) => (s.id === seat.id ? { ...s, status: 'AVAILABLE' } : s))
        );
      } catch {
        console.error('Failed to release lock');
      }
    } else {
      try {
        setLocksExpired(false);
        const result = await lockSeat(seat.id, screeningId, sessionId);
        setMyLockedSeatIds((prev) => new Set(prev).add(seat.id));
        setSeats((prev) =>
          prev.map((s) => (s.id === seat.id ? { ...s, status: 'LOCKED' } : s))
        );
        // Track the EARLIEST expiry across all locked seats
        if (result.lockExpiresAt) {
          const newExpiry = new Date(result.lockExpiresAt);
          setLockExpiresAt((prev) => (!prev || newExpiry < prev ? newExpiry : prev));
        }
      } catch {
        showSnackbar('This seat was just taken. Please pick another.', 'error');
      }
    }
  }

  async function handleConfirm() {
    if (!screeningId || myLockedSeatIds.size === 0) return;
    setIsBooking(true);
    try {
      const { bookingReference } = await createBooking(
        Array.from(myLockedSeatIds),
        screeningId,
        sessionId,
        fullname,
        email,
        phone,
        myLockedSeats.map((s) => `${s.row}${s.number}`),
        state.showTitle ?? '',
        state.screenName ?? '',
        state.theatreName ?? '',
        state.startsAt ?? ''
      );
      navigate(`/screenings/${screeningId}/confirmation`, {
        state: {
          bookingReference,
          seatLabels: myLockedSeats.map((s) => `${s.row}${s.number}`),
          fullname,
          email,
          showTitle: state.showTitle,
          startsAt: state.startsAt,
          theatreName: state.theatreName,
        },
      });
    } catch {
      showSnackbar('Booking failed. Your lock may have expired. Please try again.', 'error');
      setIsBooking(false);
    }
  }

  if (isLoading) return <PageLoader />;

  const myLockedSeats = seats.filter((s) => myLockedSeatIds.has(s.id));

  const timerColor =
    lockSecondsLeft === null
      ? ''
      : lockSecondsLeft <= 30
      ? 'text-red-400'
      : lockSecondsLeft <= 60
      ? 'text-amber-400'
      : 'text-green-400';

  return (
    <div className="mx-auto max-w-xl p-6">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back
      </button>

      <div className="mt-4 mb-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SELECT SEATS</p>
        <h1 className="font-display text-4xl tracking-wide text-ivory">
          {state.showTitle ?? 'Seat Selection'}
        </h1>
        {state.startsAt && (
          <p className="mt-1 font-mono text-xs text-dust">
            {formatShowtime(state.startsAt)}
            {state.screenName && ` · ${state.screenName}`}
          </p>
        )}
        {state.theatreName && (
          <p className="font-mono text-xs text-dust">{state.theatreName}</p>
        )}
      </div>

      <SeatMap seats={seats} selectedSeatIds={myLockedSeatIds} onSeatClick={handleSeatClick} />

      <div className="mt-6 flex flex-wrap gap-4">
        <Legend color="bg-seat-available" label="Available" />
        <Legend color="bg-seat-locked" label="Locked" />
        <Legend color="bg-seat-booked" label="Booked" />
        <Legend color="bg-screen-glow ring-2 ring-offset-1 ring-offset-velvet-950 ring-marquee-gold" label="Your Selection" />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">YOUR SELECTION</p>
              <p className="mt-1 font-display text-xl tracking-wide text-ivory">
                {myLockedSeats.length === 0
                  ? 'No seats selected'
                  : `${myLockedSeats.length} seat${myLockedSeats.length > 1 ? 's' : ''}`}
              </p>
              {myLockedSeats.length > 0 && (
                <p className="mt-1 font-mono text-sm text-marquee-gold">
                  {myLockedSeats.map((s) => `${s.row}${s.number}`).join(' · ')}
                </p>
              )}
            </div>

            {/* Timer */}
            {myLockedSeats.length > 0 && (
              <div className="text-right">
                <p className="font-mono text-[10px] tracking-[0.2em] text-dust">
                  {locksExpired ? 'EXPIRED' : 'EXPIRES IN'}
                </p>
                {locksExpired ? (
                  <p className="mt-1 font-mono text-sm text-red-400">
                    Seats released — reselect
                  </p>
                ) : lockSecondsLeft !== null ? (
                  <p className={`mt-1 font-mono text-xl font-bold tabular-nums ${timerColor}`}>
                    {formatCountdown(lockSecondsLeft)}
                  </p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="relative border-t-2 border-dashed border-velvet-700 px-5 py-4">
          <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
          <span aria-hidden className="absolute -top-2 right-0 h-4 w-4 translate-x-1/2 rounded-full bg-velvet-950" />
          <button
            type="button"
            disabled={myLockedSeats.length === 0 || isBooking || locksExpired}
            onClick={() => setShowBookingModal(true)}
            className="w-full cursor-pointer rounded-md bg-marquee-gold px-5 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.01] hover:bg-amber-300 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-velvet-700 disabled:text-dust"
          >
            {isBooking ? 'Booking…' : 'Confirm Booking'}
          </button>
        </div>
      </div>

      {showBookingModal && (
        <BookingConfirmationDialog
          isOpen={showBookingModal}
          isBooking={isBooking}
          selectedSeats={myLockedSeats.map((s) => `${s.row}${s.number}`)}
          fullname={fullname}
          email={email}
          phone={phone}
          onFullnameChange={setFullname}
          onEmailChange={setEmail}
          onPhoneChange={setPhone}
          onConfirm={handleConfirm}
          onClose={() => {
            setShowBookingModal(false);
            setIsEmailVerified(false);
          }}
          isEmailVerified={isEmailVerified}
          onEmailVerified={() => setIsEmailVerified(true)}
        />
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-dust">
      <span className={`inline-block h-3 w-3 rounded-sm ${color}`} />
      <span>{label}</span>
    </div>
  );
}