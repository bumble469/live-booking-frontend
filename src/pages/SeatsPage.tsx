// src/pages/SeatsPage.tsx
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Seat } from '../types/types';
import { fetchSeats } from '../api/seats';
import { lockSeat, unlockSeat } from '../api/locks';
import { createBooking } from '../api/bookings';
import { SeatMap } from '../components/SeatMap';
import { socket } from '../sockets/socket';
import { getSessionId } from '../utils/session';
import { BookingConfirmationDialog } from '../components/BookingConfirmationDialog';

export function SeatsPage() {
  const { theaterId, screenId } = useParams<{ theaterId: string; screenId: string }>();
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [myLockedSeatIds, setMyLockedSeatIds] = useState<Set<string>>(new Set());
  const [isBooking, setIsBooking] = useState(false);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (!screenId) return;
    fetchSeats(screenId).then((data) => {
      setSeats(data);
      setIsLoading(false);
    });
  }, [screenId]);

  useEffect(() => {
    if (!screenId) return;

    socket.connect();
    socket.emit('join_screen', screenId);

    socket.on('seat_locked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, status: 'LOCKED' } : s)));
    });

    socket.on('seat_unlocked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, status: 'AVAILABLE' } : s)));
    });

    socket.on('seat_booked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) => prev.map((s) => (s.id === seatId ? { ...s, status: 'BOOKED' } : s)));
    });

    return () => {
      socket.emit('leave_screen', screenId);
      socket.off('seat_locked');
      socket.off('seat_unlocked');
      socket.off('seat_booked');
      socket.disconnect();
    };
  }, [screenId]);

  async function handleSeatClick(seat: Seat) {
    if (!screenId) return;
    if (seat.status === 'BOOKED') return;
    if (seat.status === 'LOCKED' && !myLockedSeatIds.has(seat.id)) return;

    if (myLockedSeatIds.has(seat.id)) {
      try {
        await unlockSeat(seat.id, screenId, sessionId);
        setMyLockedSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seat.id);
          return next;
        });
        setSeats((prev) => prev.map((s) => (s.id === seat.id ? { ...s, status: 'AVAILABLE' } : s)));
      } catch (err) {
        console.error('Failed to release lock', err);
      }
    } else {
      try {
        await lockSeat(seat.id, screenId, sessionId);
        setMyLockedSeatIds((prev) => new Set(prev).add(seat.id));
        setSeats((prev) => prev.map((s) => (s.id === seat.id ? { ...s, status: 'LOCKED' } : s)));
      } catch (err) {
        alert('This seat was just taken. Please pick another.');
      }
    }
  }

  async function handleConfirm() {
    if (!screenId || myLockedSeatIds.size === 0) return;
    setIsBooking(true);

    try {
      const { bookingReference } = await createBooking(
        Array.from(myLockedSeatIds),
        screenId,
        sessionId,
        fullname,
        email,
        phone
      );
      navigate(`/theatres/${theaterId}/screens/${screenId}/confirmation`, {
        state: { bookingReference },
      });
    } catch (err) {
      alert('Booking failed. Your lock may have expired. Please try again.');
      setIsBooking(false);
    }
  }

  if (isLoading) return <p className="p-6 text-dust">Loading seats...</p>;

  const myLockedSeats = seats.filter((s) => myLockedSeatIds.has(s.id));

  return (
    <div className="mx-auto max-w-xl p-6">
      <Link
        to={`/theatres/${theaterId}`}
        className="inline-flex items-center gap-1 font-mono text-xs tracking-wide text-dust transition-colors hover:text-marquee-gold"
      >
        ← Back to screens
      </Link>

      <p className="mt-4 mb-1 font-mono text-xs tracking-[0.3em] text-dust">STEP 3 OF 3</p>
      <h1 className="mb-6 font-display text-4xl tracking-wide text-ivory">Select Your Seats</h1>

      <SeatMap seats={seats} selectedSeatIds={myLockedSeatIds} onSeatClick={handleSeatClick} />

      <div className="mt-6 flex flex-wrap gap-4">
        <Legend color="bg-seat-available" label="Available" />
        <Legend color="bg-seat-locked" label="Locked" />
        <Legend color="bg-seat-booked" label="Booked" />
        <Legend color="bg-screen-glow ring-2 ring-offset-1 ring-offset-velvet-950 ring-marquee-gold" label="Your Selection" />
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900">
        <div className="px-5 py-4">
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

        <div className="relative border-t-2 border-dashed border-velvet-700 px-5 py-4">
          <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
          <span aria-hidden className="absolute -top-2 right-0 h-4 w-4 translate-x-1/2 rounded-full bg-velvet-950" />
          <button
            type="button"
            disabled={myLockedSeats.length === 0 || isBooking}
            onClick={() => setShowBookingModal(true)}
            className="w-full cursor-pointer rounded-md bg-marquee-gold px-5 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.01] hover:bg-amber-300 disabled:cursor-not-allowed disabled:scale-100 disabled:bg-velvet-700 disabled:text-dust"
          >
            {isBooking ? 'Booking…' : 'Confirm Booking'}
          </button>
        </div>
      </div>
      <BookingConfirmationDialog
        isOpen={showBookingModal}
        isBooking={isBooking}
        selectedSeats={myLockedSeats.map(
          (seat) => `${seat.row}${seat.number}`
        )}
        fullname={fullname}
        email={email}
        phone={phone}
        onFullnameChange={setFullname}
        onEmailChange={setEmail}
        onPhoneChange={setPhone}
        onConfirm={handleConfirm}
        onClose={() => setShowBookingModal(false)}
      />
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