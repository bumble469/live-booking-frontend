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