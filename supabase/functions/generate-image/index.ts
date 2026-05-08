import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const STYLE_SUFFIX = "3D rendered geometric LEGO-style character, minimalist blocky design, terracotta clay material, matte finish, simple glowing rectangular eyes, hexagonal head, rectangular torso, cylindrical limbs, studio lighting, neutral beige background, physically-based rendering, high quality, 4k";

const NEGATIVE_PROMPT = "realistic, detailed face, organic shapes, complex anatomy, photorealistic skin, hair, clothing folds, blurry, low quality, distorted";

const MODELS = [
  "stabilityai/stable-diffusion-xl-base-1.0",
  "runwayml/stable-diffusion-v1-5",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { prompt, seed, model } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fullPrompt = `${prompt}, ${STYLE_SUFFIX}`;
    const selectedModel = model && MODELS.includes(model) ? model : MODELS[0];
    const hfApiKey = Deno.env.get("HUGGINGFACE_API_KEY");

    if (!hfApiKey) {
      return new Response(JSON.stringify({ error: "Hugging Face API key not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parameters: Record<string, unknown> = {
      negative_prompt: NEGATIVE_PROMPT,
      num_inference_steps: 30,
      guidance_scale: 7.5,
    };

    if (seed !== undefined && seed !== null) {
      parameters.seed = Number(seed);
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${selectedModel}`,
      {
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: fullPrompt,
          parameters,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      // If primary model fails, try fallback
      if (selectedModel === MODELS[0]) {
        const fallbackResponse = await fetch(
          `https://api-inference.huggingface.co/models/${MODELS[1]}`,
          {
            headers: {
              Authorization: `Bearer ${hfApiKey}`,
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              inputs: fullPrompt,
              parameters,
            }),
          }
        );

        if (fallbackResponse.ok) {
          const imageBlob = await fallbackResponse.blob();
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          return new Response(
            JSON.stringify({
              image: `data:${imageBlob.type};base64,${base64}`,
              model: MODELS[1],
              prompt: fullPrompt,
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      return new Response(JSON.stringify({ error: `Image generation failed: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageBlob = await response.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    return new Response(
      JSON.stringify({
        image: `data:${imageBlob.type};base64,${base64}`,
        model: selectedModel,
        prompt: fullPrompt,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
