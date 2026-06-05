import { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { generateImage } from '../lib/ai';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { StoryEditor } from '../components/creator/StoryEditor';
import { Sparkles, Save, ImagePlus, Wand2, Grid3x3, BookOpen, Plus, Trash2, Download, AlertCircle, RefreshCw, FolderPlus, FileDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GeneratedImage {
  url: string;
  prompt: string;
  seed: number;
  timestamp: number;
}

interface Panel {
  id: string;
  imageUrl: string;
  dialogue: string;
  dialoguePosition: { x: number; y: number };
}

interface PageData {
  panels: Panel[];
  layout: 'single' | '2-panel' | '4-panel' | 'webtoon';
}

const LAYOUT_TEMPLATES = [
  { id: 'single' as const, label: 'Single Panel', icon: '■' },
  { id: '2-panel' as const, label: '2-Panel', icon: '■■' },
  { id: '4-panel' as const, label: '4-Panel', icon: '2x2' },
  { id: 'webtoon' as const, label: 'Webtoon Strip', icon: '↕' },
];

const CHARACTER_PRESETS = [
  { name: 'Hero', prompt: 'brave warrior character, strong stance, determined pose, armor plates' },
  { name: 'Villain', prompt: 'dark antagonist character, menacing pose, angular features, dark armor' },
  { name: 'Sidekick', prompt: 'friendly companion character, cheerful pose, smaller build, casual outfit' },
  { name: 'Mentor', prompt: 'wise elder character, calm pose, flowing geometric robes, staff' },
  { name: 'Creature', prompt: 'fantasy creature, quadruped body, geometric crystal features, glowing eyes' },
];

const STYLE_PRESETS = [
  { name: 'Shonen', tag: 'shonen manga style, dynamic action, bold lines' },
  { name: 'Shojo', tag: 'shojo manga style, delicate features, flowing hair, romantic' },
  { name: 'Dark Fantasy', tag: 'dark fantasy style, gothic, moody atmosphere, dramatic shadows' },
  { name: 'Cyberpunk', tag: 'cyberpunk style, neon lights, futuristic, tech wear' },
  { name: 'Chibi', tag: 'chibi style, cute, oversized head, small body, adorable' },
];

export function StudioPage() {
  const { user } = useAuth();
  const { toasts, show: showToast, dismiss } = useToast();
  const [activeTab, setActiveTab] = useState<'generate' | 'layout' | 'series'>('generate');
  const [prompt, setPrompt] = useState('');
  const [seed, setSeed] = useState(42);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [activeStylePresets, setActiveStylePresets] = useState<string[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Series management
  const [seriesList, setSeriesList] = useState<any[]>([]);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeries, setNewSeries] = useState({ title: '', description: '', genre: '' });

  // Page layout
  const [currentPage, setCurrentPage] = useState<PageData>({
    panels: [],
    layout: '4-panel',
  });

  // New project
  const [showNewProject, setShowNewProject] = useState(false);
  const [projectName, setProjectName] = useState('');

  const fullPrompt = activeStylePresets.length > 0
    ? `${prompt}, ${activeStylePresets.map((name) => STYLE_PRESETS.find((s) => s.name === name)?.tag || '').join(', ')}`
    : prompt;

  const handleGenerate = useCallback(async () => {
    if (!fullPrompt.trim()) return;
    setGenerating(true);
    setGenError(null);
    setImageLoading(true);

    try {
      const result = await generateImage(fullPrompt, seed);
      if (result.error) {
        setGenError(result.error);
      } else if (result.imageUrl) {
        setGeneratedImages((prev) => [
          { url: result.imageUrl, prompt: result.prompt, seed, timestamp: Date.now() },
          ...prev,
        ]);
      }
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setGenerating(false);
    }
  }, [fullPrompt, seed]);

  const handleImageLoaded = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    setGenError('Failed to load the generated image. Try regenerating.');
  }, []);

  const toggleStylePreset = (name: string) => {
    setActiveStylePresets((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const handlePresetSelect = (preset: typeof CHARACTER_PRESETS[number]) => {
    setPrompt(preset.prompt);
    setSelectedPreset(preset.name);
  };

  const addPanelImage = (imageUrl: string) => {
    const newPanel: Panel = {
      id: crypto.randomUUID(),
      imageUrl,
      dialogue: '',
      dialoguePosition: { x: 50, y: 20 },
    };
    setCurrentPage((prev) => ({
      ...prev,
      panels: [...prev.panels, newPanel],
    }));
    showToast('Image added to panel');
  };

  const updatePanelDialogue = (panelId: string, dialogue: string) => {
    setCurrentPage((prev) => ({
      ...prev,
      panels: prev.panels.map((p) => (p.id === panelId ? { ...p, dialogue } : p)),
    }));
  };

  const removePanel = (panelId: string) => {
    setCurrentPage((prev) => ({
      ...prev,
      panels: prev.panels.filter((p) => p.id !== panelId),
    }));
    showToast('Panel removed', 'info');
  };

  const addBlankPanel = () => {
    const newPanel: Panel = {
      id: crypto.randomUUID(),
      imageUrl: '',
      dialogue: '',
      dialoguePosition: { x: 50, y: 20 },
    };
    setCurrentPage((prev) => ({
      ...prev,
      panels: [...prev.panels, newPanel],
    }));
    showToast('Blank panel added');
  };

  const handleSaveProject = () => {
    const projectData = {
      name: projectName || 'Untitled Project',
      panels: currentPage.panels,
      layout: currentPage.layout,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('terramanga-project', JSON.stringify(projectData));
    showToast('Project saved!');
  };

  const handleExportProject = () => {
    const data = {
      projectName: projectName || 'Untitled',
      layout: currentPage.layout,
      panels: currentPage.panels.map((p) => ({
        dialogue: p.dialogue,
        hasImage: !!p.imageUrl,
      })),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectName || 'terramanga-project').replace(/\s+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Project exported!');
  };

  const handleNewProject = () => {
    setCurrentPage({ panels: [], layout: '4-panel' });
    setProjectName('');
    setGeneratedImages([]);
    setPrompt('');
    setActiveStylePresets([]);
    setSelectedPreset(null);
    localStorage.removeItem('terramanga-project');
    setShowNewProject(false);
    showToast('New project created', 'info');
  };

  const handleCreateSeries = async () => {
    if (!user || !newSeries.title) return;
    const { data } = await supabase
      .from('manga_series')
      .insert({
        creator_id: user.id,
        title: newSeries.title,
        description: newSeries.description,
        genre: newSeries.genre ? [newSeries.genre] : [],
        is_published: false,
      })
      .select()
      .single();

    if (data) {
      setSeriesList((prev) => [data, ...prev]);
      setShowNewSeries(false);
      setNewSeries({ title: '', description: '', genre: '' });
      showToast('Series created!');
    }
  };

  const handleDownloadImage = (url: string, imgSeed: number) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `terramanga-${imgSeed}.png`;
    a.target = '_blank';
    a.click();
    showToast('Image download started');
  };

  const tabs = [
    { id: 'generate' as const, label: 'AI Generator', icon: Sparkles },
    { id: 'layout' as const, label: 'Panel Layout', icon: Grid3x3 },
    { id: 'series' as const, label: 'My Series', icon: BookOpen },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-terracotta-900">Sign in to access the Studio</h2>
          <p className="mt-2 text-sand-500">You need an account to create manga.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      <div className="page-container py-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-xl font-bold text-terracotta-900">Creator Studio</h1>
            {projectName && (
              <Badge variant="default">{projectName}</Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowNewProject(true)}>
              <FolderPlus size={14} /> New Project
            </Button>
            <Button variant="secondary" size="sm" className="gap-1" onClick={handleSaveProject}>
              <Save size={14} /> Save
            </Button>
            <Button variant="secondary" size="sm" className="gap-1" onClick={handleExportProject}>
              <FileDown size={14} /> Export
            </Button>
          </div>
        </div>

        {/* Main Layout: Editor sidebar + Content */}
        <div className="flex gap-6">
          {/* Story Editor Sidebar (desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0 h-[calc(100vh-12rem)] sticky top-24">
            <StoryEditor onToast={showToast} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="flex gap-1 rounded-xl bg-sand-100 p-1 mb-6 max-w-lg">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-terracotta-700 shadow-sm'
                      : 'text-sand-500 hover:text-terracotta-600'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* AI Generator Tab */}
              {activeTab === 'generate' && (
                <motion.div
                  key="generate"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Style Presets */}
                  <Card>
                    <CardHeader>
                      <h3 className="font-display font-semibold text-terracotta-900 flex items-center gap-2">
                        <Wand2 size={18} /> Style Presets
                      </h3>
                    </CardHeader>
                    <CardBody>
                      <div className="flex flex-wrap gap-2">
                        {STYLE_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            onClick={() => toggleStylePreset(preset.name)}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                              activeStylePresets.includes(preset.name)
                                ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                                : 'bg-sand-50 text-sand-600 border border-sand-200 hover:border-terracotta-200'
                            }`}
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  <div className="grid gap-6 lg:grid-cols-3">
                    {/* Generator Controls */}
                    <div className="lg:col-span-1 space-y-6">
                      <Card>
                        <CardHeader>
                          <h3 className="font-display font-semibold text-terracotta-900 flex items-center gap-2">
                            <Wand2 size={18} /> Character Presets
                          </h3>
                        </CardHeader>
                        <CardBody>
                          <div className="flex flex-wrap gap-2">
                            {CHARACTER_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                onClick={() => handlePresetSelect(preset)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                  selectedPreset === preset.name
                                    ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                                    : 'bg-sand-50 text-sand-600 border border-sand-200 hover:border-terracotta-200'
                                }`}
                              >
                                {preset.name}
                              </button>
                            ))}
                          </div>
                        </CardBody>
                      </Card>

                      <Card>
                        <CardHeader>
                          <h3 className="font-display font-semibold text-terracotta-900 flex items-center gap-2">
                            <Sparkles size={18} /> Generate Character
                          </h3>
                        </CardHeader>
                        <CardBody className="space-y-4">
                          <Textarea
                            label="Character Description"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe your manga character (e.g. samurai warrior with silver hair, dramatic lighting, manga style)"
                            rows={4}
                          />
                          <Input
                            label="Seed (for consistency)"
                            type="number"
                            value={seed}
                            onChange={(e) => setSeed(Number(e.target.value))}
                          />
                          <p className="text-xs text-sand-400">
                            Use the same seed with similar prompts for consistent character appearances.
                          </p>

                          {/* Error Display */}
                          {genError && (
                            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
                              <div className="flex items-start gap-2">
                                <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <p className="text-sm text-red-700 flex-1">{genError}</p>
                                <button
                                  onClick={handleGenerate}
                                  className="flex-shrink-0 rounded-lg p-1 text-red-500 hover:bg-red-100 transition-colors"
                                  title="Retry"
                                >
                                  <RefreshCw size={14} />
                                </button>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={handleGenerate}
                              disabled={generating || !prompt.trim()}
                              className="flex-1 gap-2"
                            >
                              {generating ? (
                                <>
                                  <Spinner size="sm" /> Generating...
                                </>
                              ) : (
                                <>
                                  <ImagePlus size={16} /> Generate
                                </>
                              )}
                            </Button>
                            {generatedImages.length > 0 && (
                              <Button
                                variant="outline"
                                onClick={handleGenerate}
                                disabled={generating}
                                className="gap-1"
                                title="Regenerate with same prompt"
                              >
                                <RefreshCw size={16} />
                              </Button>
                            )}
                          </div>
                        </CardBody>
                      </Card>
                    </div>

                    {/* Generated Images Gallery */}
                    <div className="lg:col-span-2">
                      <Card>
                        <CardHeader className="flex items-center justify-between">
                          <h3 className="font-display font-semibold text-terracotta-900">
                            Generated Images ({generatedImages.length})
                          </h3>
                        </CardHeader>
                        <CardBody>
                          {generatedImages.length === 0 && !generating ? (
                            <div className="flex flex-col items-center justify-center py-16 text-sand-400">
                              <ImagePlus size={48} className="mb-4 opacity-50" />
                              <p className="text-sm">No images generated yet</p>
                              <p className="text-xs mt-1">Use the controls to generate your first character</p>
                            </div>
                          ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                              {generating && imageLoading && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  className="aspect-square rounded-xl border border-sand-200 bg-sand-100 flex items-center justify-center"
                                >
                                  <div className="text-center">
                                    <Spinner size="lg" />
                                    <p className="mt-3 text-sm text-sand-500">Generating image...</p>
                                  </div>
                                </motion.div>
                              )}
                              {generatedImages.map((img, i) => (
                                <motion.div
                                  key={img.timestamp}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="group relative overflow-hidden rounded-xl border border-sand-200 bg-sand-50"
                                >
                                  <div className="aspect-square">
                                    <img
                                      src={img.url}
                                      alt={img.prompt}
                                      className="h-full w-full object-cover"
                                      onLoad={handleImageLoaded}
                                      onError={handleImageError}
                                    />
                                  </div>
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="flex-1 gap-1 text-xs"
                                        onClick={() => addPanelImage(img.url)}
                                      >
                                        <Grid3x3 size={12} /> Add to Panel
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="secondary"
                                        className="gap-1 text-xs"
                                        onClick={() => handleDownloadImage(img.url, img.seed)}
                                      >
                                        <Download size={12} />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="absolute top-2 right-2">
                                    <Badge variant="default" className="text-[10px]">
                                      Seed: {img.seed}
                                    </Badge>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </CardBody>
                      </Card>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Panel Layout Tab */}
              {activeTab === 'layout' && (
                <motion.div
                  key="layout"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Layout Template Selector */}
                  <Card>
                    <CardHeader>
                      <h3 className="font-display font-semibold text-terracotta-900">Layout Template</h3>
                    </CardHeader>
                    <CardBody>
                      <div className="flex gap-3 flex-wrap">
                        {LAYOUT_TEMPLATES.map((template) => (
                          <button
                            key={template.id}
                            onClick={() => setCurrentPage((prev) => ({ ...prev, layout: template.id }))}
                            className={`flex items-center gap-2 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                              currentPage.layout === template.id
                                ? 'border-terracotta-400 bg-terracotta-50 text-terracotta-700'
                                : 'border-sand-200 bg-white text-sand-600 hover:border-terracotta-200'
                            }`}
                          >
                            <span className="font-mono text-xs bg-sand-100 px-1.5 py-0.5 rounded">
                              {template.icon}
                            </span>
                            {template.label}
                          </button>
                        ))}
                      </div>
                    </CardBody>
                  </Card>

                  {/* Page Canvas */}
                  <Card>
                    <CardHeader className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-terracotta-900">Page Editor</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1" onClick={addBlankPanel}>
                          <Plus size={14} /> Add Panel
                        </Button>
                        <Button size="sm" className="gap-1" onClick={handleSaveProject}>
                          <Save size={14} /> Save Page
                        </Button>
                      </div>
                    </CardHeader>
                    <CardBody>
                      <div
                        className={`grid gap-3 min-h-[400px] rounded-xl border-2 border-dashed border-sand-200 bg-white p-4 ${
                          currentPage.layout === 'single' ? 'grid-cols-1' :
                          currentPage.layout === '2-panel' ? 'grid-cols-2' :
                          currentPage.layout === '4-panel' ? 'grid-cols-2' :
                          'grid-cols-1'
                        }`}
                      >
                        {currentPage.panels.length === 0 ? (
                          <div className="col-span-full flex flex-col items-center justify-center py-16 text-sand-400">
                            <Grid3x3 size={48} className="mb-4 opacity-50" />
                            <p className="text-sm">No panels added yet</p>
                            <p className="text-xs mt-1">Generate images and add them to panels</p>
                            <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={addBlankPanel}>
                              <Plus size={14} /> Add Blank Panel
                            </Button>
                          </div>
                        ) : (
                          currentPage.panels.map((panel) => (
                            <div
                              key={panel.id}
                              className={`relative group rounded-lg border border-sand-200 bg-sand-50 overflow-hidden ${
                                currentPage.layout === 'webtoon' ? 'aspect-[3/4]' :
                                currentPage.layout === 'single' ? 'aspect-[3/4]' : 'aspect-square'
                              }`}
                            >
                              {panel.imageUrl ? (
                                <img
                                  src={panel.imageUrl}
                                  alt="Panel"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-sand-300">
                                  <Grid3x3 size={32} />
                                </div>
                              )}
                              {/* Speech Bubble Overlay */}
                              {panel.dialogue && (
                                <div
                                  className="absolute bg-white rounded-xl px-3 py-2 text-sm font-medium text-terracotta-900 shadow-lg border border-sand-200 max-w-[80%]"
                                  style={{ left: `${panel.dialoguePosition.x}%`, top: `${panel.dialoguePosition.y}%`, transform: 'translate(-50%, -50%)' }}
                                >
                                  {panel.dialogue}
                                </div>
                              )}
                              {/* Panel Controls */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="absolute top-2 right-2">
                                  <button
                                    onClick={() => removePanel(panel.id)}
                                    className="rounded-lg bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                  <input
                                    type="text"
                                    value={panel.dialogue}
                                    onChange={(e) => updatePanelDialogue(panel.id, e.target.value)}
                                    placeholder="Add dialogue..."
                                    className="w-full rounded-lg bg-white/90 border-0 px-3 py-2 text-sm text-terracotta-900 placeholder:text-sand-400 focus:ring-2 focus:ring-terracotta-400"
                                  />
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )}

              {/* Series Management Tab */}
              {activeTab === 'series' && (
                <motion.div
                  key="series"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="section-heading">My Series</h2>
                    <Button className="gap-2" onClick={() => setShowNewSeries(true)}>
                      <Plus size={16} /> New Series
                    </Button>
                  </div>

                  {seriesList.length === 0 ? (
                    <Card>
                      <CardBody className="flex flex-col items-center py-16 text-sand-400">
                        <BookOpen size={48} className="mb-4 opacity-50" />
                        <p className="text-sm">No series created yet</p>
                        <p className="text-xs mt-1">Create your first manga series to get started</p>
                        <Button className="mt-4 gap-2" onClick={() => setShowNewSeries(true)}>
                          <Plus size={16} /> Create Series
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {seriesList.map((series) => (
                        <Card key={series.id} hover>
                          <CardBody>
                            <h3 className="font-semibold text-terracotta-900">{series.title}</h3>
                            <p className="mt-1 text-sm text-sand-500 line-clamp-2">{series.description}</p>
                            <div className="mt-3 flex gap-2">
                              {series.genre?.map((g: string) => (
                                <Badge key={g}>{g}</Badge>
                              ))}
                              <Badge variant={series.is_published ? 'success' : 'warning'}>
                                {series.is_published ? 'Published' : 'Draft'}
                              </Badge>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* New Series Modal */}
                  <Modal open={showNewSeries} onClose={() => setShowNewSeries(false)} title="Create New Series" size="lg">
                    <div className="space-y-4">
                      <Input
                        label="Series Title"
                        value={newSeries.title}
                        onChange={(e) => setNewSeries((prev) => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter your series title"
                      />
                      <Textarea
                        label="Description"
                        value={newSeries.description}
                        onChange={(e) => setNewSeries((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your manga series"
                        rows={3}
                      />
                      <div className="space-y-1">
                        <label className="block text-sm font-medium text-terracotta-900">Genre</label>
                        <select
                          value={newSeries.genre}
                          onChange={(e) => setNewSeries((prev) => ({ ...prev, genre: e.target.value }))}
                          className="w-full rounded-lg border border-sand-300 bg-white px-4 py-2.5 text-sm text-terracotta-900 focus:border-terracotta-500 focus:outline-none focus:ring-2 focus:ring-terracotta-200"
                        >
                          <option value="">Select genre</option>
                          <option value="Action">Action</option>
                          <option value="Adventure">Adventure</option>
                          <option value="Comedy">Comedy</option>
                          <option value="Drama">Drama</option>
                          <option value="Fantasy">Fantasy</option>
                          <option value="Horror">Horror</option>
                          <option value="Romance">Romance</option>
                          <option value="Sci-Fi">Sci-Fi</option>
                          <option value="Slice of Life">Slice of Life</option>
                        </select>
                      </div>
                      <div className="flex justify-end gap-3 pt-2">
                        <Button variant="ghost" onClick={() => setShowNewSeries(false)}>Cancel</Button>
                        <Button onClick={handleCreateSeries} disabled={!newSeries.title}>Create Series</Button>
                      </div>
                    </div>
                  </Modal>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <Modal open={showNewProject} onClose={() => setShowNewProject(false)} title="New Project" size="sm">
        <div className="space-y-4">
          <Input
            label="Project Name"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Enter project name"
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowNewProject(false)}>Cancel</Button>
            <Button onClick={handleNewProject}>Create Project</Button>
          </div>
        </div>
      </Modal>

      {/* Mobile Story Editor (floating button + drawer is inside StoryEditor) */}
    </div>
  );
}
