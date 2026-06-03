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

## Ch11 Row Level Security (RLS) — 배포 규칙 요약

- RLS 정책은 Supabase 콘솔에서 실험할 수 있으나, **배포용 정책은 반드시 Supabase CLI 마이그레이션 파일**로 관리해야 합니다. 마이그레이션 파일은 `supabase/migrations/`에 커밋하세요.
- 적용 상태 (작업 중/권장):
  - `posts` 테이블 RLS 활성화 및 정책: `supabase/migrations/20260520043651_add_posts_rls.sql` (또는 `supabase/policies/posts_rls.sql`) — `auth.uid()` 기준으로 동작하도록 설계합니다.
  - `profiles` 테이블 관련 RLS 마이그레이션(권장/생성됨): `supabase/migrations/20260520090000_add_profiles_rls.sql` — 프로필 생성·수정을 인증 사용자 본인으로 제한할 경우 필요합니다.

- 적용된(권장) `posts` 정책 개요:
  - SELECT: 누구나 허용 (공개 포스트 조회)
  - INSERT: 인증 사용자, `WITH CHECK (auth.uid() = user_id)` — 로그인한 본인이 user_id로 삽입해야 함
  - UPDATE: `USING (auth.uid() = user_id) AND WITH CHECK (auth.uid() = user_id)` — 작성자만 수정
  - DELETE: `USING (auth.uid() = user_id)` — 작성자만 삭제

- 테스트 시나리오 (권장 수행 및 기대 동작):
  - 비로그인(익명): GET `/api/posts` → 성공(SELECT 허용), POST/PUT/DELETE → 401/403 또는 RLS 차단
  - 사용자 A (작성자): 로그인 → POST(자신의 `user_id`로 삽입) 성공, UPDATE/DELETE(자신 글) 성공
  - 사용자 B (타인): 로그인 → POST(자신 글 삽입) 성공, UPDATE/DELETE(다른 사람 글) → RLS로 차단(권한없음)

- 현재 관찰/권고사항:
  - 브라우저(클라이언트)에서 프로필을 자동으로 생성(insert)하려 할 때 RLS로 차단되는 로그가 발견되었습니다. 이 경우 두 가지 대응이 있습니다:
    1. `profiles` 테이블에 적절한 INSERT/UPDATE 정책을 추가(마이그레이션)하여 인증된 사용자가 자신의 프로필을 생성·수정할 수 있게 허용
    2. 또는 프로필 생성 로직을 서버 신뢰 경로(API)로 옮기고 서버 세션 또는 service_role(서버 전용)로 upsert하여 처리(권장: 마이그레이션 방식으로 RLS를 보완)

- 마이그레이션 적용 방법(요약):
  1. `supabase/migrations/20260520043651_add_posts_rls.sql` 및 필요 시 `20260520090000_add_profiles_rls.sql`을 확인
  2. 로컬에서 `npx supabase db push`로 마이그레이션을 적용
  3. 클린 빌드: `.next` 삭제 후 `npm run build` 실행(이전 번들에 남아 있는 서비스-롤 키 하드코딩 흔적 제거)

- 주의: `service_role` 키는 운영 중인 서버 전용 환경변수로만 사용하세요. 클라이언트에 절대 노출하지 마십시오.

---

## Ch12: 에러 처리 및 UX 개선 (최근 변경 사항)

- 추가된 파일
  - `app/posts/loading.tsx` — 포스트 목록 로딩 스켈레톤/펄스 UI
  - `app/posts/error.tsx` — 라우트 수준 에러 UI (친절한 메시지, 재시도 버튼)
  - `lib/error-message.ts` — Supabase/네트워크/원문 에러를 친절한 메시지로 변환하는 유틸

- 화면별 로딩/빈 상태/오류 UX 요약
  - `/posts` (목록)
    - 로딩: `app/posts/loading.tsx` 스켈레톤 표시
    - 빈 상태: "아직 게시글이 없습니다. 첫 글을 작성해보세요!"
    - 오류: `app/posts/error.tsx` 또는 목록 내 친절한 경고(상황에 따라 라우트 에러 컴포넌트가 사용됨)
  - `/posts/[id]` (상세)
    - 로딩: 상세 페이지 내 로딩 안내(기존 구현 유지)
    - 오류/찾을 수 없음: 라우트에서 친절한 메시지 및 `notFound()` 사용
  - `/posts/new` (작성)
    - 폼 제출 중: 제출 버튼 비활성화 및 "저장 중..." 텍스트
    - 클라이언트 검증 실패: 필드별 에러 메시지 표시(제목/내용 아래)
    - 서버/네트워크 에러: 개발자용 콘솔 로그 유지, 사용자에게는 친절한 메시지 표시
  - 인증 페이지(`/login`, `/signup`)
    - Supabase 에러/네트워크 에러를 `lib/error-message.ts`로 변환하여 사용자에게 노출
    - 개발자용 원문 에러는 `console.error`로 남김

- 폼 검증 규칙 (클라이언트)
  - 제목: 필수, 최소 2자
  - 내용: 필수, 최소 10자
  - 제출 중에는 버튼 비활성화하여 중복 제출 방지

- 에러 메시지 변환 규칙 (`lib/error-message.ts`)
  - PostgreSQL 권한/ RLS 관련(예: `42501`, "row-level") → "이 작업을 수행할 권한이 없습니다."
  - 네트워크(예: "Failed to fetch") → "인터넷 연결을 확인해주세요."
  - not found 계열(예: "not found", `404`, "no rows") → "요청한 게시글을 찾을 수 없습니다."
  - 기본값 → "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요."

위 변경은 외부 라이브러리 추가 없이 Tailwind CSS와 기존 컴포넌트만 사용해 구현되었습니다.

원하시면 이 내용을 `README.md` 또는 프로젝트 문서(예: `docs/`)로 복사해 배포용 요약을 만들어 드리겠습니다.

## 검증 보고서

- 최종 검증 보고서는 `docs/verification-report.md`에 작성되어 있습니다. 이 문서는 로컬 빌드·테스트 결과(Playwright 포함), 배포( Vercel )에 대한 수동 검증 체크리스트와 우선순위별 확인 필요 항목을 정리합니다.
