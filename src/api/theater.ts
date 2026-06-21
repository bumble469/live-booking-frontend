import type { Theater } from '../types/types';
import { apiFetch } from './http';

export async function fetchTheaters(): Promise<Theater[]> {
  return apiFetch<Theater[]>('/api/theaters');
}