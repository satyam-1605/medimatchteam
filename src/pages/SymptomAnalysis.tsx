import { useState, useEffect, Suspense, lazy } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  MicOff,
  Send,
  User,
  Calendar,
  Pill,
  FileText,
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Box,
  LayoutGrid,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import GlowButton from "@/components/ui/GlowButton";
import BodyDiagram from "@/components/symptoms/BodyDiagram";
import EmergencyOverlay, { checkForEmergency } from "@/components/symptoms/EmergencyOverlay";

// Lazy load the 3D body diagram for performance
const BodyDiagram3D = lazy(() => import("@/components/symptoms/BodyDiagram3D"));

type SymptomType = "pain" | "swelling" | "numbness" | "rash" | "normal";

const quickSymptoms = [
  "Headache",
  "Fever",
  "Cough",
  "Fatigue",
  "Nausea",
  "Dizziness",
  "Back Pain",
  "Chest Pain",
  "Shortness of Breath",
  "Joint Pain",
  "Morning Stiffness",
  "Numbness",
  "Injury",
  "Swelling",
  "Abdominal Pain",
  "Skin Rash",
  "Itching",
  "Eye Pain",
  "Blurred Vision",
  "Sore Throat",
  "Ear Pain",
  "Allergies",
  "Sneezing",
  "Anxiety",
  "Low Mood",
  "Sleep Problems",
  "Tingling",
  "Muscle Pain",
  "Heart Palpitations",
  "Urinary Issues",
  "Weight Changes",
  "Excessive Thirst",
];

