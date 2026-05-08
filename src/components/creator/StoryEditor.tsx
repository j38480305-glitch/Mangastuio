import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { FileText, StickyNote, Users, Save, Download, Trash2, PenLine, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type EditorTab = 'script' | 'panel-notes' | 'character-notes';

const SCRIPT_TAGS = [
  { label: 'Page Break', tag: '\n--- PAGE BREAK ---\n' },
  { label: 'Panel:', tag: '\n[PANEL] ' },
  { label: 'Caption:', tag: '[CAPTION] ' },
  { label: 'Dialogue:', tag: '[DIALOGUE] ' },
  { label: 'SFX:', tag: '[SFX] ' },
];

interface StoryEditorProps {
  onToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export function StoryEditor({ onToast }: StoryEditorProps) {
  const [activeTab, setActiveTab] = useState<EditorTab>('script');
  const [chapterTitle, setChapterTitle] = useState('');
  const [script, setScript] = useState('');
  const [panelNotes, setPanelNotes] = useState('');
  const [characterNotes, setCharacterNotes] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const storageKey = 'terramanga-story-editor';

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setChapterTitle(data.chapterTitle || '');
        setScript(data.script || '');
        setPanelNotes(data.panelNotes || '');
        setCharacterNotes(data.characterNotes || '');
        setSavedAt(data.savedAt || null);
      } catch { /* ignore corrupt data */ }
    }
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString();
      const data = { chapterTitle, script, panelNotes, characterNotes, savedAt: now };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSavedAt(now);
    }, 30000);
    return () => clearInterval(interval);
  }, [chapterTitle, script, panelNotes, characterNotes]);

  const handleSave = useCallback(() => {
    const now = new Date().toISOString();
    const data = { chapterTitle, script, panelNotes, characterNotes, savedAt: now };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setSavedAt(now);
    onToast('Project saved!');
  }, [chapterTitle, script, panelNotes, characterNotes, onToast]);

  const handleClear = useCallback(() => {
    setChapterTitle('');
    setScript('');
    setPanelNotes('');
    setCharacterNotes('');
    localStorage.removeItem(storageKey);
    setSavedAt(null);
    setShowClearConfirm(false);
    onToast('Editor cleared', 'info');
  }, [onToast]);

  const handleExport = useCallback(() => {
    const content = [
      `Chapter: ${chapterTitle || 'Untitled'}`,
      '='.repeat(40),
      '',
      '--- STORY SCRIPT ---',
      script || '(empty)',
      '',
      '--- PANEL NOTES ---',
      panelNotes || '(empty)',
      '',
      '--- CHARACTER NOTES ---',
      characterNotes || '(empty)',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(chapterTitle || 'terramanga-script').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onToast('Script exported!');
  }, [chapterTitle, script, panelNotes, characterNotes, onToast]);

  const insertTag = useCallback((tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = activeTab === 'script' ? script : activeTab === 'panel-notes' ? panelNotes : characterNotes;
    const updated = current.substring(0, start) + tag + current.substring(end);
    if (activeTab === 'script') setScript(updated);
    else if (activeTab === 'panel-notes') setPanelNotes(updated);
    else setCharacterNotes(updated);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + tag.length;
      textarea.focus();
    }, 0);
  }, [activeTab, script, panelNotes, characterNotes]);

  const wordCount = (activeTab === 'script' ? script : activeTab === 'panel-notes' ? panelNotes : characterNotes)
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const tabs: { id: EditorTab; label: string; icon: typeof FileText }[] = [
    { id: 'script', label: 'Story Script', icon: FileText },
    { id: 'panel-notes', label: 'Panel Notes', icon: StickyNote },
    { id: 'character-notes', label: 'Character Notes', icon: Users },
  ];

  const editorContent = (
    <div className="flex flex-col h-full">
      {/* Chapter Title */}
      <div className="px-4 pt-4 pb-2 border-b border-sand-100">
        <Input
          value={chapterTitle}
          onChange={(e) => setChapterTitle(e.target.value)}
          placeholder="Chapter Title"
          className="font-display font-semibold text-lg"
        />
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 px-4 py-2 bg-sand-50 border-b border-sand-100">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-terracotta-100 text-terracotta-700'
                : 'text-sand-500 hover:text-terracotta-600 hover:bg-sand-100'
            }`}
          >
            <tab.icon size={13} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Script Tags (only for script tab) */}
      {activeTab === 'script' && (
        <div className="flex gap-1.5 px-4 py-2 border-b border-sand-100 overflow-x-auto scrollbar-hide">
          {SCRIPT_TAGS.map((tag) => (
            <button
              key={tag.label}
              onClick={() => insertTag(tag.tag)}
              className="flex-shrink-0 rounded-md bg-sand-100 px-2.5 py-1 text-xs font-medium text-sand-600 hover:bg-terracotta-50 hover:text-terracotta-700 transition-colors"
            >
              {tag.label}
            </button>
          ))}
        </div>
      )}

      {/* Textarea */}
      <div className="flex-1 px-4 py-3 min-h-0">
        <textarea
          ref={textareaRef}
          value={activeTab === 'script' ? script : activeTab === 'panel-notes' ? panelNotes : characterNotes}
          onChange={(e) => {
            if (activeTab === 'script') setScript(e.target.value);
            else if (activeTab === 'panel-notes') setPanelNotes(e.target.value);
            else setCharacterNotes(e.target.value);
          }}
          placeholder={
            activeTab === 'script'
              ? 'Write your manga story script here...\n\nUse the tags above to format: [PANEL], [DIALOGUE], [CAPTION], [SFX]'
              : activeTab === 'panel-notes'
              ? 'Describe panel layouts, compositions, and visual notes...'
              : 'Describe characters, their backstories, and relationships...'
          }
          className="w-full h-full min-h-[200px] resize-none rounded-lg border border-sand-200 bg-white px-3 py-2.5 text-sm text-terracotta-900 placeholder:text-sand-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-100"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-sand-100 bg-sand-50">
        <div className="flex items-center gap-3 text-xs text-sand-400">
          <span>{wordCount} words</span>
          {savedAt && (
            <span className="flex items-center gap-1 text-green-600">
              <Save size={10} /> Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleSave}>
            <Save size={12} /> Save
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleExport}>
            <Download size={12} /> Export
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-xs text-red-500 hover:text-red-600" onClick={() => setShowClearConfirm(true)}>
            <Trash2 size={12} /> Clear
          </Button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      <Modal open={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Clear Editor" size="sm">
        <p className="text-sm text-sand-600">Are you sure you want to clear all content? This cannot be undone.</p>
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" size="sm" onClick={() => setShowClearConfirm(false)}>Cancel</Button>
          <Button variant="danger" size="sm" onClick={handleClear}>Clear All</Button>
        </div>
      </Modal>
    </div>
  );

  return (
    <>
      {/* Desktop: inline panel */}
      <div className="hidden lg:block h-full rounded-xl border border-sand-200 bg-white shadow-sm overflow-hidden">
        {editorContent}
      </div>

      {/* Mobile: floating button + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-600 text-white shadow-xl hover:bg-terracotta-700 transition-colors"
        >
          <PenLine size={22} />
        </button>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/40"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-sand-100">
                  <h3 className="font-display font-semibold text-terracotta-900">Story Editor</h3>
                  <button onClick={() => setMobileOpen(false)} className="text-sand-400 hover:text-sand-600">
                    <X size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {editorContent}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
