import type { Screen } from '../types/types';
import { apiFetch } from './http';

export async function fetchScreens(theaterId: string): Promise<Screen[]> {
  return apiFetch<Screen[]>(`/api/theaters/${theaterId}/screens`);
}