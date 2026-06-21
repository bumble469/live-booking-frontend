export type SeatStatus = 'AVAILABLE' | 'LOCKED' | 'BOOKED';

export interface Seat {
  id: string;
  screenId: string;
  row: string;
  number: number;
  status: SeatStatus;
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
};