# DB_SCHEMA — my-first-web (Supabase)

이 문서는 Ch8 기준 데이터 모델을 그대로 적어 둔 기준 문서입니다. 컬럼명은 임의로 바꾸지 않습니다.

설계 요약

- 인증은 Supabase Auth 사용(이메일). 사용자 기본 정보는 `auth.users`에서 관리.
- 프로필 정보는 `profiles` 테이블에 보관.
- 글(포스트)은 `posts` 테이블.

권장 스키마 (SQL)

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id),
  username text,
  avatar_url text,
  role text
);

create table if not exists public.posts (
  id uuid primary key,
  user_id uuid references public.profiles(id),
  title text,
  content text,
  created_at timestamptz
);
```

간단한 설명 및 구현 팁

- `profiles.id`는 `auth.users.id`를 참조합니다.
- `posts.user_id`는 `profiles.id`를 참조합니다.
- 컬럼명은 `id`, `user_id`, `title`, `content`, `created_at`만 사용합니다.
- `profiles`는 `username`, `avatar_url`, `role`을 유지합니다.

다음 단계 제안

1. Supabase 프로젝트 생성 및 환경 변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 설정
2. 위 SQL을 Supabase SQL Editor에 붙여 스키마 생성
3. 간단한 시드 데이터(테스트 사용자, 예시 포스트) 추가

원하시면 위 SQL을 `supabase/migrations/001_init.sql`로 저장하거나, Supabase 자격증명 설정 가이드를 `docs/SUPABASE.md`로 만들어 드리겠습니다.
