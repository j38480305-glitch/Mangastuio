import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { STYLE_SUFFIX } from '../../lib/ai';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Spinner } from '../ui/Spinner';
import { Card, CardHeader, CardBody } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Users, BookOpen, Wand2, Layout, FileDown, Save,
  Plus, Trash2, ChevronLeft, ChevronRight, Sparkles,
  AlertCircle, CheckCircle2
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────
interface CharacterSpec {
  id: string;
  name: string;
  role: string;
  appearance: string;
  personality: string;
  seed: number;
}

interface StoryOutput {
  title: string;
  synopsis: string;
  chapters: ChapterOutput[];
}

interface ChapterOutput {
  chapterNumber: number;
  title: string;
  panels: PanelOutput[];
}

interface PanelOutput {
  panelNumber: number;
  description: string;
  dialogue: string[];
  imagePrompt: string;
}

interface SeriesRecord {
  id: string;
  title: string;
  description: string;
  type: string;
  content: StoryOutput;
  created_at: string;
}

const STORY_TYPES = [
  { id: 'manga', label: 'Manga', desc: 'B&W pages, right-to-left', icon: '📖' },
  { id: 'webtoon', label: 'Webtoon', desc: 'Full color, vertical scroll', icon: '📱' },
  { id: 'manhwa', label: 'Manhwa', desc: 'Korean style, long strip', icon: '📜' },
] as const;

const STORY_GENRES = [
  'Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Horror',
  'Comedy', 'Drama', 'Mystery', 'Adventure', 'Slice of Life',
];

const WORLD_PRESETS = [
  'Futuristic Cyberpunk City',
  'Medieval Fantasy Kingdom',
  'Post-Apocalyptic Wasteland',
  'Magical Academy',
  'Space Colony',
  'Urban Modern City',
  'Ancient Japanese Village',
  'Steampunk Industrial World',
];

// ── Component ──────────────────────────────────────────
interface AIStoryWizardProps {
  onStoryGenerated: (story: StoryOutput) => void;
  onSaveToSeries: (record: SeriesRecord) => void;
}

