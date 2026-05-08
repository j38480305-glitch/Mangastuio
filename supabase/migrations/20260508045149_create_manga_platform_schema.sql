/*
  # Create Manga Platform Database Schema

  1. New Tables
    - `profiles` - User profiles extending auth.users
      - `id` (uuid, PK, references auth.users)
      - `username` (text, unique)
      - `display_name` (text)
      - `avatar_url` (text)
      - `bio` (text)
      - `is_creator` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `manga_series` - Manga series/titles
      - `id` (uuid, PK)
      - `creator_id` (uuid, FK to profiles)
      - `title` (text)
      - `description` (text)
      - `cover_url` (text)
      - `genre` (text[])
      - `art_style` (text, default 'geometric-lego')
      - `status` (text, default 'ongoing')
      - `rating` (numeric, default 0)
      - `view_count` (integer, default 0)
      - `is_published` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `chapters` - Individual chapters within a series
      - `id` (uuid, PK)
      - `series_id` (uuid, FK to manga_series)
      - `chapter_number` (integer)
      - `title` (text)
      - `pages` (jsonb, stores page layout data)
      - `is_published` (boolean, default false)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `character_profiles` - Reusable character definitions for AI generation
      - `id` (uuid, PK)
      - `creator_id` (uuid, FK to profiles)
      - `series_id` (uuid, FK to manga_series, nullable)
      - `name` (text)
      - `description` (text)
      - `prompt_template` (text)
      - `seed_value` (integer)
      - `reference_url` (text)
      - `created_at` (timestamptz)

    - `generated_images` - Cache of AI-generated images
      - `id` (uuid, PK)
      - `creator_id` (uuid, FK to profiles)
      - `character_id` (uuid, FK to character_profiles, nullable)
      - `prompt` (text)
      - `negative_prompt` (text)
      - `seed` (integer)
      - `image_url` (text)
      - `model_used` (text)
      - `created_at` (timestamptz)

    - `bookmarks` - User bookmarks for reading progress
      - `id` (uuid, PK)
      - `user_id` (uuid, FK to profiles)
      - `series_id` (uuid, FK to manga_series)
      - `chapter_id` (uuid, FK to chapters, nullable)
      - `page_number` (integer, default 0)
      - `created_at` (timestamptz)

    - `follows` - Creator follow relationships
      - `id` (uuid, PK)
      - `follower_id` (uuid, FK to profiles)
      - `following_id` (uuid, FK to profiles)
      - `created_at` (timestamptz)

    - `comments` - Comments on chapters
      - `id` (uuid, PK)
      - `user_id` (uuid, FK to profiles)
      - `chapter_id` (uuid, FK to chapters)
      - `content` (text)
      - `created_at` (timestamptz)

    - `reviews` - Reviews for series
      - `id` (uuid, PK)
      - `user_id` (uuid, FK to profiles)
      - `series_id` (uuid, FK to manga_series)
      - `rating` (integer, 1-5)
      - `content` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on ALL tables
    - Profiles: users can read all, update own
    - Manga series: creators can CRUD own series, anyone can read published
    - Chapters: creators can CRUD own chapters, anyone can read published
    - Character profiles: creators can CRUD own characters, anyone can read
    - Generated images: creators can CRUD own images, anyone can read
    - Bookmarks: users can CRUD own bookmarks
    - Follows: users can create/delete own follows, anyone can read
    - Comments: users can create own, read all, delete own
    - Reviews: users can create own, read all, delete own

  3. Indexes
    - manga_series: creator_id, genre, status
    - chapters: series_id, chapter_number
    - generated_images: creator_id
    - bookmarks: user_id, series_id
    - follows: follower_id, following_id
    - comments: chapter_id
    - reviews: series_id
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text DEFAULT '',
  avatar_url text DEFAULT '',
  bio text DEFAULT '',
  is_creator boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Manga series table
CREATE TABLE IF NOT EXISTS manga_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  cover_url text DEFAULT '',
  genre text[] DEFAULT '{}',
  art_style text DEFAULT 'geometric-lego',
  status text DEFAULT 'ongoing',
  rating numeric DEFAULT 0,
  view_count integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Chapters table
CREATE TABLE IF NOT EXISTS chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES manga_series(id) ON DELETE CASCADE,
  chapter_number integer NOT NULL,
  title text DEFAULT '',
  pages jsonb DEFAULT '[]',
  is_published boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Character profiles table
CREATE TABLE IF NOT EXISTS character_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id uuid REFERENCES manga_series(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text DEFAULT '',
  prompt_template text DEFAULT '',
  seed_value integer DEFAULT 0,
  reference_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Generated images table
CREATE TABLE IF NOT EXISTS generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  character_id uuid REFERENCES character_profiles(id) ON DELETE SET NULL,
  prompt text NOT NULL,
  negative_prompt text DEFAULT '',
  seed integer DEFAULT 0,
  image_url text DEFAULT '',
  model_used text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Bookmarks table
CREATE TABLE IF NOT EXISTS bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id uuid NOT NULL REFERENCES manga_series(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES chapters(id) ON DELETE SET NULL,
  page_number integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id uuid NOT NULL REFERENCES manga_series(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, series_id)
);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manga_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Manga series policies
CREATE POLICY "Anyone can read published series" ON manga_series FOR SELECT USING (is_published = true OR creator_id = auth.uid());
CREATE POLICY "Creators can insert own series" ON manga_series FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own series" ON manga_series FOR UPDATE TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can delete own series" ON manga_series FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- Chapters policies
CREATE POLICY "Anyone can read published chapters" ON chapters FOR SELECT USING (is_published = true OR EXISTS (SELECT 1 FROM manga_series WHERE manga_series.id = chapters.series_id AND manga_series.creator_id = auth.uid()));
CREATE POLICY "Creators can insert own chapters" ON chapters FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM manga_series WHERE manga_series.id = chapters.series_id AND manga_series.creator_id = auth.uid()));
CREATE POLICY "Creators can update own chapters" ON chapters FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM manga_series WHERE manga_series.id = chapters.series_id AND manga_series.creator_id = auth.uid())) WITH CHECK (EXISTS (SELECT 1 FROM manga_series WHERE manga_series.id = chapters.series_id AND manga_series.creator_id = auth.uid()));
CREATE POLICY "Creators can delete own chapters" ON chapters FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM manga_series WHERE manga_series.id = chapters.series_id AND manga_series.creator_id = auth.uid()));

-- Character profiles policies
CREATE POLICY "Anyone can read character profiles" ON character_profiles FOR SELECT USING (true);
CREATE POLICY "Creators can insert own characters" ON character_profiles FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own characters" ON character_profiles FOR UPDATE TO authenticated USING (creator_id = auth.uid()) WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can delete own characters" ON character_profiles FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- Generated images policies
CREATE POLICY "Anyone can read generated images" ON generated_images FOR SELECT USING (true);
CREATE POLICY "Creators can insert own images" ON generated_images FOR INSERT TO authenticated WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can delete own images" ON generated_images FOR DELETE TO authenticated USING (creator_id = auth.uid());

-- Bookmarks policies
CREATE POLICY "Users can read own bookmarks" ON bookmarks FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own bookmarks" ON bookmarks FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own bookmarks" ON bookmarks FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own bookmarks" ON bookmarks FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Follows policies
CREATE POLICY "Anyone can read follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow creators" ON follows FOR INSERT TO authenticated WITH CHECK (follower_id = auth.uid());
CREATE POLICY "Users can unfollow" ON follows FOR DELETE TO authenticated USING (follower_id = auth.uid());

-- Comments policies
CREATE POLICY "Anyone can read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS idx_manga_series_creator ON manga_series(creator_id);
CREATE INDEX IF NOT EXISTS idx_manga_series_genre ON manga_series USING gin(genre);
CREATE INDEX IF NOT EXISTS idx_manga_series_status ON manga_series(status);
CREATE INDEX IF NOT EXISTS idx_chapters_series ON chapters(series_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_generated_images_creator ON generated_images(creator_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_series ON bookmarks(series_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_comments_chapter ON comments(chapter_id);
CREATE INDEX IF NOT EXISTS idx_reviews_series ON reviews(series_id);
