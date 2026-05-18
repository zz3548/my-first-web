# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-05-18
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록, 포스트 상세, 포스트 작성, 포스트 수정/삭제, Ch9 Supabase Auth
- 진행 중: Ch10 문서 정리 및 최종 검증
- 미착수: 마이페이지, RLS(Ch11)

## 기술 결정 사항

- 인증: Supabase Auth (Email/Password)
- 상태관리: React Context (AuthProvider) — contexts/AuthContext.tsx 사용
- 데이터베이스: Supabase PostgreSQL
- posts 자료원: lib/supabase/client.ts → RPC 또는 직접 쿼리
- 이미지: Supabase Storage 사용 예정

## 변경된 파일 (2026-05-18)

- context.md — Ch10 기준으로 업데이트 (posts CRUD 정보 추가)
- TODO.md — Ch10 posts CRUD 항목 정리
- ARCHITECTURE.md — posts CRUD API/라우트 구조 추가
- .github/copilot-instructions.md — Ch10 posts CRUD 규칙 추가
- AGENTS.md, CLAUDE.md, .agent/rules/project.md — Ch10 기준 업데이트
- app/posts/page.tsx — Supabase posts 목록(Server Component) 연결
- app/posts/[id]/page.tsx — 게시글 상세/수정/삭제 연결
- app/posts/new/page.tsx — 게시글 작성 연결
- app/api/posts/route.ts — GET/POST Supabase API 연결
- app/api/posts/[id]/route.ts — GET/PUT/DELETE Supabase API 연결

## 해결된 이슈 (오늘 포함)

- shadcn/ui Button variant가 디자인 토큰과 불일치 → `app/globals.css`의 `--primary` 수정으로 해결
- 모바일 헤더 메뉴가 겹침 → `Sheet` 컴포넌트로 교체하여 해결

## 새로 알게 된 점 (오늘)

- Tailwind CSS 4 사용 시 `@import "tailwindcss"`와 `@theme` 블록을 사용하는 설정 방식(일부 설정은 `tailwind.config.js` 없이 처리 가능).
- Next.js App Router 규칙: 모든 페이지는 `app/`에 두고 `pages/` 디렉터리는 만들지 않음.
  - 서버 컴포넌트가 기본이고, 클라이언트 기능이 필요하면 파일 상단에 `"use client"` 추가.
  - 클라이언트 내비게이션 시 `next/navigation`을 사용하고 `next/router`는 사용하지 않음.
  - 서버 사이드 API는 `app/api/.../route.ts`로 구현.
- Server Component에서는 `useRouter`를 사용할 수 없고, 서버에서 리다이렉트가 필요하면 `redirect()`를 사용해야 함.
- Copilot/AI에게 코드 요청할 때 유용한 템플릿과 주의사항을 문서화해 `.github/copilot-instructions.md`에 추가함(예: App Router 명시, `"use client"` 남발 주의, 타입 명시 요구, 접근성 검사 등).

## Ch9 인증 관련 (추가)

- 환경변수(교재 기준): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- 인증 방식: 이메일/비밀번호만 사용. 소셜 로그인은 제외.
- 보호 라우트는 `middleware.ts`로 처리하고, 클라이언트에는 서비스 역할 키를 두지 않음.
- Supabase SDK 호출은 `signInWithPassword`, `signUp`, `signOut`을 권장.

---

## Ch10 posts CRUD 기준

### 사용할 기존 모듈

- **Supabase 클라이언트**: lib/supabase/client.ts (Ch8 기준)
- **인증 훅**: useAuth() from contexts/AuthContext.tsx (Ch9 기준)
- **posts 데이터베이스 스키마** (Ch8 기준):
  ```sql
  CREATE TABLE public.posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.profiles(id),
    title text NOT NULL,
    content text,
    created_at timestamptz DEFAULT now()
  );
  ```

### Ch10 할 일

- [x] **Read**: GET /api/posts (전체 또는 user_id 필터)
- [x] **Create**: POST /api/posts (로그인 필수, 현재 user_id 자동 입력)
- [x] **Update**: PUT /api/posts/[id] (작성자만 수정 가능)
- [x] **Delete**: DELETE /api/posts/[id] (작성자만 삭제 가능)
- [x] 각 API 라우트는 app/api/posts/route.ts, app/api/posts/[id]/route.ts에 배치
- [x] UI는 app/posts/new/page.tsx, app/posts/[id]/page.tsx, app/posts/page.tsx에서 호출
- [x] 수정/삭제 버튼은 UX (작성자만 표시), 실제 보안은 Ch11 RLS에서 구현
- [x] npm run build 통과 및 grep 검증 완료

### 주의사항

- middleware.ts의 보호 라우트 (/posts/new 등)는 Ch9에서 이미 구현됨
- 편집/삭제 버튼 표시는 UI 레벨이며, 브라우저 조작 방지 같은 실제 보안은 Ch11 RLS 정책으로 구현
- posts 테이블 컬럼명은 Ch8 스키마(id, user_id, title, content, created_at)를 그대로 유지

---

### Ch9 Supabase Auth 작업 요약

- 인증: Supabase Auth (이메일/비밀번호)
- 환경변수 (필수): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ch8 Supabase CLI 연결 확인 권장 커맨드: `supabase projects list`, `supabase projects api-keys`
- 생성/수정된 파일(Ch9):
  - `lib/auth.ts`
  - `app/login/page.tsx`
  - `app/signup/page.tsx`
  - `contexts/AuthContext.tsx` (AuthProvider / `useAuth` 훅)
  - `components/Header.tsx`
  - `middleware.ts` (보호 라우트: `/posts/new` 등)
- 보호 라우트: `/posts/new` (middleware로 검증)
- Supabase 대시보드 확인 항목(2026-05 기준):
  - Authentication → Sign In / Providers → Email(이메일 로그인 활성화)
  - Authentication → URL Configuration(리디렉트, 사이트 URL 설정)

참고: 서버·클라이언트 세션 동기화(쿠키 vs 로컬 스토리지) 동작을 런타임에서 검증하세요. Vercel 배포 시에는 위 환경변수를 Preview/Production에 등록해야 합니다.

---

## Version Policy

- 교재 기준: Next.js 16.2.1, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2
- 현재 설치 기준 (package.json): Next.js 16.2.1, @supabase/supabase-js 2.105.1, @supabase/ssr 0.10.2
- 설명: 문서는 교재 기준으로 통일합니다. 실제 동작·빌드 오류가 버전 차이에서 발생하면 `package.json` 기준으로 원인을 진단하세요.

원하시면 이 내용을 `README.md` 또는 프로젝트 문서(예: `docs/`)로 복사해 배포용 요약을 만들어 드리겠습니다.
