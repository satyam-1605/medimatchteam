import type { CallStatus } from "@/hooks/useWebRTC";
import { Wifi, WifiOff, Loader2 } from "lucide-react";

interface ConnectionStatusProps {
  status: CallStatus;
}

const statusMap: Record<CallStatus, { label: string; color: string; icon: "wifi" | "off" | "loading" }> = {
  idle: { label: "Ready", color: "text-muted-foreground", icon: "wifi" },
  waiting: { label: "Waiting for doctor...", color: "text-warning", icon: "loading" },
  connecting: { label: "Connecting...", color: "text-warning", icon: "loading" },
  connected: { label: "Connected", color: "text-success", icon: "wifi" },
  reconnecting: { label: "Reconnecting...", color: "text-warning", icon: "loading" },
  ended: { label: "Call Ended", color: "text-muted-foreground", icon: "off" },
  failed: { label: "Connection Failed", color: "text-destructive", icon: "off" },
};

const ConnectionStatus = ({ status }: ConnectionStatusProps) => {
  const cfg = statusMap[status];
  const Icon = cfg.icon === "loading" ? Loader2 : cfg.icon === "off" ? WifiOff : Wifi;

  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium ${cfg.color}`}>
      <Icon className={`w-4 h-4 ${cfg.icon === "loading" ? "animate-spin" : ""}`} />
      <span>{cfg.label}</span>
    </div>
  );
};

export default ConnectionStatus;
