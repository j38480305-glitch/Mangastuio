const STYLE_SUFFIX = '3D rendered geometric LEGO-style character, minimalist blocky design, terracotta clay material, matte finish, simple glowing rectangular eyes, hexagonal head, rectangular torso, cylindrical limbs, studio lighting, neutral beige background, physically-based rendering, high quality, 4k';

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
  error?: string;
}

export interface CharacterMemory {
  name: string;
  appearance: string;
  seed: number;
}

// ── Core generation function ───────────────────────────
export async function generateImage(
  prompt: string,
  seed?: number,
  worldSetting?: string
): Promise<GenerationResult> {
  let fullPrompt = prompt;
  
  // Prepend world setting for consistency
  if (worldSetting) {
    fullPrompt = `${worldSetting}, ${fullPrompt}`;
  }
  
  fullPrompt = `${fullPrompt}, ${STYLE_SUFFIX}`;
  
  const encoded = encodeURIComponent(fullPrompt);
  const seedParam = seed !== undefined ? `&seed=${seed}` : '';
  const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=768&height=768&nologo=true${seedParam}`;

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      return {
        imageUrl: '',
        prompt: fullPrompt,
        error: `Image generation failed (HTTP ${response.status})`,
      };
    }
    return { imageUrl, prompt: fullPrompt };
  } catch (err) {
    return {
      imageUrl: '',
      prompt: fullPrompt,
      error: err instanceof Error ? err.message : 'Network error during generation',
    };
  }
}

// ── Generate with character consistency ─────────────────
export async function generateCharacterPanel(
  characterMemory: CharacterMemory[],
  worldSetting: string,
  panelDescription: string,
  seed?: number
): Promise<GenerationResult> {
  // Build a prompt that includes ALL character appearances for consistency
  const characterBlock = characterMemory
    .map(c => `${c.name}: ${c.appearance}`)
    .join('; ');

  const fullPrompt = `${worldSetting}, ${characterBlock}, ${panelDescription}, all characters consistent, same appearance as reference`;

  return generateImage(fullPrompt, seed, worldSetting);
}

// ── Build character prompt from memory ──────────────────
export function buildCharacterPrompt(
  description: string,
  pose?: string,
  expression?: string
): string {
  let fullPrompt = description;
  if (pose) fullPrompt += `, ${pose}`;
  if (expression) fullPrompt += `, ${expression}`;
  return fullPrompt;
}

export { STYLE_SUFFIX };
