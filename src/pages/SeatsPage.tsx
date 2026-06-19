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

export function SeatsPage() {
  const { theaterId, screenId } = useParams<{ theaterId: string; screenId: string }>();
  const navigate = useNavigate();
  const sessionId = getSessionId();

  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Track which seatIds this session has locked
  const [myLockedSeatIds, setMyLockedSeatIds] = useState<Set<string>>(new Set());
  const [isBooking, setIsBooking] = useState(false);

  // Load seats from backend
  useEffect(() => {
    if (!screenId) return;
    fetchSeats(screenId).then((data) => {
      setSeats(data);
      setIsLoading(false);
    });
  }, [screenId]);

  // Socket.IO — join this screen's room and listen for seat events
  useEffect(() => {
    if (!screenId) return;

    socket.connect();
    socket.emit('join_screen', screenId);

    // Another user locked a seat — update our local seat list
    socket.on('seat_locked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'LOCKED' } : s))
      );
    });

    // Another user released a lock — seat turns available again
    socket.on('seat_unlocked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'AVAILABLE' } : s))
      );
    });

    // Someone completed a booking — seat is permanently red
    socket.on('seat_booked', ({ seatId }: { seatId: string }) => {
      setSeats((prev) =>
        prev.map((s) => (s.id === seatId ? { ...s, status: 'BOOKED' } : s))
      );
    });

    return () => {
      // Cleanup: leave the room and remove listeners when navigating away
      socket.emit('leave_screen', screenId);
      socket.off('seat_locked');
      socket.off('seat_unlocked');
      socket.off('seat_booked');
      socket.disconnect();
    };
  }, [screenId]);

  async function handleSeatClick(seat: Seat) {
    if (!screenId) return;

    // Can't click locked-by-someone-else or booked seats
    if (seat.status === 'BOOKED') return;
    if (seat.status === 'LOCKED' && !myLockedSeatIds.has(seat.id)) return;

    if (myLockedSeatIds.has(seat.id)) {
      // Deselect — release our lock
      try {
        await unlockSeat(seat.id, screenId, sessionId);
        setMyLockedSeatIds((prev) => {
          const next = new Set(prev);
          next.delete(seat.id);
          return next;
        });
        setSeats((prev) =>
          prev.map((s) => (s.id === seat.id ? { ...s, status: 'AVAILABLE' } : s))
        );
      } catch (err) {
        console.error('Failed to release lock', err);
      }
    } else {
      // Select — try to lock
      try {
        await lockSeat(seat.id, screenId, sessionId);
        setMyLockedSeatIds((prev) => new Set(prev).add(seat.id));
        setSeats((prev) =>
          prev.map((s) => (s.id === seat.id ? { ...s, status: 'LOCKED' } : s))
        );
      } catch (err) {
        // 409 — someone else grabbed it just before us
        alert('This seat was just taken. Please pick another.');
      }
    }
  }

  async function handleConfirm() {
    if (!screenId || myLockedSeatIds.size === 0) return;
    setIsBooking(true);

    try {
      for (const seatId of myLockedSeatIds) {
        await createBooking(seatId, screenId, sessionId);
      }
      navigate(`/theatres/${theaterId}/screens/${screenId}/confirmation`);
    } catch (err) {
      alert('Booking failed. Your lock may have expired. Please try again.');
      setIsBooking(false);
    }
  }

  if (isLoading) return <p className="p-6">Loading seats...</p>;

  const myLockedSeats = seats.filter((s) => myLockedSeatIds.has(s.id));

  return (
    <div className="mx-auto max-w-xl p-6">
      <Link to={`/theatres/${theaterId}`} className="text-sm text-blue-600 hover:underline">
        ← Back to screens
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-semibold text-gray-900">Select Your Seats</h1>

      <SeatMap
        seats={seats}
        selectedSeatIds={myLockedSeatIds}
        onSeatClick={handleSeatClick}
      />

      <div className="mt-4 flex gap-4">
        <Legend color="bg-emerald-500" label="Available" />
        <Legend color="bg-amber-400" label="Locked" />
        <Legend color="bg-red-500" label="Booked" />
        <Legend color="bg-emerald-500 ring-2 ring-offset-1 ring-blue-600" label="Your Selection" />
      </div>

      <div className="mt-6 rounded-md border border-gray-200 p-4">
        <p className="font-semibold text-gray-900">
          {myLockedSeats.length === 0
            ? 'No seats selected yet'
            : `${myLockedSeats.length} seat${myLockedSeats.length > 1 ? 's' : ''} selected: ${myLockedSeats
                .map((s) => `${s.row}${s.number}`)
                .join(', ')}`}
        </p>
        <button
          type="button"
          disabled={myLockedSeats.length === 0 || isBooking}
          onClick={handleConfirm}
          className="mt-3 rounded-md bg-blue-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isBooking ? 'Booking...' : 'Confirm Booking'}
        </button>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-gray-700">
      <span className={`inline-block h-3.5 w-3.5 rounded ${color}`} />
      <span>{label}</span>
    </div>
  );
}