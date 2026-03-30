import { Calendar, Clock, User, Video, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Appointment {
  id: string;
  appointment_date: string;
  time_slot: string;
  doctor_name: string;
  consultation_type: string | null;
  status: string | null;
  reason: string | null;
  booking_ref: string;
  patient_name?: string;
}

interface DoctorAppointmentCardProps {
  appointment: Appointment;
  onUpdateStatus: (id: string, status: string) => void;
  loading?: boolean;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-primary/20 text-primary border-primary/30",
  completed: "bg-[hsl(var(--success))]/20 text-[hsl(var(--success))] border-[hsl(var(--success))]/30",
  cancelled: "bg-destructive/20 text-destructive border-destructive/30",
};

const DoctorAppointmentCard = ({ appointment, onUpdateStatus, loading }: DoctorAppointmentCardProps) => {
  const isUpcoming = new Date(appointment.appointment_date) >= new Date(new Date().toDateString());
  const canAct = appointment.status === "confirmed" && isUpcoming;

  return (
    <div className="glass-panel rounded-xl p-5 border border-border/50 space-y-3">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">
              {appointment.patient_name || "Patient"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Ref: {appointment.booking_ref}</p>
        </div>
        <Badge className={statusColors[appointment.status || "confirmed"] || "bg-muted text-muted-foreground"}>
          {appointment.status || "confirmed"}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {appointment.time_slot}
        </span>
        <span className="flex items-center gap-1.5">
          {appointment.consultation_type === "video" ? (
            <Video className="w-3.5 h-3.5" />
          ) : (
            <MapPin className="w-3.5 h-3.5" />
          )}
          {appointment.consultation_type || "in-person"}
        </span>
      </div>

      {appointment.reason && (
        <p className="text-sm text-muted-foreground border-t border-border/30 pt-2">
          <span className="font-medium text-foreground">Reason:</span> {appointment.reason}
        </p>
      )}

      {canAct && (
        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="border-[hsl(var(--success))]/50 text-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/10"
            disabled={loading}
            onClick={() => onUpdateStatus(appointment.id, "completed")}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            disabled={loading}
            onClick={() => onUpdateStatus(appointment.id, "cancelled")}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
          </Button>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointmentCard;
