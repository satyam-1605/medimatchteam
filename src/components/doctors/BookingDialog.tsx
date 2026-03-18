import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Check, Video, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createBookingNotification } from "@/services/notificationService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import GlowButton from "@/components/ui/GlowButton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctor: {
    id: number;
    name: string;
    specialty: string;
    videoCallAvailable?: boolean;
  };
}

const TIME_SLOTS = [
  "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
  "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
  "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
  "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
];

const BookingDialog = ({ open, onOpenChange, doctor }: BookingDialogProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date>();
  const [timeSlot, setTimeSlot] = useState("");
  const [reason, setReason] = useState("");
  const [consultationType, setConsultationType] = useState<"in-person" | "video">("in-person");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingRef, setBookingRef] = useState("");
  const [appointmentId, setAppointmentId] = useState("");

  const generateRef = () => `MED-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const handleBook = async () => {
    if (!date || !timeSlot) {
      toast({ title: "Missing info", description: "Please select a date and time slot.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({ title: "Not logged in", variant: "destructive" });
      setLoading(false);
      return;
    }
    const ref = generateRef();
    const { data: inserted, error } = await supabase.from("appointments").insert({
      user_id: session.user.id,
      booking_ref: ref,
      doctor_id: doctor.id,
      doctor_name: doctor.name,
      appointment_date: format(date, "yyyy-MM-dd"),
      time_slot: timeSlot,
      reason: reason || null,
      consultation_type: consultationType,
    }).select("id").single();
    setLoading(false);
    if (error || !inserted) {
      toast({ title: "Booking failed", description: error?.message, variant: "destructive" });
    } else {
      setBookingRef(ref);
      setAppointmentId(inserted.id);
      setConfirmed(true);
      await createBookingNotification({
        doctorName: doctor.name,
        date: format(date, "PPP"),
        timeSlot,
        bookingRef: ref,
        consultationType,
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // reset after close animation
    setTimeout(() => {
      setDate(undefined);
      setTimeSlot("");
      setReason("");
      setConsultationType("in-person");
      setConfirmed(false);
      setBookingRef("");
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {confirmed ? "Booking Confirmed!" : `Book ${doctor.name}`}
          </DialogTitle>
        </DialogHeader>

        {confirmed ? (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
              <Check className="w-8 h-8 text-success" />
            </div>
            <p className="text-foreground font-semibold text-lg">Appointment Booked</p>
            <div className="text-center space-y-1 text-sm text-muted-foreground">
              <p><strong className="text-foreground">{doctor.name}</strong> — {doctor.specialty}</p>
              <p>{date && format(date, "PPP")} at {timeSlot}</p>
              <p className="capitalize">{consultationType}</p>
            </div>
            <div className="mt-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/25">
              <span className="text-xs text-muted-foreground">Booking Ref:</span>
              <span className="ml-2 font-mono font-bold text-primary">{bookingRef}</span>
            </div>
            {consultationType === "video" && (
              <Button
                onClick={() => navigate(`/video-call/${appointmentId}`)}
                className="mt-3 w-full gap-2"
                variant="outline"
              >
                <Video className="w-4 h-4" /> Join Video Call
              </Button>
            )}
            <GlowButton onClick={handleClose} className="mt-2">Done</GlowButton>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Consultation Type */}
            {doctor.videoCallAvailable && (
              <div className="flex gap-2">
                <button
                  onClick={() => setConsultationType("in-person")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                    consultationType === "in-person"
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <MapPin className="w-4 h-4" /> In-Person
                </button>
                <button
                  onClick={() => setConsultationType("video")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors",
                    consultationType === "video"
                      ? "bg-primary/15 border-primary/40 text-primary"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Video className="w-4 h-4" /> Video Call
                </button>
              </div>
            )}

            {/* Date Picker */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Select Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Slots */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Select Time</label>
              <div className="grid grid-cols-4 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={cn(
                      "py-2 rounded-lg text-xs font-medium border transition-colors",
                      timeSlot === slot
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted/50"
                    )}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Reason (optional)</label>
              <Textarea
                placeholder="Briefly describe your symptoms or reason for visit..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>

            <GlowButton onClick={handleBook} className="w-full" disabled={loading}>
              {loading ? "Booking..." : "Confirm Booking"}
            </GlowButton>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
