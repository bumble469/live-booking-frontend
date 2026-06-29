import { useState, useEffect } from 'react';
import type { BookingConfirmationModalProps } from '../types/types';
import { sendOTP, confirmOTP } from '../api/verification';

export function BookingConfirmationDialog({
  isOpen,
  isBooking,
  selectedSeats,
  fullname,
  email,
  phone,
  onFullnameChange,
  onEmailChange,
  onPhoneChange,
  onConfirm,
  onClose,
  isEmailVerified,
  onEmailVerified,
}: BookingConfirmationModalProps) {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null); // null = timer not started yet

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValidEmail = emailRegex.test(email.trim());
  const isValidPhone = /^[0-9]{10}$/.test(phone.trim());
  const isFormValid =
    isValidEmail && isValidPhone && fullname.trim() !== '' && isEmailVerified;

  const timerDisplay =
  secondsLeft !== null
    ? `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`
    : '';

  // Only expired when the timer has actually started AND reached zero
  const isOtpExpired = otpSent && !isEmailVerified && secondsLeft === 0;

  useEffect(() => {
    if (!otpSent || isEmailVerified || !isOpen) return;

    setSecondsLeft(3 * 60);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // ✅ cleanup function, not an immediate call
  }, [otpSent, isEmailVerified, isOpen]);

  async function handleSendOTP() {
    setIsSendingOtp(true);
    setOtpError('');
    setOtpSent(false);    
    setSecondsLeft(null); // reset so expired state doesn't flash on resend
    try {
      await sendOTP(email.trim());
      setOtpSent(true);
    } catch {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOTP() {
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      const { verified } = await confirmOTP(email.trim(), otp.trim());
      if (verified) {
        onEmailVerified(email.trim());
      } else {
        setOtpError('Invalid or expired OTP. Please try again.');
      }
    } catch {
      setOtpError('Invalid or expired OTP. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  function handleEmailChange(value: string) {
    onEmailChange(value);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    setSecondsLeft(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-velvet-700 bg-velvet-900 shadow-2xl">
        {/* Header */}
        <div className="border-b border-velvet-800 px-6 py-5">
          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">CONFIRM BOOKING</p>
          <h2 className="mt-2 font-display text-3xl tracking-wide text-ivory">Almost There</h2>
          <p className="mt-2 text-sm text-dust">Enter your details to reserve your selected seats.</p>
        </div>

        <div className="space-y-4 px-6 py-5">
          {/* Seats */}
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">SELECTED SEATS</label>
            <div className="rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 font-mono text-marquee-gold">
              {selectedSeats.join(' · ')}
            </div>
          </div>

          {/* Fullname */}
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">FULLNAME</label>
            <input
              type="text"
              value={fullname}
              onChange={(e) => onFullnameChange(e.target.value)}
              placeholder="Albert Wesker"
              className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold"
            />
          </div>

          {/* Email + OTP */}
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">EMAIL</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="you@example.com"
                disabled={isEmailVerified}
                className="flex-1 rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold disabled:opacity-50"
              />
              {!isEmailVerified && (
                <button
                  type="button"
                  disabled={!isValidEmail || isSendingOtp}
                  onClick={handleSendOTP}
                  className="shrink-0 rounded-md border border-marquee-gold px-3 py-2 font-mono text-xs text-marquee-gold transition hover:bg-marquee-gold hover:text-velvet-950 disabled:border-velvet-700 disabled:text-dust disabled:cursor-not-allowed"
                >
                  {isSendingOtp ? 'Sending…' : otpSent ? 'Resend' : 'Send OTP'}
                </button>
              )}
              {isEmailVerified && (
                <span className="flex items-center gap-1 font-mono text-xs text-green-400">
                  ✓ Verified
                </span>
              )}
            </div>
            {email && !isValidEmail && (
              <p className="mt-1 text-xs text-red-400">Please enter a valid email address.</p>
            )}

            {/* OTP input */}
            {otpSent && !isEmailVerified && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10px] tracking-widest text-dust">OTP SENT</p>
                  {isOtpExpired ? (
                    <p className="font-mono text-[10px] text-red-400">OTP expired — resend</p>
                  ) : secondsLeft !== null ? (
                    <p className="font-mono text-[10px] text-marquee-gold">
                      Expires in {timerDisplay}
                    </p>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    disabled={isOtpExpired}
                    className="flex-1 rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 font-mono tracking-widest text-ivory outline-none focus:border-marquee-gold disabled:opacity-40"
                  />
                  <button
                    type="button"
                    disabled={otp.length !== 6 || isVerifyingOtp || isOtpExpired}
                    onClick={handleVerifyOTP}
                    className="shrink-0 rounded-md bg-marquee-gold px-3 py-2 font-mono text-xs text-velvet-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-velvet-700 disabled:text-dust"
                  >
                    {isVerifyingOtp ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
              </div>
            )}
            {otpError && <p className="mt-1 text-xs text-red-400">{otpError}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">PHONE</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold"
            />
            {phone && !isValidPhone && (
              <p className="mt-1 text-xs text-red-400">Please enter a valid 10-digit mobile number.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-velvet-800 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-md border border-velvet-700 px-4 py-3 font-mono text-sm text-dust transition hover:bg-velvet-400"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isBooking || !isFormValid}
            onClick={onConfirm}
            className="flex-1 cursor-pointer rounded-md bg-marquee-gold px-4 py-3 font-display text-lg tracking-wide text-velvet-950 transition hover:bg-amber-300 disabled:bg-velvet-700 disabled:text-dust"
          >
            {isBooking ? 'Booking…' : 'Book Now'}
          </button>
        </div>
      </div>
    </div>
  );
}