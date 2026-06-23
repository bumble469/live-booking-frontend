import { apiFetch } from './http';

export async function createBooking(
  seatIds: string[],
  screeningId: string,
  sessionId: string,
  fullname: string,
  email: string,
  phone: string,
  seatLabels: string[]
) {
  return apiFetch<{ success: boolean; bookingReference: string }>('/api/bookings', {
    method: 'POST',
    body: { seatIds, screeningId, sessionId, fullname, email, phone, seatLabels },
  });
}