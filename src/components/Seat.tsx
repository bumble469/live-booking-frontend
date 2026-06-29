import type { Seat as SeatType } from '../types/types';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onClick: (seat: SeatType) => void;
}

const statusClasses: Record<SeatType['status'], string> = {
  AVAILABLE: 'bg-seat-available text-ivory hover:bg-emerald-600 cursor-pointer',
  LOCKED: 'bg-seat-locked text-velvet-950 cursor-not-allowed',
  BOOKED: 'bg-seat-booked text-ivory cursor-not-allowed',
};

export function Seat({ seat, isSelected, onClick }: SeatProps) {
  const isDisabled = seat.status === 'BOOKED' ||
    (seat.status === 'LOCKED' && !isSelected);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onClick(seat)}
      title={`${seat.row}${seat.number} - ${seat.status}`}
      className={`flex h-8 w-8 items-center justify-center rounded-t-md rounded-b-sm font-mono text-[11px] font-semibold transition-all duration-150 ${
        isSelected
          ? 'bg-screen-glow text-velvet-950 shadow-[0_0_10px_2px_rgba(191,232,255,0.55)] cursor-pointer ring-2 ring-offset-2 ring-offset-velvet-950 ring-screen-glow'
          : statusClasses[seat.status]
      } ${isDisabled ? 'opacity-50' : ''}`}
    >
      {seat.number}
    </button>
  );
}