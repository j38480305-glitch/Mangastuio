import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Search, Eye, BookOpen, Star, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GENRES, formatNumber } from '../lib/utils';

interface MangaSeries {
  id: string;
  title: string;
  description: string;
  cover_url: string;
  genre: string[];
  status: string;
  rating: number;
  view_count: number;
  creator_id: string;
  profiles?: { username: string; display_name: string };
}

const DEMO_MANGA: MangaSeries[] = [
  {
    id: 'demo-1',
    title: 'Hexagonal Warriors',
    description: 'In a world of geometric beings, a young hexagonal warrior must defend the Clay Kingdom from the Angular Invasion.',
    cover_url: 'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: ['Action', 'Fantasy'],
    status: 'ongoing',
    rating: 4.5,
    view_count: 12400,
    creator_id: '',
    profiles: { username: 'claymaster', display_name: 'Clay Master' },
  },
  {
    id: 'demo-2',
    title: 'Clay Chronicles',
    description: 'Ancient terracotta beings awaken in the modern world, struggling to find their place among humans.',
    cover_url: 'https://images.pexels.com/photos/7681832/pexels-photo-7681832.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: ['Fantasy', 'Drama'],
    status: 'ongoing',
    rating: 4.2,
    view_count: 8900,
    creator_id: '',
    profiles: { username: 'terracotta_tales', display_name: 'Terracotta Tales' },
  },
  {
    id: 'demo-3',
    title: 'Block City Blues',
    description: 'A noir detective story set in Block City, where geometric citizens hide angular secrets.',
    cover_url: 'https://images.pexels.com/photos/7681843/pexels-photo-7681843.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: ['Drama', 'Mystery'],
    status: 'completed',
    rating: 4.7,
    view_count: 6200,
    creator_id: '',
    profiles: { username: 'blocknoir', display_name: 'Block Noir' },
  },
  {
    id: 'demo-4',
    title: 'Terracotta Tales',
    description: 'Heartwarming stories of geometric villagers going about their daily lives in Clay Town.',
    cover_url: 'https://images.pexels.com/photos/7681856/pexels-photo-7681856.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: ['Slice of Life', 'Comedy'],
    status: 'ongoing',
    rating: 4.0,
    view_count: 4500,
    creator_id: '',
    profiles: { username: 'claylife', display_name: 'Clay Life' },
  },
  {
    id: 'demo-5',
    title: 'Prism Knights',
    description: 'Legendary warriors made of living crystal defend the realm from shadow creatures.',
    cover_url: 'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: ['Action', 'Adventure'],
    status: 'ongoing',
    rating: 4.3,
    view_count: 7800,
    creator_id: '',
    profiles: { username: 'prism_studio', display_name: 'Prism Studio' },
  },
  {
    id: 'demo-6',
    title: 'Geometric Ghosts',
    description: 'When a hexagonal medium discovers she can see geometric spirits, her world turns upside down.',
    cover_url: 'https://images.pexels.com/photos/7681832/pexels-photo-7681832.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: ['Supernatural', 'Horror'],
    status: 'ongoing',
    rating: 4.1,
    view_count: 3200,
    creator_id: '',
    profiles: { username: 'hex_ghost', display_name: 'Hex Ghost' },
  },
];

export function DiscoverPage() {
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [mangaList, setMangaList] = useState<MangaSeries[]>(DEMO_MANGA);

  useEffect(() => {
    async function fetchManga() {
      const { data } = await supabase
        .from('manga_series')
        .select('*, profiles:creator_id(username, display_name)')
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(20);

      if (data && data.length > 0) {
        setMangaList([...data, ...DEMO_MANGA]);
      }
    }
    fetchManga();
  }, []);

  const filtered = mangaList.filter((m) => {
    const matchesSearch = !search ||
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = !selectedGenre || m.genre?.includes(selectedGenre);
    return matchesSearch && matchesGenre;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'popular') return b.view_count - a.view_count;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="section-heading">Discover Manga</h1>
          <p className="mt-2 text-sand-500">Explore geometric-style manga from creators around the world</p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sand-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search manga by title or description..."
                className="w-full rounded-xl border border-sand-200 bg-white pl-11 pr-4 py-3 text-sm text-terracotta-900 placeholder:text-sand-400 focus:border-terracotta-400 focus:outline-none focus:ring-2 focus:ring-terracotta-100"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-sand-200 bg-white p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-terracotta-900 mb-2 block">Genre</label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedGenre(null)}
                        className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                          !selectedGenre ? 'bg-terracotta-100 text-terracotta-700' : 'bg-sand-50 text-sand-600 hover:bg-sand-100'
                        }`}
                      >
                        All
                      </button>
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          onClick={() => setSelectedGenre(genre === selectedGenre ? null : genre)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                            selectedGenre === genre ? 'bg-terracotta-100 text-terracotta-700' : 'bg-sand-50 text-sand-600 hover:bg-sand-100'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-terracotta-900 mb-2 block">Sort By</label>
                    <div className="flex gap-2">
                      {(['popular', 'rating', 'newest'] as const).map((option) => (
                        <button
                          key={option}
                          onClick={() => setSortBy(option)}
                          className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                            sortBy === option ? 'bg-terracotta-100 text-terracotta-700' : 'bg-sand-50 text-sand-600 hover:bg-sand-100'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((manga, i) => (
            <motion.div
              key={manga.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link to={`/manga/${manga.id}`} className="group block">
                <Card hover>
                  <div className="relative aspect-[16/9] overflow-hidden rounded-t-xl bg-sand-100">
                    <img
                      src={manga.cover_url || 'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=600'}
                      alt={manga.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <Badge variant="info" className="text-[10px]">{manga.status}</Badge>
                    </div>
                  </div>
                  <CardBody>
                    <h3 className="font-semibold text-terracotta-900 group-hover:text-terracotta-600 transition-colors">
                      {manga.title}
                    </h3>
                    <p className="mt-1 text-sm text-sand-500 line-clamp-2">{manga.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {manga.genre?.slice(0, 3).map((g) => (
                        <Badge key={g} variant="default">{g}</Badge>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs text-sand-400">
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {formatNumber(manga.view_count)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={12} className="text-ochre-400" /> {manga.rating?.toFixed(1)}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={12} /> {manga.profiles?.display_name || manga.profiles?.username || 'Unknown'}
                      </span>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {sorted.length === 0 && (
          <div className="flex flex-col items-center py-16 text-sand-400">
            <Search size={48} className="mb-4 opacity-50" />
            <p className="text-sm">No manga found matching your criteria</p>
            <Button variant="ghost" className="mt-3" onClick={() => { setSearch(''); setSelectedGenre(null); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
