import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SymptomAnalysisRequest {
  symptoms: string;
  quickSymptoms: string[];
  bodyParts: Array<{ part: string; symptomType: string }>;
  age: number;
  gender: string;
  medications: string[];
  language?: string;
}

interface SpecialistRecommendation {
  specialty: string;
  matchPercentage: number;
  reasoning: string;
  urgencyLevel: "low" | "moderate" | "high" | "emergency";
  conditions: string[];
}

interface AnalysisResponse {
  primaryRecommendation: SpecialistRecommendation;
  alternatives: SpecialistRecommendation[];
  urgencyPercentage: number;
  emergencyFlags: string[];
  differentialDiagnosis: string[];
  nextSteps: string[];
  ageSpecificConsiderations: string;
  genderSpecificConsiderations: string;
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: SymptomAnalysisRequest = await req.json();
    console.log('Received symptom analysis request:', JSON.stringify(requestData, null, 2));

    const { symptoms, quickSymptoms, bodyParts, age, gender, medications, language } = requestData;

    const systemPrompt = buildSystemPrompt(language);
    const userPrompt = buildUserPrompt(symptoms, quickSymptoms, bodyParts, age, gender, medications);

    console.log('Sending request to Lovable AI Gateway...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Lovable AI Gateway response received');

    const textContent = data.choices?.[0]?.message?.content;
    
