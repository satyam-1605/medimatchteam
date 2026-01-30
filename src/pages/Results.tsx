import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Brain,
  Heart,
  Stethoscope,
  Bone,
  Eye,
  Activity,
  FileDown,
  MapPin,
  RefreshCw,
  ChevronRight,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import GlowButton from "@/components/ui/GlowButton";
import UrgencyMeter from "@/components/results/UrgencyMeter";
import SpecialistCard from "@/components/results/SpecialistCard";
import ReasoningDisplay from "@/components/results/ReasoningDisplay";

// Mock analysis results
const mockResults = {
  urgency: "moderate" as const,
  urgencyPercentage: 65,
  primaryRecommendation: {
    icon: Brain,
    specialty: "Neurologist",
    matchPercentage: 94,
    description:
      "Based on your reported symptoms including headaches and dizziness, a neurologist specializes in disorders of the nervous system and would be best suited to evaluate your condition.",
  },
  alternatives: [
    {
      icon: Heart,
      specialty: "Cardiologist",
      matchPercentage: 72,
      description:
        "Some of your symptoms may have cardiovascular origins. A cardiologist can rule out heart-related causes.",
    },
    {
      icon: Stethoscope,
      specialty: "Internal Medicine",
      matchPercentage: 68,
      description:
        "A general internist can provide comprehensive evaluation and coordinate care if multiple specialties are needed.",
    },
    {
      icon: Eye,
      specialty: "Ophthalmologist",
      matchPercentage: 45,
      description:
        "Headaches can sometimes be related to vision issues. An eye exam may be beneficial.",
    },
  ],
  reasoning: [
    "Your symptom pattern suggests neurological involvement, particularly the combination of headaches and dizziness.",
    "The duration and frequency of your symptoms indicate a chronic condition requiring specialist evaluation.",
    "Your age group and symptom profile match common presentations seen by neurologists.",
    "The absence of cardiovascular warning signs reduces urgency but doesn't eliminate the need for evaluation.",
  ],
};

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleGeneratePDF = async () => {
    setIsGeneratingPDF(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsGeneratingPDF(false);
    // In a real app, this would trigger PDF download
    alert("PDF Report Generated! (Demo)");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-success text-sm font-medium mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Activity className="w-4 h-4" />
              Analysis Complete
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="headline-gradient">Your Results</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Based on your symptoms, here are our specialist recommendations
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Urgency + Primary Recommendation */}
            <div className="lg:col-span-2 space-y-6">
              {/* Urgency Section */}
              <motion.div
                className="glass-panel p-8"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <UrgencyMeter
                    level={mockResults.urgency}
                    percentage={mockResults.urgencyPercentage}
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Urgency Assessment
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      Your symptoms suggest a moderate priority level. We recommend
                      scheduling an appointment within the next few days for proper
                      evaluation.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-sm">
                        Not Emergency
                      </span>
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                        Specialist Recommended
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Primary Recommendation */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Primary Recommendation
                </h3>
                <SpecialistCard
                  icon={mockResults.primaryRecommendation.icon}
                  specialty={mockResults.primaryRecommendation.specialty}
                  matchPercentage={mockResults.primaryRecommendation.matchPercentage}
                  description={mockResults.primaryRecommendation.description}
                  isMain={true}
                />
              </motion.div>

              {/* Alternative Recommendations */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Alternative Specialists
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockResults.alternatives.slice(0, 2).map((alt, index) => (
                    <SpecialistCard
                      key={alt.specialty}
                      icon={alt.icon}
                      specialty={alt.specialty}
                      matchPercentage={alt.matchPercentage}
                      description={alt.description}
                      index={index}
                    />
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Right: Reasoning + Actions */}
            <div className="space-y-6">
              {/* Reasoning */}
              <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ReasoningDisplay reasons={mockResults.reasoning} />
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                className="glass-panel p-6 space-y-4"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-lg font-semibold text-foreground">
                  Next Steps
                </h4>

                <Link to="/doctors" className="block">
                  <motion.button
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5" />
                      <span className="font-medium">Find Nearby Specialists</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>

                <motion.button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-muted border border-border text-foreground hover:border-primary/30 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <FileDown className="w-5 h-5" />
                    <span className="font-medium">
                      {isGeneratingPDF ? "Generating..." : "Download PDF Report"}
                    </span>
                  </div>
                  {isGeneratingPDF ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <ChevronRight className="w-5 h-5" />
                  )}
                </motion.button>

                <Link to="/symptoms" className="block">
                  <motion.button
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-5 h-5" />
                      <span className="font-medium">Start New Analysis</span>
                    </div>
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>

              {/* Disclaimer */}
              <motion.div
                className="p-4 rounded-xl bg-warning/10 border border-warning/30"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <p className="text-xs text-warning/80 leading-relaxed">
                  <strong>Disclaimer:</strong> This AI-powered analysis is for
                  informational purposes only and should not replace professional
                  medical advice. Always consult with a qualified healthcare provider
                  for diagnosis and treatment.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Results;
