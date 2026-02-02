import { useState } from "react";
import { AlertTriangle, Monitor, RefreshCw, Chrome, ExternalLink, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface WebGLTroubleshootProps {
  isOpen: boolean;
  onClose: () => void;
}

// Detect browser type
const getBrowserInfo = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes("chrome") && !userAgent.includes("edge")) {
    return { name: "Chrome", icon: Chrome };
  } else if (userAgent.includes("firefox")) {
    return { name: "Firefox", icon: Monitor };
  } else if (userAgent.includes("safari") && !userAgent.includes("chrome")) {
    return { name: "Safari", icon: Monitor };
  } else if (userAgent.includes("edge")) {
    return { name: "Edge", icon: Monitor };
  }
  return { name: "your browser", icon: Monitor };
};

const troubleshootingSteps = {
  Chrome: [
    {
      title: "Enable Hardware Acceleration",
      steps: [
        "Open Chrome Settings (⋮ → Settings)",
        "Click 'System' in the left sidebar",
        "Enable 'Use hardware acceleration when available'",
        "Restart Chrome"
      ]
    },
    {
      title: "Override GPU Blocklist",
      steps: [
        "Open chrome://flags in a new tab",
        "Search for 'Override software rendering list'",
        "Set it to 'Enabled'",
        "Click 'Relaunch' at the bottom"
      ]
    },
    {
      title: "Update Graphics Drivers",
      steps: [
        "Right-click on Windows Start → Device Manager",
        "Expand 'Display adapters'",
        "Right-click your GPU → 'Update driver'",
        "Choose 'Search automatically for drivers'"
      ]
    }
  ],
  Firefox: [
    {
      title: "Enable WebGL",
      steps: [
        "Open about:config in a new tab",
        "Search for 'webgl.disabled'",
        "Set it to 'false' if it's 'true'",
        "Search for 'webgl.force-enabled' and set to 'true'"
      ]
    },
    {
      title: "Enable Hardware Acceleration",
      steps: [
        "Open Firefox Settings (☰ → Settings)",
        "Scroll to 'Performance'",
        "Uncheck 'Use recommended performance settings'",
        "Check 'Use hardware acceleration when available'"
      ]
    }
  ],
  Safari: [
    {
      title: "Enable WebGL",
      steps: [
        "Open Safari → Preferences → Security",
        "Check 'Allow WebGL'",
        "Restart Safari"
      ]
    },
    {
      title: "Enable Develop Menu",
      steps: [
        "Safari → Preferences → Advanced",
        "Check 'Show Develop menu in menu bar'",
        "Develop → Experimental Features → WebGL 2.0"
      ]
    }
  ],
  Edge: [
    {
      title: "Enable Hardware Acceleration",
      steps: [
        "Open Edge Settings (⋯ → Settings)",
        "Click 'System and performance'",
        "Enable 'Use hardware acceleration when available'",
        "Restart Edge"
      ]
    }
  ],
  "your browser": [
    {
      title: "General Troubleshooting",
      steps: [
        "Try using Google Chrome (best WebGL support)",
        "Enable hardware acceleration in browser settings",
        "Update your graphics drivers",
        "Restart your browser after making changes"
      ]
    }
  ]
};

export const WebGLTroubleshoot = ({ isOpen, onClose }: WebGLTroubleshootProps) => {
  const [expandedStep, setExpandedStep] = useState<number | null>(0);
  const browserInfo = getBrowserInfo();
  const steps = troubleshootingSteps[browserInfo.name as keyof typeof troubleshootingSteps] || troubleshootingSteps["your browser"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Enable 3D View in {browserInfo.name}
          </DialogTitle>
          <DialogDescription>
            WebGL is required for the 3D body diagram. Follow these steps to enable it.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              className="border border-border rounded-lg overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <button
                onClick={() => setExpandedStep(expandedStep === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-sm flex items-center justify-center font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium text-foreground">{step.title}</span>
                </div>
                <motion.span
                  animate={{ rotate: expandedStep === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </motion.span>
              </button>
              
              <AnimatePresence>
                {expandedStep === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ol className="px-4 pb-4 space-y-2 list-decimal list-inside text-sm text-muted-foreground">
                      {step.steps.map((instruction, i) => (
                        <li key={i} className="leading-relaxed">
                          {instruction}
                        </li>
                      ))}
                    </ol>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground flex items-start gap-2">
            <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              After making changes, <strong className="text-foreground">refresh this page</strong> and try enabling 3D view again.
            </span>
          </p>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href="https://get.webgl.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Test WebGL Support
          </a>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WebGLTroubleshoot;
