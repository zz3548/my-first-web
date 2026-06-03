import { test, expect } from "@playwright/test";

const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

// Skip whole file when credentials are not provided
if (!EMAIL || !PASSWORD) {
  test.skip(true, "TEST_EMAIL / TEST_PASSWORD are not set in environment");
}

test.describe("Auth + Posts E2E", () => {
  test("happy path: login, create post, visible in list", async ({ page }) => {
    const title = `e2e-${Date.now()}`;
    const content = `E2E 테스트 내용 ${Math.random().toString(36).slice(2)}`;

    // 로그인
    await page.goto("/login");
    await page.getByLabel("이메일").fill(EMAIL!);
    await page.getByLabel("비밀번호").fill(PASSWORD!);
    await page.getByRole("button", { name: "로그인" }).click();

    // 로그인 후 /posts 또는 루트로 리다이렉트 될 수 있으니 안전하게 이동
    await page.waitForURL("**/posts**", { timeout: 5000 }).catch(() => {});

    // 새 글 작성
    await page.goto("/posts/new");
    await page.getByLabel("제목").fill(title);
    await page.getByLabel("내용").fill(content);
    await page.getByRole("button", { name: "저장" }).click();

    // 저장 후 목록에서 제목 확인 (저장 후 /posts 로 리다이렉트되거나 상세로 이동할 수 있음)
    await page.waitForURL("**/posts**", { timeout: 5000 }).catch(() => {
      /* ignore */
    });
    await page.goto("/posts");

    // 제목 텍스트가 보이는지 확인
    await expect(page.getByText(title)).toBeVisible();
  });

  test("reject path: unauthenticated access to /posts/new redirects to /login", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/posts/new");
    await page.waitForLoadState("networkidle");

    // App Router 기준으로 리다이렉트 되는지 URL에 /login 포함 여부로 검증
    expect(page.url()).toContain("/login");

    await context.close();
  });
});
