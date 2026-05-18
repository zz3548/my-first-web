# ARCHITECTURE — my-first-web

간단한 아키텍처 뼈대(초보자용)

이 파일은 프로젝트의 목표, URL 기반 페이지 맵, 주요 유저 플로우를 정리합니다. 기술 스택, 세부 컴포넌트 구조와 데이터 모델은 추후 채웁니다.

## 1. 프로젝트 목표

- 목적: 개인 일기형 블로그 — 일상과 생각을 간단히 기록하고 필요하면 공개하는 공간
- 우선순위: 작성 편의성(모바일 우선), 읽기 가독성, 간단한 인증 기반 작성 권한
- 핵심 기능: 글 읽기(퍼블릭), 글 작성/초안 관리(인증 사용자), 마이페이지(작성자 대시보드)

## 1-1. Ch10 현재 구현 상태

- `/posts` 목록, `/posts/[id]` 상세, `/posts/new` 작성, `/api/posts`, `/api/posts/[id]` 구현 완료
- posts 컬럼은 Ch8 스키마 그대로 사용: `id`, `user_id`, `title`, `content`, `created_at`
- 수정/삭제 버튼은 `user.id === post.user_id`일 때만 UI에 표시
- 실제 권한 검증은 Ch11 RLS에서 처리 예정

## 2. 페이지 맵 (Next.js App Router 기준)

다음 표는 각 URL, 페이지 목적, 주요 동작, 인증 요구 여부를 정리한 것입니다.

| URL           |      페이지 이름 | 목적                                 | 핵심 동작                                        | 인증                              |
| ------------- | ---------------: | ------------------------------------ | ------------------------------------------------ | --------------------------------- |
| `/`           | 홈 (포스트 목록) | 최신 글·하이라이트·목록 출발점       | 최신 글 카드, 태그/검색, 빠른 이동(예: `/posts`) | 아니오                            |
| `/posts`      |      포스트 목록 | 전체 게시글 목록 확인                | 목록 보기, 새 글 작성 이동, 상세 링크 제공       | 아니오                            |
| `/posts/new`  |      포스트 작성 | 새 글 작성                           | 제목/본문 입력, 저장, 로그인 필요                | 예                                |
| `/posts/[id]` |      포스트 상세 | 단일 글 전문 보기                    | 본문, 작성일, 수정/삭제 버튼(작성자 UI)          | 공개: 아니오 / 비공개: 예(작성자) |
| `/mypage`     |       마이페이지 | 사용자 대시보드(내 글, 초안, 프로필) | 내 글 목록, 초안 관리, 프로필 편집 링크          | 예                                |
| `/login`      |           로그인 | 인증(이메일) 시작                    | 로그인/비밀번호 재설정, 비밀번호 복구 흐름       | 아니오                            |
| `/signup`     |         회원가입 | 신규 계정 생성                       | 이메일/비밀번호 가입, 프로필 기본 설정           | 아니오                            |

## 3. 유저 플로우

아래는 사용자가 시스템을 어떻게 사용하는지 단계별로 정리한 흐름입니다.

### 글 읽기 (Reader)

1. 사용자 진입: `/` 또는 `/posts`
2. 목록에서 관심 글 클릭 → `/posts/[id]`
3. 글이 공개이면 바로 본문을 읽음

### 글 작성 (Author)

1. 작성자는 먼저 인증되어야 함(미인증 시 `/login`로 유도)
2. 인증 후 `/posts/new`로 이동하여 글 작성
3. 작성 중 '초안 저장' 선택 → DB에 `status='draft'`로 저장

### 마이페이지 확인 (User Dashboard)

1. `/mypage` 접근(인증 필요)
2. 내 글 목록(초안/발행), 프로필 정보 표시
3. 각 글에서 편집(편집 라우트로 이동) 또는 삭제, 발행 전환 수행

## 4. API 엔드포인트 (Ch10 posts CRUD)

다음은 posts CRUD를 위한 API 라우트입니다. 모두 `app/api/posts/` 아래에 배치됩니다.

| 메서드 | 엔드포인트      | 목적             | 인증   | 비고                                                    |
| ------ | --------------- | ---------------- | ------ | ------------------------------------------------------- |
| GET    | /api/posts      | 전체 포스트 조회 | 아니오 | 최신순 정렬, `id/title/content/created_at/user_id` 조회 |
| POST   | /api/posts      | 새 포스트 생성   | 예     | body: `{title, content}`, 서버에서 `user_id` 자동 입력  |
| GET    | /api/posts/[id] | 상세 포스트 조회 | 아니오 | `id`로 단일 글 조회                                     |
| PUT    | /api/posts/[id] | 포스트 수정      | 예     | 작성자만 수정 가능, body: `{title, content}`            |
| DELETE | /api/posts/[id] | 포스트 삭제      | 예     | 작성자만 삭제 가능                                      |