    if (!textContent) {
      console.error('No text content in AI response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const analysisResult = parseAIResponse(textContent, age, gender);
    
    // Sanitize all string fields to remove markdown artifacts
    const sanitized = sanitizeAnalysisResponse(analysisResult);
    
    console.log('Analysis complete');

    return new Response(
      JSON.stringify(sanitized),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-symptoms function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Remove markdown artifacts, asterisks, and other formatting noise from text.
 */
function cleanText(text: string): string {
  if (!text) return text;
  return text
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')  // **bold**, *italic*, ***both***
    .replace(/#{1,6}\s*/g, '')                   // # headers
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) => m.replace(/`/g, ''))  // inline code
    .replace(/^\s*[-*+]\s+/gm, '')               // bullet points
    .replace(/^\s*\d+\.\s+/gm, '')               // numbered lists
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')     // [links](url)
    .replace(/[_~]{1,2}([^_~]+)[_~]{1,2}/g, '$1') // __underline__, ~~strike~~
    .replace(/\(\*\)/g, '')                       // (*) artifacts
    .replace(/\s{2,}/g, ' ')                      // collapse extra spaces
    .trim();
}

function sanitizeAnalysisResponse(response: AnalysisResponse): AnalysisResponse {
  const cleanRec = (rec: SpecialistRecommendation): SpecialistRecommendation => ({
    ...rec,
    specialty: cleanText(rec.specialty),
    reasoning: cleanText(rec.reasoning),
    conditions: rec.conditions.map(cleanText),
  });

  return {
    ...response,
    primaryRecommendation: cleanRec(response.primaryRecommendation),
    alternatives: response.alternatives.map(cleanRec),
    emergencyFlags: response.emergencyFlags.map(cleanText),
    differentialDiagnosis: response.differentialDiagnosis.map(cleanText),
    nextSteps: response.nextSteps.map(cleanText),
    ageSpecificConsiderations: cleanText(response.ageSpecificConsiderations),
    genderSpecificConsiderations: cleanText(response.genderSpecificConsiderations),
  };
}

function buildSystemPrompt(language?: string): string {
  const langName = language && language !== 'en' ? LANGUAGE_NAMES[language] || language : null;
  
  const langInstruction = langName
    ? `\n\nCRITICAL LANGUAGE RULE: You MUST write ALL text values (reasoning, conditions, nextSteps, considerations, emergencyFlags, differentialDiagnosis) in ${langName}. Only JSON keys stay in English. Every human-readable string must be in ${langName}.`
    : '';

  return `You are a medical triage assistant. Your job is to analyze patient symptoms and recommend the right medical specialist.

RULES:
- Focus only on symptom interpretation and specialist recommendation.
- Do NOT include any markdown formatting: no asterisks, no bold, no italic, no bullet points, no headers, no links.
- Write plain, clean sentences only.
- Do NOT add disclaimers or lengthy explanations. Be concise and direct.
- Always recommend professional medical consultation as a next step.

AGE GUIDELINES:
- Children (0-12): Pediatric conditions, growth issues, infectious diseases
- Teenagers (13-19): Hormonal changes, sports injuries, mental health
- Adults (20-44): Lifestyle factors, occupational hazards
- Middle-aged (45-64): Cardiovascular risk, cancer screening, metabolic conditions
- Elderly (65+): Geriatric syndromes, fall risk, polypharmacy, stroke/heart attack risk

OUTPUT FORMAT:
Return ONLY a valid JSON object. No text before or after the JSON. No markdown code fences. The exact structure:

{
  "primaryRecommendation": {
    "specialty": "Specialist type name",
    "matchPercentage": 85,
    "reasoning": "One to two plain sentences explaining why this specialist fits best.",
    "urgencyLevel": "low or moderate or high or emergency",
    "conditions": ["Possible condition 1", "Possible condition 2"]
  },
  "alternatives": [
    {
      "specialty": "Alternative specialist name",
      "matchPercentage": 70,
      "reasoning": "One plain sentence explaining why this is an alternative.",
      "urgencyLevel": "low or moderate or high",
      "conditions": ["Alternative condition"]
    }
  ],
  "urgencyPercentage": 65,
  "emergencyFlags": ["Plain text emergency warning if any, otherwise empty array"],
  "differentialDiagnosis": ["Condition 1", "Condition 2", "Condition 3"],
  "nextSteps": ["Plain action step 1", "Plain action step 2", "Plain action step 3"],
  "ageSpecificConsiderations": "One plain sentence about age-related factors.",
  "genderSpecificConsiderations": "One plain sentence about gender-related factors if relevant, or empty string."
}${langInstruction}`;
}

function buildUserPrompt(
  symptoms: string,
  quickSymptoms: string[],
  bodyParts: Array<{ part: string; symptomType: string }>,
  age: number,
  gender: string,
  medications: string[]
): string {
  const bodyPartsDescription = bodyParts.length > 0
    ? bodyParts.map(bp => `${bp.part} (${bp.symptomType})`).join(', ')
    : 'Not specified';

  const medicationsText = medications.length > 0 ? medications.join(', ') : 'None reported';
  const quickSymptomsText = quickSymptoms.length > 0 ? quickSymptoms.join(', ') : 'None selected';

  return `Patient age: ${age}, gender: ${gender || 'Not specified'}, medications: ${medicationsText}.
Symptoms described: "${symptoms || 'None provided'}".
Quick-selected symptoms: ${quickSymptomsText}.
Affected body areas: ${bodyPartsDescription}.

Analyze these symptoms and return the JSON response.`;
}

function parseAIResponse(
  textContent: string,
  age: number,
  gender: string
): AnalysisResponse {
  try {
    let jsonStr = textContent.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Try to extract JSON if there's text around it
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    const parsed = JSON.parse(jsonStr);
    
    return {
      primaryRecommendation: parsed.primaryRecommendation || {
        specialty: "General Physician",
        matchPercentage: 75,
        reasoning: "Based on the symptoms provided, a general evaluation is recommended.",
        urgencyLevel: "moderate",
        conditions: ["General health assessment needed"],
      },
      alternatives: parsed.alternatives || [],
      urgencyPercentage: parsed.urgencyPercentage || 50,
      emergencyFlags: parsed.emergencyFlags || [],
      differentialDiagnosis: parsed.differentialDiagnosis || [],
      nextSteps: parsed.nextSteps || [
        "Schedule an appointment with the recommended specialist",
        "Keep a symptom diary",
        "Avoid self-medication",
      ],
      ageSpecificConsiderations: parsed.ageSpecificConsiderations || 
        `For a ${age}-year-old patient, standard age-appropriate evaluation applies.`,
      genderSpecificConsiderations: parsed.genderSpecificConsiderations || 
        (gender ? `Standard considerations for ${gender} patients apply.` : ""),
    };
  } catch (parseError) {
    console.error('Error parsing AI response:', parseError, 'Raw text:', textContent);
    
    return {
      primaryRecommendation: {
        specialty: "General Physician",
        matchPercentage: 70,
        reasoning: "Unable to fully process symptoms. A general evaluation is recommended as a starting point.",
        urgencyLevel: "moderate",
        conditions: ["Requires in-person evaluation"],
      },
      alternatives: [
        {
          specialty: "Urgent Care",
          matchPercentage: 60,
          reasoning: "If symptoms worsen or persist, consider urgent care for immediate evaluation.",
          urgencyLevel: "moderate",
          conditions: ["Time-sensitive evaluation may be needed"],
        },
      ],
      urgencyPercentage: 50,
      emergencyFlags: [],
      differentialDiagnosis: ["Further evaluation needed"],
      nextSteps: [
        "Schedule an appointment with a healthcare provider",
        "Monitor symptoms and note any changes",
        "Seek emergency care if symptoms suddenly worsen",
      ],
      ageSpecificConsiderations: `Standard precautions for ${age}-year-old patients apply.`,
      genderSpecificConsiderations: gender ? `Standard considerations for ${gender} patients apply.` : "",
    };
  }
}