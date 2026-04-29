# DB_SCHEMA — my-first-web (Supabase)

이 문서는 Supabase(Postgres) 기반으로 사용할 데이터베이스 스키마 초안입니다. 초보자도 이해하기 쉽게 각 테이블 목적과 필요한 컬럼, 간단한 SQL 생성문을 제공합니다.

설계 요약

- 인증은 Supabase Auth 사용(이메일). 사용자 기본 정보는 `auth.users`에서 관리.
- 추가 프로필 정보는 `profiles` 테이블에 보관.
- 글(포스트)은 `posts` 테이블.
- 태그는 `tags` 및 `post_tags`로 N:M 연결.
- 댓글은 `comments` 테이블(향후 확장 가능).

권장 스키마 (SQL)

```sql
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
```

간단한 설명 및 구현 팁

- `auth.users`는 Supabase가 관리하므로 사용자 인증과 기본 식별은 Auth를 사용하세요. 추가 프로필은 `profiles`에 저장합니다.
- `posts.status`로 `draft`/`published`를 관리하면 초안 저장과 공개 전환이 쉬워집니다.
- 이미지는 Supabase Storage에 두고 `posts`에는 `image_url` 또는 별도 `post_media` 테이블로 참조하세요(확장성 고려).
- `slug`는 SEO와 라우팅용 고유값입니다. 생성 시 중복 체크 필요.
- 인덱스: `published_at`, `author_id` 등에 인덱스 추가를 권장합니다.

다음 단계 제안

1. Supabase 프로젝트 생성 및 로컬 환경 변수(`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`) 설정
2. 위 SQL을 Supabase SQL Editor에 붙여 스키마 생성
3. 간단한 시드 데이터(테스트 사용자, 예시 포스트) 추가

원하시면 위 SQL을 `supabase/migrations/001_init.sql`로 저장하거나, Supabase 자격증명 설정 가이드를 `docs/SUPABASE.md`로 만들어 드리겠습니다.
