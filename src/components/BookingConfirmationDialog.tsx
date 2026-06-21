import type { BookingConfirmationModalProps } from '../types/types';

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
}: BookingConfirmationModalProps) {
    if (!isOpen) return null;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const isValidEmail = emailRegex.test(email.trim());

    const isValidPhone = /^[0-9]{10}$/.test(phone.trim());

    const isFormValid =
        isValidEmail &&
        isValidPhone &&
        fullname.trim() !== '' &&
        email.trim() !== '' &&
        phone.trim() !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-velvet-700 bg-velvet-900 shadow-2xl">
        <div className="border-b border-velvet-800 px-6 py-5">
          <p className="font-mono text-[10px] tracking-[0.3em] text-dust">
            CONFIRM BOOKING
          </p>

          <h2 className="mt-2 font-display text-3xl tracking-wide text-ivory">
            Almost There
          </h2>

          <p className="mt-2 text-sm text-dust">
            Enter your details to reserve your selected seats.
          </p>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">
              SELECTED SEATS
            </label>

            <div className="rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 font-mono text-marquee-gold">
              {selectedSeats.join(' · ')}
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">
              FULLNAME
            </label>

            <input
              type="text"
              value={fullname}
              onChange={(e) => onFullnameChange(e.target.value)}
              placeholder="Albert Wesker"
              className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">
              EMAIL
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold"
            />
            {email && !isValidEmail && (
                <p className="mt-1 text-xs text-red-400">
                    Please enter a valid email address.
                </p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs tracking-wide text-dust">
              PHONE
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full rounded-md border border-velvet-700 bg-velvet-950 px-3 py-2 text-ivory outline-none focus:border-marquee-gold"
            />
            {phone && !isValidPhone && (
                <p className="mt-1 text-xs text-red-400">
                    Please enter a valid 10-digit mobile number.
                </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-velvet-800 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 cursor-pointer rounded-md border border-velvet-700 px-4 py-3 font-mono text-sm text-dust transition hover:bg-velvet-800"
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