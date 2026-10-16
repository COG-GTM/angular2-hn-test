<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">
    <img alt="Angular 2 HN" title="Angular 2 HN" src="http://i.imgur.com/J303pQ4.png" width="150">
  </a>
</p>

<p align="center">
  A progressive Hacker News client built with React
</p>

<p align="center">
  <a href="https://angular2-hn.firebaseapp.com">View App</a>
</p>

<p align="center">
  <a href="/CONTRIBUTING.md"><img alt="PRs Welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg"></a>
</p>

---

:zap: **Fast:** Service Worker App Shell + Dynamic Content model to achieve faster load times with and without a network.

:iphone: **Responsive:** Completely responsive UI that can be installed to your mobile home screen to provide a native feel.

:rocket: **Progressive:** Built with Vite and React for optimal performance.

## Tech Stack

- **React 18** with functional components and hooks
- **React Router v6** for client-side routing
- **Vite** for fast development and optimized builds
- **TypeScript** for type safety
- **SCSS** for styling with theme engine
- **vite-plugin-pwa** for service worker and offline support
- **unfetch** for HTTP requests

## Mobile Preview

<p align="center">
  <img src = "http://i.imgur.com/ZloA1hn.gif">
</p>

## Laptop Preview

<p align="center">
  <img src = "http://i.imgur.com/MrKHaln.gif">
</p>

## Offline Support

This app uses [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (powered by Workbox) to generate a service worker as part of the build step to load quickly and work offline.

## Manifest

With Chromium based browsers for Android (Chrome, Opera, etc...), Angular 2 HN includes a Web App Manifest that allows you to install to your homescreen.

<p align="center">
  <img src = "http://i.imgur.com/1RaaNkr.png">
</p>

## Themes

Built in theme engine!

Current themes:
* Default
* Night
* Black (AMOLED)

More to come!

## Areas of improvement

 - Realtime updating using the Firebase SDK (may need to add option to settings so service worker can still rely on REST endpoints)
 - Server side rendering

Feel free to send me feedback on [twitter](https://twitter.com/hdjirdeh) or [file an issue](https://github.com/hdjirdeh/angular2-hn/issues/new)! Feature requests are always welcome.

## Migration conventions (React port of `COG-GTM/angular2-hn`)

Source of truth for behaviour is the Angular 9 app in [`COG-GTM/angular2-hn`](https://github.com/COG-GTM/angular2-hn) (`src/app`). Audit against it and fix gaps; don't rewrite working code.

**Shared foundation (Session 0) — import, don't edit.** Need a change? Describe it under "Shared-file changes needed" in your PR instead.

| Path | What |
| --- | --- |
| `src/App.tsx`, `src/main.tsx` | Route table mirroring `app.routes.ts`: `/` → `/news/1`, `/{news,newest,show,ask,jobs}/:page` → `<Feed feedType=…/>`, lazy `/item/:id`, lazy `/user/:id` |
| `src/services/hackerNewsApi.ts` | `fetchFeed`, `fetchItemContent` (awaits poll options), `fetchPollContent`, `fetchUser` (HNPWA — node-hnapi 404s on `/user/*`). All reject with `ApiError` on non-2xx / non-JSON / `null` bodies |
| `src/models/*` | `Story`, `Comment`, `User`, `PollResult`, `Settings`, `FeedName`, `FEED_NAMES` |
| `src/utils/sanitizeHtml.ts` | Required for every `dangerouslySetInnerHTML` (Angular's `[innerHTML]` was sanitized) |
| `src/utils/useAsyncResource.ts` | `useAsyncResource(key, load \| null)` → `{ data, error, loading }`; never shows a previous route's data, `load = null` = invalid param → error state |
| `src/utils/story.ts`, `formatCommentCount.ts`, `a11y.ts` | `hasExternalUrl`, `parsePositiveInt` (route params), comment pipe, `buttonProps(onActivate, label)` for clickable spans/images |
| `src/context/useSettings.ts` | `useSettings()` hook + `SettingsContextType` (signature is frozen; the provider lives in `SettingsContext.tsx`) |
| `src/components/Loader`, `src/components/ErrorMessage` | Shared UI states |
| `src/test/*`, `vitest.config.ts` | `renderWithProviders(ui, { route, path })`, `mockFetch(url => ({ body }))`, fixtures, matchMedia mock |
| `package.json`, `package-lock.json` | All deps are pre-installed (Vitest, Testing Library, jsdom, Playwright, vite-plugin-pwa). Don't add deps or touch the lockfile |

**Workstream ownership (each PR edits only its own paths):**

| Workstream | Angular source | Owns |
| --- | --- | --- |
| Feed | `src/app/feeds/` | `src/components/Feed/**`, `src/components/Item/**` (feed list item) |
| Item details + comments | `src/app/item-details/` | `src/components/ItemDetails/**`, `src/components/Comment/**` |
| User profile | `src/app/user/` | `src/components/UserProfile/**` |
| Settings / theme | `src/app/shared/services/settings.service.ts`, `src/app/core/{header,footer,settings}` | `src/context/SettingsContext.tsx` (+ new files in `src/context/`), `src/components/{Header,Footer,Settings}/**`, `src/shared/scss/_themes.scss`, `src/shared/scss/_theme_variables.scss` |
| PWA + build | `ngsw-config.json`, `src/manifest.webmanifest`, `src/styles.scss`, `src/assets` | `vite.config.ts`, `index.html`, `public/**`, `src/styles.scss`, `src/App.scss`, `src/shared/scss/_media.scss`, `eslint.config.js`, `tsconfig*.json`, `e2e/**`, `playwright.config.ts`, hosting/CI config |

**Conventions**
- Functional components + hooks, named exports, 4-space indent, single quotes (Prettier config in `package.json`).
- Component SCSS is global in React (Angular's was view-encapsulated): nest rules under the component's root class so they don't leak.
- JSX drops the whitespace Angular templates kept between inline elements — add `{' '}` where the Angular output had a space.
- Colocate tests as `*.test.tsx`. Before opening a PR: `npm run lint && npm test && npm run build`.

## Build process

 - Clone or download the repo
 - `npm install`
 - `npm run dev` to run the application with Vite dev server
 - `npm test` to run the unit tests (Vitest)
 - `npm run lint` / `npm run typecheck`
 - `npm run build` to kick off a production build (output in `dist/`)
 - `npm run preview` to preview the production build locally

## Contributors

A million thanks to some awesome people :)

* [Ashwin Sureshkumar](https://github.com/ashwin-sureshkumar)
* [Mateusz](https://github.com/mateuszwitkowski)
* [Jordi Collell](https://github.com/jordic)
* [Ben Brooks](https://github.com/bbrks)
* [Zach Berger](https://github.com/zachberger)
* [blAck PR](https://github.com/blackpr)
* [Bram Borggreve](https://github.com/beeman)
* [Antonio Indrianjafy](https://github.com/Antogin)
* [Addy Osmani](https://github.com/addyosmani)
* [Majid Hajian](https://github.com/mhadaily)
* [Jeff Cross](https://github.com/jeffbcross)
* [Minko Gechev](https://github.com/mgechev)
