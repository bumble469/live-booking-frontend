import type { Seat } from '../types/types';
import { seats } from './mockData';

export async function fetchSeats(screenId: string): Promise<Seat[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return seats.filter((seat) => seat.screenId === screenId);
}