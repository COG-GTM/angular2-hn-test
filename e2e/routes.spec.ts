import { expect, test } from '@playwright/test';
import { comment, mockApi, story, user } from './fixtures';

test.beforeEach(async ({ context }) => {
    await mockApi(context);
});

test('/ redirects to /news/1 and the app-loader goes away once React mounts', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/news\/1$/);
    await expect(page.getByText(`${story.title} (news)`).filter({ visible: true }).first()).toBeVisible();
    await expect(page.locator('a.home-link')).toBeVisible();
    await expect(page.locator('.app-loader')).toHaveCSS('opacity', '0');
    await expect(page).toHaveTitle('Angular 2 HN');
});

for (const feed of ['news', 'newest', 'show', 'ask', 'jobs']) {
    test(`/${feed}/1 renders the ${feed} feed`, async ({ page }) => {
        await page.goto(`/${feed}/1`);
        await expect(page.getByText(`${story.title} (${feed})`).filter({ visible: true }).first()).toBeVisible();
    });
}

test('/item/:id renders the story and its comments', async ({ page }) => {
    await page.goto(`/item/${story.id}`);
    await expect(page.getByText(story.title).filter({ visible: true }).first()).toBeVisible();
    await expect(page.getByText('For a Linux user, you can already build')).toBeVisible();
    await expect(page.getByText(comment.user).first()).toBeVisible();
});

test('/user/pg renders the profile', async ({ page }) => {
    await page.goto(`/user/${user.id}`);
    await expect(page.getByText(user.about)).toBeVisible();
    await expect(page.getByText(String(user.karma))).toBeVisible();
});

test('static assets from index.html resolve on deep links', async ({ page }) => {
    await page.goto(`/item/${story.id}`);
    for (const selector of [
        'link[rel="icon"][sizes="32x32"]',
        'link[rel="apple-touch-icon"]',
        'link[rel="mask-icon"]',
    ]) {
        const href = await page.locator(selector).first().getAttribute('href');
        const res = await page.request.get(new URL(href!, page.url()).href);
        expect(res.ok(), `${selector} -> ${href}`).toBe(true);
        expect(res.headers()['content-type']).not.toContain('text/html');
    }
});
