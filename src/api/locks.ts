import { apiFetch } from './http';

export async function lockSeat(seatId: string, screeningId: string, sessionId: string) {
  return apiFetch<{ success: boolean; lockExpiresAt?: string }>('/api/locks', {
    method: 'POST',
    body: { seatId, screeningId, sessionId },
  });
}

export async function unlockSeat(seatId: string, screeningId: string, sessionId: string) {
  return apiFetch<{ success: boolean }>('/api/locks/release', {
    method: 'POST',
    body: { seatId, screeningId, sessionId },
  });
}