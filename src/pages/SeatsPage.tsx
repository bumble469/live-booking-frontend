import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Seat } from '../types/types';
import { fetchSeats } from '../api/seats';
import { SeatMap } from '../components/SeatMap';

export function SeatsPage() {
  const { theaterId, screenId } = useParams<{ theaterId: string; screenId: string }>();
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!screenId) return;
    fetchSeats(screenId).then((data) => {
      setSeats(data);
      setIsLoading(false);
    });
  }, [screenId]);

  function toggleSeat(seat: Seat) {
    setSelectedSeatIds((prev) => {
      const next = new Set(prev);
      if (next.has(seat.id)) {
        next.delete(seat.id);
      } else {
        next.add(seat.id);
      }
      return next;
    });
  }

  if (isLoading) return <p className="p-6">Loading seats...</p>;

  const selectedSeats = seats.filter((seat) => selectedSeatIds.has(seat.id));

  return (
    <div className="mx-auto max-w-xl p-6">
      <Link to={`/theatres/${theaterId}`} className="text-sm text-blue-600 hover:underline">
        ← Back to screens
      </Link>
      <h1 className="mt-2 mb-4 text-2xl font-semibold text-gray-900">Select Your Seats</h1>

      <SeatMap seats={seats} selectedSeatIds={selectedSeatIds} onSeatClick={toggleSeat} />

      <div className="mt-4 flex gap-4">
        <Legend color="bg-emerald-500" label="Available" />
        <Legend color="bg-amber-400" label="Locked" />
        <Legend color="bg-red-500" label="Booked" />
        <Legend color="bg-emerald-500 ring-2 ring-offset-1 ring-blue-600" label="Selected" />
      </div>

      <div className="mt-6 rounded-md border border-gray-200 p-4">
        <p className="font-semibold text-gray-900">
          {selectedSeats.length === 0
            ? 'No seats selected yet'
            : `${selectedSeats.length} seat${selectedSeats.length > 1 ? 's' : ''} selected: ${selectedSeats
                .map((s) => `${s.row}${s.number}`)
                .join(', ')}`}
        </p>
        <button
          type="button"
          disabled={selectedSeats.length === 0}
          className="mt-3 rounded-md bg-blue-600 px-5 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Continue
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