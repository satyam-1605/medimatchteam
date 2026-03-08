import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, Menu, X, LogIn, LogOut, CalendarCheck, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import GlowButton from "@/components/ui/GlowButton";
import LanguageSelector from "@/components/ui/LanguageSelector";
import NotificationBell from "@/components/ui/NotificationBell";
import type { Session } from "@supabase/supabase-js";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: t("nav.home") },
    { path: "/symptoms", label: t("nav.symptoms") },
    { path: "/results", label: t("nav.results") },
    { path: "/doctors", label: t("nav.doctors") },
    { path: "/dashboard", label: t("nav.dashboard") },
    ...(session ? [{ path: "/my-bookings", label: t("common.myBookings") }] : []),
  ];

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-[9999] glass-panel border-b border-border/50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div className="relative" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Activity className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 bg-primary/30 blur-lg" />
            </motion.div>
            <span className="font-display font-bold text-xl text-foreground">
              Medi<span className="text-primary">Match</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} className={`nav-link ${location.pathname === link.path ? "active" : ""}`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector variant="compact" />
            {session ? (
              <>
                <NotificationBell />
                <Link to="/my-bookings">
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <CalendarCheck className="w-4 h-4" />
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  {t("common.logout")}
                </button>
              </>
            ) : (
              <Link to="/auth">
                <GlowButton size="sm">
                  <LogIn className="w-4 h-4 mr-1.5" />
                  {t("common.login")}
                </GlowButton>
              </Link>
            )}
          </div>

          <button className="md:hidden text-foreground p-2" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <motion.div className="md:hidden overflow-hidden" initial={{ height: 0 }} animate={{ height: isOpen ? "auto" : 0 }} transition={{ duration: 0.3 }}>
          <div className="py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-2 rounded-lg transition-colors ${
                  location.pathname === link.path ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <LanguageSelector variant="dropdown" />
              {session ? (
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
                  <LogOut className="w-4 h-4" /> {t("common.logout")}
                </button>
              ) : (
                <Link to="/auth" onClick={() => setIsOpen(false)}>
                  <GlowButton size="sm" className="w-full">
                    <LogIn className="w-4 h-4 mr-1.5" /> {t("common.login")}
                  </GlowButton>
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default Navbar;