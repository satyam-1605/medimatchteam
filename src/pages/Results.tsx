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
  Wind,
  Ear,
  Moon,
  FlaskConical,
  Scale,
  Droplets,
  Smile,
  Dumbbell,
  Sparkles,
  Pill,
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Crown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import ParticleBackground from "@/components/ui/ParticleBackground";
import GlowButton from "@/components/ui/GlowButton";
import UrgencyMeter from "@/components/results/UrgencyMeter";
import SpecialistCard from "@/components/results/SpecialistCard";
import ReasoningDisplay from "@/components/results/ReasoningDisplay";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getFirstMeasuresFromLLM, getFallbackFirstMeasures } from "@/services/firstMeasuresApi";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Specialist config: icon, specialty, description (broad + niche)
const SPECIALIST_CONFIG: Record<
  string,
  { icon: LucideIcon; specialty: string; description: string }
> = {
  Rheumatologist: {
    icon: Bone,
    specialty: "Rheumatologist",
    description:
      "Joint pain and morning stiffness suggest musculoskeletal or autoimmune conditions. A rheumatologist specializes in arthritis, lupus, and similar disorders.",
  },
  Cardiologist: {
    icon: Heart,
    specialty: "Cardiologist",
    description:
      "Chest pain or heart palpitations warrant a heart evaluation. A cardiologist specializes in cardiovascular conditions and can rule out serious causes.",
  },
  Neurologist: {
    icon: Brain,
    specialty: "Neurologist",
    description:
      "Headache, numbness, tingling, or dizziness can point to nervous system involvement. A neurologist specializes in brain, spine, and nerve disorders.",
  },
  Pulmonologist: {
    icon: Wind,
    specialty: "Pulmonologist",
    description:
      "Cough or shortness of breath suggests respiratory involvement. A pulmonologist specializes in lungs and breathing disorders.",
  },
  "Sports Medicine": {
    icon: Dumbbell,
    specialty: "Sports Medicine",
    description:
      "Injury with muscle pain often benefits from sports medicine. This niche specialty focuses on exercise-related injuries and recovery.",
  },
  Orthopedic: {
    icon: Bone,
    specialty: "Orthopedic",
    description:
      "Injury or swelling may involve bones, joints, or soft tissue. An orthopedic specialist can evaluate and recommend treatment.",
  },
  Gastroenterologist: {
    icon: Pill,
    specialty: "Gastroenterologist",
    description:
      "Nausea or abdominal pain suggests digestive system involvement. A gastroenterologist specializes in gut, liver, and digestive disorders.",
  },
  Dermatologist: {
    icon: Sparkles,
    specialty: "Dermatologist",
    description:
      "Skin rash or itching points to skin conditions. A dermatologist specializes in skin, hair, and nail disorders.",
  },
  Ophthalmologist: {
    icon: Eye,
    specialty: "Ophthalmologist",
    description:
      "Eye pain or blurred vision warrants an eye exam. An ophthalmologist specializes in vision and eye diseases.",
  },
  ENT: {
    icon: Ear,
    specialty: "ENT (Otolaryngologist)",
    description:
      "Sore throat or ear pain suggests ear, nose, or throat involvement. An ENT specialist treats conditions in these areas.",
  },
  Allergist: {
    icon: Wind,
    specialty: "Allergist / Immunologist",
    description:
      "Allergies or sneezing may need allergy testing and management. An allergist specializes in allergic and immune conditions.",
  },
  Psychiatrist: {
    icon: Smile,
    specialty: "Psychiatrist",
    description:
      "Anxiety or low mood can benefit from mental health evaluation. A psychiatrist specializes in emotional and behavioral health.",
  },
  "Sleep Specialist": {
    icon: Moon,
    specialty: "Sleep Specialist",
    description:
      "Sleep problems affect overall health. A sleep specialist evaluates sleep disorders and can recommend testing or treatment.",
  },
  Physiatrist: {
    icon: Activity,
    specialty: "Physiatrist (PM&R)",
    description:
      "Back pain or muscle pain often benefits from rehabilitation. A physiatrist specializes in physical medicine and rehabilitation.",
  },
  "Infectious Disease": {
    icon: FlaskConical,
    specialty: "Infectious Disease Specialist",
    description:
      "Prolonged fever with respiratory symptoms may need infectious disease evaluation. This niche specialty focuses on complex infections.",
  },
  Urologist: {
    icon: Droplets,
    specialty: "Urologist",
    description:
      "Urinary issues warrant a urology evaluation. A urologist specializes in urinary tract and related conditions.",
  },
  Endocrinologist: {
    icon: Scale,
    specialty: "Endocrinologist",
    description:
      "Weight changes or excessive thirst can signal hormone or metabolic issues. An endocrinologist specializes in diabetes, thyroid, and hormones.",
  },
  "Pain Management": {
    icon: Activity,
    specialty: "Pain Management Specialist",
    description:
      "Chronic pain may benefit from a pain specialist. This niche focuses on comprehensive pain evaluation and treatment.",
  },
  "General Physician": {
    icon: Stethoscope,
    specialty: "General Physician",
    description:
      "Fever, fatigue, or general symptoms are a good fit for a general physician. They can provide initial evaluation and refer to a specialist if needed.",
  },
};

