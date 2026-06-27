import { apiFetch } from './http';

export async function createBooking(
  seatIds: string[],
  screeningId: string,
  sessionId: string,
  fullname: string,
  email: string,
  phone: string,
  seatLabels: string[],
  showTitle: string,
  screenName: string,
  theatreName: string,
  startsAt: string
) {
  return apiFetch<{ success: boolean; bookingReference: string }>('/api/bookings', {
    method: 'POST',
    body: { seatIds, screeningId, sessionId, fullname, email, phone, seatLabels, showTitle, screenName, theatreName, startsAt },
  });
}

export async function lookupBookingForCancel(ref: string, email: string) {
  return apiFetch<{
    bookingReference: string;
    fullname: string;
    email: string;
    status: string;
    showTitle: string;
    screenName: string;
    theatreName: string;
    startsAt: string;
    seatLabels: string[];
  }>(`/api/bookings/cancel?ref=${encodeURIComponent(ref)}&email=${encodeURIComponent(email)}`);
}

export async function cancelBooking(ref: string, email: string) {
  return apiFetch<{ success: boolean }>('/api/bookings/cancel', {
    method: 'POST',
    body: { ref, email },
  });
}