# Context — my-first-web 프로젝트 상태

## 현재 상태

- 마지막 작업일: 2026-04-29
- 완료된 작업: 홈 페이지, 헤더/푸터 레이아웃, 포스트 목록
- 진행 중: 포스트 상세 페이지 (UI 완료, 데이터 연결 미완)
- 미착수: 마이페이지

## 기술 결정 사항

- 인증: Supabase Auth (Email)
- 상태관리: React Context (AuthProvider)
- 이미지: Supabase Storage 사용 예정

## 변경된 파일 (오늘)

- `.github/copilot-instructions.md` — 프로젝트 코드 작성 규칙(Next.js App Router, TypeScript/Tailwind, shadcn/ui, AI 주의사항) 초안으로 작성/업데이트

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

---

원하시면 이 내용을 `README.md` 또는 프로젝트 문서(예: `docs/`)로 복사해 배포용 요약을 만들어 드리겠습니다.
