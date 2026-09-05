import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const response = await request.post("/api/e2e/reset");
  expect(response.ok()).toBeTruthy();
});

test("auth forms accept real keyboard input and submit in E2E mode", async ({ page }) => {
  await page.goto("/auth/sign-up");

  const signUpEmail = page.getByLabel("メールアドレス");
  const signUpPassword = page.getByLabel("パスワード（8文字以上）");

  await signUpEmail.pressSequentially("browser-e2e@example.com");
  await signUpPassword.pressSequentially("short7");
  await page.getByRole("button", { name: "アカウント作成" }).click();

  await expect(page).toHaveURL(/\/auth\/sign-up$/);
  expect(await signUpPassword.evaluate((element) => (element as HTMLInputElement).checkValidity())).toBe(false);

  await signUpPassword.fill("");
  await signUpPassword.pressSequentially("abcdefghijk");
  await page.getByRole("button", { name: "アカウント作成" }).click();

  await expect(page).toHaveURL(/\/auth\/login\?message=/);
  await expect(page.getByText("E2E: アカウント作成フォーム送信を確認しました。")).toBeVisible();

  const loginEmail = page.getByLabel("メールアドレス");
  const loginPassword = page.getByLabel("パスワード", { exact: true });
  await loginEmail.pressSequentially("browser-e2e@example.com");
  await loginPassword.pressSequentially("abcdefghijk");
  await page.getByRole("button", { name: "ログイン" }).click();

  await expect(page).toHaveURL(/\/bookmarks$/);
  await expect(page.getByRole("heading", { name: "Bookmarks", exact: true })).toBeVisible();
});

test("Bookmarks CRUD is operable entirely by browser typing and clicks", async ({ page }) => {
  await page.goto("/bookmarks");

  const nameInput = page.getByLabel("Bookmark名");
  const urlInput = page.getByLabel("Bookmark URL");

  await nameInput.pressSequentially("Invalid URL sample");
  await urlInput.pressSequentially("not-a-url");
  await page.getByRole("button", { name: "追加" }).click();
  expect(await urlInput.evaluate((element) => (element as HTMLInputElement).checkValidity())).toBe(false);
  await expect(page.getByText("まだBookmarkはありません。")).toBeVisible();

  await nameInput.fill("");
  await urlInput.fill("");
  await nameInput.pressSequentially("OpenAI");
  await urlInput.pressSequentially("https://openai.com");
  await page.getByRole("button", { name: "追加" }).click();

  const row = page.locator("[data-bookmark-id]").filter({ hasText: "OpenAI" });
  await expect(row).toBeVisible();
  await expect(row.getByRole("link", { name: "OpenAI" })).toHaveAttribute("href", "https://openai.com/");

  await row.getByText("編集").click();
  const editName = row.getByLabel("編集 Bookmark名");
  const editUrl = row.getByLabel("編集 Bookmark URL");
  await editName.click();
  await editName.press("Control+A");
  await editName.pressSequentially("OpenAI Official");
  await editUrl.click();
  await editUrl.press("Control+A");
  await editUrl.pressSequentially("https://www.openai.com");
  await row.getByRole("button", { name: "更新" }).click();

  const updatedRow = page.locator("[data-bookmark-id]").filter({ hasText: "OpenAI Official" });
  await expect(updatedRow).toBeVisible();
  await expect(updatedRow.getByRole("link", { name: "OpenAI Official" })).toHaveAttribute(
    "href",
    "https://www.openai.com/",
  );

  await updatedRow.getByRole("button", { name: "削除" }).click();
  await expect(page.locator("[data-bookmark-id]")).toHaveCount(0);
  await expect(page.getByText("まだBookmarkはありません。")).toBeVisible();
});
