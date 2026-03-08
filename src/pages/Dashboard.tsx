import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
  Download,
  Bell,
  Settings,
  Lock,
  Stethoscope,
  MapPin,
  Shield,
  LogIn,
  UserPlus,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import AnimatedCounter from "@/components/ui/AnimatedCounter";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

const healthData = [
  { date: "Jan", value: 72, bp: 120 },
  { date: "Feb", value: 75, bp: 118 },
  { date: "Mar", value: 71, bp: 122 },
  { date: "Apr", value: 78, bp: 119 },
  { date: "May", value: 82, bp: 121 },
  { date: "Jun", value: 79, bp: 117 },
];

const weeklySymptoms = [
  { day: "Mon", count: 2 },
  { day: "Tue", count: 4 },
  { day: "Wed", count: 3 },
  { day: "Thu", count: 5 },
  { day: "Fri", count: 2 },
  { day: "Sat", count: 1 },
  { day: "Sun", count: 0 },
];

const healthTimeline = [
  {
    id: 1,
    date: "Jan 15, 2024",
    titleKey: "Annual Checkup",
    type: "appointment",
    description: "Routine health examination completed",
    doctor: "Dr. Sarah Chen",
  },
  {
    id: 2,
    date: "Feb 3, 2024",
    titleKey: "Blood Work Results",
    type: "report",
    description: "All markers within normal range",
    doctor: "Lab Services",
  },
  {
    id: 3,
    date: "Mar 10, 2024",
    titleKey: "Symptom Report",
    type: "symptom",
    description: "Headache and fatigue - referred to neurologist",
    doctor: "AI Analysis",
  },
  {
    id: 4,
    date: "Mar 20, 2024",
    titleKey: "Neurologist Consultation",
    type: "appointment",
    description: "MRI scheduled, medication prescribed",
    doctor: "Dr. Emily Thompson",
  },
];

