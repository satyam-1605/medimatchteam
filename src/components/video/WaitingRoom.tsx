import { useEffect, useRef, useState } from "react";
import { Video, Mic, MicOff, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlowButton from "@/components/ui/GlowButton";

interface WaitingRoomProps {
  doctorName: string;
  appointmentDate: string;
  timeSlot: string;
  onJoinCall: () => void;
  error?: string | null;
}

const WaitingRoom = ({ doctorName, appointmentDate, timeSlot, onJoinCall, error }: WaitingRoomProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [mediaError, setMediaError] = useState<string | null>(null);

  useEffect(() => {
    let s: MediaStream | null = null;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((media) => {
        s = media;
        setStream(media);
        if (videoRef.current) videoRef.current.srcObject = media;
      })
      .catch(() => setMediaError("Unable to access camera/microphone"));
    return () => {
      s?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const toggleMic = () => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    setMicOn((p) => !p);
  };

  const toggleCam = () => {
    stream?.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    setCamOn((p) => !p);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto">
      {/* Camera preview */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-muted border border-border">
        {mediaError ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            {mediaError}
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        )}
        {/* Controls overlay */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          <Button variant={micOn ? "secondary" : "destructive"} size="icon" className="rounded-full" onClick={toggleMic}>
            {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </Button>
          <Button variant={camOn ? "secondary" : "destructive"} size="icon" className="rounded-full" onClick={toggleCam}>
            {camOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Appointment info */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Video Consultation</h2>
        <p className="text-sm text-muted-foreground">with <span className="text-primary font-medium">{doctorName}</span></p>
        <p className="text-xs text-muted-foreground">{appointmentDate} • {timeSlot}</p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <GlowButton onClick={onJoinCall} disabled={!!mediaError} className="w-full">
        <Video className="w-4 h-4 mr-2" /> Join Call
      </GlowButton>
    </div>
  );
};

export default WaitingRoom;
