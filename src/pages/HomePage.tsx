import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, BookOpen, PenTool, Sparkles, Users, Zap, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';

const featuredManga = [
  {
    id: '1',
    title: 'Hexagonal Warriors',
    cover: 'https://images.pexels.com/photos/7682193/pexels-photo-7682193.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: 'Action',
    views: 12400,
    chapters: 24,
  },
  {
    id: '2',
    title: 'Clay Chronicles',
    cover: 'https://images.pexels.com/photos/7681832/pexels-photo-7681832.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: 'Fantasy',
    views: 8900,
    chapters: 18,
  },
  {
    id: '3',
    title: 'Block City Blues',
    cover: 'https://images.pexels.com/photos/7681843/pexels-photo-7681843.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: 'Drama',
    views: 6200,
    chapters: 12,
  },
  {
    id: '4',
    title: 'Terracotta Tales',
    cover: 'https://images.pexels.com/photos/7681856/pexels-photo-7681856.jpeg?auto=compress&cs=tinysrgb&w=600',
    genre: 'Slice of Life',
    views: 4500,
    chapters: 30,
  },
];

const features = [
  {
    icon: Sparkles,
    title: 'AI Character Generation',
    description: 'Generate consistent geometric LEGO-style characters with our AI-powered tools.',
  },
  {
    icon: PenTool,
    title: 'Creator Studio',
    description: 'Professional panel layouts, speech bubbles, and multi-layer canvas editing.',
  },
  {
    icon: BookOpen,
    title: 'Immersive Reader',
    description: 'Multiple reading modes including webtoon scroll, page view, and RTL manga.',
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Follow creators, leave reviews, and discover your next favorite series.',
  },
];

export function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-terracotta-50 via-sand-50 to-ochre-50">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-terracotta-200 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-ochre-200 blur-3xl" />
          <div className="absolute top-40 right-1/3 h-48 w-48 rounded-full bg-clay-200 blur-3xl" />
        </div>

        <div className="page-container relative py-20 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-terracotta-100 px-4 py-1.5 text-sm font-medium text-terracotta-700 mb-6">
              <Zap size={14} />
              AI-Powered Manga Creation
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-terracotta-950 sm:text-5xl lg:text-6xl leading-[1.1]">
              Create Stunning Manga with{' '}
              <span className="gradient-text">Geometric AI Characters</span>
            </h1>
            <p className="mt-6 text-lg text-sand-600 leading-relaxed max-w-2xl">
              TerraManga is the all-in-one platform for creating, sharing, and discovering manga.
              Generate consistent terracotta-style characters, design panel layouts, and publish
              your stories to a growing community.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/studio">
                <Button size="lg" className="gap-2">
                  <PenTool size={18} />
                  Start Creating
                </Button>
              </Link>
              <Link to="/discover">
                <Button variant="secondary" size="lg" className="gap-2">
                  <BookOpen size={18} />
                  Browse Manga
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Manga */}
      <section className="page-container py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-heading">Featured Series</h2>
          <Link to="/discover" className="flex items-center gap-1 text-sm font-medium text-terracotta-600 hover:text-terracotta-700 transition-colors">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6">
          {featuredManga.map((manga, i) => (
            <motion.div
              key={manga.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <Link to={`/manga/${manga.id}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand-100 manga-panel-shadow">
                  <img
                    src={manga.cover}
                    alt={manga.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center gap-2 text-white text-xs">
                      <Eye size={12} />
                      {manga.views.toLocaleString()} views
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <h3 className="font-semibold text-terracotta-900 text-sm group-hover:text-terracotta-600 transition-colors line-clamp-1">
                    {manga.title}
                  </h3>
                  <p className="text-xs text-sand-500 mt-0.5">{manga.genre} &middot; {manga.chapters} chapters</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-y border-sand-200">
        <div className="page-container py-16">
          <div className="text-center mb-12">
            <h2 className="section-heading">Everything You Need to Create Manga</h2>
            <p className="mt-3 text-sand-500 max-w-xl mx-auto">
              From AI character generation to professional publishing tools, TerraManga has you covered.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl border border-sand-200 bg-sand-50/50 p-6 hover:border-terracotta-200 hover:bg-terracotta-50/30 transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta-100 text-terracotta-600 mb-4">
                  <feature.icon size={22} />
                </div>
                <h3 className="font-display font-semibold text-terracotta-900">{feature.title}</h3>
                <p className="mt-2 text-sm text-sand-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="page-container py-16">
        <div className="rounded-3xl bg-gradient-to-br from-terracotta-600 to-terracotta-800 p-8 sm:p-12 text-center">
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Ready to Bring Your Stories to Life?
          </h2>
          <p className="mt-3 text-terracotta-200 max-w-lg mx-auto">
            Join thousands of creators using TerraManga to create stunning geometric-style manga.
          </p>
          <Link to="/register">
            <Button
              size="lg"
              className="mt-6 bg-white text-terracotta-700 hover:bg-sand-50 shadow-lg gap-2"
            >
              Get Started Free <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