const SymptomAnalysis = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [selectedQuickSymptoms, setSelectedQuickSymptoms] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  // 3D body diagram: Map of partId -> symptomType
  const [selectedBodyParts3D, setSelectedBodyParts3D] = useState<Record<string, SymptomType>>({});
  const [use3DView, setUse3DView] = useState(true);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<string>("");
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencySymptoms, setEmergencySymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Check for emergency keywords
  useEffect(() => {
    const allText = `${symptoms} ${selectedQuickSymptoms.join(" ")}`;
    const detected = checkForEmergency(allText);
    if (detected.length > 0 && !showEmergency) {
      setEmergencySymptoms(detected);
      setShowEmergency(true);
    }
  }, [symptoms, selectedQuickSymptoms]);

  const toggleQuickSymptom = (symptom: string) => {
    setSelectedQuickSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  };

  const toggleBodyPart = (part: string) => {
    setSelectedBodyParts((prev) =>
      prev.includes(part)
        ? prev.filter((p) => p !== part)
        : [...prev, part]
    );
  };

  // 3D body part click handler
  const handleBodyPart3DClick = (partId: string, symptomType: SymptomType) => {
    setSelectedBodyParts3D((prev) => {
      if (prev[partId]) {
        // Remove if already selected
        const { [partId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [partId]: symptomType };
    });
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setMedications((prev) => [...prev, newMedication.trim()]);
      setNewMedication("");
    }
  };

  const removeMedication = (med: string) => {
    setMedications((prev) => prev.filter((m) => m !== med));
  };

  // Combine body parts from both 2D and 3D views
  const getAllBodyParts = () => {
    if (use3DView) {
      return Object.entries(selectedBodyParts3D).map(([partId, symptomType]) => ({
        part: partId,
        symptomType,
      }));
    }
    return selectedBodyParts.map((part) => ({ part, symptomType: "pain" as SymptomType }));
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const bodyPartsData = getAllBodyParts();
    navigate("/results", {
      state: {
        symptoms,
        quickSymptoms: selectedQuickSymptoms,
        bodyParts: bodyPartsData.map((bp) => bp.part),
        bodyPartsDetailed: bodyPartsData,
        age,
        gender,
        medications,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />
      <EmergencyOverlay
        isVisible={showEmergency}
        onClose={() => setShowEmergency(false)}
        detectedSymptoms={emergencySymptoms}
      />

      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
              <span className="headline-gradient">Symptom Analysis</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms in detail for the most accurate specialist recommendation
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Input */}
            <div className="space-y-6">
              {/* Main Symptom Input */}
              <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-foreground mb-3">
                  <Stethoscope className="w-4 h-4 inline mr-2 text-primary" />
                  Describe Your Symptoms
                </label>
                <div className="relative">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Tell us what you're experiencing..."
                    className="w-full h-32 bg-muted/50 border border-border rounded-xl p-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                  />
                  <button
                    onClick={() => setIsRecording(!isRecording)}
                    className={`absolute bottom-4 right-4 p-2 rounded-full transition-all ${
                      isRecording
                        ? "bg-destructive text-white animate-pulse"
                        : "bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary"
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                </div>
                {isRecording && (
                  <motion.div
                    className="mt-2 flex items-center gap-2 text-sm text-destructive"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    Recording... Speak clearly
                  </motion.div>
                )}
              </motion.div>

              {/* Quick Symptoms */}
              <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-foreground mb-3">
                  Quick Add Symptoms
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickSymptoms.map((symptom) => (
                    <motion.button
                      key={symptom}
                      onClick={() => toggleQuickSymptom(symptom)}
                      className={`pill-btn ${
                        selectedQuickSymptoms.includes(symptom) ? "active" : ""
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {symptom}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Patient Context */}
              <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="grid grid-cols-2 gap-6">
                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      <Calendar className="w-4 h-4 inline mr-2 text-primary" />
                      Age: {age}
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      <User className="w-4 h-4 inline mr-2 text-primary" />
                      Gender
                    </label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={`pill-btn flex-1 ${gender === g ? "active" : ""}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medical History Accordion */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                    className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span>
                      <FileText className="w-4 h-4 inline mr-2" />
                      Medical History & Medications
                    </span>
                    {showMedicalHistory ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: showMedicalHistory ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          <Pill className="w-4 h-4 inline mr-2" />
                          Current Medications
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newMedication}
                            onChange={(e) => setNewMedication(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && addMedication()}
                            placeholder="Add medication..."
                            className="flex-1 bg-muted/50 border border-border rounded-lg px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                          />
                          <button
                            onClick={addMedication}
                            className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                          >
                            Add
                          </button>
                        </div>
                        {medications.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {medications.map((med) => (
                              <motion.span
                                key={med}
                                className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm flex items-center gap-2"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                {med}
                                <button
                                  onClick={() => removeMedication(med)}
                                  className="hover:text-destructive"
                                >
                                  ×
                                </button>
                              </motion.span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Body Diagram */}
            <motion.div
              className="glass-panel p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Click Affected Body Parts
                </h3>
                <div className="flex items-center gap-2 p-1 bg-muted/50 rounded-lg">
                  <button
                    onClick={() => setUse3DView(false)}
                    className={`p-2 rounded-md transition-all ${
                      !use3DView
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="2D View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setUse3DView(true)}
                    className={`p-2 rounded-md transition-all ${
                      use3DView
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="3D View"
                  >
                    <Box className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <AnimatePresence mode="wait">
                {use3DView ? (
                  <motion.div
                    key="3d"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Suspense
                      fallback={
                        <div className="h-[500px] flex items-center justify-center bg-muted/30 rounded-xl">
                          <div className="text-center">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">Loading 3D Model...</p>
                          </div>
                        </div>
                      }
                    >
                      <BodyDiagram3D
                        selectedParts={selectedBodyParts3D}
                        onPartClick={handleBodyPart3DClick}
                      />
                    </Suspense>
                  </motion.div>
                ) : (
                  <motion.div
                    key="2d"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <BodyDiagram
                      selectedParts={selectedBodyParts}
                      onPartClick={toggleBodyPart}
                    />
                    {selectedBodyParts.length > 0 && (
                      <motion.div
                        className="mt-6 p-4 bg-primary/10 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <p className="text-sm text-muted-foreground mb-2">Selected areas:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBodyParts.map((part) => (
                            <span
                              key={part}
                              className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm capitalize"
                            >
                              {part.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Analyze Button */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlowButton
              size="lg"
              onClick={handleAnalyze}
              disabled={!symptoms && selectedQuickSymptoms.length === 0 && Object.keys(selectedBodyParts3D).length === 0 && selectedBodyParts.length === 0}
            >
              {isAnalyzing ? (
                <motion.span
                  className="flex items-center gap-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0.2s" }} />
                  Analyzing...
                </motion.span>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Analyze Symptoms
                </>
              )}
            </GlowButton>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SymptomAnalysis;