**주의**: 위 인증 검증은 API 라우트 레벨에서 하지만, 진정한 보안(데이터베이스 행 레벨 보안)은 Ch11 RLS에서 구현합니다.

## 5. 컴포넌트 구조 (shadcn/ui 기준)

이 프로젝트는 shadcn/ui로 기본 UI 컴포넌트를 구성합니다. 아래는 각 화면에서 어떤 컴포넌트를 사용하는지 설계 관점에서 정리한 내용입니다.

- 전역 레이아웃(`app/layout.tsx`)
  - 네비게이션 버튼: `Button` (헤더의 링크/액션)
  - 사이트 타이틀/로고: 단순 텍스트 또는 `Button as child`로 링크 처리

- 홈(`/`) 및 포스트 목록(`/posts`)
  - 포스트 목록 항목: `Card` (각 포스트는 Card로 감싸서 제목·메타·요약·링크를 표시)
  - 요약 텍스트: Card의 `CardContent`에 위치, `line-clamp`로 길이 제한
  - 액션(읽기/작성): `Button` (변형: `outline`, 기본 버튼 사용)
  - 검색 입력: 현재 Ch10 구현에서는 비활성, 추후 `SearchBar`로 확장 가능

- 포스트 상세(`/posts/[id]`)
  - 본문 영역: 기본 블록 레이아웃(타이포그래피 가독성 우선)
  - 메타: 작성일 표시
  - 편집/삭제 버튼: `Button` 사용, 삭제는 `Dialog`로 확인
  - 편집 모드: 제목/본문을 같은 화면에서 수정

- 포스트 작성(`/posts/new`)
  - 입력 필드(제목, 본문): `Input`, `textarea` 컴포넌트 사용
  - 저장 버튼: `Button` (primary 형태)
  - 폼 검증: 로그인 필수 확인 (`useAuth()` → 미인증 시 `/login`으로 리다이렉트)
  - 성공 시: POST `/api/posts` → 상세 페이지로 이동 또는 목록으로 리다이렉트

- 포스트 상세(`/posts/[id]`) 및 수정
  - 편집 버튼: 작성자만 표시 (`user.id === post.user_id` 확인)
  - 삭제 버튼: 작성자만 표시, `Dialog`로 확인 후 DELETE `/api/posts/[id]`
  - 수정/삭제 권한은 UI 분기이며, 실제 보안은 Ch11 RLS에서 처리

```sql
-- profiles 테이블 (auth.users와 1:1)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- posts 테이블
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 제안
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
```

관계 요약

- `auth.users.id` (Supabase Auth) ⇄ `profiles.id` (1:1)
- `profiles.id` ⇄ `posts.user_id` (1:N)

### Ch10 posts CRUD 시작 전 체크리스트

- [x] Supabase 프로젝트 생성 및 `profiles`, `posts` 테이블 생성 완료
- [x] 환경변수 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) 설정 완료
- [x] `lib/supabase/client.ts` 클라이언트 초기화 완료
- [x] `contexts/AuthContext.tsx` & `useAuth()` 훅 구현 완료
- [x] `middleware.ts` 보호 라우트 설정 완료
- [x] `app/api/posts/route.ts` GET/POST 엔드포인트 구현
- [x] `app/api/posts/[id]/route.ts` GET/PUT/DELETE 엔드포인트 구현
- [x] `app/posts/new/page.tsx` 글 작성 폼 UI
- [x] 포스트 상세 페이지에 편집/삭제 버튼 추가
- [x] API 라우트 테스트 (로컬 런타임 검증)
  - `created_at`, `updated_at` (timestamptz)

- 관계
  - `users(1) -> posts(N)` : 사용자 한 명이 여러 포스트를 가질 수 있음
  - 태그/포스트는 N:M (옵션): `tags`, `post_tags` 테이블로 확장 가능

운영·확장 팁

- 초안 기능: `status='draft'`로 관리하면 작성 중인 글을 공개하지 않고 저장 가능
- 권한: RLS(Row Level Security)를 적용해 작성자만 자신의 초안을 수정할 수 있도록 설정 권장
- 이미지: Supabase Storage에 파일 저장 후 `posts`나 `post_media`에 URL로 참조

---

참고: DB 마이그레이션과 예제 SQL은 `docs/DB_SCHEMA.md` 및 `supabase/migrations/001_init.sql`에 있습니다.

## 6. 디자인 토큰 (권장)

