import type { Seat } from '../types/types';
import { apiFetch } from './http';

export async function fetchSeats(screenId: string): Promise<Seat[]> {
  return apiFetch<Seat[]>(`/api/screens/${screenId}/seats`);
}