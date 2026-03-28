import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PhoneOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useWebRTC } from "@/hooks/useWebRTC";
import Navbar from "@/components/layout/Navbar";
import WaitingRoom from "@/components/video/WaitingRoom";
import VideoCallView from "@/components/video/VideoCallView";
import GlowButton from "@/components/ui/GlowButton";
import { Button } from "@/components/ui/button";

const VideoCall = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "patient"; // patient or doctor
  const isInitiator = role === "patient";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [appointmentInfo, setAppointmentInfo] = useState<{
    doctorName: string;
    date: string;
    timeSlot: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [inWaitingRoom, setInWaitingRoom] = useState(true);

  // Fetch appointment and create/find video session
  useEffect(() => {
    const init = async () => {
      if (!appointmentId) {
        setInitError("No appointment ID provided");
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Fetch appointment
      const { data: appt, error: apptError } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();

      if (apptError || !appt) {
        setInitError("Appointment not found");
        setLoading(false);
        return;
      }

      setAppointmentInfo({
        doctorName: appt.doctor_name,
        date: appt.appointment_date,
        timeSlot: appt.time_slot,
      });

      // Find or create video session
      const { data: existing } = await supabase
        .from("video_sessions")
        .select("id")
        .eq("appointment_id", appointmentId)
        .maybeSingle();

      if (existing) {
        setSessionId(existing.id);
      } else if (isInitiator) {
        const { data: created, error: createError } = await supabase
          .from("video_sessions")
          .insert({
            appointment_id: appointmentId,
            patient_id: session.user.id,
            doctor_id: appt.doctor_id,
            status: "waiting",
          } as any)
          .select("id")
          .single();

        if (createError) {
          // Handle duplicate — session was created between our check and insert
          if (createError.code === "23505") {
            const { data: retry } = await supabase
              .from("video_sessions")
              .select("id")
              .eq("appointment_id", appointmentId)
              .single();
            if (retry) {
              setSessionId(retry.id);
            } else {
              setInitError("Failed to find video session");
            }
          } else {
            console.error("Video session create error:", createError);
            setInitError("Failed to create video session: " + createError.message);
          }
        } else {
          setSessionId(created.id);
        }
      } else {
        setInitError("No active video session. Patient must start the call first.");
      }
      setLoading(false);
    };
    init();
  }, [appointmentId, navigate, isInitiator]);

  const webrtc = useWebRTC({
    sessionId: sessionId || "",
    isInitiator,
  });

  const handleJoinCall = () => {
    setInWaitingRoom(false);
    webrtc.startCall();
  };

  const handleEndCall = async () => {
    await webrtc.endCall();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (initError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <p className="text-destructive font-medium">{initError}</p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (webrtc.callStatus === "ended") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <PhoneOff className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Call Ended</h2>
          <p className="text-sm text-muted-foreground">
            Your consultation with {appointmentInfo?.doctorName} has ended.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => navigate("/my-bookings")}>My Bookings</Button>
            <GlowButton onClick={() => navigate("/doctors")}>Find Doctors</GlowButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {inWaitingRoom && <Navbar />}
      <div className={`flex-1 flex items-center justify-center ${inWaitingRoom ? "pt-20 pb-8 px-4" : "p-2"}`}>
        <motion.div
          className={inWaitingRoom ? "w-full max-w-md" : "w-full h-[calc(100vh-1rem)]"}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {inWaitingRoom ? (
            <WaitingRoom
              doctorName={appointmentInfo?.doctorName || "Doctor"}
              appointmentDate={appointmentInfo?.date || ""}
              timeSlot={appointmentInfo?.timeSlot || ""}
              onJoinCall={handleJoinCall}
              error={webrtc.error}
            />
          ) : (
            <VideoCallView
              localStream={webrtc.localStream}
              remoteStream={webrtc.remoteStream}
              callStatus={webrtc.callStatus}
              isMuted={webrtc.isMuted}
              isCameraOff={webrtc.isCameraOff}
              doctorName={appointmentInfo?.doctorName || "Doctor"}
              onToggleMute={webrtc.toggleMute}
              onToggleCamera={webrtc.toggleCamera}
              onEndCall={handleEndCall}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default VideoCall;
