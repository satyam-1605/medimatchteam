import { useState } from "react";
import { Mail, Lock, User, Stethoscope, FileText, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import GlowButton from "@/components/ui/GlowButton";
import { useToast } from "@/hooks/use-toast";

const SPECIALTIES = [
  "General Practice", "Cardiology", "Dermatology", "Endocrinology",
  "Gastroenterology", "Neurology", "Oncology", "Orthopedics",
  "Pediatrics", "Psychiatry", "Pulmonology", "Radiology", "Surgery",
];

const DoctorRegistrationForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [mode, setMode] = useState<"code" | "request">("code");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, sign up the user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });

      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Failed to create account");

      if (mode === "code") {
        // Use invite code for instant approval
        const { error: rpcError } = await supabase.rpc("register_doctor_with_code", {
          _user_id: signUpData.user.id,
          _full_name: fullName,
          _specialty: specialty,
          _license_number: licenseNumber,
          _invite_code: inviteCode,
        });

        if (rpcError) {
          // If code is invalid, still keep the account but show error
          if (rpcError.message.includes("Invalid invite code")) {
            toast({
              title: "Invalid invite code",
              description: "Your account was created but doctor access was not granted. You can request admin approval instead.",
              variant: "destructive",
            });
          } else {
            throw rpcError;
          }
        } else {
          toast({
            title: "Doctor account created!",
            description: "Please verify your email, then sign in to access your doctor dashboard.",
          });
        }
      } else {
        // Submit registration request for admin approval via RPC (bypasses RLS when session isn't established)
        const { error: rpcError } = await supabase.rpc("submit_doctor_registration", {
          _user_id: signUpData.user.id,
          _full_name: fullName,
          _specialty: specialty,
          _license_number: licenseNumber,
        });

        if (rpcError) throw rpcError;

        toast({
          title: "Registration submitted!",
          description: "Please verify your email. Your doctor access request is pending admin approval.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 rounded-lg bg-muted">
        <button
          type="button"
          onClick={() => setMode("code")}
          className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
            mode === "code"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Have Invite Code
        </button>
        <button
          type="button"
          onClick={() => setMode("request")}
          className={`flex-1 text-sm py-1.5 rounded-md transition-colors ${
            mode === "request"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Request Access
        </button>
      </div>

      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="pl-10" />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-10" />
      </div>

      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="password" placeholder="Password (min 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="pl-10" />
      </div>

      <div className="relative">
        <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <Select value={specialty} onValueChange={setSpecialty} required>
          <SelectTrigger className="pl-10">
            <SelectValue placeholder="Select Specialty" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input type="text" placeholder="Medical License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required className="pl-10" />
      </div>

      {mode === "code" && (
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="text" placeholder="Invite Code" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} required className="pl-10" />
        </div>
      )}

      {mode === "request" && (
        <p className="text-xs text-muted-foreground text-center">
          Your registration will be reviewed by an admin. You'll get doctor access once approved.
        </p>
      )}

      <button type="submit" className="w-full">
        <GlowButton className="w-full pointer-events-none" disabled={loading || !specialty}>
          {loading
            ? "Registering..."
            : mode === "code"
            ? "Register with Code"
            : "Submit for Approval"}
        </GlowButton>
      </button>
    </form>
  );
};

export default DoctorRegistrationForm;
