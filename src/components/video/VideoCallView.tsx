import { useEffect, useRef } from "react";
import type { CallStatus } from "@/hooks/useWebRTC";
import CallControls from "./CallControls";
import CallTimer from "./CallTimer";
import ConnectionStatus from "./ConnectionStatus";

interface VideoCallViewProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callStatus: CallStatus;
  isMuted: boolean;
  isCameraOff: boolean;
  doctorName: string;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

const VideoCallView = ({
  localStream,
  remoteStream,
  callStatus,
  isMuted,
  isCameraOff,
  doctorName,
  onToggleMute,
  onToggleCamera,
  onEndCall,
}: VideoCallViewProps) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const hasRemote = callStatus === "connected" && remoteStream && remoteStream.getTracks().length > 0;

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col">
      {/* Remote video (full area) */}
      <div className="flex-1 relative bg-muted rounded-2xl overflow-hidden">
        {hasRemote ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">{doctorName.charAt(0)}</span>
            </div>
            <ConnectionStatus status={callStatus} />
          </div>
        )}

        {/* Local video PiP */}
        <div className="absolute bottom-4 right-4 w-36 h-28 sm:w-48 sm:h-36 rounded-xl overflow-hidden border-2 border-border shadow-lg bg-card">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              Camera off
            </div>
          )}
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border">
            <span className="text-sm font-medium text-foreground">{doctorName}</span>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-border">
            <CallTimer isRunning={callStatus === "connected"} />
          </div>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="flex items-center justify-center py-4">
        <CallControls
          isMuted={isMuted}
          isCameraOff={isCameraOff}
          onToggleMute={onToggleMute}
          onToggleCamera={onToggleCamera}
          onEndCall={onEndCall}
        />
      </div>
    </div>
  );
};

export default VideoCallView;
