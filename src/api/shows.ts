import { apiFetch } from './http';
import type { Show } from '../types/types';

export function fetchShows(): Promise<Show[]> { 
  return apiFetch<Show[]>('/api/shows');
}

export function fetchShow(showId: string): Promise<Show> {
  return apiFetch<Show>(`/api/shows/${showId}`);
}