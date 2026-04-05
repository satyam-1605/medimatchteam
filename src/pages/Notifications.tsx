import { useState, useEffect } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  booking_ref: string | null;
  created_at: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel("notifications-page-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setNotifications(data as Notification[]);
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
    if (unreadIds.length === 0) return;
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = async (id: string) => {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = async () => {
    const ids = notifications.map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").delete().in("id", ids);
    setNotifications([]);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "booking_confirmed": return "✅";
      case "booking_cancelled": return "❌";
      case "booking_completed": return "🏥";
      case "reminder": return "⏰";
      default: return "🔔";
    }
  };

  const getTypeBorderColor = (type: string) => {
    switch (type) {
      case "booking_confirmed": return "border-l-green-500";
      case "booking_cancelled": return "border-l-destructive";
      case "booking_completed": return "border-l-blue-500";
      default: return "border-l-primary";
    }
  };

  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10 max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Notifications</h1>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "You're all caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllRead}
                className="text-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-xs text-destructive hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear all
              </Button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")} className="mb-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="text-xs">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-border bg-card overflow-hidden"
        >
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <div className="animate-pulse">Loading notifications...</div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-medium">
                {filter === "unread" ? "No unread notifications" : "No notifications yet"}
              </p>
              <p className="text-xs mt-1 opacity-70">
                We'll notify you when something happens
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {filteredNotifications.map((n, index) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                  className={`group relative flex items-start gap-3 px-5 py-4 border-b border-border/30 last:border-0 cursor-pointer transition-all duration-200 border-l-[3px] ${getTypeBorderColor(n.type)} ${
                    !n.read
                      ? "bg-primary/5 hover:bg-primary/10"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    if (n.booking_ref) navigate("/my-bookings");
                  }}
                >
                  {/* Type icon */}
                  <span className="text-lg mt-0.5 shrink-0">
                    {getTypeIcon(n.type)}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-sm leading-tight ${
                          !n.read
                            ? "font-semibold text-foreground"
                            : "font-medium text-muted-foreground"
                        }`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {n.message}
                    </p>
                    {n.booking_ref && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        Ref: {n.booking_ref}
                      </span>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!n.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(n.id);
                        }}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(n.id);
                      }}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;
