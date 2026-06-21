import { apiFetch } from './http';

export async function createBooking(
  seatIds: string[],
  screenId: string,
  sessionId: string,
  fullname: string,
  email: string,
  phone: string
) {
  return apiFetch<{ success: boolean; bookingReference: string }>('/api/bookings', {
    method: 'POST',
    body: { seatIds, screenId, sessionId, fullname, email, phone },
  });
}