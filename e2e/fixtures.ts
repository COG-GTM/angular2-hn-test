import type { BrowserContext } from '@playwright/test';

export const HN_API = 'https://node-hnapi.herokuapp.com';
export const HNPWA_API = 'https://api.hnpwa.com/v0';

export const story = {
    id: 8863,
    title: 'My YC app: Dropbox - Throw away your USB drive',
    points: 104,
    user: 'dhouston',
    time: 1175714200,
    time_ago: '15 years ago',
    comments_count: 1,
    type: 'link',
    url: 'http://www.getdropbox.com/u/2/screencast.html',
    domain: 'getdropbox.com',
};

export const comment = {
    id: 9224,
    level: 0,
    user: 'BrandonM',
    time: 1175816820,
    time_ago: '15 years ago',
    content: '<p>For a Linux user, you can already build such a system yourself quite trivially.</p>',
    comments: [],
};

export const user = { id: 'pg', created: '19 years ago', created_time: 1160418092, karma: 157316, about: 'Bug fixer.' };

const cors = { 'access-control-allow-origin': '*' };

/** Mocks both HN APIs. `latencyMs` delays responses (e.g. so the first fetch is in flight when the SW takes over). */
export async function mockApi(context: BrowserContext, { latencyMs = 0 } = {}) {
    await context.route(`${HN_API}/**`, async (route) => {
        if (latencyMs) await new Promise((resolve) => setTimeout(resolve, latencyMs));
        const { pathname } = new URL(route.request().url());
        const feedType = pathname.slice(1);
        const body = pathname.startsWith('/item/')
            ? { ...story, comments: [comment], content: '' }
            : [{ ...story, title: `${story.title} (${feedType})` }];
        return route.fulfill({ json: body, headers: cors });
    });
    await context.route(`${HNPWA_API}/**`, async (route) => {
        if (latencyMs) await new Promise((resolve) => setTimeout(resolve, latencyMs));
        return route.request().url() === `${HNPWA_API}/user/pg.json`
            ? route.fulfill({ json: user, headers: cors })
            : route.fulfill({ status: 404, body: 'Not found', headers: cors });
    });
}
