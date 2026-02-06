/**
 * First-measures suggestions: calls Lovable AI via edge function,
 * with rule-based fallback tips when API fails.
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Call edge function to get AI-powered first-measures suggestions.
 * Falls back gracefully on any error.
 */
export async function getFirstMeasuresFromLLM(
  symptomsText: string,
  quickSymptoms: string[]
): Promise<{ text: string } | { error: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("first-measures", {
      body: { symptomsText, quickSymptoms },
    });

    if (error) {
      console.warn("[FirstMeasures] Edge function error:", error.message);
      return { error: error.message };
    }

    if (data?.error) {
      console.warn("[FirstMeasures] API returned error:", data.error);
      return { error: data.error };
    }

    if (data?.text) {
      return { text: data.text };
    }

    return { error: "No response from AI" };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    console.warn("[FirstMeasures] Fetch error:", message);
    return { error: message };
  }
}

/**
 * Rule-based fallback first measures when AI is unavailable.
 * Uses symptom keywords to suggest generic, safety-first tips.
 */
export function getFallbackFirstMeasures(
  symptomsText: string,
  quickSymptoms: string[]
): string {
  const text = `${(symptomsText || "").toLowerCase()} ${(quickSymptoms || []).join(" ").toLowerCase()}`;
  const tips: string[] = [];

  if (/\b(chest pain|shortness of breath|severe pain)\b/.test(text)) {
    tips.push("If chest pain or severe shortness of breath is present, seek emergency care or call local emergency number.");
  }
  if (/\b(fever|fatigue|tired)\b/.test(text)) {
    tips.push("Rest and stay hydrated. Monitor temperature; if high or prolonged, see a doctor.");
  }
  if (/\b(joint pain|morning stiffness|arthritis)\b/.test(text)) {
    tips.push("Avoid strenuous activity on affected joints. Gentle movement may help stiffness. Apply warmth if it eases pain.");
  }
  if (/\b(headache|dizziness|numbness|tingling)\b/.test(text)) {
    tips.push("Rest in a quiet, dim room. Avoid driving or operating machinery until symptoms improve.");
  }
  if (/\b(cough|shortness of breath)\b/.test(text)) {
    tips.push("Stay hydrated, avoid smoke and dust. If breathing difficulty worsens, seek medical help.");
  }
  if (/\b(nausea|abdominal pain|stomach)\b/.test(text)) {
    tips.push("Eat light, bland foods. Sip fluids. Avoid heavy or spicy meals until symptoms ease.");
  }
  if (/\b(injury|swelling|sprain)\b/.test(text)) {
    tips.push("Rest, ice, compress, and elevate (RICE) the affected area. Avoid putting weight on it if severe.");
  }
  if (/\b(skin rash|itching)\b/.test(text)) {
    tips.push("Keep the area clean and dry. Avoid scratching. Consider an over-the-counter antihistamine if appropriate.");
  }
  if (/\b(anxiety|low mood|sleep)\b/.test(text)) {
    tips.push("Maintain a regular sleep schedule. Limit caffeine and screens before bed. Reach out to someone you trust.");
  }

  if (tips.length === 0) {
    tips.push("Rest and stay hydrated.");
    tips.push("Note down when symptoms started and what makes them better or worse for your doctor.");
    tips.push("If symptoms worsen or new ones appear, contact a healthcare provider.");
  }

  tips.push("These are general tips only. Always consult a doctor for proper diagnosis and treatment.");
  return tips.map((t, i) => `${i + 1}. ${t}`).join("\n\n");
}
