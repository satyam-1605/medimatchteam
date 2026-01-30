import { motion } from "framer-motion";

interface BodyDiagramProps {
  selectedParts: string[];
  onPartClick: (part: string) => void;
}

const bodyParts = [
  { id: "head", name: "Head", path: "M150,25 C180,25 200,50 200,80 C200,110 180,135 150,135 C120,135 100,110 100,80 C100,50 120,25 150,25" },
  { id: "neck", name: "Neck", path: "M135,135 L165,135 L165,160 L135,160 Z" },
  { id: "chest", name: "Chest", path: "M100,160 L200,160 L210,250 L90,250 Z" },
  { id: "leftArm", name: "Left Arm", path: "M90,170 L60,170 L40,280 L60,285 L75,200 L90,250 Z" },
  { id: "rightArm", name: "Right Arm", path: "M210,170 L240,170 L260,280 L240,285 L225,200 L210,250 Z" },
  { id: "abdomen", name: "Abdomen", path: "M90,250 L210,250 L205,340 L95,340 Z" },
  { id: "leftLeg", name: "Left Leg", path: "M95,340 L145,340 L140,480 L100,480 Z" },
  { id: "rightLeg", name: "Right Leg", path: "M155,340 L205,340 L200,480 L160,480 Z" },
];

const BodyDiagram = ({ selectedParts, onPartClick }: BodyDiagramProps) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      <svg viewBox="0 0 300 500" className="w-full h-auto">
        {/* Background glow effect */}
        <defs>
          <filter id="bodyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(180, 100%, 50%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(185, 100%, 60%)" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* Body outline */}
        {bodyParts.map((part) => {
          const isSelected = selectedParts.includes(part.id);
          return (
            <motion.path
              key={part.id}
              d={part.path}
              className={`body-part ${isSelected ? "active" : ""}`}
              onClick={() => onPartClick(part.id)}
              fill={isSelected ? "url(#bodyGradient)" : "hsl(220, 40%, 12%)"}
              stroke={isSelected ? "hsl(180, 100%, 50%)" : "hsl(220, 40%, 25%)"}
              strokeWidth={isSelected ? 2 : 1}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ transformOrigin: "center" }}
              filter={isSelected ? "url(#bodyGlow)" : undefined}
            />
          );
        })}

        {/* Labels for selected parts */}
        {selectedParts.map((partId) => {
          const part = bodyParts.find((p) => p.id === partId);
          if (!part) return null;

          const labelPositions: Record<string, { x: number; y: number }> = {
            head: { x: 250, y: 80 },
            neck: { x: 250, y: 147 },
            chest: { x: 250, y: 205 },
            leftArm: { x: 10, y: 225 },
            rightArm: { x: 270, y: 225 },
            abdomen: { x: 250, y: 295 },
            leftLeg: { x: 50, y: 410 },
            rightLeg: { x: 220, y: 410 },
          };

          const pos = labelPositions[partId] || { x: 250, y: 100 };

          return (
            <motion.g key={`label-${partId}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <line
                x1={part.id.includes("left") ? 80 : part.id.includes("right") ? 220 : 150}
                y1={pos.y}
                x2={pos.x - 10}
                y2={pos.y}
                stroke="hsl(180, 100%, 50%)"
                strokeWidth="1"
                strokeDasharray="3,3"
              />
              <text
                x={pos.x}
                y={pos.y + 5}
                fill="hsl(180, 100%, 50%)"
                fontSize="12"
                fontFamily="Inter"
              >
                {part.name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted border border-border" />
          <span className="text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/50 border border-primary box-glow" />
          <span className="text-muted-foreground">Selected</span>
        </div>
      </div>
    </div>
  );
};

export default BodyDiagram;
