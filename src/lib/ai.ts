import { supabase } from './supabase';

const STYLE_SUFFIX = '3D rendered geometric LEGO-style character, minimalist blocky design, terracotta clay material, matte finish, simple glowing rectangular eyes, hexagonal head, rectangular torso, cylindrical limbs, studio lighting, neutral beige background, physically-based rendering, high quality, 4k';

const NEGATIVE_PROMPT = 'realistic, detailed face, organic shapes, complex anatomy, photorealistic skin, hair, clothing folds, blurry, low quality, distorted';

export interface GenerationResult {
  image: string;
  model: string;
  prompt: string;
  error?: string;
}

export async function generateImage(prompt: string, seed?: number): Promise<GenerationResult> {
  const { data: { session } } = await supabase.auth.getSession();

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session?.access_token ?? ''}`,
    },
    body: JSON.stringify({ prompt, seed }),
  });

  const result = await response.json();
  return result;
}

export function buildCharacterPrompt(description: string, pose?: string, expression?: string): string {
  let prompt = description;
  if (pose) prompt += `, ${pose}`;
  if (expression) prompt += `, ${expression}`;
  return prompt;
}

export { STYLE_SUFFIX, NEGATIVE_PROMPT };
