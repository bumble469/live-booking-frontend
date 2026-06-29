import { apiFetch } from './http';
import type { Show, ShowsPage } from '../types/types';

export function fetchShows(page = 1, limit = 8, q = ''): Promise<ShowsPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  return apiFetch<ShowsPage>(`/api/shows?${params}`);
}

export function fetchShow(showId: string): Promise<Show> {
  return apiFetch<Show>(`/api/shows/${showId}`);
}