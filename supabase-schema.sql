-- ==============================================================================
-- ZEMIX SUPABASE DATABASE SCHEMA (FULL SETUP SCRIPT)
-- ==============================================================================
-- [사용 방법]
-- 1. Supabase 대시보드 (https://supabase.com/dashboard) 로그인
-- 2. 본인의 프로젝트 선택 -> 왼쪽 메뉴에서 'SQL Editor' 클릭
-- 3. 우측 상단 또는 탭에서 '+ New query' 클릭
-- 4. 기존 작성창 내용을 모두 지우고 (Ctrl + A -> Delete)
-- 5. 아래 스크립트 '전체'를 복사하여 붙여넣기
-- 6. [중요] 마우스로 텍스트 일부분을 드래그하지 않은 상태에서 'Run' (Ctrl + Enter) 실행!
-- ==============================================================================

-- 1. PROFILES TABLE (빌더 프로필)
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  handle text,
  avatar_url text,
  bio text default 'zemix 메이커',
  role text default 'Maker',
  github_url text,
  twitter_url text,
  website_url text,
  is_starting_member boolean default true,
  followers_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 혹시 테이블이 이미 존재할 경우 누락된 컬럼 자동 보완
alter table if exists public.profiles add column if not exists name text;
alter table if exists public.profiles add column if not exists handle text;
alter table if exists public.profiles add column if not exists avatar_url text;
alter table if exists public.profiles add column if not exists bio text default 'zemix 메이커';
alter table if exists public.profiles add column if not exists role text default 'Maker';
alter table if exists public.profiles add column if not exists github_url text;
alter table if exists public.profiles add column if not exists twitter_url text;
alter table if exists public.profiles add column if not exists website_url text;
alter table if exists public.profiles add column if not exists is_starting_member boolean default true;
alter table if exists public.profiles add column if not exists followers_count integer default 0;

-- 2. PROJECTS TABLE (프로젝트)
create table if not exists public.projects (
  id text primary key,
  user_id text,
  title text not null,
  tagline text,
  description text,
  status text default 'Public',
  logo_url text,
  cover_url text,
  screenshots jsonb default '[]'::jsonb,
  website_url text,
  github_url text,
  author jsonb not null default '{}'::jsonb,
  tags jsonb default '[]'::jsonb,
  likes_count integer default 0,
  views_count integer default 1,
  comments_count integer default 0,
  feedbacks_count integer default 0,
  looking_for_team boolean default false,
  looking_for_testers boolean default false,
  insights jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 혹시 테이블이 이미 존재할 경우 누락된 컬럼 자동 보완
alter table if exists public.projects add column if not exists user_id text;
alter table if exists public.projects add column if not exists title text;
alter table if exists public.projects add column if not exists tagline text;
alter table if exists public.projects add column if not exists description text;
alter table if exists public.projects add column if not exists status text default 'Public';
alter table if exists public.projects add column if not exists logo_url text;
alter table if exists public.projects add column if not exists cover_url text;
alter table if exists public.projects add column if not exists screenshots jsonb default '[]'::jsonb;
alter table if exists public.projects add column if not exists website_url text;
alter table if exists public.projects add column if not exists github_url text;
alter table if exists public.projects add column if not exists author jsonb default '{}'::jsonb;
alter table if exists public.projects add column if not exists tags jsonb default '[]'::jsonb;
alter table if exists public.projects add column if not exists likes_count integer default 0;
alter table if exists public.projects add column if not exists views_count integer default 1;
alter table if exists public.projects add column if not exists comments_count integer default 0;
alter table if exists public.projects add column if not exists feedbacks_count integer default 0;
alter table if exists public.projects add column if not exists looking_for_team boolean default false;
alter table if exists public.projects add column if not exists looking_for_testers boolean default false;
alter table if exists public.projects add column if not exists insights jsonb default '{}'::jsonb;

-- 3. COMMUNITY POSTS TABLE (커뮤니티 라운지 글)
create table if not exists public.community_posts (
  id text primary key,
  category text default 'General',
  title text not null,
  content text not null,
  image_url text,
  author jsonb not null default '{}'::jsonb,
  author_id text,
  likes_count integer default 0,
  comments_count integer default 0,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- 혹시 테이블이 이미 존재할 경우 누락된 컬럼 자동 보완
alter table if exists public.community_posts add column if not exists category text default 'General';
alter table if exists public.community_posts add column if not exists title text;
alter table if exists public.community_posts add column if not exists content text;
alter table if exists public.community_posts add column if not exists image_url text;
alter table if exists public.community_posts add column if not exists author jsonb default '{}'::jsonb;
alter table if exists public.community_posts add column if not exists author_id text;
alter table if exists public.community_posts add column if not exists likes_count integer default 0;
alter table if exists public.community_posts add column if not exists comments_count integer default 0;
alter table if exists public.community_posts add column if not exists tags jsonb default '[]'::jsonb;

-- 4. FEEDBACKS TABLE (프로젝트 피드백)
create table if not exists public.feedbacks (
  id text primary key,
  project_id text not null,
  user_id text,
  user_name text,
  user_avatar text,
  type text default 'idea',
  title text not null,
  description text,
  upvotes integer default 1,
  status text default 'Open',
  created_at timestamptz default now()
);

-- 혹시 테이블이 이미 존재할 경우 누락된 컬럼 자동 보완
alter table if exists public.feedbacks add column if not exists project_id text;
alter table if exists public.feedbacks add column if not exists user_id text;
alter table if exists public.feedbacks add column if not exists user_name text;
alter table if exists public.feedbacks add column if not exists user_avatar text;
alter table if exists public.feedbacks add column if not exists type text default 'idea';
alter table if exists public.feedbacks add column if not exists title text;
alter table if exists public.feedbacks add column if not exists description text;
alter table if exists public.feedbacks add column if not exists upvotes integer default 1;
alter table if exists public.feedbacks add column if not exists status text default 'Open';

-- 5. COMMENTS TABLE (프로젝트 댓글)
create table if not exists public.comments (
  id text primary key,
  project_id text not null,
  user_id text,
  user_name text,
  user_avatar text,
  content text not null,
  likes integer default 0,
  created_at timestamptz default now()
);

-- 혹시 테이블이 이미 존재할 경우 누락된 컬럼 자동 보완
alter table if exists public.comments add column if not exists project_id text;
alter table if exists public.comments add column if not exists user_id text;
alter table if exists public.comments add column if not exists user_name text;
alter table if exists public.comments add column if not exists user_avatar text;
alter table if exists public.comments add column if not exists content text;
alter table if exists public.comments add column if not exists likes integer default 0;

-- ==============================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES 설정
-- 모든 방문자가 읽기/작성할 수 있도록 안전하게 정책을 활성화합니다.
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.community_posts enable row level security;
alter table public.feedbacks enable row level security;
alter table public.comments enable row level security;

-- Profiles 정책
drop policy if exists "Allow all read profiles" on public.profiles;
drop policy if exists "Allow insert profiles" on public.profiles;
drop policy if exists "Allow update profiles" on public.profiles;
drop policy if exists "Allow delete profiles" on public.profiles;
create policy "Allow all read profiles" on public.profiles for select using (true);
create policy "Allow insert profiles" on public.profiles for insert with check (true);
create policy "Allow update profiles" on public.profiles for update using (true);
create policy "Allow delete profiles" on public.profiles for delete using (true);

-- ==============================================================================
-- SUPABASE AUTH -> PROFILES 자동 연동 트리거 (로그인 시 자동 빌더 등록)
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    name,
    handle,
    avatar_url,
    bio,
    role,
    is_starting_member,
    followers_count,
    created_at,
    updated_at
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Maker'),
    lower(regexp_replace(coalesce(new.raw_user_meta_data->>'user_name', split_part(new.email, '@', 1), 'maker'), '[^a-z0-9_]', '', 'g')),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id),
    'zemix 메이커',
    'Maker',
    true,
    0,
    now(),
    now()
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, public.profiles.name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert or update on auth.users
  for each row execute function public.handle_new_user();

-- Projects 정책
drop policy if exists "Allow all read projects" on public.projects;
drop policy if exists "Allow insert projects" on public.projects;
drop policy if exists "Allow update projects" on public.projects;
drop policy if exists "Allow delete projects" on public.projects;
create policy "Allow all read projects" on public.projects for select using (true);
create policy "Allow insert projects" on public.projects for insert with check (true);
create policy "Allow update projects" on public.projects for update using (true);
create policy "Allow delete projects" on public.projects for delete using (true);

-- Community Posts 정책
drop policy if exists "Allow all read community_posts" on public.community_posts;
drop policy if exists "Allow insert community_posts" on public.community_posts;
drop policy if exists "Allow update community_posts" on public.community_posts;
drop policy if exists "Allow delete community_posts" on public.community_posts;
create policy "Allow all read community_posts" on public.community_posts for select using (true);
create policy "Allow insert community_posts" on public.community_posts for insert with check (true);
create policy "Allow update community_posts" on public.community_posts for update using (true);
create policy "Allow delete community_posts" on public.community_posts for delete using (true);

-- Feedbacks 정책
drop policy if exists "Allow all read feedbacks" on public.feedbacks;
drop policy if exists "Allow insert feedbacks" on public.feedbacks;
drop policy if exists "Allow update feedbacks" on public.feedbacks;
drop policy if exists "Allow delete feedbacks" on public.feedbacks;
create policy "Allow all read feedbacks" on public.feedbacks for select using (true);
create policy "Allow insert feedbacks" on public.feedbacks for insert with check (true);
create policy "Allow update feedbacks" on public.feedbacks for update using (true);
create policy "Allow delete feedbacks" on public.feedbacks for delete using (true);

-- Comments 정책
drop policy if exists "Allow all read comments" on public.comments;
drop policy if exists "Allow insert comments" on public.comments;
drop policy if exists "Allow update comments" on public.comments;
drop policy if exists "Allow delete comments" on public.comments;
create policy "Allow all read comments" on public.comments for select using (true);
create policy "Allow insert comments" on public.comments for insert with check (true);
create policy "Allow update comments" on public.comments for update using (true);
create policy "Allow delete comments" on public.comments for delete using (true);
