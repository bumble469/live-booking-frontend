import { apiFetch } from './http';
import type { FeaturedShow } from '../types/types';

export async function getFeaturedShows() {
  return apiFetch<{ success: boolean; data: FeaturedShow[] }>(
    '/api/home/featured',
    {
      method: 'GET',
    }
  );
}