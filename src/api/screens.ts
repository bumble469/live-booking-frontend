import type { Screen } from '../types/types';
import { screens } from './mockData';

export async function fetchScreens(theaterId: string): Promise<Screen[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return screens.filter((screen) => screen.theaterId === theaterId);
}