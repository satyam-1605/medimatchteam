// Utilities for working with appointment date + time-slot strings.
// Time slots are single start times like "10:00 AM" (30-minute slots).

const SLOT_DURATION_MINUTES = 30;

/**
 * Parse a time slot string like "10:00 AM" into { hours, minutes } in 24h.
 * Returns null if it can't be parsed.
 */
export function parseTimeSlot(slot: string): { hours: number; minutes: number } | null {
  if (!slot) return null;
  const match = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

/**
 * Returns the end-of-slot Date for an appointment.
 * If the time slot can't be parsed, falls back to end of the appointment date.
 */
export function getAppointmentEnd(dateStr: string, timeSlot: string): Date {
  const parsed = parseTimeSlot(timeSlot);
  const [y, m, d] = dateStr.split("-").map(Number);
  if (parsed && y && m && d) {
    return new Date(y, m - 1, d, parsed.hours, parsed.minutes + SLOT_DURATION_MINUTES);
  }
  // Fallback: end of day
  const fallback = new Date(dateStr);
  fallback.setHours(23, 59, 59, 999);
  return fallback;
}

/**
 * Returns the start Date for an appointment slot.
 */
export function getAppointmentStart(dateStr: string, timeSlot: string): Date {
  const parsed = parseTimeSlot(timeSlot);
  const [y, m, d] = dateStr.split("-").map(Number);
  if (parsed && y && m && d) {
    return new Date(y, m - 1, d, parsed.hours, parsed.minutes);
  }
  return new Date(dateStr);
}

/**
 * Whether the appointment slot end is in the past.
 */
export function isAppointmentPast(dateStr: string, timeSlot: string): boolean {
  return getAppointmentEnd(dateStr, timeSlot).getTime() < Date.now();
}

/**
 * Whether it's currently within a small join window before the slot
 * and before the slot end. Patients can join 10 minutes before start.
 */
export function canJoinVideoCall(dateStr: string, timeSlot: string, leadMinutes = 10): boolean {
  const now = Date.now();
  const start = getAppointmentStart(dateStr, timeSlot).getTime();
  const end = getAppointmentEnd(dateStr, timeSlot).getTime();
  return now >= start - leadMinutes * 60 * 1000 && now <= end;
}
