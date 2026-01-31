/**
 * First-measures suggestions: calls a free LLM API (Groq) when API key is set,
 * otherwise returns rule-based fallback tips from symptom keywords.
 */

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

function getApiKey(): string | undefined {
  return import.meta.env.VITE_GROQ_API_KEY as string | undefined;
}

function buildSymptomSummary(symptomsText: string, quickSymptoms: string[]): string {
  const parts: string[] = [];
  if (symptomsText.trim()) parts.push(symptomsText.trim());
  if (quickSymptoms.length) parts.push(quickSymptoms.join(", "));
  return parts.length ? parts.join(". Selected symptoms: ") : "General wellness check.";
}

/**
 * Call Groq (free tier) to get first-measures suggestions. Returns null if no API key or on error.
 */
export async function getFirstMeasuresFromLLM(
  symptomsText: string,
  quickSymptoms: string[]
): Promise<{ text: string } | { error: string }> {
  const apiKey = getApiKey();
  if (!apiKey?.trim()) {
    return { error: "NO_API_KEY" };
  }

  const symptomSummary = buildSymptomSummary(symptomsText, quickSymptoms);
  const prompt = `You are a helpful health assistant. The user has reported these symptoms: "${symptomSummary}"

Give 4 to 5 brief, safety-first measures the person should take at home before seeing a doctor. Use simple language. If any symptom suggests an emergency (e.g. chest pain, severe shortness of breath), say so clearly first. Format as a short numbered list. Do not diagnose. Keep total response under 200 words.`;

  try {
    const res = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You give brief, safety-first at-home first measures. No diagnosis. Short numbered lists." },
          { role: "user", content: prompt },
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return { error: res.status === 401 ? "INVALID_API_KEY" : err || res.statusText };
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) return { error: "Empty response" };
    return { text: content };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Network error";
    return { error: message };
  }
}

/**
 * Rule-based fallback first measures when no LLM API key is set.
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
