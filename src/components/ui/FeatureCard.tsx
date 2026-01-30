import { motion } from "framer-motion";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  index?: number;
  iconAnimation?: "pulse" | "radar" | "heartbeat" | "float";
}

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  index = 0,
  iconAnimation = "pulse",
}: FeatureCardProps) => {
  const animationClasses = {
    pulse: "animate-pulse-glow",
    radar: "animate-radar-sweep",
    heartbeat: "animate-heartbeat",
    float: "animate-float",
  };

  return (
    <motion.div
      className="card-glow p-8 flex flex-col items-center text-center group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <motion.div
        className="relative mb-6"
        whileHover={{ scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center relative">
          <Icon className={`w-10 h-10 text-primary ${animationClasses[iconAnimation]}`} />
          <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </motion.div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
