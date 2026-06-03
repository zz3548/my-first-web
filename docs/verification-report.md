# 최종 검증 보고서

작성일: 2026-05-27

## 1. 테스트 환경

- 로컬: Windows 개발 환경 (프로젝트 루트에서 `npm run build`, `npx playwright test` 실행 확인)
  - 빌드: `npm run build` — 성공 (exit 0, 로컬 확인)
  - E2E: Playwright (`npx playwright test`) — 성공 (모든 테스트 통과, exit 0)
- Vercel: 배포 환경 — 확인 필요

> 비고: 로컬에서의 빌드·테스트는 확인되었으나 Vercel 배포 상태 및 실제 도메인에서의 동작은 수동 확인이 필요합니다.

## 2. Playwright 테스트 결과

- 테스트 파일: `tests/auth-crud.spec.ts`
- 실행 커맨드: `npx playwright test`
- 결과 요약:
  - 전체 테스트: 성공
  - 종료 코드: 0
  - 사용된 환경변수: `TEST_EMAIL`, `TEST_PASSWORD` (로컬/CI에서 설정 필요)

## 3. 배포 URL 수동 검증 결과

- Vercel 배포 URL: 확인 필요
  - 배포가 되어 있고 URL이 제공된 경우 아래 항목을 수동으로 검증하세요:
    - 홈 페이지 로드 상태
    - `/posts` 목록 로딩/빈 상태/에러 UI 동작
    - `/posts/new` 접근(미인증 리다이렉트), 인증 후 글 작성 흐름
    - RLS 정책 적용 여부(프로덕션 DB에서 권한 검증)

## 4. 아직 확인 필요한 항목 (우선순위 순)

1. 리포지토리에 노출된 환경변수(민감키) 제거 및 키 회전 — **확인 필요**
   - `.env.local` / `.env.from_vercel` 등에 포함된 키 존재 여부 확인
   - 노출된 키는 삭제 후 교체(회전) 필요
2. 프로덕션 DB에서 RLS 마이그레이션 적용 여부 확인 — **확인 필요**
   - `supabase/migrations/*` 파일들이 실제 프로덕션 DB에 반영되었는지 확인하세요.
3. Vercel 배포 URL에 대한 수동 검증(위 섹션 체크리스트) — **확인 필요**
4. 서버 사이드(SSR) 렌더링 페이지에서 원문 에러 노출 제거 및 `getErrorMessage` 적용 — **확인 필요**
   - 일부 서버 렌더 페이지가 Supabase 원문 에러를 사용자에게 그대로 노출할 수 있음
5. `app/api/posts/route.ts` 등에서의 개발용 콘솔 로그(환경키 일부 출력) 제거 — **확인 필요**
6. 중복된 서버-클라이언트 생성 로직(쿠키/서버 클라이언트) 리팩터링 — **확인 필요**
7. Playwright CI 통합 및 비밀값(테스트 계정) 관리 설정 — **확인 필요**

## 5. 조치 권장 사항 (단기)

- 즉시: 노출된 키 삭제 및 회전. Git 기록에 키가 남아있다면 `git filter-repo` 또는 `BFG`를 사용해 제거 권장.
- 배포 전: 프로덕션 RLS 적용 여부 확인 및 RLS 테스트 시나리오 실행.
- 코드 정리: API 라우트의 개발용 콘솔 로그 제거, 에러 메시지 표준화 적용.
- 테스트: Playwright 테스트를 CI(예: GitHub Actions)에 통합하고, 비밀은 CI 시크릿으로 관리.

---

파일 위치: `docs/verification-report.md`
