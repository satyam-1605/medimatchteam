import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Heart,
  Shield,
  Bell,
  Lock,
  LogOut,
  Save,
  Pencil,
  X,
  Loader2,
  LogIn,
  UserPlus,
  Droplets,
  AlertTriangle,
  Activity,
  PhoneCall,
  Globe,
  ChevronRight,
  ExternalLink,
  Check,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { supabase } from "@/integrations/supabase/client";
import { languages } from "@/i18n/config";
import { STATE_SCHEMES } from "@/data/governmentSchemes";
import type { User as SupaUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import i18n from "@/i18n/config";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh",
];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

interface ProfileData {
  full_name: string;
  phone: string;
  age: number | null;
  gender: string;
  state: string;
  blood_group: string;
  allergies: string;
  medical_conditions: string;
  emergency_contact: string;
  notification_preferences: { email: boolean; sms: boolean; push: boolean };
}

const defaultProfile: ProfileData = {
  full_name: "",
  phone: "",
  age: null,
  gender: "",
  state: "",
  blood_group: "",
  allergies: "",
  medical_conditions: "",
  emergency_contact: "",
  notification_preferences: { email: true, sms: false, push: true },
};

/* ───── Login Prompt ───── */
const LoginPrompt = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />
      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-lg text-center">
          <motion.div
            className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}
          >
            <Lock className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold mb-3">
            <span className="headline-gradient">My Profile</span>
          </h1>
          <p className="text-muted-foreground mb-8">Please log in to view and manage your profile.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button onClick={() => navigate("/auth")} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <LogIn className="w-5 h-5" /> Sign In
            </motion.button>
            <motion.button onClick={() => navigate("/auth")} className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <UserPlus className="w-5 h-5 text-primary" /> Create Account
            </motion.button>
          </div>
        </div>
      </main>
    </div>
  );
};

/* ───── Section Wrapper ───── */
const Section = ({ title, icon: Icon, children, delay = 0 }: { title: string; icon: React.ElementType; children: React.ReactNode; delay?: number }) => (
  <motion.div
    className="glass-panel p-6"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-5">
      <Icon className="w-5 h-5 text-primary" />
      {title}
    </h3>
    {children}
  </motion.div>
);

