자동 동기화(로컬 <-> Vercel) 사용법

**현재 동기화 상태 (2026-05-13)**

- ✅ Production 환경: Supabase 변수 동기화 완료
- ✅ 로컬 (.env.local): Supabase 변수 동기화 완료
- ✅ localhost:3000: 환경변수 정상 로드됨

**전제:**

- Vercel 프로젝트가 로컬에 링크되어 있어야 합니다. 처음 한 번은 `npx vercel link`를 실행하세요.
- 로그인 상태가 없으면 `VERCEL_TOKEN`을 환경변수로 설정해도 됩니다.

- 동기화 대상은 앱이 실제로 쓰는 두 값만입니다.
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

- 로컬에 동기화할 파일: `.env.local` (기본). 다른 파일을 쓰려면 `ENV_FILE` 환경변수를 설정하세요.

PowerShell 예시:

```powershell
$env:VERCEL_TOKEN = 'your-token-here'
npm run sync:vercel:pull
# 변경 후 로컬을 Vercel에 반영하려면
npm run sync:vercel:push
```

설명:

- `sync:vercel:pull`: Vercel 프로젝트의 preview 환경변수를 `.env.local`로 내려받습니다.
- `sync:vercel:push`: `.env.local`의 Supabase 공개 변수 2개를 Vercel preview 환경에 올립니다.

주의:

- 이 스크립트는 `npx vercel env pull`과 `npx vercel env add`를 사용합니다.
- production 환경으로 동기화하려면 `--env production` 플래그를 사용하세요.
- Vercel CLI가 설치되지 않았다면 먼저 `npx vercel --version`으로 확인하세요.

**동기화 확인방법:**

1. Production 환경 확인:

   ```powershell
   npx vercel env ls production
   ```

   - `NEXT_PUBLIC_SUPABASE_URL` 및 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 보여야 합니다.

2. 로컬 환경 (.env.local) 확인:

   ```powershell
   type .env.local
   ```

   - 동일한 두 변수가 있어야 합니다.

3. localhost:3000 확인:
   ```powershell
   npm run dev
   ```

   - http://localhost:3000이 정상적으로 로드되고 Supabase 접근이 가능해야 합니다.
