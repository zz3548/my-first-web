<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

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
