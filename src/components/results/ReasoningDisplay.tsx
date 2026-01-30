import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface ReasoningDisplayProps {
  reasons: string[];
}

const ReasoningDisplay = ({ reasons }: ReasoningDisplayProps) => {
  const [visibleReasons, setVisibleReasons] = useState<number[]>([]);

  useEffect(() => {
    reasons.forEach((_, index) => {
      setTimeout(() => {
        setVisibleReasons((prev) => [...prev, index]);
      }, index * 500);
    });
  }, [reasons]);

  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-foreground mb-4">
        Analysis Reasoning
      </h4>
      <div className="space-y-3">
        {reasons.map((reason, index) => (
          <motion.div
            key={index}
            className="flex items-start gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={
              visibleReasons.includes(index)
                ? { opacity: 1, x: 0 }
                : { opacity: 0, x: -20 }
            }
            transition={{ duration: 0.3 }}
          >
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">{index + 1}</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {visibleReasons.includes(index) ? (
                <TypewriterReason text={reason} />
              ) : (
                <span className="opacity-0">{reason}</span>
              )}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const TypewriterReason = ({ text }: { text: string }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [text]);

  // Highlight medical terms
  const highlightTerms = (str: string) => {
    const terms = [
      "neurological",
      "cardiovascular",
      "respiratory",
      "musculoskeletal",
      "gastrointestinal",
      "dermatological",
      "headache",
      "chest pain",
      "fatigue",
      "inflammation",
    ];

    let result = str;
    terms.forEach((term) => {
      const regex = new RegExp(`(${term})`, "gi");
      result = result.replace(
        regex,
        `<span class="text-primary font-medium">$1</span>`
      );
    });
    return result;
  };

  return (
    <span dangerouslySetInnerHTML={{ __html: highlightTerms(displayedText) }} />
  );
};

export default ReasoningDisplay;
