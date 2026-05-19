import { Timestamp } from 'firebase/firestore';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface DailyHours {
  start: string; // "09:00" format (24hr)
  end: string;   // "17:00" format
  active: boolean;
}

export type WorkingHours = Record<DayOfWeek, DailyHours>;

export interface CalendarSettings {
  workingHours: WorkingHours;
  slotDurationMinutes: number; // e.g., 30, 45, 60
  timezone: string; // e.g., "America/New_York"
  nativeCalendarEnabled: boolean;
  bookingUrl?: string; // Optional third-party link fallback
}

export interface Appointment {
  id: string;
  leadId: string | null;
  name: string;
  email: string;
  phone: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  service: string;
  status: 'scheduled' | 'canceled' | 'completed';
  notes?: string;
  createdAt: Timestamp | Date;
}