const ALL_SPECIALIST_KEYS = Object.keys(SPECIALIST_CONFIG);

// Conditions typically treated by each specialist (for scheme coverage display).
// Used to show e.g. "rheumatoid arthritis for Rheumatologist → covered under Ayushman Bharat".
const SPECIALIST_CONDITIONS: Record<string, string[]> = {
  Rheumatologist: ["rheumatoid arthritis", "osteoarthritis", "lupus", "joint disorders", "ankylosing spondylitis"],
  Cardiologist: ["heart disease", "hypertension", "arrhythmia", "heart failure", "angina"],
  Neurologist: ["migraine", "epilepsy", "stroke", "neuropathy", "multiple sclerosis", "Parkinson's"],
  Pulmonologist: ["asthma", "COPD", "pneumonia", "bronchitis", "sleep apnea"],
  "Sports Medicine": ["sports injuries", "muscle strains", "ligament tears", "rehabilitation"],
  Orthopedic: ["fractures", "joint replacement", "arthritis", "tendonitis", "back and joint pain"],
  Gastroenterologist: ["IBS", "GERD", "liver disease", "inflammatory bowel disease", "digestive disorders"],
  Dermatologist: ["skin infections", "eczema", "psoriasis", "acne", "skin cancer screening"],
  Ophthalmologist: ["cataract", "glaucoma", "diabetic retinopathy", "vision disorders"],
  ENT: ["sinusitis", "hearing loss", "tonsillitis", "ear infections", "sleep apnea"],
  Allergist: ["allergic rhinitis", "asthma", "food allergies", "eczema", "anaphylaxis"],
  Psychiatrist: ["depression", "anxiety", "bipolar disorder", "PTSD", "schizophrenia"],
  "Sleep Specialist": ["insomnia", "sleep apnea", "narcolepsy", "restless leg syndrome"],
  Physiatrist: ["chronic pain", "rehabilitation", "spinal cord injury", "stroke rehabilitation"],
  "Infectious Disease": ["tuberculosis", "HIV", "hepatitis", "complex infections", "travel medicine"],
  Urologist: ["kidney stones", "UTI", "benign prostate enlargement", "urological cancers"],
  Endocrinologist: ["diabetes", "thyroid disorders", "hormone imbalances", "osteoporosis"],
  "Pain Management": ["chronic pain", "fibromyalgia", "neuropathic pain", "cancer pain"],
  "General Physician": ["general health check-up", "fever", "infections", "chronic disease management"],
};

