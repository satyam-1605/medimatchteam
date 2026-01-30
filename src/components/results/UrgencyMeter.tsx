import { motion } from "framer-motion";

interface UrgencyMeterProps {
  level: "low" | "moderate" | "high" | "critical";
  percentage: number;
}

const urgencyConfig = {
  low: {
    color: "hsl(142, 76%, 45%)",
    label: "Low Priority",
    description: "Non-urgent consultation recommended",
  },
  moderate: {
    color: "hsl(38, 92%, 50%)",
    label: "Moderate",
    description: "Schedule appointment soon",
  },
  high: {
    color: "hsl(25, 95%, 53%)",
    label: "High Priority",
    description: "Same-day consultation advised",
  },
  critical: {
    color: "hsl(0, 84%, 60%)",
    label: "Critical",
    description: "Seek immediate medical attention",
  },
};

const UrgencyMeter = ({ level, percentage }: UrgencyMeterProps) => {
  const config = urgencyConfig[level];
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="hsl(220, 40%, 15%)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={config.color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              filter: `drop-shadow(0 0 8px ${config.color})`,
            }}
          />
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-display font-bold"
            style={{ color: config.color }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {percentage}%
          </motion.span>
        </div>
      </div>
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <motion.span
          className="text-lg font-bold block"
          style={{ color: config.color }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          {config.label}
        </motion.span>
        <span className="text-sm text-muted-foreground">{config.description}</span>
      </motion.div>
    </div>
  );
};

export default UrgencyMeter;
