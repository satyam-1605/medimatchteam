import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LANGUAGE_NAMES: Record<string, string> = {
  hi: 'Hindi (हिन्दी)',
  es: 'Spanish (Español)',
  bn: 'Bengali (বাংলা)',
  ta: 'Tamil (தமிழ்)',
  te: 'Telugu (తెలుగు)',
  mr: 'Marathi (मराठी)',
  kn: 'Kannada (ಕನ್ನಡ)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
};

/**
 * Remove markdown artifacts from AI text output.
 */
function cleanText(text: string): string {
  if (!text) return text;
  return text
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
    .replace(/#{1,6}\s*/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ''))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[_~]{1,2}([^_~]+)[_~]{1,2}/g, '$1')
    .replace(/\(\*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symptomsText, quickSymptoms, language } = await req.json();

    const langName = language && language !== 'en' ? LANGUAGE_NAMES[language] || language : null;
    const langInstruction = langName
      ? ` You MUST respond entirely in ${langName}. Do not use English.`
      : '';
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parts: string[] = [];
    if (symptomsText?.trim()) parts.push(symptomsText.trim());
    if (quickSymptoms?.length) parts.push(quickSymptoms.join(", "));
    const symptomSummary = parts.length ? parts.join(". Also: ") : "General wellness check.";

    const systemPrompt = `You are a health assistant that gives brief, safety-first at-home measures before a doctor visit.

RULES:
- Do NOT use any markdown formatting: no asterisks, no bold, no italic, no headers, no links.
- Write plain numbered steps only (e.g. "1. Rest and stay hydrated.").
- Do NOT diagnose. Only suggest safe home measures.
- If symptoms suggest an emergency (chest pain, severe breathing difficulty, stroke signs), state that clearly as step 1.
- Keep total response under 150 words.
- Use simple, easy-to-understand language.${langInstruction}`;

    const userPrompt = `The patient reports these symptoms: "${symptomSummary}"

Give 4 to 5 brief safety-first measures they should take at home before seeing a doctor.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 400,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Empty response from AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sanitize the output to remove any markdown artifacts
    const cleaned = cleanText(content);

    return new Response(
      JSON.stringify({ text: cleaned }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("First measures error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});