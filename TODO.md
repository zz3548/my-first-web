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

## Ch11: 보안 강화 (이후)

- [ ] Row Level Security (RLS) 정책 작성
  - 작성자만 자신의 포스트 수정/삭제 가능
  - 공개 포스트는 모두 읽기 가능
  - 미발행 포스트는 작성자만 읽기 가능
- [ ] API 라우트에 user_id 검증 추가

## Ch12 이상: 추가 기능

- [ ] 마이페이지 (내 글 목록, 프로필)
- [ ] 댓글 기능
- [ ] 태그/검색
- [ ] 이미지 업로드 (Supabase Storage)

---

**진행률**: 14 / 14 = 100% (Ch10 구현 및 검증 완료)
