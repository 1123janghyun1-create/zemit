-- ==============================================================================
-- LUMIO DATABASE SCHEMA FOR SUPABASE
-- Run this in your Supabase project's SQL Editor to create all tables & policies
-- ==============================================================================

-- 1. Profiles Table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  handle TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'Maker',
  github_url TEXT,
  twitter_url TEXT,
  website_url TEXT,
  is_starting_member BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'Public' CHECK (status IN ('Public', 'Beta', 'MVP', 'In Development', 'Concept')),
  logo_url TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  screenshots TEXT[] DEFAULT '{}',
  website_url TEXT NOT NULL,
  github_url TEXT,
  tags TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  views_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  feedbacks_count INT DEFAULT 0,
  looking_for_team BOOLEAN DEFAULT false,
  looking_for_team_roles TEXT[] DEFAULT '{}',
  looking_for_testers BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Project Likes Table
CREATE TABLE IF NOT EXISTS public.project_likes (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, user_id)
);

-- 4. Project Views Table
CREATE TABLE IF NOT EXISTS public.project_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Outbound Clicks Tracking (for lumio/go/[id])
CREATE TABLE IF NOT EXISTS public.project_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('idea', 'bug', 'suggestion', 'praise')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  upvotes INT DEFAULT 1,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Review', 'Planned', 'Completed', 'Declined')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Feedback Upvotes Table
CREATE TABLE IF NOT EXISTS public.feedback_upvotes (
  feedback_id UUID REFERENCES public.feedbacks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (feedback_id, user_id)
);

-- 8. Project Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Project Updates (Timeline)
CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Community Posts
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('General', 'Show & Tell', 'Feedback Request', 'Team Building', 'Tips & Insights')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Follows Table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedbacks_project_id ON public.feedbacks(project_id);
CREATE INDEX IF NOT EXISTS idx_comments_project_id ON public.comments(project_id);
CREATE INDEX IF NOT EXISTS idx_project_updates_project_id ON public.project_updates(project_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Public read project likes" ON public.project_likes FOR SELECT USING (true);
CREATE POLICY "Public read feedbacks" ON public.feedbacks FOR SELECT USING (true);
CREATE POLICY "Public read comments" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Public read updates" ON public.project_updates FOR SELECT USING (true);
CREATE POLICY "Public read community posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Public read follows" ON public.follows FOR SELECT USING (true);

-- Authenticated write policies
CREATE POLICY "Users can edit own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can create and edit own projects" ON public.projects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can toggle own likes" ON public.project_likes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can submit feedback" ON public.feedbacks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can add comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Project owners can add updates" ON public.project_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- Whenever a user signs up (via Google OAuth or email), auto-insert into profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, handle, avatar_url, bio, role, is_starting_member)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    LOWER(REGEXP_REPLACE(COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)), '[^a-zA-Z0-9_]', '', 'g')),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || NEW.id),
    'zemix 메이커',
    'Maker',
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

