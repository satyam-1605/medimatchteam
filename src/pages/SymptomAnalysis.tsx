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
  ChevronDown,
  ChevronUp,
  Stethoscope,
  Box,
  LayoutGrid,
  Heart,
  Activity,
  CheckCircle2,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import BodyDiagram from "@/components/symptoms/BodyDiagram";
import EmergencyOverlay, { checkForEmergency } from "@/components/symptoms/EmergencyOverlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Lazy load the 3D body diagram for performance
const BodyDiagram3D = lazy(() => import("@/components/symptoms/BodyDiagram3D"));

type SymptomType = "pain" | "swelling" | "numbness" | "rash" | "normal";

const symptomCategories = {
  "General": ["Fever", "Fatigue", "Weight Changes", "Excessive Thirst"],
  "Head & Face": ["Headache", "Dizziness", "Blurred Vision", "Eye Pain", "Ear Pain"],
  "Respiratory": ["Cough", "Shortness of Breath", "Sore Throat", "Sneezing"],
  "Digestive": ["Nausea", "Abdominal Pain"],
  "Musculoskeletal": ["Back Pain", "Joint Pain", "Muscle Pain", "Morning Stiffness", "Swelling"],
  "Skin": ["Skin Rash", "Itching"],
  "Neurological": ["Numbness", "Tingling"],
  "Cardiovascular": ["Chest Pain", "Heart Palpitations"],
  "Mental Health": ["Anxiety", "Low Mood", "Sleep Problems"],
  "Other": ["Allergies", "Injury", "Urinary Issues"],
};

