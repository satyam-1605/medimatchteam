import { supabase } from "@/integrations/supabase/client";

export interface BodyPartDetail {
  part: string;
  symptomType: string;
}

export interface SymptomAnalysisRequest {
  symptoms: string;
  quickSymptoms: string[];
  bodyParts: BodyPartDetail[];
  age: number;
  gender: string;
  medications: string[];
}

export interface SpecialistRecommendation {
  specialty: string;
  matchPercentage: number;
  reasoning: string;
  urgencyLevel: "low" | "moderate" | "high" | "emergency";
  conditions: string[];
}

export interface AIAnalysisResponse {
  primaryRecommendation: SpecialistRecommendation;
  alternatives: SpecialistRecommendation[];
  urgencyPercentage: number;
  emergencyFlags: string[];
  differentialDiagnosis: string[];
  nextSteps: string[];
  ageSpecificConsiderations: string;
  genderSpecificConsiderations: string;
}

export async function analyzeSymptoms(
  request: SymptomAnalysisRequest
): Promise<AIAnalysisResponse> {
  console.log("Sending symptom analysis request:", request);

  const { data, error } = await supabase.functions.invoke("analyze-symptoms", {
    body: request,
  });

  if (error) {
    console.error("Error calling analyze-symptoms function:", error);
    throw new Error(error.message || "Failed to analyze symptoms");
  }

  if (!data) {
    throw new Error("No data returned from analysis");
  }

  // Check if the response contains an error
  if (data.error) {
    console.error("AI analysis error:", data.error, data.details || data.message);
    throw new Error(data.error);
  }

  console.log("AI analysis response:", data);
  return data as AIAnalysisResponse;
}
