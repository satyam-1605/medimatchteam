import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Phone, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import GlowButton from "@/components/ui/GlowButton";

interface EmergencyOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  detectedSymptoms: string[];
}

const emergencyKeywords = [
  "chest pain",
  "heart attack",
  "stroke",
  "difficulty breathing",
  "severe bleeding",
  "unconscious",
  "seizure",
  "severe burn",
  "choking",
  "overdose",
  "suicidal",
  "can't breathe",
  "crushing chest",
];

export const checkForEmergency = (text: string): string[] => {
  const lowerText = text.toLowerCase();
  return emergencyKeywords.filter((keyword) => lowerText.includes(keyword));
};

const EmergencyOverlay = ({ isVisible, onClose, detectedSymptoms }: EmergencyOverlayProps) => {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="max-w-lg w-full p-8 rounded-2xl border-2 border-destructive bg-card relative overflow-hidden"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{
              boxShadow: "0 0 60px hsl(0, 84%, 60%, 0.4)",
            }}
          >
            {/* Pulsing background */}
            <motion.div
              className="absolute inset-0 bg-destructive/10"
              animate={{ opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative z-10 text-center">
              <motion.div
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/20 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </motion.div>

              <h2 className="text-2xl font-display font-bold text-destructive mb-4">
                {t("emergency.title")}
              </h2>

              <p className="text-muted-foreground mb-4">
                {t("emergency.message")}
              </p>

              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-2">{t("emergency.detectedKeywords")}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {detectedSymptoms.map((symptom) => (
                    <span
                      key={symptom}
                      className="px-3 py-1 rounded-full bg-destructive/20 text-destructive text-sm font-medium"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              <GlowButton
                variant="emergency"
                size="lg"
                className="w-full mb-4"
                onClick={() => window.open("tel:911")}
              >
                <Phone className="w-5 h-5 mr-2" />
                {t("emergency.call911")}
              </GlowButton>

              <p className="text-xs text-muted-foreground">
                {t("emergency.notEmergency")}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmergencyOverlay;
