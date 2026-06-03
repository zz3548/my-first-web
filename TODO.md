# TODO — my-first-web (Ch10 기준: 2026-05-18 업데이트)

## 준비 단계 (Ch7~9) ✓ 완료

- [x] Next.js + TypeScript + Tailwind + shadcn/ui 초기화 (Ch7)
- [x] 데이터베이스 스키마 설계 (Ch8 — profiles, posts 테이블)
- [x] Supabase 환경변수 설정 (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [x] 프로젝트 기본 레이아웃/헤더/홈 페이지 (Ch7)
- [x] Supabase Auth (이메일/비밀번호) 구현 (Ch9 — lib/auth.ts, contexts/AuthContext.tsx)
- [x] 로그인/회원가입/로그아웃 페이지 (Ch9)
- [x] 보호 라우트 구현 (middleware.ts) (Ch9)

## Ch10: posts CRUD 구현 (진행 중)

### Read (조회) — 예정

- [x] GET /api/posts — 모든 포스트 조회
- [x] GET /api/posts/[id] — 상세 포스트 조회
- [x] 홈페이지/포스트 목록 페이지에서 /api/posts 호출
- [x] 상세 페이지에서 /api/posts/[id] 호출

### Create (생성) — 예정

- [x] POST /api/posts 라우트 구현 (title, content, user_id)
- [x] app/posts/new/page.tsx — 글 작성 폼
- [x] 로그인 필수 확인 (useAuth() → 미인증 시 /login으로 리다이렉트)

### Update (수정) — 예정

- [x] PUT /api/posts/[id] 라우트 구현
- [x] app/posts/[id]/page.tsx 내 수정 폼/편집 모드 구현
- [x] UX: 작성자만 "수정" 버튼 표시 (실제 권한 검증은 Ch11 RLS)

### Delete (삭제) — 예정

- [x] DELETE /api/posts/[id] 라우트 구현
- [x] app/posts/[id] 상세 페이지에 "삭제" 버튼 (Dialog로 확인)
- [x] UX: 작성자만 "삭제" 버튼 표시 (실제 권한 검증은 Ch11 RLS)

## 검증

- [x] npm run build 통과
- [x] 구버전 라우터/API grep 검증 통과
- [x] 민감 키 grep 검증 통과

## Ch11: 보안 강화 (RLS) — 작업 지침

- RLS 정책은 **Supabase CLI 마이그레이션**으로 관리합니다. 직접 SQL Editor에서 영구 적용하지 마시고, 마이그레이션 파일을 `supabase/migrations/`에 추가하세요.
- 정책 작성 시 기본 원칙:
  - 수정/삭제 권한: `posts.user_id = auth.uid()` 조건으로 작성
  - 읽기 권한: 공개 포스트는 모두 읽을 수 있게, 초안/비공개는 작성자만 읽을 수 있게 분리
  - 프로필(선택사항): 프로필 수정은 본인만 허용하도록 `profiles.id = auth.uid()` 기반 정책 권장
- RLS 적용 대상(우선순위): `posts` 테이블 (주 적용 대상). 필요 시 `profiles`에 대해서도 작성자 정책 추가.
- `service_role` 키는 클라이언트에 절대 포함하지 마세요 — 서버 전용으로만 사용합니다.

### Ch11 작업 체크리스트 (우선순위)

- [ ] posts RLS 마이그레이션 생성 및 경로 확인 (`supabase/migrations/20260520043651_add_posts_rls.sql` 또는 `supabase/policies/posts_rls.sql`)
- [ ] (필요 시) profiles RLS 마이그레이션 생성 (`supabase/migrations/20260520090000_add_profiles_rls.sql`)
- [ ] 로컬에서 마이그레이션 적용: `npx supabase db push`
- [ ] 다른 계정 우회 테스트: 사용자 A/B 시나리오로 INSERT/UPDATE/DELETE 권한 검증
- [ ] 보안 키 노출 grep 및 결과 확인 (`git grep` / `Select-String`로 `SUPABASE_SERVICE_ROLE_KEY`, `service_role`, `PRIVATE_KEY` 등 검색)
- [ ] 빌드/배포 검증: `.next` 정리 후 `npm run build`, 배포 시 환경변수 등록 및 RLS 동작 확인

---

참고: 마이그레이션 파일을 커밋한 뒤 `npx supabase db push`를 실행하고, 테스트(회원가입 → 프로필 upsert → 글 작성 시나리오)를 통해 RLS가 의도대로 동작하는지 확인하세요. 클라이언트에서 프로필을 직접 insert하려 할 때 RLS로 차단되는 경우가 발생하면 위 체크리스트의 profiles 마이그레이션 항목을 우선 처리하세요.

- API 라우트: 서버에서 추가 검증을 하되, 실제 데이터 접근 제어는 RLS가 담당합니다(클라이언트/서버 검증은 방어적 코드용).

## Ch12 이상: 추가 기능

- [ ] 마이페이지 (내 글 목록, 프로필)
- [ ] 댓글 기능
- [ ] 태그/검색
- [ ] 이미지 업로드 (Supabase Storage)

## Ch12: 에러 처리 및 UX 개선 (완료)

- 작업 항목
  - [x] `app/posts/loading.tsx` 추가 — 목록 로딩 스켈레톤
  - [x] `app/posts/error.tsx` 추가 — 라우트 에러 친절 안내(재시도 버튼 포함)
  - [x] `lib/error-message.ts` 추가 — Supabase/네트워크 에러를 사용자 친화적 메시지로 매핑
  - [x] `app/posts/PostsClient.tsx` 로딩/오류/빈 상태 및 스켈레톤 추가
  - [x] `app/posts/new/page.tsx` 클라이언트 검증(제목 최소 2자, 내용 최소 10자) 및 필드 에러 표시
  - [x] `app/login/page.tsx`, `app/signup/page.tsx` — `getErrorMessage` 적용 (콘솔에 원문 로그 유지)

- 검증·운영 체크리스트
  - [ ] 저장소 전체 변경사항 빠른 검사(빌드/테스트) — 권장
  - [x] 로컬 빌드 확인(`npm run build` 통과됨)

설계 원칙: 사용자에게는 친절한 오류 메시지를, 개발자에게는 원문 로그를 제공. 외부 라이브러리 추가 금지(기존 Tailwind + shadcn/ui 사용).

---

**진행률**: 14 / 14 = 100% (Ch10 구현 및 검증 완료)

## 검증 후속 작업(우선순위)

- [ ] 리포지토리 내 민감 키 노출 검사 및 제거 (노출 시 키 회전) — **긴급**
- [ ] `supabase/migrations` 파일이 프로덕션 DB에 적용되었는지 검증 — **확인 필요**
- [ ] Vercel 배포 URL 수동 검증 (홈, /posts 리스트, /posts/new, 인증 플로우) — **확인 필요**
- [ ] 서버 렌더 페이지에서 원문 에러가 사용자에게 노출되는지 확인하고 `lib/error-message.ts` 적용 — **확인 필요**
- [ ] `app/api/*`의 개발용 콘솔 로그(환경 키 노출 등) 제거 — **확인 필요**
- [ ] 서버-클라이언트 공통 생성 로직(쿠키/서버 클라이언트) 리팩터링 — **확인 필요**
- [ ] Playwright를 CI에 통합하고 테스트 계정/비밀 관리를 CI 시크릿으로 구성 — **확인 필요**
