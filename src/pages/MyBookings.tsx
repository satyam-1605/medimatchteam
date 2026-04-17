import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, Clock, XCircle, CheckCircle, AlertCircle, Video, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createCancellationNotification } from "@/services/notificationService";
import { isAppointmentPast, canJoinVideoCall } from "@/lib/appointmentTime";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import GlowButton from "@/components/ui/GlowButton";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Appointment {
  id: string;
  booking_ref: string;
  doctor_name: string;
  appointment_date: string;
  time_slot: string;
  consultation_type: string;
  status: string;
  reason: string | null;
  created_at: string;
}

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  confirmed: { icon: CheckCircle, color: "text-success", label: "Confirmed" },
  completed: { icon: CheckCircle, color: "text-primary", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled" },
  passed: { icon: History, color: "text-muted-foreground", label: "Date has passed" },
};

const MyBookings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      fetchAppointments();
    };
    check();
  }, [navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAppointments((data as Appointment[]) || []);
    }
  };

  const cancelAppointment = async (appt: Appointment) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled" })
      .eq("id", appt.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Appointment cancelled" });
      await createCancellationNotification({
        doctorName: appt.doctor_name,
        date: appt.appointment_date,
        timeSlot: appt.time_slot,
        bookingRef: appt.booking_ref,
      });
      fetchAppointments();
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        <motion.h1
          className="text-3xl font-display font-bold text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          My <span className="text-primary">Bookings</span>
        </motion.h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-20">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No bookings yet.</p>
            <GlowButton onClick={() => navigate("/doctors")}>Find a Doctor</GlowButton>
          </div>
        ) : (
          <BookingsTabs
            appointments={appointments}
            onCancel={cancelAppointment}
            onJoin={(id) => navigate(`/video-call/${id}`)}
            onFindDoctor={() => navigate("/doctors")}
          />
        )}
      </div>
    </div>
  );
};

interface BookingsTabsProps {
  appointments: Appointment[];
  onCancel: (appt: Appointment) => void;
  onJoin: (id: string) => void;
  onFindDoctor: () => void;
}

const BookingsTabs = ({ appointments, onCancel, onJoin, onFindDoctor }: BookingsTabsProps) => {
  const { upcoming, past } = useMemo(() => {
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];
    for (const a of appointments) {
      const ended = isAppointmentPast(a.appointment_date, a.time_slot);
      const isHistorical = a.status !== "confirmed" || ended;
      if (isHistorical) past.push(a);
      else upcoming.push(a);
    }
    // Upcoming: soonest first. Past: most recent first.
    upcoming.sort((a, b) => a.appointment_date.localeCompare(b.appointment_date));
    past.sort((a, b) => b.appointment_date.localeCompare(a.appointment_date));
    return { upcoming, past };
  }, [appointments]);

  return (
    <Tabs defaultValue="upcoming" className="max-w-2xl">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="upcoming">
          Upcoming{upcoming.length > 0 && ` (${upcoming.length})`}
        </TabsTrigger>
        <TabsTrigger value="past">
          Past{past.length > 0 && ` (${past.length})`}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="mt-0">
        {upcoming.length === 0 ? (
          <EmptyState
            label="No upcoming appointments."
            actionLabel="Find a Doctor"
            onAction={onFindDoctor}
          />
        ) : (
          <div className="grid gap-4">
            {upcoming.map((appt, i) => (
              <BookingCard
                key={appt.id}
                appt={appt}
                index={i}
                onCancel={onCancel}
                onJoin={onJoin}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past" className="mt-0">
        {past.length === 0 ? (
          <EmptyState label="No past appointments yet." />
        ) : (
          <div className="grid gap-4">
            {past.map((appt, i) => (
              <BookingCard
                key={appt.id}
                appt={appt}
                index={i}
                onCancel={onCancel}
                onJoin={onJoin}
              />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

const EmptyState = ({
  label,
  actionLabel,
  onAction,
}: {
  label: string;
  actionLabel?: string;
  onAction?: () => void;
}) => (
  <div className="text-center py-16 glass-panel rounded-xl border border-border">
    <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
    <p className="text-muted-foreground mb-4">{label}</p>
    {actionLabel && onAction && <GlowButton onClick={onAction}>{actionLabel}</GlowButton>}
  </div>
);

interface BookingCardProps {
  appt: Appointment;
  index: number;
  onCancel: (appt: Appointment) => void;
  onJoin: (id: string) => void;
}

const BookingCard = ({ appt, index, onCancel, onJoin }: BookingCardProps) => {
  const past = isAppointmentPast(appt.appointment_date, appt.time_slot);
  const effectiveKey = past && appt.status === "confirmed" ? "passed" : appt.status;
  const cfg = statusConfig[effectiveKey] || statusConfig.confirmed;
  const Icon = cfg.icon;
  const canJoin =
    appt.status === "confirmed" &&
    appt.consultation_type === "video" &&
    canJoinVideoCall(appt.appointment_date, appt.time_slot);
  const canCancel = appt.status === "confirmed" && !past;

  return (
    <motion.div
      className="glass-panel p-5 rounded-xl border border-border"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground">{appt.doctor_name}</h3>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {appt.appointment_date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {appt.time_slot}
            </span>
            <span className="capitalize px-2 py-0.5 rounded-full bg-muted text-xs">
              {appt.consultation_type}
            </span>
          </div>
          {appt.reason && (
            <p className="text-xs text-muted-foreground mt-2 truncate">Reason: {appt.reason}</p>
          )}
          <div className="mt-2 text-xs font-mono text-muted-foreground">
            Ref: <span className="text-primary">{appt.booking_ref}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`flex items-center gap-1 text-sm font-medium ${cfg.color}`}>
            <Icon className="w-4 h-4" />
            {cfg.label}
          </span>
          {(canJoin || canCancel) && (
            <div className="flex flex-col items-end gap-1.5">
              {canJoin && (
                <button
                  onClick={() => onJoin(appt.id)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                >
                  <Video className="w-3.5 h-3.5" /> Join Call
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => onCancel(appt)}
                  className="text-xs text-destructive hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MyBookings;
