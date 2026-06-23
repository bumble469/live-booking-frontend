import type { Seat } from '../types/types';
import { apiFetch } from './http';

export async function fetchSeats(screeningId: string): Promise<Seat[]> {
  return apiFetch<Seat[]>(`/api/screenings/${screeningId}/seats`);
}