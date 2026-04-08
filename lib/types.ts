export type Show = {
  id: string;
  name: string;
  slug: string;
  prefix: string;
  total_seats: number;
  created_at: string;
};

export type Booking = {
  id: string;
  show_id: string;
  requester_name: string;
  phone: string;
  ticket_count: number;
  participant_names: string;
  notes: string | null;
  confirmed: boolean;
  paid: boolean;
  checked_in: boolean;
  created_at: string;
  updated_at: string;
};

export type Serial = {
  id: string;
  show_id: string;
  code: string;
  status: 'LIBERO' | 'PRENOTATO' | 'PAGATO';
  assigned_to: string | null;
  booking_id: string | null;
};
