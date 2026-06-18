import type { Seat as SeatType } from '../types/types';
import { Seat } from './Seat';

interface SeatMapProps {
  seats: SeatType[];
  selectedSeatIds: Set<string>;
  onSeatClick: (seat: SeatType) => void;
}

export function SeatMap({ seats, selectedSeatIds, onSeatClick }: SeatMapProps) {
  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => (
        <div key={row} className="flex items-center gap-2">
          <span className="w-4 font-bold">{row}</span>
          <div className="flex gap-1.5">
            {seats
              .filter((s) => s.row === row)
              .sort((a, b) => a.number - b.number)
              .map((seat) => (
                <Seat key={seat.id} seat={seat} isSelected={selectedSeatIds.has(seat.id)} onClick={onSeatClick} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}