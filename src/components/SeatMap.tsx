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
    <div className="flex flex-col items-center gap-8">
      {/* the screen */}
      <div className="flex w-full flex-col items-center gap-2">
        <div
          className="h-2 w-full max-w-md rounded-[50%] bg-screen-glow"
          style={{
            boxShadow:
              '0 0 24px 6px rgba(191,232,255,0.55), 0 0 60px 20px rgba(191,232,255,0.18)',
          }}
        />
        <span className="font-mono text-[10px] tracking-[0.4em] text-dust">SCREEN</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="w-4 font-display text-lg text-marquee-gold">{row}</span>
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
    </div>
  );
}