- 목적: Tailwind 기본 색상을 직접 사용하지 않고 프로젝트 전반의 색상/간격/타이포그라피를 일관되게 관리합니다.
- 위치: `app/globals.css`에서 CSS 변수로 선언
- 권장 토큰 목록 (예)
  - `--background`: 페이지 배경색
  - `--foreground`: 일반 텍스트 색
  - `--muted`: 보조 텍스트/회색
  - `--primary`: 브랜드/액션 색
  - `--primary-foreground`: primary 위의 텍스트 색
  - `--card-bg`: 카드 배경
  - `--radius`: 컴포넌트 공통 반경
  - `--ring`: 포커스 링 색

- 사용 규칙
  - shadcn/ui 컴포넌트와 Tailwind 클래스를 조합할 때 토큰을 우선 사용합니다. 예: `text-[color:var(--primary)]` 대신 `text-primary` 유틸을 프로젝트 전역으로 매핑.
  - 모바일 우선 스타일링; 버튼·입력의 터치 영역을 충분히 확보(최소 44px 권장).

## 7. shadcn/ui 컴포넌트 계층

- 목표: UI 컴포넌트를 원자(Atoms) → 조합(Organisms) → 화면(Page) 레벨로 조직하여 재사용성·테마화 용이

- 권장 디렉터리 구조 (이미 `components/ui/` 사용 중)
  - `components/ui/` — shadcn에서 제공한 저수준 컴포넌트(Button, Card, Input, Dialog 등)
  - `components/` — 프로젝트 전용 래퍼와 조합 컴포넌트
    - `components/Button.tsx` — 공통 props(variant, size)를 래핑하고 토큰 사용 강제
    - `components/PostCard.tsx` — `Card` 기반, 제목·메타·요약·Action 버튼을 포함
    - `components/SearchBar.tsx` — `Input` + 검색 로직
    - `components/ConfirmDialog.tsx` — `Dialog` 래퍼(삭제/영구 작업 재사용)

- 컴포넌트 역할 분류
  - Atoms: `Button`, `Input`, `Badge`, `Avatar` (shadcn/ui 제공)
  - Molecules: `PostMeta`(작성자·날짜·태그), `PostActions`(읽기/편집/삭제 버튼)
  - Organisms: `PostCard`, `PostsGrid`, `PostEditorForm`
  - Pages: `app/posts/page.tsx`, `app/posts/[id]/page.tsx`, `app/posts/new/page.tsx`

## 8. 인증 (이메일/비밀번호) 흐름 — Supabase 기반

- 인증 방식: Supabase Auth의 이메일/비밀번호 기능 사용
- 기본 흐름
  1. 사용자가 `/login`에서 이메일/비밀번호로 로그인 시도 → 클라이언트에서 Supabase Auth SDK 호출
  2. 성공 시 Supabase는 세션(JWT)을 발급하고 클라이언트에 저장(쿠키 또는 LocalStorage — 권장: 서버 세션/HTTP-only 쿠키)
  3. 서버 측에서는 요청에 포함된 세션을 검증해 `auth.uid`를 사용하여 사용자 리소스 접근 제어
  4. RLS 설정: `posts` 테이블에 RLS 정책을 적용해 작성자만 자신의 초안 수정·삭제 가능

- 구현 팁
  - Server Components에서 인증이 필요하면 서버에서 Supabase 클라이언트(서버 키 또는 서비스 역할 대신 세션 기반)를 사용해 SSR로 유저 컨텍스트를 확보
  - 클라이언트 상호작용(로그아웃, 로그인 폼)은 `use client` 컴포넌트로 구현

- 추가 규칙 (Ch9)
  - 보호 라우트 구현은 `middleware.ts`를 사용해 비로그인 사용자를 `/login`으로 리다이렉트합니다.
  - Supabase 인증 호출은 `signInWithPassword`, `signUp`, `signOut`을 사용하고, 구버전 `auth.signIn()`을 사용하지 않습니다.
  - 클라이언트 코드에 `service_role` 키를 두지 않습니다. 서버 전용 키는 서버 영역(환경변수 또는 서버-side config)에서만 사용하세요.

### Ch9 Auth 요약

- 인증 흐름: 회원가입(signup) → 로그인(login) → 포스트 작성/목록(posts)
- Header 상태 분기:
  - 비로그인: `로그인`, `회원가입` 링크 표시
  - 로그인: `글쓰기`, `로그아웃` 버튼 표시
- 보호 라우트 목록:
  - `/posts/new` (작성 페이지)
  - `/mypage` (마이페이지 및 하위 경로)

## 9. DB 스키마 (users/profiles, posts) — 예시

아래는 간단한 SQL 스키마 예시(마이그레이션 파일에 반영 가능).

```sql
-- profiles 테이블 (auth.users와 1:1)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  display_name text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- posts 테이블
CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text,
  excerpt text,
  status text NOT NULL DEFAULT 'draft',
  is_private boolean DEFAULT false,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 인덱스 제안
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC);
```

