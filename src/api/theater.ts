import { apiFetch } from './http';
import type { TheatersPage } from '../types/types';

export function fetchTheaters(page = 1, limit = 6, q = ''): Promise<TheatersPage> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q) params.set('q', q);
  return apiFetch<TheatersPage>(`/api/theaters?${params}`);
}