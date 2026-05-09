import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import {
  Grid3x3, Plus, Trash2, Move, MessageSquare,
  Download, Eye, EyeOff, GripVertical
} from 'lucide-react';

interface Panel {
  id: string;
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dialogue: string;
  dialogueX: number;
  dialogueY: number;
}

interface PanelCanvasProps {
  panels: Panel[];
  onPanelsChange: (panels: Panel[]) => void;
  onAddPanel: () => void;
  onRemovePanel: (id: string) => void;
  layout: string;
  onLayoutChange: (layout: string) => void;
}

const LAYOUTS = [
  { id: 'single', label: 'Single', cols: 1, rows: 1 },
  { id: '2-panel', label: '2-Panel', cols: 1, rows: 2 },
  { id: '4-panel', label: '4-Panel', cols: 2, rows: 2 },
  { id: 'webtoon', label: 'Webtoon', cols: 1, rows: 4 },
];

export function PanelCanvas({
  panels, onPanelsChange, onAddPanel, onRemovePanel,
  layout, onLayoutChange
}: PanelCanvasProps) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [editingDialogue, setEditingDialogue] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentLayout = LAYOUTS.find(l => l.id === layout) || LAYOUTS[2];

  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragEnd = () => setDraggingId(null);

  const handleDrop = useCallback((e: React.DragEvent, targetId?: string) => {
    e.preventDefault();
    // Handle reordering logic here
    setDraggingId(null);
  }, []);

  const updateDialogue = (id: string, dialogue: string) => {
    onPanelsChange(panels.map(p => p.id === id ? { ...p, dialogue } : p));
  };

  const exportPage = async () => {
    if (!canvasRef.current) return;
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(canvasRef.current, { quality: 0.95 });
    const link = document.createElement('a');
    link.download = `manga-page-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          {LAYOUTS.map((l) => (
            <button
              key={l.id}
              onClick={() => onLayoutChange(l.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                layout === l.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowGrid(!showGrid)}
          className={`p-2 rounded-lg transition-colors ${showGrid ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'}`}
          title="Toggle grid overlay"
        >
          {showGrid ? <Eye size={16} /> : <EyeOff size={16} />}
        </button>
        <div className="flex-1" />
        <Button onClick={onAddPanel} size="sm" className="gap-1">
          <Plus size={14} /> Add Panel
        </Button>
        <Button onClick={exportPage} variant="outline" size="sm" className="gap-1">
          <Download size={14} /> Export Page
        </Button>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`relative bg-white rounded-xl overflow-hidden border-2 border-gray-700 ${
          showGrid ? 'bg-grid' : ''
        }`}
        style={{
          minHeight: '600px',
          aspectRatio: layout === 'webtoon' ? '9/16' : '3/4',
          maxWidth: '800px',
          margin: '0 auto',
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e)}
      >
        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="w-full h-full grid gap-1 p-2"
              style={{
                gridTemplateColumns: `repeat(${currentLayout.cols}, 1fr)`,
                gridTemplateRows: `repeat(${currentLayout.rows}, 1fr)`,
              }}
            >
              {Array.from({ length: currentLayout.cols * currentLayout.rows }).map((_, i) => (
                <div key={i} className="border border-dashed border-gray-300 rounded-lg" />
              ))}
            </div>
          </div>
        )}

        {/* Panels */}
        {panels.map((panel, index) => (
          <motion.div
            key={panel.id}
            layout
            draggable
            onDragStart={() => handleDragStart(panel.id)}
            onDragEnd={handleDragEnd}
            className={`absolute cursor-move group ${
              draggingId === panel.id ? 'opacity-50 z-10' : 'z-0'
            }`}
            style={{
              left: `${panel.x}%`,
              top: `${panel.y}%`,
              width: `${panel.width}%`,
              height: `${panel.height}%`,
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {/* Panel content */}
            <div className="relative w-full h-full rounded-lg overflow-hidden border-2 border-gray-300 hover:border-indigo-400 transition-colors">
              {panel.imageUrl ? (
                <img
                  src={panel.imageUrl}
                  alt={`Panel ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="text-center text-gray-400">
                    <Grid3x3 size={24} className="mx-auto mb-1" />
                    <span className="text-xs">Panel {index + 1}</span>
                  </div>
                </div>
              )}

              {/* Dialogue bubble */}
              {panel.dialogue && (
                <div
                  className="absolute bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 text-sm text-gray-900 shadow-lg border border-gray-200 max-w-[80%]"
                  style={{
                    left: `${panel.dialogueX}%`,
                    top: `${panel.dialogueY}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {panel.dialogue}
                  {/* Bubble tail */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white/90" />
                </div>
              )}

              {/* Hover controls */}
              <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => setEditingDialogue(editingDialogue === panel.id ? null : panel.id)}
                  className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-indigo-600"
                  title="Edit dialogue"
                >
                  <MessageSquare size={12} />
                </button>
                <button
                  onClick={() => onRemovePanel(panel.id)}
                  className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-red-600"
                  title="Remove panel"
                >
                  <Trash2 size={12} />
                </button>
                <button className="p-1.5 bg-white rounded-lg shadow text-gray-600 hover:text-indigo-600 cursor-grab" title="Drag to reposition">
                  <GripVertical size={12} />
                </button>
              </div>

              {/* Panel number */}
              <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>

              {/* Inline dialogue editor */}
              {editingDialogue === panel.id && (
                <div className="absolute inset-x-0 bottom-0 p-2 bg-black/70">
                  <Input
                    value={panel.dialogue}
                    onChange={e => updateDialogue(panel.id, e.target.value)}
                    placeholder="Enter dialogue..."
                    className="text-sm"
                    autoFocus
                    onBlur={() => setEditingDialogue(null)}
                    onKeyDown={e => { if (e.key === 'Enter') setEditingDialogue(null); }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Empty state */}
        {panels.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Grid3x3 size={48} className="mx-auto mb-3 opacity-50" />
              <p className="text-lg font-medium">No panels yet</p>
              <p className="text-sm">Generate images and add them to panels</p>
              <Button onClick={onAddPanel} className="mt-4 gap-1">
                <Plus size={14} /> Add First Panel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Panel List (bottom bar) */}
      {panels.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {panels.map((panel, i) => (
            <div
              key={panel.id}
              className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-indigo-400 cursor-pointer transition-colors"
            >
              {panel.imageUrl ? (
                <img src={panel.imageUrl} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 text-xs">
                  #{i + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
