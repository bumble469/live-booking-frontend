import { apiFetch } from './http';

export async function createBooking(seatId: string, screenId: string, sessionId: string) {
  return apiFetch<{ success: boolean }>('/api/bookings', {
    method: 'POST',
    body: { seatId, screenId, sessionId },
  });
}