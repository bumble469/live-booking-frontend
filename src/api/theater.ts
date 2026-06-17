import type { Theater } from '../types/types';
import { theaters } from './mockData';

export async function fetchTheaters(): Promise<Theater[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return theaters;
}