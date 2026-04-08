import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Check, X, Clock, UserCheck, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface Registration {
  id: string;
  user_id: string;
  full_name: string;
  specialty: string;
  license_number: string;
  status: string;
  invite_code: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isAdmin = roles?.some((r: any) => r.role === "admin");
      if (!isAdmin) { navigate("/"); return; }

      fetchRegistrations();
    };
    checkAdmin();
  }, [navigate]);

  const fetchRegistrations = async () => {
    const { data, error } = await supabase
      .from("doctor_registrations")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setRegistrations(data);
    setLoading(false);
  };

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase.rpc("approve_doctor_registration", {
      _registration_id: id,
    });

    if (error) {
      toast({ title: "Approval failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Doctor approved!", description: "The doctor now has access to their dashboard." });
      fetchRegistrations();
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase
      .from("doctor_registrations")
      .update({ status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({ title: "Rejection failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Registration rejected" });
      fetchRegistrations();
    }
    setActionLoading(null);
  };

  const pending = registrations.filter((r) => r.status === "pending");
  const approved = registrations.filter((r) => r.status === "approved");
  const rejected = registrations.filter((r) => r.status === "rejected");

  const statusBadge = (status: string) => {
    const variants: Record<string, { className: string; icon: React.ReactNode }> = {
      pending: { className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30", icon: <Clock className="w-3 h-3" /> },
      approved: { className: "bg-green-500/20 text-green-400 border-green-500/30", icon: <UserCheck className="w-3 h-3" /> },
      rejected: { className: "bg-red-500/20 text-red-400 border-red-500/30", icon: <UserX className="w-3 h-3" /> },
    };
    const v = variants[status] || variants.pending;
    return (
      <Badge variant="outline" className={`${v.className} flex items-center gap-1`}>
        {v.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const RegistrationCard = ({ reg }: { reg: Registration }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{reg.full_name}</h3>
          <p className="text-sm text-muted-foreground">{reg.specialty}</p>
        </div>
        {statusBadge(reg.status)}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <p>License: {reg.license_number}</p>
        {reg.invite_code && <p>Used invite code</p>}
        <p>Applied: {new Date(reg.created_at).toLocaleDateString()}</p>
      </div>
      {reg.status === "pending" && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleApprove(reg.id)}
            disabled={actionLoading === reg.id}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <Check className="w-4 h-4" /> Approve
          </button>
          <button
            onClick={() => handleReject(reg.id)}
            disabled={actionLoading === reg.id}
            className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm font-medium disabled:opacity-50"
          >
            <X className="w-4 h-4" /> Reject
          </button>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />
      <div className="relative z-10 pt-24 px-4 max-w-4xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Pending", count: pending.length, color: "text-yellow-400" },
            { label: "Approved", count: approved.length, color: "text-green-400" },
            { label: "Rejected", count: rejected.length, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="p-4 rounded-xl border border-border bg-card/50 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pending">
              Pending {pending.length > 0 && `(${pending.length})`}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          {(["pending", "approved", "rejected"] as const).map((status) => {
            const list = status === "pending" ? pending : status === "approved" ? approved : rejected;
            return (
              <TabsContent key={status} value={status}>
                {loading ? (
                  <p className="text-center text-muted-foreground py-8">Loading...</p>
                ) : list.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No {status} registrations</p>
                ) : (
                  <div className="space-y-4">
                    {list.map((reg) => (
                      <RegistrationCard key={reg.id} reg={reg} />
                    ))}
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
