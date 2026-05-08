import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Maximize, Minimize, Settings, Bookmark, ArrowLeft, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

type ReadingMode = 'webtoon' | 'single' | 'double' | 'rtl';

const DEMO_PAGES = [
  'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7681832/pexels-photo-7681832.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7681843/pexels-photo-7681843.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7681856/pexels-photo-7681856.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/7681832/pexels-photo-7681832.jpeg?auto=compress&cs=tinysrgb&w=800',
];

export function MangaReaderPage() {
  const { id, chapterId } = useParams();
  const [readingMode, setReadingMode] = useState<ReadingMode>('webtoon');
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const pages = DEMO_PAGES;
  const totalPages = pages.length;

  // Persist reading progress
  useEffect(() => {
    const key = `reading-progress-${id}-${chapterId}`;
    const saved = localStorage.getItem(key);
    if (saved) setCurrentPage(Number(saved));
  }, [id, chapterId]);

  useEffect(() => {
    const key = `reading-progress-${id}-${chapterId}`;
    localStorage.setItem(key, String(currentPage));
  }, [currentPage, id, chapterId]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setCurrentPage((p) => Math.max(p - 1, 0));
      } else if (e.key === 'f') {
        toggleFullscreen();
      } else if (e.key === 'Escape') {
        setShowControls((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [totalPages, toggleFullscreen]);

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 0));

  return (
    <div ref={containerRef} className="relative min-h-screen bg-black">
      {/* Top Controls */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/80 to-transparent px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to={`/manga/${id}`}>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 gap-1">
                    <ArrowLeft size={16} /> Back
                  </Button>
                </Link>
                <div className="text-white">
                  <p className="text-sm font-medium">Chapter 1</p>
                  <p className="text-xs text-white/60">Hexagonal Warriors</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-white hover:bg-white/10 gap-1 ${bookmarked ? 'text-ochre-400' : ''}`}
                  onClick={() => setBookmarked(!bookmarked)}
                >
                  <Bookmark size={16} fill={bookmarked ? 'currentColor' : 'none'} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10 gap-1"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  <Settings size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/10"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-0 right-0 bottom-0 z-30 w-72 bg-sand-50 border-l border-sand-200 shadow-2xl overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-sand-200">
              <h3 className="font-display font-semibold text-terracotta-900">Reading Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-sand-400 hover:text-sand-600">
                <X size={18} />
              </button>
            </div>
            <div className="p-4 space-y-6">
              <div>
                <label className="text-sm font-medium text-terracotta-900 mb-2 block">Reading Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { id: 'webtoon' as const, label: 'Webtoon Scroll' },
                    { id: 'single' as const, label: 'Single Page' },
                    { id: 'double' as const, label: 'Double Page' },
                    { id: 'rtl' as const, label: 'Right to Left' },
                  ]).map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setReadingMode(mode.id)}
                      className={`rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        readingMode === mode.id
                          ? 'bg-terracotta-100 text-terracotta-700 border border-terracotta-200'
                          : 'bg-white text-sand-600 border border-sand-200 hover:border-terracotta-200'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reader Content */}
      <div
        className="pt-14 pb-14 min-h-screen"
        onClick={() => setShowControls((prev) => !prev)}
      >
        {readingMode === 'webtoon' ? (
          /* Webtoon Scroll Mode */
          <div className="mx-auto max-w-2xl">
            {pages.map((page, i) => (
              <div key={i} className="relative">
                <img
                  src={page}
                  alt={`Page ${i + 1}`}
                  className="w-full"
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              </div>
            ))}
          </div>
        ) : readingMode === 'double' ? (
          /* Double Page spread */
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] gap-1 px-4">
            {currentPage > 0 && (
              <img
                src={pages[currentPage - 1]}
                alt={`Page ${currentPage}`}
                className="max-h-[calc(100vh-8rem)] w-1/2 object-contain"
              />
            )}
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-h-[calc(100vh-8rem)] w-1/2 object-contain"
            />
          </div>
        ) : (
          /* Single page / RTL mode */
          <div className="flex items-center justify-center min-h-[calc(100vh-7rem)] px-4">
            <img
              src={pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              className="max-h-[calc(100vh-8rem)] max-w-full object-contain"
            />
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      {readingMode !== 'webtoon' && showControls && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 py-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={prevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft size={20} />
            </Button>
            <div className="text-center">
              <p className="text-sm text-white/80">
                {currentPage + 1} / {totalPages}
              </p>
              <div className="mt-1 h-1 w-32 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full bg-terracotta-400 rounded-full transition-all duration-300"
                  style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
                />
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
              onClick={nextPage}
              disabled={currentPage === totalPages - 1}
            >
              <ChevronRight size={20} />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Click zones for page navigation (single/rtl/double modes) */}
      {readingMode !== 'webtoon' && (
        <div className="absolute inset-0 z-10 flex" onClick={(e) => e.stopPropagation()}>
          <div className="w-1/3 h-full cursor-pointer" onClick={prevPage} />
          <div className="w-1/3 h-full" onClick={() => setShowControls((prev) => !prev)} />
          <div className="w-1/3 h-full cursor-pointer" onClick={nextPage} />
        </div>
      )}
    </div>
  );
}
