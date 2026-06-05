const STYLE_SUFFIX = '3D rendered geometric LEGO-style character, minimalist blocky design, terracotta clay material, matte finish, simple glowing rectangular eyes, hexagonal head, rectangular torso, cylindrical limbs, studio lighting, neutral beige background, physically-based rendering, high quality, 4k';

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  error?: string;
}

export async function generateImage(prompt: string, seed?: number): Promise<GenerationResult> {
  const fullPrompt = `${prompt}, ${STYLE_SUFFIX}`;
  const encoded = encodeURIComponent(fullPrompt);
  const seedParam = seed !== undefined ? `&seed=${seed}` : '';
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=512&height=512&nologo=true${seedParam}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return { imageUrl: '', prompt: fullPrompt, error: `Image generation failed (HTTP ${response.status})` };
    }
    return { imageUrl, prompt: fullPrompt };
  } catch (err) {
    return { imageUrl: '', prompt: fullPrompt, error: err instanceof Error ? err.message : 'Network error during generation' };
  }
}

export function buildCharacterPrompt(description: string, pose?: string, expression?: string): string {
  let fullPrompt = description;
  if (pose) fullPrompt += `, ${pose}`;
  if (expression) fullPrompt += `, ${expression}`;
  return fullPrompt;
}

export { STYLE_SUFFIX };
