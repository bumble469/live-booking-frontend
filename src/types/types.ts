export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

export interface Seat {
  id: string;
  screenId: string;
  row: string;
  number: number;
  status: SeatStatus;
  lockedBy: string | null;
}

export interface Theater {
  id: string;
  name: string;
  city: string;
}

export interface Screen {
  id: string;
  theaterId: string;
  name: string;
}

export interface BookingConfirmationModalProps {
  isOpen: boolean;
  isBooking: boolean;
  selectedSeats: string[];
  fullname: string;
  email: string;
  phone: string;
  onFullnameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
  isEmailVerified: boolean;                    
  onEmailVerified: (email: string) => void;   
};

export interface Show {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  posterUrl?: string;
}

export interface Screening {
  id: string;
  showId: string;
  showTitle: string;
  screenId: string;
  screenName: string;
  theatreId: string;
  theatreName: string;
  theatreCity: string;
  startsAt: string;     
  endsAt: string;     
  totalSeats: number;     
  availableSeats: number;  
}

export interface FeaturedShow {
  id: number;
  title: string;
  description: string | null;
  posterUrl: string | null;
  startsAt: string;
}

