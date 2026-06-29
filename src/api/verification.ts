import { apiFetch } from './http';

export async function sendOTP(email: string): Promise<{ message: string }> {
  return apiFetch('/api/verify/send', {
    method: 'POST',
    body: { email },
  });
}

export async function confirmOTP(email: string, otp: string): Promise<{ verified: boolean }> {
  return apiFetch('/api/verify/confirm', {
    method: 'POST',
    body: { email, otp },
  });
}