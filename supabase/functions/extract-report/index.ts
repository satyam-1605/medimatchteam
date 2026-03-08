import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { filePath } = await req.json();
    if (!filePath) {
      return new Response(JSON.stringify({ error: 'filePath required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Extracting report text from:', filePath);

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('medical-reports')
      .download(filePath);

    if (downloadError || !fileData) {
      console.error('Download error:', downloadError);
      return new Response(JSON.stringify({ error: 'Failed to download report' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const ext = filePath.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
    const isPdf = ext === 'pdf';

    let extractedText = '';

    if (isImage) {
      // Use Gemini vision to extract text from image
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(await fileData.arrayBuffer()))
      );
      const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract ALL text and medical information from this medical report image. Include test names, values, reference ranges, diagnosis notes, doctor observations, and any abnormal findings. Format as structured plain text. If there are abnormal values, clearly mark them.',
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:${mimeType};base64,${base64}` },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('AI vision error:', response.status, errText);
        return new Response(JSON.stringify({ error: 'Failed to extract text from image' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      extractedText = data.choices?.[0]?.message?.content || '';
    } else if (isPdf) {
      // For PDFs: convert first pages to base64 and use vision, or extract raw text
      // Since we can read PDFs as array buffers, use Gemini to analyze
      const base64 = btoa(
        String.fromCharCode(...new Uint8Array(await fileData.arrayBuffer()))
      );

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract ALL text and medical information from this medical report PDF. Include test names, values, reference ranges, diagnosis notes, doctor observations, and any abnormal findings. Format as structured plain text. If there are abnormal values, clearly mark them.',
                },
                {
                  type: 'image_url',
                  image_url: { url: `data:application/pdf;base64,${base64}` },
                },
              ],
            },
          ],
          temperature: 0.1,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('AI PDF analysis error:', response.status, errText);
        return new Response(JSON.stringify({ error: 'Failed to extract text from PDF' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const data = await response.json();
      extractedText = data.choices?.[0]?.message?.content || '';
    } else {
      // Try reading as text
      extractedText = await fileData.text();
    }

    console.log('Extracted text length:', extractedText.length);

    return new Response(
      JSON.stringify({ extractedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in extract-report:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