const SymptomAnalysis = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState("");
  const [selectedQuickSymptoms, setSelectedQuickSymptoms] = useState<string[]>([]);
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [selectedBodyParts3D, setSelectedBodyParts3D] = useState<Record<string, SymptomType>>({});
  const [use3DView, setUse3DView] = useState(false);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<string>("");
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [medications, setMedications] = useState<string[]>([]);
  const [newMedication, setNewMedication] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [emergencySymptoms, setEmergencySymptoms] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>("General");

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

  const handleBodyPart3DClick = (partId: string, symptomType: SymptomType) => {
    setSelectedBodyParts3D((prev) => {
      if (prev[partId]) {
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

  const hasInput = symptoms || selectedQuickSymptoms.length > 0 || Object.keys(selectedBodyParts3D).length > 0 || selectedBodyParts.length > 0;

  // Progress steps
  const steps = [
    { id: 1, label: "Symptoms", icon: Activity, complete: selectedQuickSymptoms.length > 0 || symptoms.length > 0 },
    { id: 2, label: "Body Map", icon: Heart, complete: selectedBodyParts.length > 0 || Object.keys(selectedBodyParts3D).length > 0 },
    { id: 3, label: "Profile", icon: User, complete: gender !== "" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ParticleBackground />
      <EmergencyOverlay
        isVisible={showEmergency}
        onClose={() => setShowEmergency(false)}
        detectedSymptoms={emergencySymptoms}
      />

      <main className="pt-20 pb-32 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Stethoscope className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Symptom Analysis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              <span className="headline-gradient">Tell us how you feel</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Describe your symptoms and we'll match you with the right specialist
            </p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div 
            className="flex justify-center mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300",
                    step.complete 
                      ? "bg-primary/20 text-primary" 
                      : "text-muted-foreground"
                  )}>
                    {step.complete ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground/50" />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Left Column - Symptoms Input */}
            <div className="lg:col-span-3 space-y-6">
              {/* Main Symptom Input Card */}
              <motion.div
                className="rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="p-6 border-b border-border/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 rounded-xl bg-primary/10">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">Describe Your Symptoms</h2>
                      <p className="text-sm text-muted-foreground">Be as detailed as possible</p>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Example: I've had a persistent headache for the past 3 days, along with sensitivity to light..."
                      className="w-full h-28 bg-muted/30 border border-border/50 rounded-2xl p-4 pr-14 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none text-base"
                    />
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={cn(
                        "absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300",
                        isRecording
                          ? "bg-destructive text-white shadow-lg shadow-destructive/30 animate-pulse"
                          : "bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary"
                      )}
                    >
                      {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  </div>
                  {isRecording && (
                    <motion.div
                      className="mt-3 flex items-center gap-2 text-sm text-destructive"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                      Recording... Speak clearly
                    </motion.div>
                  )}
                </div>

                {/* Quick Symptoms by Category */}
                <div className="p-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Add Symptoms</h3>
                  <div className="space-y-3">
                    {Object.entries(symptomCategories).map(([category, categorySymptoms]) => (
                      <div key={category} className="rounded-xl border border-border/30 overflow-hidden">
                        <button
                          onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                          className="w-full flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                        >
                          <span className="text-sm font-medium text-foreground">{category}</span>
                          <div className="flex items-center gap-2">
                            {categorySymptoms.some(s => selectedQuickSymptoms.includes(s)) && (
                              <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                                {categorySymptoms.filter(s => selectedQuickSymptoms.includes(s)).length}
                              </span>
                            )}
                            <ChevronDown className={cn(
                              "w-4 h-4 text-muted-foreground transition-transform duration-200",
                              expandedCategory === category && "rotate-180"
                            )} />
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedCategory === category && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="p-3 pt-0 flex flex-wrap gap-2">
                                {categorySymptoms.map((symptom) => (
                                  <button
                                    key={symptom}
                                    onClick={() => toggleQuickSymptom(symptom)}
                                    className={cn(
                                      "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border",
                                      selectedQuickSymptoms.includes(symptom)
                                        ? "bg-primary/20 border-primary text-primary shadow-sm shadow-primary/20"
                                        : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                    )}
                                  >
                                    {symptom}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Symptoms Summary */}
                {selectedQuickSymptoms.length > 0 && (
                  <div className="px-6 pb-6">
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-muted-foreground mb-2">Selected symptoms:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedQuickSymptoms.map((symptom) => (
                          <motion.span
                            key={symptom}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            {symptom}
                            <button
                              onClick={() => toggleQuickSymptom(symptom)}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Patient Info Card */}
              <motion.div
                className="rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-accent/10">
                    <User className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Your Profile</h2>
                    <p className="text-sm text-muted-foreground">Help us personalize recommendations</p>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Age */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                      <Calendar className="w-4 h-4 text-primary" />
                      Age
                      <span className="ml-auto text-primary font-semibold">{age} years</span>
                    </label>
                    <div className="relative">
                      <input
                        type="range"
                        min="1"
                        max="100"
                        value={age}
                        onChange={(e) => setAge(Number(e.target.value))}
                        className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>1</span>
                        <span>100</span>
                      </div>
                    </div>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-3">
                      <User className="w-4 h-4 text-primary" />
                      Gender
                    </label>
                    <div className="flex gap-2">
                      {["Male", "Female", "Other"].map((g) => (
                        <button
                          key={g}
                          onClick={() => setGender(g)}
                          className={cn(
                            "flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 border",
                            gender === g
                              ? "bg-primary/20 border-primary text-primary shadow-sm shadow-primary/20"
                              : "bg-muted/30 border-border/50 text-muted-foreground hover:border-primary/50"
                          )}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medical History Accordion */}
                <div className="mt-6 pt-6 border-t border-border/30">
                  <button
                    onClick={() => setShowMedicalHistory(!showMedicalHistory)}
                    className="w-full flex items-center justify-between text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Pill className="w-4 h-4" />
                      Medical History & Medications
                      {medications.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">
                          {medications.length}
                        </span>
                      )}
                    </span>
                    {showMedicalHistory ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  <AnimatePresence>
                    {showMedicalHistory && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          <div>
                            <label className="block text-sm text-muted-foreground mb-2">
                              Current Medications
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newMedication}
                                onChange={(e) => setNewMedication(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && addMedication()}
                                placeholder="Add medication..."
                                className="flex-1 bg-muted/30 border border-border/50 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
                              />
                              <Button
                                onClick={addMedication}
                                variant="outline"
                                size="icon"
                                className="rounded-xl border-primary/50 text-primary hover:bg-primary/10"
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            {medications.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {medications.map((med) => (
                                  <motion.span
                                    key={med}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                  >
                                    {med}
                                    <button
                                      onClick={() => removeMedication(med)}
                                      className="hover:text-destructive transition-colors"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </motion.span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Body Diagram */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="sticky top-24 rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border border-border/50 overflow-hidden">
                <div className="p-6 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-primary/10">
                        <Heart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">Body Map</h2>
                        <p className="text-sm text-muted-foreground">Click affected areas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
                      <button
                        onClick={() => setUse3DView(false)}
                        className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          !use3DView
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="2D View"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setUse3DView(true)}
                        className={cn(
                          "p-2 rounded-lg transition-all duration-200",
                          use3DView
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title="3D View"
                      >
                        <Box className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
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
                            <div className="h-[400px] flex items-center justify-center bg-muted/20 rounded-2xl">
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Selected Body Parts */}
                  {(selectedBodyParts.length > 0 || Object.keys(selectedBodyParts3D).length > 0) && (
                    <motion.div
                      className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-2xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <p className="text-xs text-muted-foreground mb-2">Selected areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {(use3DView ? Object.keys(selectedBodyParts3D) : selectedBodyParts).map((part) => (
                          <span
                            key={part}
                            className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium capitalize"
                          >
                            {part.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Fixed Analyze Button */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="container mx-auto max-w-xl">
          <Button
            onClick={handleAnalyze}
            disabled={!hasInput}
            className={cn(
              "w-full h-14 rounded-2xl text-lg font-semibold transition-all duration-300",
              hasInput
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
                : "bg-muted text-muted-foreground"
            )}
          >
            {isAnalyzing ? (
              <motion.span
                className="flex items-center gap-3"
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
                Find My Specialist
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SymptomAnalysis;
