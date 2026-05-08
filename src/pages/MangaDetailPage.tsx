import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card, CardBody } from '../components/ui/Card';
import { Textarea } from '../components/ui/Textarea';
import { Star, Eye, BookOpen, Heart, MessageCircle, UserPlus, Play, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatNumber, formatDate } from '../lib/utils';

interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  is_published: boolean;
  published_at: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  profiles?: { username: string; display_name: string; avatar_url: string };
}

const DEMO_MANGA = {
  id: 'demo-1',
  title: 'Hexagonal Warriors',
  description: 'In a world where all beings are constructed from geometric primitives, a young hexagonal warrior named Hex must defend the Clay Kingdom from the invading Angular Forces. With the power of terracotta and the wisdom of the ancients, Hex embarks on an epic journey across the Geometric Realm, discovering the true meaning of strength, friendship, and identity.',
  cover_url: 'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=600',
  genre: ['Action', 'Fantasy'],
  status: 'ongoing',
  rating: 4.5,
  view_count: 12400,
  creator: { username: 'claymaster', display_name: 'Clay Master' },
};

const DEMO_CHAPTERS: Chapter[] = [
  { id: 'ch-1', chapter_number: 1, title: 'The Awakening', is_published: true, published_at: '2025-01-15' },
  { id: 'ch-2', chapter_number: 2, title: 'Clay Kingdom', is_published: true, published_at: '2025-02-01' },
  { id: 'ch-3', chapter_number: 3, title: 'The Angular Threat', is_published: true, published_at: '2025-02-15' },
  { id: 'ch-4', chapter_number: 4, title: 'Hexagonal Power', is_published: true, published_at: '2025-03-01' },
  { id: 'ch-5', chapter_number: 5, title: 'Allies Unite', is_published: true, published_at: '2025-03-15' },
  { id: 'ch-6', chapter_number: 6, title: 'The Siege', is_published: true, published_at: '2025-04-01' },
];

