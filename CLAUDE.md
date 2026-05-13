@AGENTS.md

## Claude 사용 시 추가 규칙

- Claude를 활용한 코드 생성 시에도 위 `AGENTS.md` 규칙을 따르세요. 특히 App Router 준수, 이메일/비밀번호 인증만 허용, 서비스 역할 키 노출 금지 항목은 반드시 지켜야 합니다.

## Version Policy

- 교재 기준: Next.js 16.2.1, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2
- 현재 설치 기준 (package.json): Next.js 16.2.1, @supabase/supabase-js 2.105.1, @supabase/ssr 0.10.2
- 설명: Claude로 생성하는 예제는 교재 기준을 따릅니다. 빌드·런타임 문제가 발생하면 `package.json`의 실제 버전을 우선 확인하세요.