// Government health schemes: coverage is mapped by specialist (conditions treated by that specialist are typically covered).
const GOVERNMENT_SCHEMES = [
  {
    id: "ayushman-bharat",
    name: "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana",
    shortName: "AB-PMJAY",
    description: "National health protection scheme providing cashless coverage for secondary and tertiary care hospitalization.",
    eligibilitySummary: "Eligible families (based on SECC) get coverage of ₹5 lakh per family per year. Check your eligibility on the official portal.",
    coveredSpecialists: [
      "Rheumatologist",
      "Cardiologist",
      "Neurologist",
      "Pulmonologist",
      "Orthopedic",
      "Gastroenterologist",
      "Dermatologist",
      "Ophthalmologist",
      "ENT",
      "Urologist",
      "Psychiatrist",
      "Infectious Disease",
      "General Physician",
      "Sports Medicine",
      "Physiatrist",
      "Pain Management",
      "Endocrinologist",
      "Allergist",
      "Sleep Specialist",
    ],
    officialUrl: "https://pmjay.gov.in",
  },
  {
    id: "cghs",
    name: "Central Government Health Scheme",
    shortName: "CGHS",
    description: "Health coverage for central government employees and pensioners including OPD and hospitalization.",
    eligibilitySummary: "Central govt. employees, pensioners, and their dependents. Coverage includes specialist consultations and procedures.",
    coveredSpecialists: [
      "Rheumatologist",
      "Cardiologist",
      "Neurologist",
      "Pulmonologist",
      "Orthopedic",
      "Gastroenterologist",
      "Dermatologist",
      "Ophthalmologist",
      "ENT",
      "Urologist",
      "Psychiatrist",
      "Endocrinologist",
      "General Physician",
      "Physiatrist",
      "Pain Management",
      "Allergist",
      "Sleep Specialist",
      "Infectious Disease",
      "Sports Medicine",
    ],
    officialUrl: "https://cghs.gov.in",
  },
  {
    id: "state-schemes",
    name: "State Health Insurance Schemes",
    shortName: "State schemes",
    description: "Various state-run health insurance schemes (e.g. MJPJAY, YSR Aarogyasri) offering coverage for hospitalization and surgeries.",
    eligibilitySummary: "Eligibility varies by state. Often covers BPL and other defined categories. Check your state health department.",
    coveredSpecialists: [
      "Rheumatologist",
      "Cardiologist",
      "Neurologist",
      "Pulmonologist",
      "Orthopedic",
      "Gastroenterologist",
      "Ophthalmologist",
      "ENT",
      "Urologist",
      "General Physician",
      "Infectious Disease",
    ],
    officialUrl: null,
  },
];

type GovernmentScheme = (typeof GOVERNMENT_SCHEMES)[number];

function getSchemesForSpecialist(specialistKey: string): GovernmentScheme[] {
  return GOVERNMENT_SCHEMES.filter((scheme) =>
    scheme.coveredSpecialists.includes(specialistKey)
  );
}

// Synonyms for text-area extraction: free-text phrases that map to canonical symptom keywords.
// Enables matching when users describe symptoms in their own words (e.g. "tired" → fatigue).
const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  "joint pain": ["joint pain", "joint ache", "achy joints", "sore joints", "joint stiffness", "arthritis"],
  "morning stiffness": ["morning stiffness", "stiff in the morning", "stiff when i wake", "hard to move in morning"],
  "chest pain": ["chest pain", "chest tightness", "chest discomfort", "pressure in chest", "chest pressure"],
  "heart palpitations": ["heart palpitations", "palpitations", "heart racing", "pounding heart", "heart fluttering", "irregular heartbeat"],
  "headache": ["headache", "head pain", "head hurts", "migraine", "head pressure"],
  "numbness": ["numbness", "numb", "loss of sensation", "no feeling"],
  "tingling": ["tingling", "pins and needles", "prickling", "tingly"],
  "dizziness": ["dizziness", "dizzy", "lightheaded", "light-headed", "vertigo", "off balance"],
  "cough": ["cough", "coughing", "hacking", "dry cough", "wet cough"],
  "shortness of breath": ["shortness of breath", "short of breath", "hard to breathe", "breathless", "difficulty breathing", "can't catch my breath", "wheezing"],
  "injury": ["injury", "injured", "hurt myself", "sprain", "strain", "twisted", "pulled muscle", "bruise", "fell"],
  "swelling": ["swelling", "swollen", "puffy", "inflammation", "inflamed", "puffiness"],
  "nausea": ["nausea", "nauseous", "queasy", "sick to stomach", "feel like vomiting", "upset stomach"],
  "abdominal pain": ["abdominal pain", "stomach pain", "stomach ache", "belly pain", "tummy pain", "gut pain", "cramping", "stomach cramps"],
  "skin rash": ["skin rash", "rash", "red skin", "skin red", "breakout", "hives", "patches on skin"],
  "itching": ["itching", "itchy", "itch", "pruritus", "scratching"],
  "eye pain": ["eye pain", "eyes hurt", "sore eyes", "eye strain", "pain in eye"],
  "blurred vision": ["blurred vision", "blurry vision", "blurred", "can't see well", "vision blurry", "double vision"],
  "sore throat": ["sore throat", "throat pain", "throat hurts", "scratchy throat", "painful swallowing"],
  "ear pain": ["ear pain", "earache", "ear hurts", "ear infection", "pain in ear"],
  "allergies": ["allergies", "allergic", "allergy", "runny nose", "itchy eyes", "watery eyes", "congestion"],
  "sneezing": ["sneezing", "sneeze", "sneezing a lot"],
  "anxiety": ["anxiety", "anxious", "worried", "nervous", "panic", "stressed", "on edge"],
  "low mood": ["low mood", "depressed", "depression", "sad", "down", "blue", "hopeless", "no interest"],
  "sleep problems": ["sleep problems", "can't sleep", "insomnia", "sleepless", "trouble sleeping", "wake at night", "poor sleep", "exhausted but can't sleep"],
  "back pain": ["back pain", "backache", "lower back pain", "upper back pain", "spine pain", "back hurts"],
  "fever": ["fever", "feverish", "high temperature", "running a temperature", "chills", "hot and cold"],
  "fatigue": ["fatigue", "tired", "tiredness", "exhausted", "exhaustion", "low energy", "no energy", "weak", "run down", "worn out"],
  "urinary issues": ["urinary issues", "painful urination", "burning when urinating", "frequent urination", "urgency", "blood in urine", "pee pain", "urination pain"],
  "weight changes": ["weight changes", "weight gain", "weight loss", "gaining weight", "losing weight", "unexplained weight"],
  "excessive thirst": ["excessive thirst", "very thirsty", "thirsty all the time", "increased thirst", "constant thirst", "dry mouth"],
  "muscle pain": ["muscle pain", "muscle ache", "sore muscles", "muscle soreness", "achy muscles", "myalgia"],
};

