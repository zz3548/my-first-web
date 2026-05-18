# Project agent rules (Ch10 + general)

이 파일은 에이전트가 프로젝트에 적용할 규칙을 모아둡니다. 에이전트는 아래 규칙을 우선적으로 지키고, 변경 시 문서에 이유를 남겨야 합니다.

**Next.js 규칙**

- Next.js App Router 사용(버전: 16.2.1)
- `pages/` 디렉터리 또는 `next/router` 사용 금지
- 보호 라우트는 `middleware.ts`로 구현(미인증자 리다이렉트)

**인증 (Ch9)**

- 이메일/비밀번호만 사용(소셜 로그인 금지)
- Supabase Auth 호출: `signInWithPassword`, `signUp`, `signOut` 사용
- 환경변수(교재 기준): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` 또는 서버 전용 키는 클라이언트 코드에 넣지 말 것
- 인증은 `contexts/AuthContext.tsx`의 `useAuth()` 훅으로 처리

**posts CRUD (Ch10)**

- 데이터베이스 클라이언트: `lib/supabase/client.ts` 사용
- posts 테이블 구조: `id`, `user_id`, `title`, `content`, `created_at` (Ch8 DB_SCHEMA.md)
- API 라우트: `app/api/posts/route.ts` (GET/POST), `app/api/posts/[id]/route.ts` (GET/PUT/DELETE)
- 수정/삭제 UI는 작성자 확인만 하고, 실제 권한 검증은 Ch11 RLS에서 구현
- 수정/삭제 버튼은 클라이언트에서 `user.id === posts.user_id` 확인으로만 표시

**버전 관리**

- 패키지 버전 설명은 "교재 기준"과 "현재 설치 기준(package.json)"을 함께 기록

# 변경 이력

- 2026-05-18: Ch10 posts CRUD 규칙 추가
- 2026-05-13: 초기 생성 (Ch9 기준 규칙 추가)

## Version Policy

- 교재 기준: Next.js 16.2.1, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2
- 현재 설치 기준 (package.json): Next.js 16.2.1, @supabase/supabase-js 2.105.1, @supabase/ssr 0.10.2
- 변경 방침: 문서와 수업 예제는 교재 기준을 따릅니다. 배포/빌드 문제 발생 시 `package.json`을 근거로 원인 분석을 수행하고 문서에 권장 대응(업데이트 또는 다운그레이드)을 기재하세요.
