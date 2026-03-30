import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import DoctorStats from "@/components/doctor/DoctorStats";
import DoctorAppointmentCard from "@/components/doctor/DoctorAppointmentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Stethoscope } from "lucide-react";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has doctor role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const isDoctor = roles?.some((r: any) => r.role === "doctor");
    if (!isDoctor) {
      navigate("/dashboard");
      return;
    }

    // Get doctor profile
    const { data: profile } = await supabase
      .from("doctor_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (!profile) {
      navigate("/dashboard");
      return;
    }

    setDoctorName(profile.full_name);
    await loadAppointments();
  };

  const loadAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load appointments", variant: "destructive" });
    } else {
      // Fetch patient names from profiles
      const userIds = [...new Set((data || []).map((a: any) => a.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name");

      // Note: RLS may limit which profiles we can read. Use what we get.
      const profileMap = new Map((profiles || []).map((p: any) => [p.id, p.full_name]));
      
      const enriched = (data || []).map((a: any) => ({
        ...a,
        patient_name: profileMap.get(a.user_id) || "Patient",
      }));

      setAppointments(enriched);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Appointment marked as ${status}` });
      await loadAppointments();
    }
    setUpdating(false);
  };

  const filtered = statusFilter === "all"
    ? appointments
    : appointments.filter((a) => a.status === statusFilter);

  const today = new Date(new Date().toDateString());
  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => new Date(a.appointment_date) >= today && a.status === "confirmed").length,
    completed: appointments.filter((a) => a.status === "completed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Doctor Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome, Dr. {doctorName}</p>
            </div>
          </div>

          <DoctorStats {...stats} />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Appointments</h2>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-12">Loading appointments...</p>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No appointments found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((apt) => (
                <DoctorAppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onUpdateStatus={handleUpdateStatus}
                  loading={updating}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