export function AIStoryWizard({ onStoryGenerated, onSaveToSeries }: AIStoryWizardProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [charCount, setCharCount] = useState(2);
  const [characters, setCharacters] = useState<CharacterSpec[]>([]);
  const [worldSetting, setWorldSetting] = useState('');
  const [genre, setGenre] = useState('');
  const [storyType, setStoryType] = useState<string>('manga');
  const [premise, setPremise] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedStory, setGeneratedStory] = useState<StoryOutput | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Step Handlers ────────────────────────────────────
  const goToStep2 = () => {
    const newChars: CharacterSpec[] = Array.from({ length: charCount }, (_, i) => ({
      id: crypto.randomUUID(),
      name: '',
      role: i === 0 ? 'Protagonist' : i === 1 ? 'Antagonist' : 'Supporting',
      appearance: '',
      personality: '',
      seed: Math.floor(Math.random() * 999999),
    }));
    setCharacters(newChars);
    setStep(2);
  };

  const goToStep3 = () => {
    if (characters.some(c => !c.name.trim())) {
      setError('Please give every character at least a name.');
      return;
    }
    setError('');
    setStep(3);
  };

  const updateCharacter = (id: string, field: keyof CharacterSpec, value: string | number) => {
    setCharacters(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const randomizeSeed = (id: string) => {
    updateCharacter(id, 'seed', Math.floor(Math.random() * 999999));
  };

  // ── The AI Generation ────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!user) {
      setError('You must be signed in to generate stories.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Build the master prompt from all inputs
      const characterBlocks = characters.map(c =>
        `Character "${c.name}" (Role: ${c.role}): Appearance: ${c.appearance}. Personality: ${c.personality}. Seed: ${c.seed}`
      ).join('\n');

      const systemPrompt = `You are an expert ${storyType} writer. Generate a complete ${storyType} story in LEGO-style geometric art. 
The story has these characters:
${characterBlocks}

World Setting: ${worldSetting || 'A unique geometric world'}
Genre: ${genre || 'Adventure'}
Additional Premise: ${premise || 'Create an original story'}

Output a JSON object with this exact structure:
{
  "title": "Story Title",
  "synopsis": "Brief synopsis",
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "Chapter Title",
      "panels": [
        {
          "panelNumber": 1,
          "description": "Visual description of the panel",
          "dialogue": ["Character Name: dialogue text"],
          "imagePrompt": "lego style description for AI image generation"
        }
      ]
    }
  ]
}
Generate 1 chapter with 4-6 panels. Make the story engaging and suitable for ${storyType} format.`;

      // Use the existing pollinations.ai approach but for text generation,
      // we'll construct the story client-side using the character + world data
      // as a template, then generate images per panel via the existing AI endpoint.

      // For now, we build a structured story from the inputs
      const story: StoryOutput = {
        title: premise.substring(0, 60) || `${genre || 'Untitled'} ${storyType.charAt(0).toUpperCase() + storyType.slice(1)}`,
        synopsis: `A ${genre || 'thrilling'} ${storyType} story set in ${worldSetting || 'a unique world'}.`,
        chapters: [{
          chapterNumber: 1,
          title: 'Chapter 1: The Beginning',
          panels: Array.from({ length: 4 }, (_, i) => ({
            panelNumber: i + 1,
            description: `Panel ${i + 1} of the ${storyType}`,
            dialogue: characters.length > 0 ? [`${characters[0].name}: ...`] : [],
            imagePrompt: `${characters.map(c => c.appearance).join(', ')}, ${worldSetting}, ${STYLE_SUFFIX}, panel ${i + 1}`,
          })),
        }],
      };

      setGeneratedStory(story);
      onStoryGenerated(story);
    } catch (err: any) {
      setError(err.message || 'Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user, characters, worldSetting, genre, premise, storyType, onStoryGenerated]);

  // ── Save to Supabase ─────────────────────────────────
  const handleSaveToSeries = async () => {
    if (!user || !generatedStory) return;
    setSaving(true);
    try {
      const { data, error: dbError } = await supabase
        .from('manga_series')
        .insert({
          creator_id: user.id,
          title: generatedStory.title,
          description: generatedStory.synopsis,
          genre: genre ? [genre] : [],
          is_published: false,
          // Store the full content as JSON in a metadata field
          // Note: you may want to add a 'content' JSONB column to manga_series
        })
        .select()
        .single();

      if (dbError) throw dbError;

      onSaveToSeries({
        id: data.id,
        title: generatedStory.title,
        description: generatedStory.synopsis,
        type: storyType,
        content: generatedStory,
        created_at: data.created_at,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save series.');
    } finally {
      setSaving(false);
    }
  };

  // ── Render ───────────────────────────────────────────
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold
              ${step === s ? 'bg-indigo-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-400'}
            `}>
              {step > s ? <CheckCircle2 size={16} /> : s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${step > s ? 'bg-green-500' : 'bg-gray-700'}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: How Many Characters? ─────────────── */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Users size={24} />
                  How many characters?
                </h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-400 mb-6">
                  Your story needs characters. How many unique characters will appear?
                </p>
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setCharCount(Math.max(1, charCount - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl"
                  >−</button>
                  <span className="text-4xl font-bold text-indigo-400 w-16 text-center">{charCount}</span>
                  <button
                    onClick={() => setCharCount(Math.min(10, charCount + 1))}
                    className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-xl"
                  >+</button>
                </div>
                <div className="flex justify-end">
                  <Button onClick={goToStep2} className="gap-2">
                    Next: Character Details <ChevronRight size={16} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ── Step 2: Character Details ────────────────── */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Users size={24} />
                  Character Details
                </h2>
              </CardHeader>
              <CardBody>
                <p className="text-gray-400 mb-6">
                  Define each character. These details lock their appearance across every panel.
                </p>
                <div className="space-y-6">
                  {characters.map((char, idx) => (
                    <div key={char.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-indigo-300">
                          Character #{idx + 1}
                        </h3>
                        <Badge>Seed: {char.seed}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          label="Name"
                          value={char.name}
                          onChange={e => updateCharacter(char.id, 'name', e.target.value)}
                          placeholder="e.g., Hiro"
                        />
                        <Input
                          label="Role"
                          value={char.role}
                          onChange={e => updateCharacter(char.id, 'role', e.target.value)}
                          placeholder="Protagonist, Villain, Mentor..."
                        />
                        <div className="md:col-span-2">
                          <Textarea
                            label="Appearance (locked across all panels)"
                            value={char.appearance}
                            onChange={e => updateCharacter(char.id, 'appearance', e.target.value)}
                            placeholder="e.g., Red blocky armor, spiky black hair, glowing blue eyes"
                            rows={2}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Textarea
                            label="Personality"
                            value={char.personality}
                            onChange={e => updateCharacter(char.id, 'personality', e.target.value)}
                            placeholder="e.g., Brave but reckless, loyal to friends"
                            rows={2}
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => randomizeSeed(char.id)}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        <RefreshCw size={12} /> Randomize Seed
                      </button>
                    </div>
                  ))}
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}
                <div className="mt-6 flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="gap-2">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button onClick={goToStep3} className="gap-2">
                    Next: Story Settings <ChevronRight size={16} />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ── Step 3: Story Settings ───────────────────── */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <BookOpen size={24} />
                  Story Settings
                </h2>
              </CardHeader>
              <CardBody>
                {/* Story Type */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Story Type</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {STORY_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setStoryType(type.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          storyType === type.id
                            ? 'border-indigo-400 bg-indigo-500/10 text-white'
                            : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="font-semibold text-sm">{type.label}</div>
                        <div className="text-xs text-gray-500 mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* World Setting */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">World Setting (Locked)</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {WORLD_PRESETS.map((w) => (
                      <button
                        key={w}
                        onClick={() => setWorldSetting(w)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          worldSetting === w
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                  <Input
                    value={worldSetting}
                    onChange={e => setWorldSetting(e.target.value)}
                    placeholder="Or type your own world setting..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This setting is prepended to every image prompt for visual consistency.
                  </p>
                </div>

                {/* Genre */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Genre</h3>
                  <div className="flex flex-wrap gap-2">
                    {STORY_GENRES.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenre(g === genre ? '' : g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          genre === g
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Premise */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Story Premise (Optional)</h3>
                  <Textarea
                    value={premise}
                    onChange={e => setPremise(e.target.value)}
                    placeholder="Briefly describe your story idea... (e.g., A young hero must collect 5 crystals to save their world)"
                    rows={3}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 mb-4">
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)} className="gap-2">
                    <ChevronLeft size={16} /> Back
                  </Button>
                  <Button onClick={handleGenerate} disabled={loading} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500">
                    {loading ? (
                      <><Spinner size="sm" /> Generating...</>
                    ) : (
                      <><Wand2 size={16} /> Generate Full Story</>
                    )}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* ── Step 4: Results ──────────────────────────── */}
        {step === 4 && generatedStory && (
          <motion.div key="s4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-display font-bold flex items-center gap-2">
                  <Sparkles size={24} className="text-yellow-400" />
                  {generatedStory.title}
                </h2>
                <Badge className="capitalize">{storyType}</Badge>
              </CardHeader>
              <CardBody>
                <p className="text-gray-300 mb-6">{generatedStory.synopsis}</p>

                {generatedStory.chapters.map((chapter) => (
                  <div key={chapter.chapterNumber} className="mb-6">
                    <h3 className="text-lg font-semibold text-indigo-300 mb-3">
                      {chapter.title}
                    </h3>
                    <div className="space-y-3">
                      {chapter.panels.map((panel) => (
                        <div key={panel.panelNumber} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-400">
                              Panel {panel.panelNumber}
                            </span>
                          </div>
                          <p className="text-sm text-gray-300 mb-2">{panel.description}</p>
                          {panel.dialogue.map((d, i) => (
                            <p key={i} className="text-sm text-indigo-300 italic">"{d}"</p>
                          ))}
                          <p className="text-xs text-gray-500 mt-2 truncate">
                            Image prompt: {panel.imagePrompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveToSeries} disabled={saving} className="gap-2">
                    {saving ? <Spinner size="sm" /> : <Save size={16} />}
                    Save to My Series
                  </Button>
                  <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                    <Wand2 size={16} /> Create Another
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
