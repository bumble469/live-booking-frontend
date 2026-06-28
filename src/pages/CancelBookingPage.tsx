import { useEffect, useRef, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { lookupBookingForCancel, cancelBooking } from '../api/bookings';
import { sendOTP, confirmOTP } from '../api/verification';
import { Spinner } from '../components/Spinner';

type Step = 'lookup' | 'otp' | 'confirm' | 'done';

function formatShowtime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCountdown(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface BookingInfo {
  bookingReference: string;
  fullname: string;
  email: string;
  status: string;
  showTitle: string;
  screenName: string;
  theatreName: string;
  startsAt: string;
  seatLabels: string[];
}

export function CancelBookingPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<Step>('lookup');
  const [ref, setRef] = useState(searchParams.get('ref') ?? '');
  const [email, setEmail] = useState('');
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState('');

  // OTP state
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isOtpExpired = secondsLeft === 0;

  // Countdown timer — starts when OTP step is entered
  useEffect(() => {
    if (step !== 'otp') {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(null);
      return;
    }

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

    timerRef.current = interval;
    return () => clearInterval(interval);
  }, [step]);

  async function handleLookup() {
    setIsLoading(true);
    setError('');
    try {
      const data = await lookupBookingForCancel(ref.trim(), email.trim());
      if (data.status === 'CANCELLED') {
        setError('This booking has already been cancelled.');
        return;
      }
      setBooking(data);
      // Auto-send OTP immediately after finding the booking
      await sendOTP(email.trim());
      setStep('otp');
    } catch {
      setError('No booking found for that reference and email. Please check and try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyOTP() {
    setIsVerifying(true);
    setError('');
    try {
      const { verified } = await confirmOTP(email.trim(), otp.trim());
      if (verified) {
        setStep('confirm');
      } else {
        setError('Incorrect OTP. Please try again.');
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResendOTP() {
    setIsResending(true);
    setError('');
    setOtp('');
    // Reset timer by briefly leaving otp step then returning
    setStep('lookup');
    try {
      await sendOTP(email.trim());
      setStep('otp');
    } catch {
      setError('Failed to resend OTP. Please try again.');
      setStep('otp');
    } finally {
      setIsResending(false);
    }
  }

  async function handleCancel() {
    if (!booking) return;
    setIsCancelling(true);
    setError('');
    try {
      await cancelBooking(booking.bookingReference, booking.email);
      setStep('done');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Cancellation failed. Please try again.';
      setError(message);
    } finally {
      setIsCancelling(false);
    }
  }

  // ── DONE ──────────────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <div className="mx-auto max-w-xl p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]" />
          <p className="font-mono text-xs tracking-[0.35em] text-dust">BOOKING CANCELLED</p>
        </div>
        <h1 className="mt-3 mb-3 font-display text-4xl tracking-wide text-ivory">All Done</h1>
        <p className="mb-8 text-sm text-dust">
          Your booking has been cancelled and a confirmation has been sent to{' '}
          <span className="text-ivory">{booking?.email}</span>. The seats are now available for others.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-marquee-gold px-6 py-3 font-display text-lg tracking-wide text-velvet-950 transition-all hover:scale-[1.03] hover:bg-amber-300"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  // ── CONFIRM ───────────────────────────────────────────────────────────────
  if (step === 'confirm' && booking) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-dust">CANCEL BOOKING</p>
        <h1 className="mt-2 mb-6 font-display text-4xl tracking-wide text-ivory">Are You Sure?</h1>

        <div className="overflow-hidden rounded-lg border border-velvet-800 bg-velvet-900">
          <div className="space-y-4 px-6 py-5">
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SHOW</p>
              <p className="mt-1 font-display text-xl tracking-wide text-ivory">{booking.showTitle}</p>
              <p className="font-mono text-xs text-dust">{booking.theatreName} · {booking.screenName}</p>
              <p className="font-mono text-xs text-marquee-gold">{formatShowtime(booking.startsAt)}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">BOOKED FOR</p>
              <p className="mt-1 text-sm text-ivory">{booking.fullname}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.3em] text-dust">SEATS</p>
              <p className="mt-1 font-mono text-lg text-marquee-gold">{booking.seatLabels.join(' · ')}</p>
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-velvet-700 px-6 py-5">
            <span aria-hidden className="absolute -top-2 left-0 h-4 w-4 -translate-x-1/2 rounded-full bg-velvet-950" />
            <span aria-hidden className="absolute -top-2 right-0 h-4 w-4 translate-x-1/2 rounded-full bg-velvet-950" />
            <p className="font-mono text-[10px] tracking-[0.3em] text-dust">BOOKING REFERENCE</p>
            <p className="mt-1 font-mono text-2xl tracking-[0.15em] text-ivory">{booking.bookingReference}</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-dust">
          Cancellations are not allowed within 2 hours of showtime. Once cancelled this cannot be undone.
        </p>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => setStep('lookup')}
            className="flex-1 rounded-md border border-velvet-700 px-4 py-3 font-mono text-sm text-dust transition hover:bg-velvet-800"
          >
            Go Back
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={handleCancel}
            className="flex-1 rounded-md bg-red-700 px-4 py-3 font-display text-lg tracking-wide text-ivory transition hover:bg-red-600 disabled:bg-velvet-700 disabled:text-dust"
          >
            {isCancelling ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Cancelling…
              </span>
            ) : (
              'Confirm Cancel'
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── OTP ───────────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p className="font-mono text-[10px] tracking-[0.3em] text-dust">CANCEL BOOKING</p>
        <h1 className="mt-2 mb-2 font-display text-4xl tracking-wide text-ivory">Verify It's You</h1>
        <p className="mb-8 text-sm text-dust">
          We sent a 6-digit code to{' '}
          <span className="text-ivory">{email}</span>. Enter it below to proceed.
        </p>

        <div className="space-y-4">
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="font-mono text-xs tracking-wide text-dust">OTP</label>
              {secondsLeft !== null && (
                isOtpExpired ? (
                  <span className="font-mono text-[10px] text-red-400">Expired</span>
                ) : (
                  <span className={`font-mono text-[10px] tabular-nums ${
                    secondsLeft <= 30 ? 'text-red-400' : secondsLeft <= 60 ? 'text-amber-400' : 'text-green-400'
                  }`}>
                    {formatCountdown(secondsLeft)}
                  </span>
                )
              )}
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              disabled={isOtpExpired}
              placeholder="——————"
              className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-3 text-center font-mono text-2xl tracking-[0.5em] text-ivory outline-none transition focus:border-marquee-gold disabled:opacity-40"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="button"
            disabled={otp.length !== 6 || isVerifying || isOtpExpired}
            onClick={handleVerifyOTP}
            className="w-full rounded-md bg-marquee-gold px-4 py-3 font-display text-lg tracking-wide text-velvet-950 transition hover:bg-amber-300 disabled:bg-velvet-700 disabled:text-dust disabled:cursor-not-allowed"
          >
            {isVerifying ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" /> Verifying…
              </span>
            ) : (
              'Verify & Continue'
            )}
          </button>

          <button
            type="button"
            disabled={isResending}
            onClick={handleResendOTP}
            className="w-full rounded-md border border-velvet-700 px-4 py-3 font-mono text-sm text-dust transition hover:bg-velvet-800 disabled:opacity-50"
          >
            {isResending ? 'Sending…' : 'Resend OTP'}
          </button>
        </div>

        <div className="mt-8">
          <button
            type="button"
            onClick={() => { setStep('lookup'); setOtp(''); setError(''); }}
            className="font-mono text-xs text-dust transition hover:text-marquee-gold"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // ── LOOKUP ────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-xl p-6">
      <p className="font-mono text-[10px] tracking-[0.3em] text-dust">CANCEL BOOKING</p>
      <h1 className="mt-2 mb-2 font-display text-4xl tracking-wide text-ivory">Cancel a Booking</h1>
      <p className="mb-8 text-sm text-dust">
        Enter your booking reference and the email used when booking.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block font-mono text-xs tracking-wide text-dust">BOOKING REFERENCE</label>
          <input
            type="text"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            placeholder="ABC123XYZ0"
            className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 font-mono tracking-widest text-ivory outline-none focus:border-marquee-gold"
          />
        </div>
        <div>
          <label className="mb-1 block font-mono text-xs tracking-wide text-dust">EMAIL</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="button"
          disabled={!ref.trim() || !email.trim() || isLoading}
          onClick={handleLookup}
          className="w-full rounded-md bg-marquee-gold px-4 py-3 font-display text-lg tracking-wide text-velvet-950 transition hover:bg-amber-300 disabled:bg-velvet-700 disabled:text-dust disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner size="sm" /> Finding booking…
            </span>
          ) : (
            'Find Booking'
          )}
        </button>
      </div>

      <div className="mt-8">
        <Link to="/" className="font-mono text-xs text-dust transition hover:text-marquee-gold">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}