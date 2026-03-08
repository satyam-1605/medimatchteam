import { supabase } from "@/integrations/supabase/client";

export const createBookingNotification = async (params: {
  doctorName: string;
  date: string;
  timeSlot: string;
  bookingRef: string;
  consultationType: string;
}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from("notifications").insert({
    user_id: session.user.id,
    title: "Appointment Confirmed",
    message: `Your ${params.consultationType} appointment with ${params.doctorName} on ${params.date} at ${params.timeSlot} is confirmed. Ref: ${params.bookingRef}`,
    type: "booking_confirmed",
    booking_ref: params.bookingRef,
  });
};

export const createCancellationNotification = async (params: {
  doctorName: string;
  date: string;
  timeSlot: string;
  bookingRef: string;
}) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  await supabase.from("notifications").insert({
    user_id: session.user.id,
    title: "Appointment Cancelled",
    message: `Your appointment with ${params.doctorName} on ${params.date} at ${params.timeSlot} has been cancelled. Ref: ${params.bookingRef}`,
    type: "booking_cancelled",
    booking_ref: params.bookingRef,
  });
};