/* ───── Field Display ───── */
const Field = ({ label, value, placeholder }: { label: string; value: string; placeholder?: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-sm text-foreground">{value || <span className="text-muted-foreground/50 italic">{placeholder || "Not set"}</span>}</p>
  </div>
);

/* ───── Main Profile Page ───── */
const Profile = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [user, setUser] = useState<SupaUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [editData, setEditData] = useState<ProfileData>(defaultProfile);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          const p: ProfileData = {
            full_name: data.full_name || "",
            phone: data.phone || "",
            age: (data as any).age || null,
            gender: (data as any).gender || "",
            state: (data as any).state || "",
            blood_group: (data as any).blood_group || "",
            allergies: (data as any).allergies || "",
            medical_conditions: (data as any).medical_conditions || "",
            emergency_contact: (data as any).emergency_contact || "",
            notification_preferences: (data as any).notification_preferences || { email: true, sms: false, push: true },
          };
          setProfile(p);
          setEditData(p);
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editData.full_name || null,
        phone: editData.phone || null,
        age: editData.age,
        gender: editData.gender || null,
        state: editData.state || null,
        blood_group: editData.blood_group || null,
        allergies: editData.allergies || null,
        medical_conditions: editData.medical_conditions || null,
        emergency_contact: editData.emergency_contact || null,
        notification_preferences: editData.notification_preferences,
      } as any)
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast({ title: "Error", description: "Failed to save profile.", variant: "destructive" });
    } else {
      setProfile(editData);
      setEditing(false);
      toast({ title: "Profile updated", description: "Your changes have been saved." });
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setChangingPassword(false);
      setNewPassword("");
      toast({ title: "Password updated", description: "Your password has been changed." });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleLanguageChange = (code: string) => {
    i18n.changeLanguage(code);
    toast({ title: "Language changed", description: `Language set to ${languages.find(l => l.code === code)?.name}` });
  };

  // Schemes for user's state
  const userSchemes = profile.state
    ? STATE_SCHEMES.filter(s => s.isNational || s.state.toLowerCase() === profile.state.toLowerCase())
    : STATE_SCHEMES.filter(s => s.isNational);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <ParticleBackground />
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) return <LoginPrompt />;

  const displayName = profile.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />

      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl space-y-6">

          {/* Header */}
          <motion.div
            className="glass-panel p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-display font-bold">
                  <span className="headline-gradient">{displayName}</span>
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            {!editing ? (
              <motion.button
                onClick={() => { setEditData(profile); setEditing(true); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium hover:bg-primary/20 transition-all self-start sm:self-auto"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Pencil className="w-4 h-4" /> Edit Profile
              </motion.button>
            ) : (
              <div className="flex gap-2 self-start sm:self-auto">
                <motion.button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </motion.button>
                <motion.button
                  onClick={() => { setEditing(false); setEditData(profile); }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 transition-all"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <X className="w-4 h-4" /> Cancel
                </motion.button>
              </div>
            )}
          </motion.div>

          {/* Personal Info */}
          <Section title="Personal Information" icon={User} delay={0.05}>
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                  <input value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                  <input value={user.email || ""} disabled className="w-full px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-muted-foreground text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Phone Number</label>
                  <input value={editData.phone} onChange={e => setEditData({ ...editData, phone: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                  <input type="number" min={1} max={120} value={editData.age ?? ""} onChange={e => setEditData({ ...editData, age: e.target.value ? parseInt(e.target.value) : null })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Age" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                  <select value={editData.gender} onChange={e => setEditData({ ...editData, gender: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select gender</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">State / Location</label>
                  <select value={editData.state} onChange={e => setEditData({ ...editData, state: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Full Name" value={profile.full_name} />
                <Field label="Email" value={user.email || ""} />
                <Field label="Phone" value={profile.phone} />
                <Field label="Age" value={profile.age ? String(profile.age) : ""} />
                <Field label="Gender" value={profile.gender} />
                <Field label="State / Location" value={profile.state} />
              </div>
            )}
          </Section>

          {/* Healthcare Info */}
          <Section title="Healthcare Information" icon={Heart} delay={0.1}>
            {editing ? (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Blood Group</label>
                  <select value={editData.blood_group} onChange={e => setEditData({ ...editData, blood_group: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="">Select blood group</option>
                    {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Emergency Contact</label>
                  <input value={editData.emergency_contact} onChange={e => setEditData({ ...editData, emergency_contact: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="Emergency contact number" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Known Allergies</label>
                  <textarea value={editData.allergies} onChange={e => setEditData({ ...editData, allergies: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="e.g. Penicillin, Peanuts..." />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-muted-foreground mb-1 block">Existing Medical Conditions</label>
                  <textarea value={editData.medical_conditions} onChange={e => setEditData({ ...editData, medical_conditions: e.target.value })} rows={2} className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" placeholder="e.g. Diabetes, Hypertension..." />
                </div>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <Droplets className="w-5 h-5 text-destructive flex-shrink-0" />
                  <Field label="Blood Group" value={profile.blood_group} />
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30">
                  <PhoneCall className="w-5 h-5 text-warning flex-shrink-0" />
                  <Field label="Emergency Contact" value={profile.emergency_contact} />
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 sm:col-span-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <Field label="Known Allergies" value={profile.allergies} placeholder="No allergies recorded" />
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/30 sm:col-span-2">
                  <Activity className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <Field label="Medical Conditions" value={profile.medical_conditions} placeholder="No conditions recorded" />
                </div>
              </div>
            )}
          </Section>

          {/* Government Schemes */}
          <Section title="Government Scheme Eligibility" icon={Shield} delay={0.15}>
            {!profile.state && !editing ? (
              <div className="text-center py-6">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">Set your state in profile to see eligible schemes.</p>
                <button onClick={() => { setEditData(profile); setEditing(true); }} className="text-sm text-primary hover:underline">Edit Profile</button>
              </div>
            ) : (
              <div className="space-y-3">
                {userSchemes.slice(0, 5).map((scheme, i) => (
                  <motion.div
                    key={scheme.id}
                    className="p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{scheme.shortName}</span>
                          {scheme.isNational && <span className="text-xs px-2 py-0.5 rounded-full bg-success/10 text-success font-medium">National</span>}
                        </div>
                        <p className="text-sm font-medium text-foreground">{scheme.name}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{scheme.description}</p>
                        <p className="text-xs text-success mt-1">Coverage: {scheme.coverage}</p>
                      </div>
                      {scheme.officialUrl && (
                        <a href={scheme.officialUrl} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors">
                          <ExternalLink className="w-4 h-4 text-muted-foreground" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
                {userSchemes.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">+{userSchemes.length - 5} more schemes available</p>
                )}
              </div>
            )}
          </Section>

          {/* Language Preferences */}
          <Section title="Language Preferences" icon={Globe} delay={0.2}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                    i18n.language === lang.code
                      ? "bg-primary/10 border-primary/50 text-primary"
                      : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground">{lang.name}</p>
                    </div>
                    {i18n.language === lang.code && <Check className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              ))}
            </div>
          </Section>

          {/* Account Settings */}
          <Section title="Account Settings" icon={Lock} delay={0.25}>
            <div className="space-y-3">
              {/* Change Password */}
              {!changingPassword ? (
                <button
                  onClick={() => setChangingPassword(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-muted/30 space-y-3">
                  <label className="text-xs text-muted-foreground block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter new password (min 6 chars)"
                  />
                  <div className="flex gap-2">
                    <button onClick={handlePasswordChange} disabled={passwordLoading} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                      {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update
                    </button>
                    <button onClick={() => { setChangingPassword(false); setNewPassword(""); }} className="px-4 py-2 rounded-lg bg-muted text-muted-foreground text-sm hover:bg-muted/80">Cancel</button>
                  </div>
                </div>
              )}

              {/* Notification Preferences */}
              <div className="p-4 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground font-medium">Notification Preferences</span>
                </div>
                <div className="space-y-3">
                  {(["email", "sms", "push"] as const).map(key => (
                    <label key={key} className="flex items-center justify-between cursor-pointer">
                      <span className="text-sm text-muted-foreground capitalize">{key} Notifications</span>
                      <button
                        onClick={() => {
                          const updated = { ...editData.notification_preferences, [key]: !editData.notification_preferences[key] };
                          setEditData({ ...editData, notification_preferences: updated });
                          if (!editing) {
                            // Save immediately
                            const newProfile = { ...profile, notification_preferences: updated };
                            setProfile(newProfile);
                            supabase.from("profiles").update({ notification_preferences: updated } as any).eq("id", user.id);
                          }
                        }}
                        className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${
                          (editing ? editData : profile).notification_preferences[key] ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${(editing ? editData : profile).notification_preferences[key] ? "translate-x-4" : "translate-x-0"}`} />
                      </button>
                    </label>
                  ))}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
