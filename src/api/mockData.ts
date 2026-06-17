import type { Seat, Theater, Screen } from '../types/types';


export const theaters: Theater[] = [
  { id: '1', name: 'PVR Cinemas', city: 'Mumbai' },
  { id: '2', name: 'INOX Megaplex', city: 'Pune' },
  { id: '3', name: 'Cinepolis', city: 'Bangalore' },
];

export const screens: Screen[] = theaters.flatMap((theater) => [
  { id: `${theater.id}-1`, theaterId: theater.id, name: 'Screen 1' },
  { id: `${theater.id}-2`, theaterId: theater.id, name: 'Screen 2' },
]);

function generateSeatsForScreen(screenId: string): Seat[] {
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const result: Seat[] = [];

  rows.forEach((row) => {
    for (let number = 1; number <= 8; number++) {
      result.push({ id: `${screenId}-${row}${number}`, screenId, row, number, status: 'AVAILABLE' });
    }
  });

  result[2].status = 'BOOKED';
  result[10].status = 'LOCKED';

  return result;
}

export const seats: Seat[] = screens.flatMap((screen) => generateSeatsForScreen(screen.id));