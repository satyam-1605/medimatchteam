import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

interface SpecialistCardProps {
  icon: LucideIcon;
  specialty: string;
  matchPercentage: number;
  description: string;
  isMain?: boolean;
  index?: number;
}

const SpecialistCard = ({
  icon: Icon,
  specialty,
  matchPercentage,
  description,
  isMain = false,
  index = 0,
}: SpecialistCardProps) => {
  return (
    <motion.div
      className={`${
        isMain ? "glass-panel p-8" : "glass-panel p-6"
      } relative overflow-hidden group`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2, duration: 0.5 }}
      whileHover={{ scale: isMain ? 1.01 : 1.02 }}
    >
      {/* Particle effect for main card */}
      {isMain && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0, 0.8, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      )}

      <div className="relative z-10 flex items-start gap-4">
        {/* Icon with SVG draw animation */}
        <motion.div
          className={`${
            isMain ? "w-20 h-20" : "w-14 h-14"
          } rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
        >
          <Icon
            className={`${isMain ? "w-10 h-10" : "w-7 h-7"} text-primary`}
            style={{
              filter: "drop-shadow(0 0 10px hsl(180, 100%, 50%, 0.5))",
            }}
          />
        </motion.div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3
              className={`${
                isMain ? "text-2xl" : "text-lg"
              } font-bold text-foreground`}
            >
              {specialty}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Match:</span>
              <span
                className={`${
                  isMain ? "text-2xl" : "text-lg"
                } font-display font-bold text-primary text-glow`}
              >
                <AnimatedCounter end={matchPercentage} suffix="%" duration={1} />
              </span>
            </div>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>

          {/* Match bar */}
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: "linear-gradient(90deg, hsl(180, 100%, 50%), hsl(185, 100%, 60%))",
                boxShadow: "0 0 10px hsl(180, 100%, 50%, 0.5)",
              }}
              initial={{ width: 0 }}
              animate={{ width: `${matchPercentage}%` }}
              transition={{ delay: index * 0.2 + 0.5, duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none box-glow" />
    </motion.div>
  );
};

export default SpecialistCard;
