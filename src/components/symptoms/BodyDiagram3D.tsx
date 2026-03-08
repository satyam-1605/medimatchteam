import { useState, useRef, Suspense, useMemo, useEffect, useCallback, Component, ReactNode } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import { motion } from "framer-motion";
import { Layers, ZoomIn, ZoomOut, RotateCcw, Eye, Bone, Heart, AlertTriangle, HelpCircle } from "lucide-react";
import WebGLTroubleshoot from "./WebGLTroubleshoot";

// Check WebGL availability with WebGL1/2 detection
function getWebGLSupport(): { supported: boolean; version: number | null; error?: string } {
  try {
    const canvas = document.createElement("canvas");
    
    // Try WebGL2 first
    const gl2 = canvas.getContext("webgl2");
    if (gl2) {
      return { supported: true, version: 2 };
    }
    
    // Fall back to WebGL1
    const gl1 = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (gl1) {
      return { supported: true, version: 1 };
    }
    
    return { supported: false, version: null, error: "WebGL not available" };
  } catch (e) {
    return { supported: false, version: null, error: String(e) };
  }
}

// Legacy check for simple boolean
function isWebGLAvailable(): boolean {
  return getWebGLSupport().supported;
}

// Error boundary for catching WebGL errors
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface WebGLErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

