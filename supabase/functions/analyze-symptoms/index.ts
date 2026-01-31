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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      console.error('GOOGLE_GEMINI_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestData: SymptomAnalysisRequest = await req.json();
    console.log('Received symptom analysis request:', JSON.stringify(requestData, null, 2));

    const { symptoms, quickSymptoms, bodyParts, age, gender, medications } = requestData;

    // Build comprehensive prompt for Gemini
    const prompt = buildAnalysisPrompt(symptoms, quickSymptoms, bodyParts, age, gender, medications);

    console.log('Sending request to Gemini API...');
    
    // Call Google Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
            topP: 0.8,
            topK: 40,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error:', geminiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiData = await geminiResponse.json();
    console.log('Gemini response received');

    // Extract text content from Gemini response
    const textContent = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textContent) {
      console.error('No text content in Gemini response:', JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({ error: 'Invalid AI response format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON from Gemini's response
    const analysisResult = parseGeminiResponse(textContent, age, gender);
    
    console.log('Analysis complete:', JSON.stringify(analysisResult, null, 2));

    return new Response(
      JSON.stringify(analysisResult),
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

function buildAnalysisPrompt(
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

  return `You are a medical triage AI assistant. Analyze the following patient information and provide specialist recommendations. Be thorough but remember this is for triage purposes only - always recommend professional medical consultation.

PATIENT INFORMATION:
- Age: ${age} years old
- Gender: ${gender || 'Not specified'}
- Current Medications: ${medicationsText}

REPORTED SYMPTOMS:
- Free-text description: "${symptoms || 'None provided'}"
- Quick-selected symptoms: ${quickSymptomsText}
- Affected body parts with symptom types: ${bodyPartsDescription}

ANALYSIS REQUIREMENTS:
1. Consider age-specific factors (pediatric, adult, geriatric considerations)
2. Consider gender-specific conditions if applicable
3. Account for medication interactions or side effects
4. Identify any emergency red flags
5. Provide differential diagnoses
6. Recommend appropriate medical specialists

IMPORTANT AGE-BASED VARIATIONS:
- For children (0-12): Consider pediatric conditions, growth-related issues, infectious diseases
- For teenagers (13-19): Consider hormonal changes, sports injuries, mental health
- For adults (20-44): Consider lifestyle factors, occupational hazards
- For middle-aged (45-64): Consider cardiovascular risk, cancer screening, metabolic conditions
- For elderly (65+): Consider geriatric syndromes, polypharmacy, fall risk, stroke/heart attack risk

Return your analysis as a valid JSON object with this exact structure:
{
  "primaryRecommendation": {
    "specialty": "Specialist type (e.g., Cardiologist, Neurologist)",
    "matchPercentage": 85,
    "reasoning": "Detailed explanation of why this specialist is recommended",
    "urgencyLevel": "low|moderate|high|emergency",
    "conditions": ["Possible condition 1", "Possible condition 2"]
  },
  "alternatives": [
    {
      "specialty": "Alternative specialist",
      "matchPercentage": 70,
      "reasoning": "Why this might also be appropriate",
      "urgencyLevel": "low|moderate|high",
      "conditions": ["Alternative condition"]
    }
  ],
  "urgencyPercentage": 65,
  "emergencyFlags": ["Any emergency symptoms detected"],
  "differentialDiagnosis": ["Condition 1", "Condition 2", "Condition 3"],
  "nextSteps": ["Step 1", "Step 2", "Step 3"],
  "ageSpecificConsiderations": "Specific considerations based on patient age",
  "genderSpecificConsiderations": "Specific considerations based on patient gender if applicable"
}

Return ONLY the JSON object, no additional text or markdown formatting.`;
}

function parseGeminiResponse(
  textContent: string,
  age: number,
  gender: string
): AnalysisResponse {
  try {
    // Try to extract JSON from the response
    let jsonStr = textContent.trim();
    
    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonStr);
    
    // Validate and provide defaults for missing fields
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
        `For a ${age}-year-old patient, standard age-appropriate evaluation protocols apply.`,
      genderSpecificConsiderations: parsed.genderSpecificConsiderations || 
        (gender ? `Gender-specific factors for ${gender} patients are considered.` : ""),
    };
  } catch (parseError) {
    console.error('Error parsing Gemini response:', parseError, 'Raw text:', textContent);
    
    // Return a fallback response
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
