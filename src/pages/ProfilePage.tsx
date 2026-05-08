import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/ui/ToastContainer';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Modal } from '../components/ui/Modal';
import { User, BookOpen, Heart, Pencil } from 'lucide-react';

interface ProfileData {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  is_creator: boolean;
}

interface SeriesData {
  id: string;
  title: string;
  description: string;
  genre: string[];
  is_published: boolean;
}

interface BookmarkData {
  id: string;
  series_id: string;
  manga_series: { title: string } | null;
}

export function ProfilePage() {
  const { user } = useAuth();
  const { toasts, show: showToast, dismiss } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [series, setSeries] = useState<SeriesData[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([]);
  const [activeTab, setActiveTab] = useState<'series' | 'bookmarks'>('series');
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ display_name: '', bio: '' });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile(data as ProfileData);
          setEditForm({ display_name: data.display_name, bio: data.bio });
        }
      });

    supabase.from('manga_series').select('*').eq('creator_id', user.id)
      .then(({ data }) => { if (data) setSeries(data as SeriesData[]); });

    supabase.from('bookmarks').select('*, manga_series(title)').eq('user_id', user.id)
      .then(({ data }) => { if (data) setBookmarks(data as BookmarkData[]); });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .update({ display_name: editForm.display_name, bio: editForm.bio, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .maybeSingle();
    if (data) {
      setProfile(data as ProfileData);
      setShowEdit(false);
      showToast('Profile updated!');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-terracotta-900">Sign in to view your profile</h2>
          <p className="mt-2 text-sand-500">You need an account to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Profile Header */}
      <div className="bg-gradient-to-br from-terracotta-600 to-terracotta-800 pb-20">
        <div className="page-container pt-8">
          <div className="flex items-center justify-end">
            <Button variant="ghost" size="sm" className="text-white/80 hover:bg-white/10 gap-2" onClick={() => setShowEdit(true)}>
              <Pencil size={14} /> Edit Profile
            </Button>
          </div>
        </div>
      </div>

      <div className="page-container -mt-16 relative z-10 pb-16">
        <div className="flex items-end gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-terracotta-100 text-terracotta-600 border-4 border-white shadow-lg">
            <User size={40} />
          </div>
          <div className="pb-1">
            <h1 className="font-display text-2xl font-bold text-terracotta-900">
              {profile?.display_name || profile?.username || 'Creator'}
            </h1>
            <p className="text-sand-500 text-sm">@{profile?.username || 'username'}</p>
          </div>
        </div>

        {profile?.bio && (
          <p className="mt-4 text-sand-600 max-w-xl">{profile.bio}</p>
        )}

        <div className="mt-4 flex gap-6 text-sm text-sand-500">
          <span className="flex items-center gap-1.5">
            <BookOpen size={14} /> {series.length} Series
          </span>
          <span className="flex items-center gap-1.5">
            <Heart size={14} /> {bookmarks.length} Bookmarks
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-xl bg-sand-100 p-1 max-w-sm">
          {(['series', 'bookmarks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all capitalize ${
                activeTab === tab
                  ? 'bg-white text-terracotta-700 shadow-sm'
                  : 'text-sand-500 hover:text-terracotta-600'
              }`}
            >
              {tab === 'series' ? <BookOpen size={16} /> : <Heart size={16} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'series' && (
          <div className="mt-6">
            {series.length === 0 ? (
              <Card>
                <CardBody className="flex flex-col items-center py-12 text-sand-400">
                  <BookOpen size={36} className="mb-3 opacity-50" />
                  <p className="text-sm">No series created yet</p>
                  <Link to="/studio">
                    <Button size="sm" className="mt-3 gap-2">
                      <Pencil size={14} /> Create Your First Series
                    </Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {series.map((s) => (
                  <Link key={s.id} to={`/manga/${s.id}`}>
                    <Card hover>
                      <CardBody>
                        <h3 className="font-semibold text-terracotta-900">{s.title}</h3>
                        <p className="mt-1 text-sm text-sand-500 line-clamp-2">{s.description}</p>
                        <div className="mt-3 flex gap-2">
                          {s.genre?.map((g: string) => (
                            <Badge key={g}>{g}</Badge>
                          ))}
                          <Badge variant={s.is_published ? 'success' : 'warning'}>
                            {s.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="mt-6">
            {bookmarks.length === 0 ? (
              <Card>
                <CardBody className="flex flex-col items-center py-12 text-sand-400">
                  <Heart size={36} className="mb-3 opacity-50" />
                  <p className="text-sm">No bookmarks yet</p>
                  <Link to="/discover">
                    <Button size="sm" variant="outline" className="mt-3">Discover Manga</Button>
                  </Link>
                </CardBody>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {bookmarks.map((b) => (
                  <Link key={b.id} to={`/manga/${b.series_id}`}>
                    <Card hover>
                      <CardBody>
                        <h3 className="font-semibold text-terracotta-900">
                          {b.manga_series?.title || 'Unknown Series'}
                        </h3>
                      </CardBody>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile" size="lg">
        <div className="space-y-4">
          <Input
            label="Display Name"
            value={editForm.display_name}
            onChange={(e) => setEditForm((prev) => ({ ...prev, display_name: e.target.value }))}
          />
          <Textarea
            label="Bio"
            value={editForm.bio}
            onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
            rows={3}
            placeholder="Tell us about yourself..."
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowEdit(false)}>Cancel</Button>
            <Button onClick={handleSaveProfile}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