/* ───────── Unauthenticated Prompt ───────── */
const LoginPrompt = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const features = [
    { icon: Activity, label: "Symptom analysis history", color: "text-primary", bg: "bg-primary/10" },
    { icon: Calendar, label: "Upcoming appointments", color: "text-success", bg: "bg-success/10" },
    { icon: Stethoscope, label: "Doctor recommendations", color: "text-accent-foreground", bg: "bg-accent/10" },
    { icon: Shield, label: "Government scheme eligibility", color: "text-warning", bg: "bg-warning/10" },
    { icon: TrendingUp, label: "Health activity timeline", color: "text-primary", bg: "bg-primary/10" },
    { icon: MapPin, label: "Nearby recommended doctors", color: "text-success", bg: "bg-success/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />

      <main className="pt-24 pb-12 px-4 relative z-10">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Lock className="w-10 h-10 text-primary" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">
              <span className="headline-gradient">{t('dashboard.title')}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Please log in to access your personalized health dashboard.
            </p>
          </motion.div>

          {/* Feature list */}
          <motion.div
            className="rounded-2xl bg-card border border-border p-6 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h3 className="text-sm font-medium text-muted-foreground mb-4 uppercase tracking-wider">
              What you'll get access to
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((feat, i) => (
                <motion.div
                  key={feat.label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.06 }}
                >
                  <div className={`w-10 h-10 rounded-lg ${feat.bg} flex items-center justify-center flex-shrink-0`}>
                    <feat.icon className={`w-5 h-5 ${feat.color}`} />
                  </div>
                  <span className="text-sm text-foreground font-medium">{feat.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={() => navigate("/auth")}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <LogIn className="w-5 h-5" />
              Sign In
            </motion.button>
            <motion.button
              onClick={() => navigate("/auth")}
              className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-card border border-border text-foreground font-semibold text-base hover:border-primary/50 transition-all"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <UserPlus className="w-5 h-5 text-primary" />
              Create Account
            </motion.button>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

/* ───────── Main Dashboard (authenticated) ───────── */
const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const symptomCategories = [
    { name: t('dashboard.categories.neurological'), value: 35, color: "hsl(180, 100%, 50%)" },
    { name: t('dashboard.categories.cardiovascular'), value: 25, color: "hsl(220, 100%, 60%)" },
    { name: t('dashboard.categories.respiratory'), value: 20, color: "hsl(142, 76%, 45%)" },
    { name: t('dashboard.categories.other'), value: 20, color: "hsl(38, 92%, 50%)" },
  ];

  const stats = [
    {
      label: t('dashboard.healthScore'),
      value: 85,
      suffix: "",
      icon: Heart,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: t('dashboard.analyses'),
      value: 12,
      suffix: "",
      icon: Activity,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: t('dashboard.appointments'),
      value: 4,
      suffix: "",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: t('dashboard.reports'),
      value: 8,
      suffix: "",
      icon: FileText,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
  ];

  // Loading state
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

  // Not authenticated → show login prompt
  if (!user) {
    return <LoginPrompt />;
  }

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                <span className="headline-gradient">Welcome back, {displayName}</span>
              </h1>
              <p className="text-muted-foreground">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </button>
              <button className="p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </motion.div>

          {/* Quick Actions Bar */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <motion.button
              onClick={() => navigate("/symptoms")}
              className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Activity className="w-6 h-6 text-primary" />
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Check Symptoms</p>
                <p className="text-xs text-muted-foreground">AI-powered analysis</p>
              </div>
            </motion.button>
            <motion.button
              onClick={() => navigate("/doctors")}
              className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20 hover:bg-success/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MapPin className="w-6 h-6 text-success" />
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">Find Doctors</p>
                <p className="text-xs text-muted-foreground">Nearby specialists</p>
              </div>
            </motion.button>
            <motion.button
              onClick={() => navigate("/my-bookings")}
              className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20 hover:bg-warning/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar className="w-6 h-6 text-warning" />
              <div className="text-left">
                <p className="font-semibold text-foreground text-sm">My Bookings</p>
                <p className="text-xs text-muted-foreground">View appointments</p>
              </div>
            </motion.button>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass-panel p-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p className={`text-3xl font-display font-bold ${stat.color}`}>
                      <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Charts Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Health Trend Chart */}
              <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">
                    {t('dashboard.healthTrend')}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success">{t('dashboard.thisMonth', { percentage: 8 })}</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(220, 40%, 18%)"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(215, 20%, 55%)"
                        fontSize={12}
                      />
                      <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222, 47%, 7%)",
                          border: "1px solid hsl(220, 40%, 18%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="hsl(180, 100%, 50%)"
                        strokeWidth={3}
                        dot={{ fill: "hsl(180, 100%, 50%)", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "hsl(180, 100%, 50%)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Two smaller charts */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Symptom Categories */}
                <motion.div
                  className="glass-panel p-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {t('dashboard.symptomCategories')}
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={symptomCategories}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {symptomCategories.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 7%)",
                            border: "1px solid hsl(220, 40%, 18%)",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3 mt-2">
                    {symptomCategories.map((cat) => (
                      <div key={cat.name} className="flex items-center gap-1.5">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {cat.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Weekly Activity */}
                <motion.div
                  className="glass-panel p-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    {t('dashboard.weeklyActivity')}
                  </h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklySymptoms}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(220, 40%, 18%)"
                        />
                        <XAxis
                          dataKey="day"
                          stroke="hsl(215, 20%, 55%)"
                          fontSize={12}
                        />
                        <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(222, 47%, 7%)",
                            border: "1px solid hsl(220, 40%, 18%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="count"
                          fill="hsl(180, 100%, 50%)"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Timeline Column */}
            <motion.div
              className="glass-panel p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">
                  {t('dashboard.healthTimeline')}
                </h3>
                <button className="text-sm text-primary hover:underline">
                  {t('common.viewAll')}
                </button>
              </div>

              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                <div className="space-y-6">
                  {healthTimeline.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className="relative pl-10"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <div
                        className={`absolute left-0 w-6 h-6 rounded-full flex items-center justify-center ${
                          item.type === "appointment"
                            ? "bg-primary/20"
                            : item.type === "report"
                            ? "bg-success/20"
                            : "bg-warning/20"
                        }`}
                      >
                        {item.type === "appointment" ? (
                          <Calendar className="w-3 h-3 text-primary" />
                        ) : item.type === "report" ? (
                          <FileText className="w-3 h-3 text-success" />
                        ) : (
                          <Activity className="w-3 h-3 text-warning" />
                        )}
                      </div>

                      <div className="bg-muted/30 rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                          <Clock className="w-3 h-3" />
                          {item.date}
                        </div>
                        <h4 className="font-medium text-foreground">
                          {item.titleKey}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                        <p className="text-xs text-primary mt-2">
                          {item.doctor}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-medium text-muted-foreground mb-4">
                  {t('dashboard.quickActions')}
                </h4>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate("/symptoms")}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-medium">{t('dashboard.newAnalysis')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.exportData')}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;