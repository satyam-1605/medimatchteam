import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

interface MedicalCrossProps {
  size?: number;
  className?: string;
}

const MedicalCross = ({ size = 200, className = "" }: MedicalCrossProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const rotateX = useSpring(useTransform(y, [-300, 300], [15, -15]), { stiffness: 100, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-300, 300], [-15, 15]), { stiffness: 100, damping: 30 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.body.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      x.set(e.clientX - centerX);
      y.set(e.clientY - centerY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [x, y]);

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: size,
        height: size,
        perspective: 1000,
        rotateX,
        rotateY,
      }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {/* Outer glow ring */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="0.5"
          opacity="0.5"
        />
        
        {/* Inner pulsing ring */}
        <motion.circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="url(#glowGradient)"
          strokeWidth="1"
          strokeDasharray="10 5"
          animate={{ strokeDashoffset: [0, 30] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />

        {/* Medical cross */}
        <motion.path
          d="M45 20 L55 20 L55 45 L80 45 L80 55 L55 55 L55 80 L45 80 L45 55 L20 55 L20 45 L45 45 Z"
          fill="url(#crossGradient)"
          filter="url(#glow)"
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "center" }}
        />

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="crossGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(180, 100%, 50%)" />
            <stop offset="100%" stopColor="hsl(185, 100%, 60%)" />
          </linearGradient>
          <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(180, 100%, 50%)" />
            <stop offset="50%" stopColor="hsl(185, 100%, 60%)" />
            <stop offset="100%" stopColor="hsl(180, 100%, 50%)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </motion.svg>

      {/* Floating particles around the cross */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/50"
          style={{
            left: "50%",
            top: "50%",
          }}
          animate={{
            x: [0, Math.cos((i * Math.PI * 2) / 6) * 80],
            y: [0, Math.sin((i * Math.PI * 2) / 6) * 80],
            opacity: [0, 0.8, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
};

export default MedicalCross;
