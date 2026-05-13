# TODO — Ch9 Supabase Auth 작업 정리

다음 항목들은 Ch9 작업 범위에 따라 정리한 주요 체크리스트입니다. 로컬 빌드와 런타임 검증을 권장합니다.

- [x] 회원가입 구현 (`app/signup/page.tsx` — `signUpWithEmail`)
- [x] 로그인 구현 (`app/login/page.tsx` — `signInWithEmail` / `signInWithPassword` 사용)
- [x] 로그아웃 구현 (`signOut` 호출)
- [x] Header 로그인 상태 분기 (`components/Header.tsx`)
- [x] `/posts/new` 보호 (middleware.ts)
- [ ] `npm run build` 검증 (TypeScript/빌드 에러 확인)
- [ ] Vercel 배포 URL 및 환경변수 검증 (Preview/Production에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 등록)

권장 후속 작업:

- 런타임 테스트: 회원가입 → 로그인 → 글 작성 흐름 검증
- 미들웨어/쿠키 동기화 확인: 로그인 시 서버에서 읽을 수 있는 세션 쿠키가 설정되는지 확인
- RLS 정책 검토: 작성자만 자신의 초안/글 편집 가능 여부

필요하면 이 TODO를 기반으로 CI 빌드 또는 QA 체크리스트를 추가해 드립니다.
# TODO — my-first-web

## 1단계: 기본 구조 (Ch7~8)

- [x] ARCHITECTURE.md 작성

## 2단계: 핵심 기능 (Ch9~10)

- [x] 포스트 목록 페이지

## 3단계: 고급 기능 (Ch11~12)

- [ ] 마이페이지

## 진행률

- 완료: 7 / 전체: 13 (약 54%)

---

파일을 업데이트해야 하거나 항목을 옮기고 싶으면 알려주세요.

# TODO — my-first-web

## 1단계: 기본 구조 (Ch7~8)

- [x] ARCHITECTURE.md 작성
- [x] copilot-instructions.md 작성
- [x] shadcn/ui 초기화 + 테마 설정
- [x] 헤더/푸터 레이아웃
- [x] 홈 페이지
- [ ] Supabase 프로젝트 생성
- [x] 데이터베이스 스키마 작성

## 2단계: 핵심 기능 (Ch9~10)

- [x] 포스트 목록 페이지
- [x] 포스트 상세 페이지
- [ ] 포스트 작성 (CRUD)
- [ ] 로그인/회원가입
- [ ] 회원가입/로그인/로그아웃 구현 (Supabase Auth)
- [ ] `/posts/new` 보호 라우트 구현 (middleware.ts)

## 3단계: 고급 기능 (Ch11~12)

- [ ] 마이페이지
- [ ] 댓글 기능

## 진행률

- 완료: 8 / 전체: 13 (약 62%)

---

파일을 업데이트해야 하거나 항목을 옮기고 싶으면 알려주세요.