export function MangaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toasts, show: showToast, dismiss } = useToast();
  const [manga, setManga] = useState(DEMO_MANGA);
  const [chapters, setChapters] = useState<Chapter[]>(DEMO_CHAPTERS);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters');

  // Load like/follow/bookmark state from localStorage
  useEffect(() => {
    if (!id) return;
    const liked = localStorage.getItem(`liked-${id}`);
    const followed = localStorage.getItem(`followed-${id}`);
    const bookmarked = localStorage.getItem(`bookmarked-${id}`);
    if (liked) setIsLiked(true);
    if (followed) setIsFollowing(true);
    if (bookmarked) setIsBookmarked(true);
  }, [id]);

  useEffect(() => {
    async function fetchManga() {
      if (!id || id.startsWith('demo')) return;
      const { data } = await supabase
        .from('manga_series')
        .select('*, profiles:creator_id(username, display_name, avatar_url)')
        .eq('id', id)
        .maybeSingle();
      if (data) setManga({ ...data, creator: data.profiles });

      const { data: chapterData } = await supabase
        .from('chapters')
        .select('*')
        .eq('series_id', id)
        .eq('is_published', true)
        .order('chapter_number');
      if (chapterData) setChapters(chapterData);
    }
    fetchManga();
  }, [id]);

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    if (id) localStorage.setItem(`liked-${id}`, next ? '1' : '');
    else localStorage.removeItem(`liked-${id}`);
    showToast(next ? 'Added to liked!' : 'Removed from liked', 'info');
  };

  const handleFollow = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    if (id) localStorage.setItem(`followed-${id}`, next ? '1' : '');
    else localStorage.removeItem(`followed-${id}`);
    showToast(next ? 'Following creator!' : 'Unfollowed creator', 'info');
  };

  const handleBookmark = () => {
    const next = !isBookmarked;
    setIsBookmarked(next);
    if (id) localStorage.setItem(`bookmarked-${id}`, next ? '1' : '');
    else localStorage.removeItem(`bookmarked-${id}`);
    showToast(next ? 'Bookmarked!' : 'Bookmark removed', 'info');
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      showToast('Link copied!');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: crypto.randomUUID(),
      content: newComment,
      created_at: new Date().toISOString(),
      profiles: { username: 'you', display_name: 'You', avatar_url: '' },
    };
    setComments((prev) => [comment, ...prev]);
    setNewComment('');
    showToast('Comment posted!');
  };

  const handleStartReading = () => {
    navigate(`/manga/${id}/chapter/1`);
  };

  return (
    <div className="min-h-screen bg-sand-50">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <img
          src={manga.cover_url}
          alt={manga.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-sand-50 via-sand-50/60 to-transparent" />
      </div>

      <div className="page-container -mt-32 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Cover */}
          <div className="flex-shrink-0">
            <div className="w-40 sm:w-48 aspect-[3/4] overflow-hidden rounded-xl manga-panel-shadow border-4 border-white">
              <img
                src={manga.cover_url}
                alt={manga.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 pt-2">
            <div className="flex flex-wrap gap-2 mb-3">
              {manga.genre?.map((g) => (
                <Badge key={g} variant="default">{g}</Badge>
              ))}
              <Badge variant={manga.status === 'ongoing' ? 'success' : 'info'}>
                {manga.status}
              </Badge>
            </div>
            <h1 className="font-display text-3xl font-bold text-terracotta-900 sm:text-4xl">
              {manga.title}
            </h1>
            <p className="mt-2 text-sand-500">
              by <span className="font-medium text-terracotta-600">{manga.creator?.display_name || manga.creator?.username}</span>
            </p>
            <p className="mt-4 text-sand-600 leading-relaxed max-w-2xl">{manga.description}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-sand-500">
              <span className="flex items-center gap-1">
                <Eye size={14} /> {formatNumber(manga.view_count)} views
              </span>
              <span className="flex items-center gap-1">
                <Star size={14} className="text-ochre-400" /> {manga.rating?.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen size={14} /> {chapters.length} chapters
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button size="lg" className="gap-2" onClick={handleStartReading}>
                <Play size={18} /> Start Reading
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleBookmark}
              >
                <Heart size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleFollow}
              >
                <UserPlus size={18} />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="gap-2"
                onClick={handleLike}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-red-500' : ''} />
                {isLiked ? 'Liked' : 'Like'}
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="gap-2"
                onClick={handleShare}
              >
                <Share2 size={18} /> Share
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex gap-1 rounded-xl bg-sand-100 p-1 max-w-md">
          {(['chapters', 'comments'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-terracotta-700 shadow-sm'
                  : 'text-sand-500 hover:text-terracotta-600'
              }`}
            >
              {tab === 'chapters' ? <BookOpen size={16} /> : <MessageCircle size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Chapters List */}
        {activeTab === 'chapters' && (
          <div className="mt-6 space-y-2">
            {chapters.map((chapter, i) => (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link to={`/manga/${id}/chapter/${chapter.chapter_number}`}>
                  <Card hover className="cursor-pointer">
                    <CardBody className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-terracotta-50 text-sm font-bold text-terracotta-600">
                          {chapter.chapter_number}
                        </span>
                        <div>
                          <p className="font-medium text-terracotta-900">{chapter.title || `Chapter ${chapter.chapter_number}`}</p>
                          <p className="text-xs text-sand-400">{formatDate(chapter.published_at)}</p>
                        </div>
                      </div>
                      <Play size={16} className="text-sand-400" />
                    </CardBody>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Comments */}
        {activeTab === 'comments' && (
          <div className="mt-6 space-y-4">
            {user && (
              <Card>
                <CardBody className="space-y-3">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts on this manga..."
                    rows={3}
                  />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={handleComment} disabled={!newComment.trim()}>
                      Post Comment
                    </Button>
                  </div>
                </CardBody>
              </Card>
            )}

            {!user && (
              <Card>
                <CardBody className="text-center py-6 text-sand-400">
                  <p className="text-sm">Sign in to leave a comment</p>
                  <Link to="/login">
                    <Button size="sm" variant="outline" className="mt-2">Sign In</Button>
                  </Link>
                </CardBody>
              </Card>
            )}

            {comments.length === 0 ? (
              <div className="text-center py-12 text-sand-400">
                <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Card key={comment.id}>
                  <CardBody>
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta-100 text-xs font-bold text-terracotta-600">
                        {(comment.profiles?.display_name || comment.profiles?.username || 'U')[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-terracotta-900">
                            {comment.profiles?.display_name || comment.profiles?.username}
                          </span>
                          <span className="text-xs text-sand-400">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="mt-1 text-sm text-sand-600">{comment.content}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
