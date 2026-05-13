# Vercel과 localhost 동기화 완료 가이드

## 현재 상태 ✅

| 환경                                      | 상태        | 사용 설정                  |
| ----------------------------------------- | ----------- | -------------------------- |
| **https://my-first-web-vdb9.vercel.app/** | ✅ 동기화됨 | Vercel Production 환경변수 |
| **http://localhost:3000**                 | ✅ 동기화됨 | `.env.local` 파일          |

## 동기화된 환경변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

두 환경이 **동일한 Supabase 설정**을 사용하고 있습니다.

## 동기화 방법

### npm 스크립트 사용

```powershell
# Vercel Production에서 .env.local로 내려받기
npm run sync:vercel:pull

# .env.local에서 Vercel Production으로 올리기
npm run sync:vercel:push
```

### 스크립트 작동 원리

- **`npm run sync:vercel:pull`**:
  - Vercel Production 환경변수 → `.env.local`
  - 로컬 개발을 Vercel과 동기화

- **`npm run sync:vercel:push`**:
  - `.env.local` → Vercel Production 환경변수
  - 로컬 변경사항을 배포 환경에 반영

## 전제사항

1. Vercel 프로젝트 링크 (처음 한 번만)

   ```powershell
   npx vercel link
   ```

2. (선택) `VERCEL_TOKEN` 환경변수 설정
   ```powershell
   $env:VERCEL_TOKEN = 'your-token-here'
   ```

## 동기화 확인

### 1. Vercel Production 확인

```powershell
npx vercel env ls production
```

### 2. 로컬 .env.local 확인

```powershell
type .env.local
```

### 3. localhost:3000 확인

```powershell
npm run dev
# http://localhost:3000 방문
```

## 기술 상세

### 사용된 도구

- Vercel CLI (`npx vercel env pull`, `npx vercel env add`)
- Node.js 스크립트 (`scripts/sync-vercel-env.js`)

### 스크립트 코드

```javascript
// 기본 환경: production
// 동기화 키: NEXT_PUBLIC_SUPABASE_* (2개)
// 실행 방식: npx vercel 커맨드 래핑
```

### 주의사항

- Preview 환경은 사용되지 않습니다 (Production 브랜치와의 충돌)
- Production과 localhost 동기화가 주요 목표입니다
- 모든 환경변수는 Vercel에서 암호화되어 저장됩니다

## 문제 발생 시

1. **Vercel CLI 없음**

   ```powershell
   npm install -g vercel
   # 또는
   npx vercel --version
   ```

2. **인증 안 됨**

   ```powershell
   npx vercel login
   ```

3. **프로젝트 미링크**
   ```powershell
   npx vercel link
   ```
