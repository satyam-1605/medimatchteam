// Scheduled function: scans for confirmed appointments starting in ~30 minutes
// and inserts a one-time in-app reminder notification per appointment.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.95.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Time slots in MyBookings are single times like "10:00 AM" (30-min slots).
function parseTimeSlot(slot: string): { hours: number; minutes: number } | null {
  if (!slot) return null;
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10);
  const minutes = parseInt(m[2], 10);
  const period = m[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
}

function appointmentStart(dateStr: string, timeSlot: string): Date | null {
  const t = parseTimeSlot(timeSlot);
  const [y, mo, d] = dateStr.split("-").map(Number);
  if (!t || !y || !mo || !d) return null;
  return new Date(y, mo - 1, d, t.hours, t.minutes);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const now = new Date();
    // Look at appointments scheduled for today or tomorrow (covers timezone slop).
    const today = now.toISOString().slice(0, 10);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const { data: appts, error: apptErr } = await supabase
      .from("appointments")
      .select(
        "id, user_id, doctor_name, appointment_date, time_slot, consultation_type, status, booking_ref",
      )
      .in("appointment_date", [today, tomorrow])
      .eq("status", "confirmed");

    if (apptErr) throw apptErr;

    // Filter to appointments starting in the next 5–35 minutes
    // (we run every ~5 min, so window is one cron interval wide on the leading edge).
    const windowStart = now.getTime() + 5 * 60 * 1000;
    const windowEnd = now.getTime() + 35 * 60 * 1000;

    const candidates = (appts || []).filter((a) => {
      const start = appointmentStart(a.appointment_date, a.time_slot);
      if (!start) return false;
      const t = start.getTime();
      return t >= windowStart && t <= windowEnd;
    });

    if (candidates.length === 0) {
      return new Response(
        JSON.stringify({ checked: appts?.length ?? 0, reminders_sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Dedup: skip any appointment that already has a reminder notification.
    const reminderRefs = candidates.map((a) => `REMIND-${a.booking_ref}`);
    const { data: existing, error: existErr } = await supabase
      .from("notifications")
      .select("booking_ref")
      .in("booking_ref", reminderRefs)
      .eq("type", "reminder");
    if (existErr) throw existErr;

    const alreadySent = new Set(
      (existing || []).map((n: { booking_ref: string | null }) => n.booking_ref),
    );

    const toInsert = candidates
      .filter((a) => !alreadySent.has(`REMIND-${a.booking_ref}`))
      .map((a) => ({
        user_id: a.user_id,
        title: "Appointment starting soon",
        message:
          `Your ${a.consultation_type ?? "appointment"} with ${a.doctor_name} ` +
          `starts at ${a.time_slot}. ${
            a.consultation_type === "video"
              ? "Tap to join the video call."
              : "Tap to view details."
          }`,
        type: "reminder",
        booking_ref: `REMIND-${a.booking_ref}`,
      }));

    let inserted = 0;
    if (toInsert.length > 0) {
      const { error: insErr, count } = await supabase
        .from("notifications")
        .insert(toInsert, { count: "exact" });
      if (insErr) throw insErr;
      inserted = count ?? toInsert.length;
    }

    return new Response(
      JSON.stringify({
        checked: appts?.length ?? 0,
        candidates: candidates.length,
        reminders_sent: inserted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("appointment-reminders error", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
