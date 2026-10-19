-- ==============================================================================
-- Lumio (cozit.app clone) Supabase Database Schema
-- Copy and paste this whole script into your Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. PROFILES TABLE (All builders who logged in)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT DEFAULT 'lumio 메이커',
  role TEXT DEFAULT 'Maker',
  is_starting_member BOOLEAN DEFAULT true,
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  status TEXT DEFAULT 'Building',
  stage TEXT DEFAULT 'building',
  cover_image TEXT,
  logo TEXT,
  website_url TEXT,
  github_url TEXT,
  author_id TEXT,
  author JSONB,
  tags TEXT[] DEFAULT '{}',
  screenshots TEXT[] DEFAULT '{}',
  looking_for TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. COMMUNITY POSTS TABLE
CREATE TABLE IF NOT EXISTS public.community_posts (
  id TEXT PRIMARY KEY,
  category TEXT DEFAULT 'General',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  author_id TEXT,
  author JSONB,
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. FEEDBACKS TABLE
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  type TEXT DEFAULT 'idea',
  title TEXT NOT NULL,
  description TEXT,
  upvotes INT DEFAULT 1,
  status TEXT DEFAULT 'Open',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.comments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT,
  user_name TEXT,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.timeline (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version TEXT DEFAULT 'v1.0.0',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline ENABLE ROW LEVEL SECURITY;

-- Allow public read and write access for application features
DO $$
BEGIN
  -- Profiles
  DROP POLICY IF EXISTS "Profiles public read" ON public.profiles;
  CREATE POLICY "Profiles public read" ON public.profiles FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Profiles public write" ON public.profiles;
  CREATE POLICY "Profiles public write" ON public.profiles FOR ALL USING (true);

  -- Projects
  DROP POLICY IF EXISTS "Projects public read" ON public.projects;
  CREATE POLICY "Projects public read" ON public.projects FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Projects public write" ON public.projects;
  CREATE POLICY "Projects public write" ON public.projects FOR ALL USING (true);

  -- Community
  DROP POLICY IF EXISTS "Community public read" ON public.community_posts;
  CREATE POLICY "Community public read" ON public.community_posts FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Community public write" ON public.community_posts;
  CREATE POLICY "Community public write" ON public.community_posts FOR ALL USING (true);

  -- Feedbacks
  DROP POLICY IF EXISTS "Feedbacks public read" ON public.feedbacks;
  CREATE POLICY "Feedbacks public read" ON public.feedbacks FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Feedbacks public write" ON public.feedbacks;
  CREATE POLICY "Feedbacks public write" ON public.feedbacks FOR ALL USING (true);

  -- Comments
  DROP POLICY IF EXISTS "Comments public read" ON public.comments;
  CREATE POLICY "Comments public read" ON public.comments FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Comments public write" ON public.comments;
  CREATE POLICY "Comments public write" ON public.comments FOR ALL USING (true);

  -- Timeline
  DROP POLICY IF EXISTS "Timeline public read" ON public.timeline;
  CREATE POLICY "Timeline public read" ON public.timeline FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Timeline public write" ON public.timeline;
  CREATE POLICY "Timeline public write" ON public.timeline FOR ALL USING (true);
END $$;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON GOOGLE OAUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, handle, avatar_url, bio, role)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)), '[^a-z0-9_]', '', 'g')),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
    'lumio 메이커',
    'Maker'
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
