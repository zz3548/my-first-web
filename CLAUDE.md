@AGENTS.md

## Claude 사용 시 추가 규칙

- Claude를 활용한 코드 생성 시에도 위 `AGENTS.md` 규칙을 따르세요. 특히 App Router 준수, 이메일/비밀번호 인증만 허용, 서비스 역할 키 노출 금지 항목은 반드시 지켜야 합니다.

## Ch10 posts CRUD 추가 규칙

- posts CRUD API는 `lib/supabase/client.ts`를 사용하여 데이터베이스를 직접 쿼리합니다.
- posts 테이블 구조는 Ch8 DB_SCHEMA.md를 따릅니다.
- 모든 인증은 `useAuth()` 훅 (Ch9)으로 처리합니다.
- App Router 규칙을 엄격히 지키세요: `pages/` 폴더와 `next/router` 사용 절대 금지.
- 수정/삭제 버튼 표시는 `user_id` 비교로만 구현 (보안은 Ch11 RLS).

## Version Policy

- 교재 기준: Next.js 16.2.1, @supabase/supabase-js 2.47.12, @supabase/ssr 0.5.2
- 현재 설치 기준 (package.json): Next.js 16.2.1, @supabase/supabase-js 2.105.1, @supabase/ssr 0.10.2
- 설명: Claude로 생성하는 예제는 교재 기준을 따릅니다. 빌드·런타임 문제가 발생하면 `package.json`의 실제 버전을 우선 확인하세요.

## Ch11 RLS 규정

- RLS는 마이그레이션으로 관리해야 합니다(`supabase/migrations/`). 콘솔에서 직접 SQL을 실행해도 되지만, 배포 가능한 정책은 마이그레이션 파일로 남겨야 합니다.
- 정책 작성을 할 때는 `posts.user_id`와 `auth.uid()` 비교를 우선으로 사용하세요. 클라이언트 UI 분기는 보안이 아니므로 RLS에 의존해야 합니다.
- `service_role` 키는 클라이언트에 절대 포함하지 않습니다. 서버 전용으로만 사용하세요.
