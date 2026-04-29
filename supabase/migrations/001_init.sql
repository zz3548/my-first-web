-- 초기 마이그레이션: posts, profiles, tags, post_tags, comments

-- Enable pgcrypto extension if not enabled (for gen_random_uuid)
create extension if not exists pgcrypto;

-- profiles: auth.users 보완용
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz default now()
);

-- posts: 글 저장
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  author_id uuid references auth.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  status text default 'draft', -- draft|published
  is_private boolean default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- tags: 간단한 태그 목록
create table if not exists public.tags (
  id serial primary key,
  name text not null unique
);

-- post_tags: posts <-> tags (N:M)
create table if not exists public.post_tags (
  post_id uuid references public.posts(id) on delete cascade,
  tag_id int references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- comments: 포스트 댓글 (옵션)
create table if not exists public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  content text not null,
  created_at timestamptz default now(),
  is_deleted boolean default false
);

-- 인덱스 권장
create index if not exists idx_posts_published_at on public.posts(published_at);
create index if not exists idx_posts_author_id on public.posts(author_id);
