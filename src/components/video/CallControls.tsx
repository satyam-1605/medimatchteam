import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CallControlsProps {
  isMuted: boolean;
  isCameraOff: boolean;
  onToggleMute: () => void;
  onToggleCamera: () => void;
  onEndCall: () => void;
}

const CallControls = ({ isMuted, isCameraOff, onToggleMute, onToggleCamera, onEndCall }: CallControlsProps) => {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isMuted ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={onToggleMute}
      >
        {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </Button>
      <Button
        variant={isCameraOff ? "destructive" : "secondary"}
        size="icon"
        className="rounded-full w-12 h-12"
        onClick={onToggleCamera}
      >
        {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
      </Button>
      <Button
        variant="destructive"
        size="icon"
        className="rounded-full w-14 h-14"
        onClick={onEndCall}
      >
        <PhoneOff className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default CallControls;
