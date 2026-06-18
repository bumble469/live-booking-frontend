import { useEffect, useState } from 'react';
import type { Seat } from '../types/seat';
import { fetchSeats } from '../api/seats';
import { SeatMap } from '../components/SeatMap';

export function BookingPage() {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  useEffect(() => {
    fetchSeats().then((data) => {
      setSeats(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <p className="p-6">Loading seats...</p>;

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">Select Your Seat</h1>
      <SeatMap seats={seats} onSeatClick={(seat) => setSelectedSeatId(seat.id)} />
      <p className="mt-4 text-sm text-gray-600">
        {selectedSeatId ? `Selected: ${selectedSeatId}` : 'Click an available seat to select it'}
      </p>
      <div className="mt-4 flex gap-4">
        <Legend color="bg-emerald-500" label="Available" />
        <Legend color="bg-amber-400" label="Locked" />
        <Legend color="bg-red-500" label="Booked" />
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