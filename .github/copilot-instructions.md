## Tech Stack

- Next.js 16.2.1 (App Router only)
- React 19.2.4
- Tailwind CSS 4
- shadcn/ui (components/ui/ 경로에 설치됨)

## Coding Conventions

- Default to Server Components unless a Client Component is required.
- Use Tailwind CSS for styling.
- Keep components simple and easy to verify.
- Prefer files inside `app/` for routes.

## Design Tokens

- Primary color: shadcn/ui --primary
- Background: --background
- Card: shadcn/ui Card 컴포넌트 사용 (rounded-lg shadow-sm)
- Spacing: 컨텐츠 간격 space-y-6, 카드 내부 p-6
- Max width: max-w-4xl mx-auto (메인 컨텐츠)
- 반응형: md 이상 2열 그리드, 모바일 1열

## Component Rules

- UI 컴포넌트는 shadcn/ui 사용 (components/ui/)
- Button, Card, Input, Dialog 등 shadcn/ui 컴포넌트 우선
- 커스텀 컴포넌트는 components/ 루트에 배치
- Tailwind 기본 컬러 직접 사용 금지 → CSS 변수(디자인 토큰) 사용

## Next.js App Router 사용 규칙 (초보자용)

- 라우팅: 이 프로젝트는 App Router를 사용합니다. 모든 페이지는 `app/` 폴더에 둡니다.
- 절대 금지: `pages/` 디렉터리 생성 금지 — App Router 규칙을 따르세요.
- 서버/클라이언트 컴포넌트
  - 기본값: 컴포넌트를 Server Component로 만드세요(파일 상단에 아무 표시 없음).
  - 클라이언트 기능(상태, 이벤트, 브라우저 API)이 필요하면 파일 최상단에 `"use client"`를 추가합니다.
  - 불필요한 `"use client"` 사용은 성능 저하와 빌드 혼란을 초래하므로 꼭 필요한 경우에만 사용하세요.
- 내비게이션
  - 클라이언트 내비게이션이 필요하면 `next/navigation`에서 `useRouter`, `usePathname`, `useSearchParams` 등을 사용합니다.
  - 절대 `next/router`를 사용하지 마세요(호환되지 않습니다).
- API 라우트
  - 서버 사이드 API는 `app/api/.../route.ts`로 만드세요. 각 `route.ts`는 HTTP 메서드를 export합니다.
- 레이아웃
  - 공통 레이아웃은 `app/layout.tsx`에 두고 서버 컴포넌트로 유지하세요. 클라이언트 상태가 필요한 부분만 별도 컴포넌트로 분리합니다.

## TypeScript & Tailwind CSS 규칙

- TypeScript
  - 프로젝트는 TypeScript를 사용합니다. 가능한 한 `strict` 옵션을 유지하세요.
  - 컴포넌트 `props`에 명확한 타입을 선언하고 any 사용은 최소화하세요.
  - 비동기 데이터(fetch 등)는 가능한 한 서버 컴포넌트에서 처리하고, 클라이언트에는 필요한 데이터만 전달하세요.
- Tailwind CSS
  - 스타일은 Tailwind 유틸리티를 기본으로 사용합니다.
  - 색상·브랜드 토큰은 CSS 변수로 관리하세요(프로젝트의 디자인 토큰 사용).
    - 예: `var(--primary)`, `var(--background)` 등
  - 클래스 조합에는 `cn` 또는 `clsx` 같은 유틸을 사용해 가독성을 유지하세요.
  - 전역 스타일은 `app/globals.css`에 두고, 컴포넌트별로 인라인 Tailwind 클래스를 사용하세요.

## shadcn/ui 컴포넌트 사용 규칙

- 설치된 컴포넌트는 `components/ui/` 안에 존재합니다. 가능한 경우 shadcn/ui의 `Button`, `Card`, `Input`, `Dialog` 등을 우선 사용하세요.
- 커스텀 스타일이 필요하면 shadcn 컴포넌트를 래핑(wrap)해서 재사용 가능한 컴포넌트를 만드세요(components/ 루트).
- shadcn 컴포넌트를 클라이언트에서만 동작하게 하려면 래퍼에 `"use client"`를 붙이고 내부에서 상태/이벤트를 관리하세요.
- 디자인 토큰을 사용해 색상과 간격을 통일하세요(직접 Tailwind 기본 컬러를 쓴다기보다 토큰을 참조).

## AI(코드 생성) 사용 시 주의사항 — 자주 틀리는 항목

- 라우터 실수: `next/router` 사용, `pages/` 생성 등 App Router 규칙을 어기는 코드가 자주 생성됩니다. 요청 시 반드시 "App Router"라고 명시하세요.
- `"use client"` 남발: 불필요하게 클라이언트 컴포넌트를 제안하거나 모든 파일 상단에 `"use client"`를 추가하는 제안을 경계하세요.
- 브라우저 전용 API 사용: 서버 컴포넌트에서 `window`, `document`, `localStorage` 등을 사용하지 않도록 검토하세요.
- 스타일 일관성 누락: Tailwind 클래스 대신 인라인 스타일이나 프로젝트 토큰을 무시한 색상 사용이 발생합니다. 디자인 토큰을 다시 명시해 달라고 요청하세요.
- 타입 부정확성: TypeScript 타입을 생략하거나 `any`로 채우는 제안이 나올 수 있습니다. 항상 `props` 타입을 요구하세요.
- 접근성(Accessibility) 누락: 이미지 `alt`, 버튼 `aria-*`, 키보드 접근성 등을 잊는 경우가 많습니다. 요청 시 접근성 요구사항을 명시하세요.

## 코드를 요청할 때의 좋은 템플릿(초보자용)

1. 목적: 무엇을 만들고 싶은지 한 줄로 설명
2. 위치: 파일 경로(예: `app/posts/[id]/page.tsx` 또는 `components/PostCard.tsx`)
3. 컴포넌트 종류: Server Component 또는 Client Component
4. 입력/출력: props 형식(예: `{title: string, date: string}`)과 예상 UI
5. 제약: 디자인 토큰 사용, Tailwind만 사용, shadcn Button 사용 등
6. 테스트 기대값(선택): 로컬에서 어떻게 확인할지 간단 명시

예시 요청:

"목적: 글 목록 카드 컴포넌트를 만듭니다. 위치: `components/PostCard.tsx`. Server Component. 입력: `{title: string, excerpt: string, date: string, tags: string[]}`. 제약: `Card` 컴포넌트(shadcn)를 사용하고 색상은 `var(--primary)`를 사용해 주세요. 접근성: 이미지에 alt 필수."

---

AGENTS.md를 참조한다.