class WebGLErrorBoundary extends Component<WebGLErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: WebGLErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("WebGL Error:", error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Shape types for anatomical appearance
type ShapeType = "sphere" | "capsule" | "ellipsoid" | "cylinder";

// Body part data with 3D coordinates for different layers
const bodyPartData: Record<string, {
  name: string;
  skinPosition: [number, number, number];
  musclePosition: [number, number, number];
  organPosition: [number, number, number];
  skinSize: [number, number, number];
  muscleSize: [number, number, number];
  organSize: [number, number, number];
  color: { skin: string; muscle: string; organ: string };
  shape: ShapeType;
}> = {
  head: {
    name: "Head", skinPosition: [0, 1.6, 0], musclePosition: [0, 1.6, 0], organPosition: [0, 1.65, 0],
    skinSize: [0.22, 0.28, 0.24], muscleSize: [0.18, 0.24, 0.2], organSize: [0.14, 0.16, 0.14],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffa8b2" }, shape: "sphere",
  },
  neck: {
    name: "Neck", skinPosition: [0, 1.28, 0], musclePosition: [0, 1.28, 0], organPosition: [0, 1.28, 0],
    skinSize: [0.1, 0.12, 0.1], muscleSize: [0.08, 0.1, 0.08], organSize: [0.04, 0.08, 0.04],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#d4766a" }, shape: "cylinder",
  },
  chest: {
    name: "Chest", skinPosition: [0, 0.95, 0], musclePosition: [0, 0.95, 0], organPosition: [0, 0.95, 0],
    skinSize: [0.36, 0.32, 0.2], muscleSize: [0.32, 0.28, 0.16], organSize: [0.12, 0.14, 0.1],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#e85a70" }, shape: "ellipsoid",
  },
  heart: {
    name: "Heart", skinPosition: [0.06, 0.98, 0.04], musclePosition: [0.06, 0.98, 0.04], organPosition: [0.06, 0.98, 0.04],
    skinSize: [0.08, 0.1, 0.08], muscleSize: [0.08, 0.1, 0.08], organSize: [0.08, 0.1, 0.08],
    color: { skin: "#e85a70", muscle: "#e85a70", organ: "#d62828" }, shape: "sphere",
  },
  lungs: {
    name: "Lungs", skinPosition: [0, 0.9, 0], musclePosition: [0, 0.9, 0], organPosition: [0, 0.9, 0],
    skinSize: [0.28, 0.22, 0.14], muscleSize: [0.28, 0.22, 0.14], organSize: [0.28, 0.22, 0.14],
    color: { skin: "#ffb5c5", muscle: "#ffb5c5", organ: "#ff8fab" }, shape: "ellipsoid",
  },
  abdomen: {
    name: "Abdomen", skinPosition: [0, 0.58, 0], musclePosition: [0, 0.58, 0], organPosition: [0, 0.58, 0],
    skinSize: [0.32, 0.28, 0.18], muscleSize: [0.28, 0.24, 0.14], organSize: [0.2, 0.18, 0.1],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#d67d6a" }, shape: "ellipsoid",
  },
  liver: {
    name: "Liver", skinPosition: [0.1, 0.68, 0], musclePosition: [0.1, 0.68, 0], organPosition: [0.1, 0.68, 0],
    skinSize: [0.14, 0.1, 0.08], muscleSize: [0.14, 0.1, 0.08], organSize: [0.14, 0.1, 0.08],
    color: { skin: "#8b4513", muscle: "#8b4513", organ: "#8b4513" }, shape: "ellipsoid",
  },
  stomach: {
    name: "Stomach", skinPosition: [-0.06, 0.62, 0.02], musclePosition: [-0.06, 0.62, 0.02], organPosition: [-0.06, 0.62, 0.02],
    skinSize: [0.1, 0.12, 0.08], muscleSize: [0.1, 0.12, 0.08], organSize: [0.1, 0.12, 0.08],
    color: { skin: "#deb887", muscle: "#deb887", organ: "#f4a460" }, shape: "sphere",
  },
  kidneys: {
    name: "Kidneys", skinPosition: [0, 0.5, -0.06], musclePosition: [0, 0.5, -0.06], organPosition: [0, 0.5, -0.06],
    skinSize: [0.24, 0.08, 0.06], muscleSize: [0.24, 0.08, 0.06], organSize: [0.24, 0.08, 0.06],
    color: { skin: "#cd5c5c", muscle: "#cd5c5c", organ: "#b22222" }, shape: "ellipsoid",
  },
  leftArm: {
    name: "Left Arm", skinPosition: [-0.32, 0.85, 0], musclePosition: [-0.32, 0.85, 0], organPosition: [-0.32, 0.85, 0],
    skinSize: [0.1, 0.45, 0.1], muscleSize: [0.08, 0.4, 0.08], organSize: [0.03, 0.35, 0.03],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "capsule",
  },
  rightArm: {
    name: "Right Arm", skinPosition: [0.32, 0.85, 0], musclePosition: [0.32, 0.85, 0], organPosition: [0.32, 0.85, 0],
    skinSize: [0.1, 0.45, 0.1], muscleSize: [0.08, 0.4, 0.08], organSize: [0.03, 0.35, 0.03],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "capsule",
  },
  leftHand: {
    name: "Left Hand", skinPosition: [-0.32, 0.48, 0], musclePosition: [-0.32, 0.48, 0], organPosition: [-0.32, 0.48, 0],
    skinSize: [0.08, 0.12, 0.04], muscleSize: [0.06, 0.1, 0.03], organSize: [0.02, 0.08, 0.02],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "sphere",
  },
  rightHand: {
    name: "Right Hand", skinPosition: [0.32, 0.48, 0], musclePosition: [0.32, 0.48, 0], organPosition: [0.32, 0.48, 0],
    skinSize: [0.08, 0.12, 0.04], muscleSize: [0.06, 0.1, 0.03], organSize: [0.02, 0.08, 0.02],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "sphere",
  },
  pelvis: {
    name: "Pelvis", skinPosition: [0, 0.32, 0], musclePosition: [0, 0.32, 0], organPosition: [0, 0.32, 0],
    skinSize: [0.3, 0.14, 0.16], muscleSize: [0.26, 0.12, 0.14], organSize: [0.16, 0.08, 0.1],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#d4a574" }, shape: "ellipsoid",
  },
  leftLeg: {
    name: "Left Leg", skinPosition: [-0.12, -0.1, 0], musclePosition: [-0.12, -0.1, 0], organPosition: [-0.12, -0.1, 0],
    skinSize: [0.12, 0.55, 0.12], muscleSize: [0.1, 0.5, 0.1], organSize: [0.04, 0.45, 0.04],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "capsule",
  },
  rightLeg: {
    name: "Right Leg", skinPosition: [0.12, -0.1, 0], musclePosition: [0.12, -0.1, 0], organPosition: [0.12, -0.1, 0],
    skinSize: [0.12, 0.55, 0.12], muscleSize: [0.1, 0.5, 0.1], organSize: [0.04, 0.45, 0.04],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "capsule",
  },
  leftFoot: {
    name: "Left Foot", skinPosition: [-0.12, -0.48, 0.04], musclePosition: [-0.12, -0.48, 0.04], organPosition: [-0.12, -0.48, 0.04],
    skinSize: [0.08, 0.06, 0.14], muscleSize: [0.06, 0.05, 0.12], organSize: [0.02, 0.03, 0.08],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "ellipsoid",
  },
  rightFoot: {
    name: "Right Foot", skinPosition: [0.12, -0.48, 0.04], musclePosition: [0.12, -0.48, 0.04], organPosition: [0.12, -0.48, 0.04],
    skinSize: [0.08, 0.06, 0.14], muscleSize: [0.06, 0.05, 0.12], organSize: [0.02, 0.03, 0.08],
    color: { skin: "#f5c6aa", muscle: "#c75050", organ: "#ffcccb" }, shape: "ellipsoid",
  },
  spine: {
    name: "Spine", skinPosition: [0, 0.7, -0.1], musclePosition: [0, 0.7, -0.1], organPosition: [0, 0.7, -0.1],
    skinSize: [0.06, 0.7, 0.06], muscleSize: [0.05, 0.65, 0.05], organSize: [0.04, 0.6, 0.04],
    color: { skin: "#e8d4c4", muscle: "#d4a574", organ: "#f5f5dc" }, shape: "capsule",
  },
};

type LayerType = "skin" | "muscle" | "organ";
type SymptomType = "pain" | "swelling" | "numbness" | "rash" | "normal";

interface BodyPartMeshProps {
  partId: string;
  partData: typeof bodyPartData[string];
  layer: LayerType;
  isSelected: boolean;
  symptomType: SymptomType;
  onClick: () => void;
  opacity: number;
  isOrganView: boolean;
}

// Symptom color mapping
const symptomColors: Record<SymptomType, string> = {
  pain: "#ff4444",
  swelling: "#9b59b6",
  numbness: "#3498db",
  rash: "#e74c3c",
  normal: "#00ffff",
};

function BodyPartMesh({ 
  partId, 
  partData, 
  layer, 
  isSelected, 
  symptomType,
  onClick, 
  opacity,
  isOrganView
}: BodyPartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  // Get position and size based on layer
  const position = layer === "skin" ? partData.skinPosition :
                   layer === "muscle" ? partData.musclePosition : partData.organPosition;
  const size = layer === "skin" ? partData.skinSize :
               layer === "muscle" ? partData.muscleSize : partData.organSize;
  const baseColor = partData.color[layer];

  // Determine display color based on selection and symptom type
  const displayColor = useMemo(() => {
    if (isSelected) {
      return symptomType !== "normal" ? symptomColors[symptomType] : symptomColors.normal;
    }
    return baseColor;
  }, [isSelected, symptomType, baseColor]);

  // Animation for selected/hovered parts
  useFrame((state) => {
    if (meshRef.current) {
      if (isSelected) {
        meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 3) * 0.03);
      } else if (hovered) {
        meshRef.current.scale.setScalar(1.05);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  // Only show organs that make sense for the organ layer
  const isOrganPart = ["heart", "lungs", "liver", "stomach", "kidneys", "spine"].includes(partId);
  const shouldShow = layer !== "organ" || isOrganPart || isOrganView;
  
  // Build geometry based on shape type
  const geometry = useMemo(() => {
    const [sx, sy, sz] = size;
    const shape = partData.shape;
    if (shape === "sphere") {
      const radius = Math.max(sx, sy, sz) / 2;
      const geo = new THREE.SphereGeometry(radius, 16, 12);
      geo.scale(sx / (radius * 2), sy / (radius * 2), sz / (radius * 2));
      return geo;
    }
    if (shape === "capsule") {
      const radius = Math.min(sx, sz) / 2;
      const length = Math.max(0.01, sy - radius * 2);
      const geo = new THREE.CapsuleGeometry(radius, length, 8, 12);
      geo.scale(1, 1, sz / sx);
      return geo;
    }
    if (shape === "cylinder") {
      const radius = Math.max(sx, sz) / 2;
      const geo = new THREE.CylinderGeometry(radius, radius * 0.9, sy, 12);
      geo.scale(1, 1, sz / sx);
      return geo;
    }
    // ellipsoid fallback
    const geo = new THREE.SphereGeometry(0.5, 16, 12);
    geo.scale(sx, sy, sz);
    return geo;
  }, [size, partData.shape]);

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick();
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      geometry={geometry}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      <meshStandardMaterial
        color={displayColor}
        transparent
        opacity={hovered ? Math.min(1, opacity + 0.2) : opacity}
        emissive={isSelected ? displayColor : "#000000"}
        emissiveIntensity={isSelected ? 0.5 : 0}
        roughness={0.4}
        metalness={0.15}
      />
      {(hovered || isSelected) && (
        <Html
          position={[0, size[1] / 2 + 0.1, 0]}
          center
          style={{ pointerEvents: 'none' }}
        >
          <div className="px-2 py-1 bg-background/90 backdrop-blur-sm border border-primary/50 rounded text-xs text-primary whitespace-nowrap shadow-lg">
            {partData.name}
            {isSelected && symptomType !== "normal" && (
              <span className="ml-1 text-destructive capitalize">({symptomType})</span>
            )}
          </div>
        </Html>
      )}
    </mesh>
  );
  );
}

interface BodyModel3DProps {
  selectedParts: Record<string, SymptomType>;
  onPartClick: (partId: string) => void;
  layer: LayerType;
  currentSymptomType: SymptomType;
}

function BodyModel3D({ selectedParts, onPartClick, layer, currentSymptomType }: BodyModel3DProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Layer opacity settings
  const getOpacity = (partLayer: LayerType): number => {
    if (layer === "skin") return partLayer === "skin" ? 0.9 : 0;
    if (layer === "muscle") return partLayer === "muscle" ? 0.85 : partLayer === "skin" ? 0.2 : 0;
    if (layer === "organ") return partLayer === "organ" ? 0.9 : partLayer === "muscle" ? 0.15 : 0.1;
    return 0;
  };

  const handlePartClick = (partId: string) => {
    onPartClick(partId);
  };

  // Filter parts based on layer
  const visibleParts = Object.entries(bodyPartData).filter(([partId]) => {
    if (layer === "organ") {
      // In organ view, show organs prominently but still show body outline
      return true;
    }
    // In skin/muscle view, hide internal organs
    const internalOrgans = ["heart", "lungs", "liver", "stomach", "kidneys"];
    return !internalOrgans.includes(partId);
  });

  return (
    <group ref={groupRef}>
      {visibleParts.map(([partId, partData]) => {
        const isOrganPart = ["heart", "lungs", "liver", "stomach", "kidneys", "spine"].includes(partId);
        const renderLayer = layer === "organ" && isOrganPart ? "organ" : layer;
        const opacity = layer === "organ" && !isOrganPart ? 0.15 : getOpacity(renderLayer);
        
        if (opacity <= 0) return null;

        return (
          <BodyPartMesh
            key={`${partId}-${layer}`}
            partId={partId}
            partData={partData}
            layer={renderLayer}
            isSelected={!!selectedParts[partId]}
            symptomType={selectedParts[partId] || currentSymptomType}
            onClick={() => handlePartClick(partId)}
            opacity={opacity}
            isOrganView={layer === "organ"}
          />
        );
      })}
    </group>
  );
}

interface BodyDiagram3DProps {
  selectedParts: Record<string, SymptomType>;
  onPartClick: (partId: string, symptomType: SymptomType) => void;
}

// Enhanced fallback with troubleshooting option
interface WebGLFallbackProps {
  onTroubleshoot?: () => void;
}

const WebGLFallback = ({ onTroubleshoot }: WebGLFallbackProps) => (
  <div className="w-full h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 border border-border flex items-center justify-center">
    <div className="text-center p-8 max-w-md">
      <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">3D View Unavailable</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Your browser or device doesn't support WebGL, which is required for the 3D body diagram.
      </p>
      <div className="flex flex-col gap-2">
        {onTroubleshoot && (
          <button
            onClick={onTroubleshoot}
            className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            How to Enable 3D
          </button>
        )}
        <p className="text-xs text-muted-foreground">
          Or use the 2D view by clicking the grid icon above.
        </p>
      </div>
    </div>
  </div>
);

const BodyDiagram3D = ({ selectedParts, onPartClick }: BodyDiagram3DProps) => {
  const [layer, setLayer] = useState<LayerType>("skin");
  const [currentSymptomType, setCurrentSymptomType] = useState<SymptomType>("pain");
  const [zoom, setZoom] = useState(3);
  const [webglSupported, setWebglSupported] = useState<boolean | null>(null);
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const controlsRef = useRef<any>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Check WebGL support on mount
  useEffect(() => {
    const support = getWebGLSupport();
    setWebglSupported(support.supported);
    if (!support.supported) {
      setWebglError(support.error || "WebGL not supported");
    }
  }, []);

  // Handle WebGL context loss/restoration
  useEffect(() => {
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn("WebGL context lost");
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log("WebGL context restored");
      setContextLost(false);
    };

    // Listen on window for context events
    window.addEventListener("webglcontextlost", handleContextLost);
    window.addEventListener("webglcontextrestored", handleContextRestored);

    return () => {
      window.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("webglcontextrestored", handleContextRestored);
    };
  }, []);

  const handleWebGLError = useCallback((error: Error) => {
    console.error("WebGL Error caught:", error);
    setWebglSupported(false);
    setWebglError(error.message);
  }, []);

  const handlePartClick = (partId: string) => {
    onPartClick(partId, currentSymptomType);
  };

  const resetView = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
    setZoom(3);
  };

  const symptomTypes: { type: SymptomType; label: string; color: string }[] = [
    { type: "pain", label: "Pain", color: symptomColors.pain },
    { type: "swelling", label: "Swelling", color: symptomColors.swelling },
    { type: "numbness", label: "Numbness", color: symptomColors.numbness },
    { type: "rash", label: "Rash", color: symptomColors.rash },
  ];

  const layers: { type: LayerType; label: string; icon: React.ReactNode }[] = [
    { type: "skin", label: "Skin", icon: <Eye className="w-4 h-4" /> },
    { type: "muscle", label: "Muscle", icon: <Bone className="w-4 h-4" /> },
    { type: "organ", label: "Organs", icon: <Heart className="w-4 h-4" /> },
  ];

  // Show loading state while checking WebGL
  if (webglSupported === null) {
    return (
      <div className="w-full h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 border border-border flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Checking 3D support...</p>
        </div>
      </div>
    );
  }

  // Show context lost state
  if (contextLost) {
    return (
      <div className="w-full h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-muted/30 to-muted/10 border border-border flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">3D View Interrupted</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The 3D context was lost. This can happen when the GPU is under heavy load.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Show fallback if WebGL not supported
  if (!webglSupported) {
    return (
      <>
        <WebGLFallback onTroubleshoot={() => setShowTroubleshoot(true)} />
        <WebGLTroubleshoot isOpen={showTroubleshoot} onClose={() => setShowTroubleshoot(false)} />
      </>
    );
  }

  return (
    <>
      <WebGLErrorBoundary 
        fallback={<WebGLFallback onTroubleshoot={() => setShowTroubleshoot(true)} />}
        onError={handleWebGLError}
      >
        <div className="space-y-3">
          {/* Top Controls Bar */}
          <div className="flex items-start gap-3 flex-wrap">
            {/* Layer Selector */}
            <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-muted-foreground ml-1 mr-1" />
              {layers.map((l) => (
                <button
                  key={l.type}
                  onClick={() => setLayer(l.type)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    layer === l.type
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {l.icon}
                  <span className="hidden sm:inline">{l.label}</span>
                </button>
              ))}
            </div>

            {/* Symptom Type Selector */}
            <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-2 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-muted-foreground ml-1 mr-1" />
              {symptomTypes.map((s) => (
                <button
                  key={s.type}
                  onClick={() => setCurrentSymptomType(s.type)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    currentSymptomType === s.type
                      ? "border-current shadow-sm"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ 
                    backgroundColor: s.color + "20",
                    color: s.color,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Help */}
            <button
              onClick={() => setShowTroubleshoot(true)}
              className="ml-auto p-2 rounded-lg bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground transition-colors"
              title="Troubleshoot 3D issues"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

          {/* 3D Viewport */}
          <div 
            ref={canvasContainerRef}
            className="relative w-full h-[420px] rounded-2xl overflow-hidden bg-gradient-to-b from-background/50 to-muted/10 border border-border/50"
          >
            {/* Zoom Controls */}
            <div className="absolute bottom-3 right-3 z-10 flex gap-1 rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-1">
              <button
                onClick={() => setZoom((z) => Math.max(1.5, z - 0.5))}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(6, z + 0.5))}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetView}
                className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Instructions */}
            <div className="absolute bottom-3 left-3 z-10 text-[10px] text-muted-foreground/60">
              Drag to rotate • Scroll to zoom • Click to select
            </div>

            {/* 3D Canvas */}
            <Canvas
              camera={{ position: [0, 0.5, zoom], fov: 50 }}
              style={{ background: 'transparent' }}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: 'default',
                failIfMajorPerformanceCaveat: false,
                preserveDrawingBuffer: true,
              }}
              onCreated={({ gl }) => {
                const glContext = gl.getContext();
                const debugInfo = glContext.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                  console.log('WebGL Renderer:', glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL));
                }
              }}
            >
              <Suspense fallback={null}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <directionalLight position={[-5, 5, -5]} intensity={0.4} />
                <pointLight position={[0, 2, 2]} intensity={0.3} color="#00ffff" />
                
                <BodyModel3D
                  selectedParts={selectedParts}
                  onPartClick={handlePartClick}
                  layer={layer}
                  currentSymptomType={currentSymptomType}
                />
                
                <ContactShadows
                  position={[0, -0.55, 0]}
                  opacity={0.4}
                  scale={3}
                  blur={2}
                  far={1}
                />
                
                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  minDistance={1.5}
                  maxDistance={6}
                  minPolarAngle={Math.PI / 6}
                  maxPolarAngle={Math.PI - Math.PI / 6}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Selected Parts Legend */}
          {Object.keys(selectedParts).length > 0 && (
            <div className="rounded-xl bg-card/80 backdrop-blur-sm border border-border/50 p-3">
              <span className="text-xs text-muted-foreground mb-2 block">
                Selected Areas ({Object.keys(selectedParts).length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(selectedParts).map(([partId, type]) => (
                  <span
                    key={partId}
                    className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: symptomColors[type] + "20", color: symptomColors[type] }}
                  >
                    {bodyPartData[partId]?.name || partId}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </WebGLErrorBoundary>
      <WebGLTroubleshoot isOpen={showTroubleshoot} onClose={() => setShowTroubleshoot(false)} />
    </>
  );
};

export default BodyDiagram3D;
