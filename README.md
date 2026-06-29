# Showaholic — Frontend

React + TypeScript frontend for the Showaholic cinema seat booking system. Handles real-time seat selection, OTP email verification, booking confirmation, and cancellation — all wired to a Fastify backend via REST and Socket.IO.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (CSS-based config, no `tailwind.config.js`) |
| Routing | React Router v7 |
| Real-time | Socket.IO client 4 |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Backend server running (see `live-booking-backend/README.md`)

### Installation

```bash
cd live-booking-frontend
npm install
```

### Environment Variables

Create a `.env` file in `live-booking-frontend/`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL of the Fastify backend — also used as the Socket.IO server URL |

### Running

```bash
# Development
npm run dev

# Production build
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── api/
│   ├── http.ts            ← base apiFetch wrapper (JSON, error handling)
│   ├── shows.ts
│   ├── screenings.ts
│   ├── seats.ts
│   ├── locks.ts
│   ├── bookings.ts        ← create booking + cancel lookup/confirm
│   └── verification.ts    ← send OTP + confirm OTP
├── components/
│   ├── SeatMap.tsx                   ← interactive seat grid
│   └── BookingConfirmationDialog.tsx ← OTP + booking details modal
├── pages/
│   ├── HomePage.tsx          ← show listings
│   ├── TheatresPage.tsx      ← theatre + screening picker
│   ├── SeatsPage.tsx         ← seat selection with live socket updates
│   ├── ConfirmationPage.tsx  ← post-booking success screen
│   └── CancelPage.tsx        ← two-step cancellation flow
├── sockets/
│   └── socket.ts             ← Socket.IO client singleton (autoConnect: false)
├── types/
│   └── types.ts              ← shared TypeScript interfaces
├── utils/
│   └── session.ts            ← sessionId via localStorage
├── App.tsx                   ← route definitions
└── main.tsx                  ← React root
```

---

## Pages & Routing

| Route | Page | Description |
|---|---|---|
| `/` | `HomePage` | Browse all shows |
| `/shows/:showId/theatres` | `TheatresPage` | Pick a theatre and screening time |
| `/screenings/:screeningId/seats` | `SeatsPage` | Select seats, real-time lock/unlock |
| `/screenings/:screeningId/confirmation` | `ConfirmationPage` | Booking success screen |
| `/cancel` | `CancelPage` | Cancel a booking by reference + email |

---

## Key Features

### Real-time Seat Map

`SeatsPage` connects to the backend Socket.IO server and joins a room scoped to the current screening (`screening-{screeningId}`). All seat status changes from any connected user are reflected live:

| Socket event | What the frontend does |
|---|---|
| `seat_locked` | Turns the seat yellow |
| `seat_unlocked` | Turns the seat green (also removes from your selection if the backend expiry job released it) |
| `seat_booked` | Turns the seat red |
| `availability_update` | Updates the available count shown on the screenings list |

### Lock Expiry Timer

When a user locks a seat the backend returns `lockExpiresAt` (5 minutes from now). The frontend tracks the earliest expiry across all selected seats and shows a live countdown in the selection panel:

- **Green** — more than 60 seconds remaining
- **Amber** — 30–60 seconds remaining
- **Red** — under 30 seconds remaining

When the timer hits zero, the Confirm Booking button is disabled and a "Seats released — reselect" message appears. The backend expiry job will have already freed the seats and the `seat_unlocked` socket events will clean up the local selection state automatically.

### Session Identity

Each browser tab generates a random `sessionId` stored in `localStorage` (`utils/session.ts`). This is sent with every lock and booking request so the backend can:
- Reject lock attempts on seats already locked by a different session
- Only allow the lock owner to release or book a seat
- Restore a user's locked seats correctly on page refresh (seats where `lockedBy === sessionId` are re-added to `myLockedSeatIds`)

### OTP Email Verification

Before confirming a booking, the user must verify their email via a 6-digit OTP:

1. User enters email → clicks **Send OTP** → `POST /api/verification/send`
2. OTP arrives by email (via Resend) — valid for **3 minutes**
3. Countdown timer shows time remaining; input is disabled when expired
4. User enters OTP → clicks **Verify** → `POST /api/verification/confirm`
5. On success the booking form unlocks

The `BookingConfirmationDialog` handles all OTP state locally. Changing the email resets the OTP flow.

### Cancellation Flow

`CancelPage` is a two-step form:

1. **Lookup** — user enters booking reference (pre-filled from email link `?ref=`) and their email → `GET /api/bookings/cancel`
2. **Confirm** — shows full booking details (show, theatre, screen, showtime, seats) with a red Confirm Cancel button → `POST /api/bookings/cancel`
3. **Done** — success message; backend has freed seats and sent a cancellation email

Cancellations within 2 hours of showtime are rejected by the backend with a clear error message.

---

## Styling Notes

Tailwind v4 is configured entirely via CSS — there is no `tailwind.config.js`. Custom design tokens (colours, fonts) are defined in the main CSS file using `@theme`:

```css
@theme {
  --color-ivory: #f3eae0;
  --color-dust: #a6939a;
  --color-velvet-900: #2A1820;
  --color-marquee-gold: #E3B23C;
  /* ... */
}
```

The plugin is registered in `vite.config.ts`:

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

---

## API Layer

All HTTP calls go through `src/api/http.ts` which wraps `fetch` with:
- Base URL from `VITE_API_BASE_URL`
- `Content-Type: application/json` header
- JSON body serialisation
- Error throwing on non-2xx responses (parses `{ error }` from response body if available)

Each feature has its own API file (`shows.ts`, `locks.ts`, `bookings.ts`, etc.) that calls `apiFetch` with typed generics.

---

## Socket Connection Lifecycle

The socket client (`src/sockets/socket.ts`) is created with `autoConnect: false` so it does not connect on import. `SeatsPage` manages the connection explicitly:

```ts
// On mount
socket.connect();
socket.emit('join_screening', screeningId);

// On unmount
socket.emit('leave_screening', screeningId);
socket.off('seat_locked');
socket.off('seat_unlocked');
socket.off('seat_booked');
socket.disconnect();
```

Named handler references are used with `socket.off` to avoid removing unrelated listeners.