관계 요약

- `auth.users.id` (Supabase Auth) ⇄ `profiles.id` (1:1)
- `auth.users.id` ⇄ `posts.author_id` (1:N)

## 10. 각 페이지의 주요 컴포넌트 및 데이터 흐름

- `/` (홈)
  - 주요 컴포넌트: `Hero`, `FeaturedPosts`(PostCard 모음), `Nav`(Header)
  - 데이터 흐름: 서버 컴포넌트가 최신 N개의 `posts`를 쿼리(공개된 것만) → 렌더링 후 클라이언트로 전달

- `/posts` (포스트 목록)
  - 주요 컴포넌트: `Card` 기반 목록, `Button`(새 글 작성), `Link`(상세 이동)
  - 데이터 흐름: 서버 컴포넌트가 `posts`를 최신순으로 조회 → 빈 상태/오류 상태 처리 → 카드 목록 렌더링

- `/posts/new` (포스트 작성)
  - 주요 컴포넌트: `Input`, `textarea`, `Button`
  - 데이터 흐름: `useAuth()`로 로그인 사용자 확인 → `posts.insert()` → 상세 페이지로 이동

- `/posts/[id]` (포스트 상세/수정/삭제)
  - 주요 컴포넌트: `Input`, `textarea`, `Button`, `Dialog`
  - 데이터 흐름: `id`로 단일 글 조회 → 작성자면 수정/삭제 UI 표시 → `update/delete` 수행

## 11. 인증 및 라우트 구분 요약

- 공개 경로: `/`, `/posts`, `/posts/[id]`, `/login`, `/signup`
- 인증 필요 경로: `/posts/new`, `/mypage`
- API 경로: `/api/posts`, `/api/posts/[id]`
- 작성자 전용 UI: `/posts/[id]` 내부의 수정/삭제 버튼
  - 데이터 흐름: 쿼리 파라미터(page, q, tag)를 서버에서 읽고 DB 쿼리 → 서버에서 SSR 목록 렌더링. 검색은 서버 요청 또는 클라이언트에서 debounce 후 API 호출

- `/posts/[id]` (포스트 상세)
  - 주요 컴포넌트: `PostContent`(서버), `PostMeta`, `PostActions`(클라이언트 권한 검사 후 편집/삭제 버튼 표시), `ConfirmDialog`
  - 데이터 흐름: 서버 컴포넌트가 `id`로 `posts`를 로드(작성자, 공개 여부 검증) → 서버 렌더링. 편집/삭제는 클라이언트 상호작용으로 API 호출(서버 route: `app/api/posts/[id]/route.ts`)

- `/posts/new` (포스트 작성)
  - 주요 컴포넌트: `PostEditorForm`(클라이언트), `Input`(제목), `Textarea`(본문), `TagInput`, `ImageUploader`
  - 데이터 흐름: 클라이언트 컴포넌트에서 입력을 관리 → 저장/발행 시 `fetch('/api/posts', { method: 'POST', body })` 호출 → 서버에서 검증 후 DB 저장

## 11. API 라우트 (권장 구조)

- 위치: `app/api/posts/route.ts` 및 `app/api/posts/[id]/route.ts`
- 책임
  - `GET /api/posts`: 필터링·검색·페이지네이션 지원(SSR이 아닌 클라이언트 검색용)
  - `POST /api/posts`: 새 글 생성(인증 필요)
  - `PUT /api/posts/[id]`: 글 수정(작성자 권한 검증)
  - `DELETE /api/posts/[id]`: 글 삭제(작성자 권한 검증)

## 12. 운영 권장사항

- RLS(행 수준 보안): Supabase에서 작성자 확인용 RLS 규칙 추가
- 백업/마이그레이션: 마이그레이션 파일을 `supabase/migrations/`에 보관
- 로깅/모니터링: 서버 에러는 Sentry 같은 외부 서비스 연동 고려

---

## Version Policy

- 교재 기준: Next.js 16.2.1, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2
- 현재 설치 기준 (package.json): Next.js 16.2.1, @supabase/supabase-js 2.105.1, @supabase/ssr 0.10.2
- 설명: 아키텍처 문서와 예제는 교재 기준으로 작성합니다. 빌드·런타임 문제는 `package.json`의 실제 설치 버전을 참고해 원인을 분석하세요.

위 내용은 현재 코드베이스(컴포넌트/라우트/스타일 토큰)를 기준으로 작성했습니다. 원하시면 이 문서를 기반으로 `docs/DB_SCHEMA.md`와 `supabase/migrations/`의 SQL을 동기화해 드리겠습니다.
