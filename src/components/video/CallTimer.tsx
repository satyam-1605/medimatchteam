import { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CallTimerProps {
  isRunning: boolean;
}

const CallTimer = ({ isRunning }: CallTimerProps) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    setSeconds(0);
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-1.5 text-sm font-mono text-muted-foreground">
      <Clock className="w-3.5 h-3.5" />
      <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
    </div>
  );
};

export default CallTimer;
