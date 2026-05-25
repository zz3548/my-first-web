<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Ch10 posts CRUD 추가 지침

- posts CRUD는 `lib/supabase/client.ts`의 Supabase 클라이언트를 사용합니다.
- posts 테이블 스키마는 Ch8 `DB_SCHEMA.md`를 따릅니다: `id`, `user_id`, `title`, `content`, `created_at`
- 인증은 `useAuth()` 훅 (Ch9 `contexts/AuthContext.tsx`)으로 현재 사용자를 가져옵니다.
- API 라우트는 `app/api/posts/route.ts`(GET/POST), `app/api/posts/[id]/route.ts`(GET/PUT/DELETE)에 배치합니다.
- 수정/삭제 UI(버튼 표시)는 작성자 확인으로만 구현하고, 실제 권한 검증은 Ch11 RLS에서 합니다.
- App Router 규칙을 반드시 지키세요: `next/router` 및 `pages/` 사용 금지.

## Ch9 Auth 추가 지침

- 여러 AI 에이전트를 사용할 때는 다음 규칙을 공통으로 따르세요:
  - App Router(Next.js 16.2.1) 규칙을 지키고 `pages/` 와 `next/router` 사용을 금지합니다.
  - Supabase 관련 변경은 교재 기준(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)을 우선으로 문서화하고, 실제 버전 차이는 `package.json`에 병기합니다.
  - 인증은 이메일/비밀번호만 사용하며, 소셜 로그인을 추가하지 않습니다.
  - Supabase Auth 호출은 `signInWithPassword`, `signUp`, `signOut`을 사용하세요. 구버전 `auth.signIn()` 사용 금지.
  - 프로젝트 패키지 버전은 Ch7·Ch8 교재 기준을 우선으로 삼아 예제·문서를 작성하세요(실제 설치 버전은 `package.json`을 기준으로 진단).
  - Supabase 대시보드 메뉴 안내는 문서 기준일 뿐이며, 이 내용은 2026-05 기준임을 명시하세요 (UI/메뉴 위치는 시간이 지나 변경될 수 있음).

## Version Policy

- 교재 기준: Next.js 16.2.1, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2
- 현재 설치 기준 (package.json): Next.js 16.2.1, @supabase/supabase-js 2.105.1, @supabase/ssr 0.10.2
- 설명: 에이전트는 문서·예제에서 교재 기준을 우선 사용합니다. 실제 빌드 오류가 발생하면 `package.json`의 버전을 근거로 원인을 진단·기록하세요.

## Ch11 RLS 주의사항

- RLS 정책은 Supabase CLI 마이그레이션(`supabase/migrations/`)으로 관리해야 합니다. 콘솔에서 직접 실행한 SQL은 실험용으로만 사용하고, 배포용 정책은 마이그레이션에 포함하세요.
- 정책 작성 시 `posts.user_id = auth.uid()` 비교를 기준으로 권한을 설계하세요. 클라이언트 UI 분기는 UX용이며 보안은 RLS가 담당합니다.
- `service_role` 키는 절대 클라이언트에 넣지 마시고, 서버 전용 환경변수에서만 사용하세요.
