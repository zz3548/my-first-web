# Supabase 설정 가이드 — my-first-web

이 가이드는 Supabase 프로젝트 생성부터 로컬 환경변수 설정, 초기 마이그레이션 적용까지 초보자도 따라할 수 있도록 정리합니다.

1. Supabase 프로젝트 생성

- https://app.supabase.com 에서 계정 생성 후 새 프로젝트를 만듭니다.
- 프로젝트 생성 후 `Settings > API`에서 `Project URL`과 `anon` 키를 확인합니다.

2. 로컬 환경 변수 설정

- 로컬 개발 환경에 아래 환경변수를 저장하세요 (예: `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> # 서버 전용
```

- `NEXT_PUBLIC_`로 시작하는 키는 클라이언트에서 읽히므로 익명 키만 사용하세요. `SUPABASE_SERVICE_ROLE_KEY`는 절대 클라이언트에 노출하지 마세요.

3. 데이터베이스 마이그레이션 적용

- Supabase 프로젝트의 SQL Editor에 `supabase/migrations/001_init.sql` 내용을 붙여 실행하거나, Supabase CLI를 사용해 마이그레이션을 적용하세요.

4. Storage 설정

- `Storage > Buckets`에서 `public` 또는 `posts` 같은 버킷을 생성합니다.
- 업로드된 파일은 공개/비공개 정책에 따라 URL을 생성해 사용하세요.

5. 인증(Email)

- `Authentication > Settings`에서 이메일 제공자 설정을 확인합니다.
- 개발 단계에서는 이메일 확인(Confirm) 옵션을 끄고 테스트 계정을 사용하면 빠릅니다.

6. 테스트 데이터 추가

- 간단한 테스트 사용자와 포스트를 추가해 API와 클라이언트가 정상 동작하는지 확인하세요.

7. 보안 권장사항

- 서비스 키는 서버 전용으로 제한하고, 환경변수에만 저장하세요.
- RLS(Row Level Security)를 적용해 작성자만 자신의 초안을 수정할 수 있게 만드세요(필요시).

다음 단계

- `supabase/migrations/001_init.sql` 파일을 프로젝트에 추가했습니다. (파일 위치: `supabase/migrations/001_init.sql`)
- 로컬에서 Supabase 프로젝트를 생성하신 후 위 환경변수를 설정하고 마이그레이션을 적용하세요.

문제가 있으면 어떤 단계에서 문제가 생겼는지 알려주시면 바로 도와드리겠습니다.
