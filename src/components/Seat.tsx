import type { Seat as SeatType } from '../types/types';

interface SeatProps {
  seat: SeatType;
  isSelected: boolean;
  onClick: (seat: SeatType) => void;
}

const statusClasses: Record<SeatType['status'], string> = {
  AVAILABLE: 'bg-emerald-500 hover:bg-emerald-600 cursor-pointer',
  LOCKED: 'bg-amber-400 cursor-not-allowed',
  BOOKED: 'bg-red-500 cursor-not-allowed',
};

export function Seat({ seat, isSelected, onClick }: SeatProps) {
  const isDisabled = seat.status !== 'AVAILABLE';

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={() => onClick(seat)}
      title={`${seat.id} - ${seat.status}`}
      className={`flex h-9 w-9 items-center justify-center rounded-md text-xs font-semibold text-white transition-colors ${statusClasses[seat.status]} ${
        isSelected ? 'ring-2 ring-offset-2 ring-blue-600' : ''
      }`}
    >
      {seat.number}
    </button>
  );
}