// Symptoms that "support" each specialist — used to compute match percentage (how many of these the user has).
const SPECIALIST_SYMPTOMS: Record<string, string[]> = {
  Rheumatologist: ["joint pain", "morning stiffness"],
  Cardiologist: ["chest pain", "heart palpitations"],
  Neurologist: ["headache", "numbness", "tingling", "dizziness"],
  Pulmonologist: ["cough", "shortness of breath"],
  "Sports Medicine": ["injury", "muscle pain"],
  Orthopedic: ["injury", "swelling"],
  Gastroenterologist: ["nausea", "abdominal pain"],
  Dermatologist: ["skin rash", "itching"],
  Ophthalmologist: ["eye pain", "blurred vision"],
  ENT: ["sore throat", "ear pain"],
  Allergist: ["allergies", "sneezing"],
  Psychiatrist: ["anxiety", "low mood"],
  "Sleep Specialist": ["sleep problems"],
  Physiatrist: ["back pain", "muscle pain"],
  "Infectious Disease": ["fever", "cough"],
  Urologist: ["urinary issues"],
  Endocrinologist: ["weight changes", "excessive thirst"],
  "Pain Management": ["back pain", "muscle pain", "joint pain"],
  "General Physician": ["fever", "fatigue"],
};

// Rule-based recommendation logic: every listed symptom maps to at least one specialist.
// Uses both quick-select symptoms and extracted text (including synonyms) from the description area.
// Match percentage is derived from how many of that specialist's symptoms are present.
function getRecommendationFromSymptoms(
  symptomsText: string,
  quickSymptomsList: string[]
): {
  primaryRecommendation: { icon: LucideIcon; specialty: string; matchPercentage: number; description: string };
  primarySpecialtyKey: string;
  alternatives: Array<{ icon: LucideIcon; specialty: string; matchPercentage: number; description: string }>;
  reasoning: string[];
  urgency: "low" | "moderate" | "high";
  urgencyPercentage: number;
} {
  const rawText = (symptomsText || "").trim();
  const text = rawText.toLowerCase();
  const quick = quickSymptomsList || [];

  // Normalize quick-select labels to canonical keywords (e.g. "Chest Pain" -> "chest pain")
  const quickNormalized = new Set(quick.map((s) => s.toLowerCase().replace(/\s+/g, " ").trim()));

  const has = (keyword: string): boolean => {
    const k = keyword.toLowerCase();
    if (quickNormalized.has(k)) return true;
    if (text.includes(k)) return true;
    const synonyms = SYMPTOM_SYNONYMS[k];
    if (synonyms) {
      for (const syn of synonyms) {
        if (text.includes(syn.toLowerCase())) return true;
      }
    }
    return false;
  };

  // Count how many of a specialist's symptoms the user has (from quick-select + text area + synonyms).
  const countMatchedSymptoms = (specialistKey: string): number => {
    const symptoms = SPECIALIST_SYMPTOMS[specialistKey];
    if (!symptoms) return 0;
    let count = 0;
    for (const s of symptoms) {
      if (has(s)) count++;
    }
    if (specialistKey === "Pain Management" && text.includes("chronic")) count += 1;
    return count;
  };

  // Match percentage from symptom overlap: base + (matched / total) * range. Primary gets a small bonus.
  const getMatchPercentage = (specialistKey: string, isPrimary: boolean): number => {
    const symptoms = SPECIALIST_SYMPTOMS[specialistKey];
    const total = specialistKey === "Pain Management" ? 4 : (symptoms?.length ?? 1);
    const matched = countMatchedSymptoms(specialistKey);
    const ratio = total > 0 ? matched / total : 0;
    const base = isPrimary ? 78 : 50;
    const range = isPrimary ? 22 : 45;
    return Math.min(99, Math.max(40, Math.round(base + ratio * range)));
  };

  const matched: string[] = [];
  const add = (key: string) => { if (!matched.includes(key)) matched.push(key); };

  // 1. Joint pain + morning stiffness → Rheumatologist
  if (has("joint pain") && has("morning stiffness")) add("Rheumatologist");
  // 2. Chest pain / heart palpitations → Cardiologist
  if (has("chest pain") || has("heart palpitations")) add("Cardiologist");
  // 3. Headache + (numbness or tingling) → Neurologist
  if (has("headache") && (has("numbness") || has("tingling"))) add("Neurologist");
  // 4. Cough / shortness of breath → Pulmonologist
  if (has("cough") || has("shortness of breath")) add("Pulmonologist");
  // 5. Injury + muscle pain → Sports Medicine (niche)
  if (has("injury") && has("muscle pain")) add("Sports Medicine");
  // 6. Injury / swelling → Orthopedic
  if (has("injury") || has("swelling")) add("Orthopedic");
  // 7. Nausea / abdominal pain → Gastroenterologist
  if (has("nausea") || has("abdominal pain")) add("Gastroenterologist");
  // 8. Skin rash / itching → Dermatologist
  if (has("skin rash") || has("itching")) add("Dermatologist");
  // 9. Eye pain / blurred vision → Ophthalmologist
  if (has("eye pain") || has("blurred vision")) add("Ophthalmologist");
  // 10. Sore throat / ear pain → ENT
  if (has("sore throat") || has("ear pain")) add("ENT");
  // 11. Allergies / sneezing → Allergist
  if (has("allergies") || has("sneezing")) add("Allergist");
  // 12. Anxiety / low mood → Psychiatrist
  if (has("anxiety") || has("low mood")) add("Psychiatrist");
  // 13. Sleep problems → Sleep Specialist
  if (has("sleep problems")) add("Sleep Specialist");
  // 14. Back pain → Physiatrist
  if (has("back pain")) add("Physiatrist");
  // 15. Dizziness → Neurologist
  if (has("dizziness")) add("Neurologist");
  // 16. Numbness / tingling → Neurologist
  if (has("numbness") || has("tingling")) add("Neurologist");
  // 17. Fever + cough → Infectious Disease (niche)
  if (has("fever") && has("cough")) add("Infectious Disease");
  // 18. Fever / fatigue → General Physician
  if (has("fever") || has("fatigue")) add("General Physician");
  // 19. Urinary issues → Urologist
  if (has("urinary issues")) add("Urologist");
  // 20. Weight changes / excessive thirst → Endocrinologist
  if (has("weight changes") || has("excessive thirst")) add("Endocrinologist");
  // 21. Muscle pain → Physiatrist
  if (has("muscle pain")) add("Physiatrist");
  // 22. Chronic + pain in text → Pain Management (niche)
  if (text.includes("chronic") && (has("back pain") || has("muscle pain") || has("joint pain"))) add("Pain Management");

  const primaryKey = matched[0] || "General Physician";
  const primaryConfig = SPECIALIST_CONFIG[primaryKey];
  const reasoning: string[] = [];

  if (matched.length === 0) {
    reasoning.push("No specific symptom rule matched; a General Physician is recommended for initial evaluation.");
  } else {
    if (primaryKey === "Rheumatologist")
      reasoning.push("Joint pain with morning stiffness suggests a rheumatology evaluation.");
    if (primaryKey === "Cardiologist")
      reasoning.push("Chest pain or palpitations warrant a cardiology evaluation.");
    if (primaryKey === "Neurologist")
      reasoning.push("Your symptoms suggest neurological involvement; a neurologist can evaluate further.");
    if (primaryKey === "Pulmonologist")
      reasoning.push("Respiratory symptoms point to a pulmonology evaluation.");
    if (primaryKey === "Sports Medicine")
      reasoning.push("Injury with muscle pain often benefits from sports medicine.");
    if (primaryKey === "Orthopedic")
      reasoning.push("Injury or swelling indicates an orthopedic assessment may be appropriate.");
    if (primaryKey === "Gastroenterologist")
      reasoning.push("Digestive symptoms suggest a gastroenterology evaluation.");
    if (primaryKey === "Dermatologist")
      reasoning.push("Skin symptoms point to a dermatology evaluation.");
    if (primaryKey === "Ophthalmologist")
      reasoning.push("Eye symptoms warrant an ophthalmology evaluation.");
    if (primaryKey === "ENT")
      reasoning.push("Ear, nose, or throat symptoms suggest an ENT evaluation.");
    if (primaryKey === "Allergist")
      reasoning.push("Allergy-related symptoms may need an allergist.");
    if (primaryKey === "Psychiatrist")
      reasoning.push("Mood or anxiety symptoms can benefit from psychiatric evaluation.");
    if (primaryKey === "Sleep Specialist")
      reasoning.push("Sleep issues are best evaluated by a sleep specialist.");
    if (primaryKey === "Physiatrist")
      reasoning.push("Pain or mobility issues often benefit from physiatry (rehabilitation).");
    if (primaryKey === "Infectious Disease")
      reasoning.push("Fever with respiratory symptoms may need infectious disease evaluation.");
    if (primaryKey === "Urologist")
      reasoning.push("Urinary symptoms warrant a urology evaluation.");
    if (primaryKey === "Endocrinologist")
      reasoning.push("Weight or thirst changes can signal hormonal or metabolic evaluation.");
    if (primaryKey === "Pain Management")
      reasoning.push("Chronic pain may benefit from a pain management specialist.");
    if (primaryKey === "General Physician")
      reasoning.push("A general physician can provide initial evaluation and refer if needed.");
    reasoning.push("Your symptom profile was matched using rule-based logic to suggest the most relevant specialist.");
    if (matched.length > 1)
      reasoning.push(`Other possible matches: ${matched.slice(1, 4).join(", ")}. Consider discussing with your doctor.`);
  }

  const otherMatched = matched.slice(1);
  const pool = ALL_SPECIALIST_KEYS.filter((s) => s !== primaryKey);
  const altKeys = [...otherMatched, ...pool.filter((s) => !matched.includes(s))].slice(0, 4);
  const alternativesList = altKeys.map((key) => {
    const c = SPECIALIST_CONFIG[key];
    if (!c) return null;
    return {
      icon: c.icon,
      specialty: c.specialty,
      matchPercentage: getMatchPercentage(key, false),
      description: c.description,
    };
  }).filter(Boolean) as Array<{ icon: LucideIcon; specialty: string; matchPercentage: number; description: string }>;

  const urgency: "low" | "moderate" | "high" = has("chest pain") || has("shortness of breath") ? "high" : matched.length > 0 ? "moderate" : "low";
  const urgencyPercentage = urgency === "high" ? 85 : urgency === "moderate" ? 60 : 40;

  return {
    primaryRecommendation: {
      icon: primaryConfig.icon,
      specialty: primaryConfig.specialty,
      matchPercentage: getMatchPercentage(primaryKey, true),
      description: primaryConfig.description,
    },
    primarySpecialtyKey: primaryKey,
    alternatives: alternativesList,
    reasoning,
    urgency,
    urgencyPercentage,
  };
}

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [firstMeasures, setFirstMeasures] = useState<string | null>(null);
  const [firstMeasuresLoading, setFirstMeasuresLoading] = useState(true);
  const [firstMeasuresFromAI, setFirstMeasuresFromAI] = useState(false);
  const [talkToNurseOpen, setTalkToNurseOpen] = useState(false);

  const state = location.state as { symptoms?: string; quickSymptoms?: string[] } | null;
  const symptomsText = state?.symptoms ?? "";
  const quickSymptomsList = state?.quickSymptoms ?? [];
  const results = getRecommendationFromSymptoms(symptomsText, quickSymptomsList);

  useEffect(() => {
    let cancelled = false;
    setFirstMeasuresLoading(true);
    getFirstMeasuresFromLLM(symptomsText, quickSymptomsList).then((out) => {
      if (cancelled) return;
      if ("text" in out) {
        setFirstMeasures(out.text);
        setFirstMeasuresFromAI(true);
      } else {
        setFirstMeasures(getFallbackFirstMeasures(symptomsText, quickSymptomsList));
        setFirstMeasuresFromAI(false);
      }
      setFirstMeasuresLoading(false);
    });
    return () => { cancelled = true; };
  }, [symptomsText, quickSymptomsList]);

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
                    level={results.urgency}
                    percentage={results.urgencyPercentage}
                  />
                  <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Urgency Assessment
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      {results.urgency === "high"
                        ? "Your symptoms suggest a higher priority. We recommend seeking evaluation soon or visiting urgent care if needed."
                        : results.urgency === "moderate"
                        ? "Your symptoms suggest a moderate priority level. We recommend scheduling an appointment within the next few days for proper evaluation."
                        : "Your symptoms suggest a lower urgency. Consider scheduling a routine appointment when convenient."}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        results.urgency === "high" ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"
                      }`}>
                        {results.urgency === "high" ? "Higher Priority" : "Not Emergency"}
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
                  icon={results.primaryRecommendation.icon}
                  specialty={results.primaryRecommendation.specialty}
                  matchPercentage={results.primaryRecommendation.matchPercentage}
                  description={results.primaryRecommendation.description}
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
                  {results.alternatives.slice(0, 4).map((alt, index) => (
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

              {/* Government Schemes & Coverage */}
              {(() => {
                const schemes = getSchemesForSpecialist(results.primarySpecialtyKey);
                const conditions = SPECIALIST_CONDITIONS[results.primarySpecialtyKey] ?? [];
                const conditionExamples = conditions.slice(0, 3).join(", ");
                if (schemes.length === 0) return null;
                return (
                  <motion.div
                    className="glass-panel p-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      Government Schemes & Coverage
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      For your recommended specialist ({results.primaryRecommendation.specialty}), conditions such as{" "}
                      <span className="text-foreground font-medium">{conditionExamples}</span>
                      {conditions.length > 3 ? ` and others` : ""} are typically covered under the following schemes. Check eligibility on official portals.
                    </p>
                    <div className="space-y-4">
                      {schemes.map((scheme) => (
                        <div
                          key={scheme.id}
                          className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-2"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-semibold text-foreground">{scheme.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-success/20 text-success text-xs font-medium">
                              Covered
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{scheme.description}</p>
                          <p className="text-xs text-muted-foreground">
                            <strong>Eligibility:</strong> {scheme.eligibilitySummary}
                          </p>
                          {scheme.officialUrl && (
                            <a
                              href={scheme.officialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                            >
                              Check eligibility <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* First measures (LLM or fallback) */}
              <motion.div
                className="glass-panel p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  First measures to take
                  {firstMeasuresFromAI && (
                    <span className="text-xs font-normal text-primary/80">(AI suggestions)</span>
                  )}
                </h3>
                {firstMeasuresLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded bg-muted animate-pulse" />
                    <div className="h-3 w-4/5 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                  </div>
                ) : firstMeasures ? (
                  <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                    {firstMeasures}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Rest and stay hydrated. If symptoms worsen, see a doctor.
                  </p>
                )}
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
                <ReasoningDisplay reasons={results.reasoning} />
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

                <motion.button
                  onClick={() => setTalkToNurseOpen(true)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all"
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5" />
                    <span className="font-medium">Talk to Nurse</span>
                  </div>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

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

      {/* Talk to Nurse — Buy Premium dialog */}
      <Dialog open={talkToNurseOpen} onOpenChange={setTalkToNurseOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Talk to a Nurse
            </DialogTitle>
            <DialogDescription>
              Get personalized guidance from a qualified nurse based on your symptoms. Available 24/7 with Premium.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Premium feature</p>
                <p className="text-sm text-muted-foreground">
                  Unlock one-on-one chat or video call with a nurse to discuss your symptoms and next steps.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setTalkToNurseOpen(false);
                alert("Premium checkout would open here. (Demo)");
              }}
              className="w-full py-3 px-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              Buy Premium to Talk to Nurse
            </button>
            <p className="text-xs text-center text-muted-foreground">
              Cancel anytime. Terms apply.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Results;
