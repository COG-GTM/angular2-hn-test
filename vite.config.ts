import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import {
    API_CACHES,
    API_NETWORK_TIMEOUT_SECONDS,
    STATIC_ASSET_CACHE,
    STATIC_ASSET_PATTERN,
} from './src/pwa/runtime-cache';

const WEEK_SECONDS = 7 * 24 * 60 * 60;

// Mirrors the Angular app's ngsw-config.json:
// - `app` group (installMode prefetch): index.html, favicon, JS, CSS, manifest -> Workbox precache.
// - `assets` group (installMode lazy): /assets/** and static files -> runtime CacheFirst.
// - HN API responses (not cached by ngsw) -> runtime NetworkFirst, so visited pages work offline.
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'generateSW',
            registerType: 'autoUpdate',
            // src/pwa/index.ts (loaded from index.html) registers the SW.
            injectRegister: false,
            // Never combine includeAssets/manifest icons with globPatterns: duplicate precache URLs make
            // Workbox throw add-to-cache-list-conflicting-entries and the SW caches nothing.
            includeManifestIcons: false,
            // Single manifest (served as /manifest.webmanifest); same fields as Angular's src/manifest.json.
            manifest: {
                name: 'Angular 2 HN',
                short_name: 'Angular 2 HN',
                icons: [144, 192, 256, 512].map((size) => ({
                    src: `/assets/icons/android-chrome-${size}x${size}.png`,
                    sizes: `${size}x${size}`,
                    type: 'image/png',
                })),
                theme_color: '#b92b27',
                background_color: '#ffffff',
                display: 'standalone',
                orientation: 'portrait',
                start_url: './?utm_source=web_app_manifest',
            },
            workbox: {
                // App shell, plus the images the shell itself renders (app-loader logo, header logo + cog)
                // so an offline reload looks complete. manifest.webmanifest is added by the plugin.
                globPatterns: ['**/*.{js,css,html}', 'favicon.ico', 'assets/images/*.svg'],
                globIgnores: ['ngsw-worker.js'],
                navigateFallback: 'index.html',
                // Firebase reserved URLs and static files must not get the app shell. Match known file
                // extensions only, so routes like /user/some.name still fall back to the shell.
                navigateFallbackDenylist: [
                    /^\/__\//,
                    /\.(?:js|mjs|css|map|json|webmanifest|xml|txt|html?|ico|png|jpe?g|gif|svg|webp|woff2?|ttf|otf|eot)$/,
                ],
                cleanupOutdatedCaches: true,
                skipWaiting: true,
                clientsClaim: true,
                runtimeCaching: [
                    ...API_CACHES.map(({ origin, cacheName, maxEntries }) => ({
                        urlPattern: new RegExp(`^${origin.replace(/[.]/g, '\\.')}/`),
                        handler: 'NetworkFirst' as const,
                        options: {
                            cacheName,
                            networkTimeoutSeconds: API_NETWORK_TIMEOUT_SECONDS,
                            expiration: { maxEntries, maxAgeSeconds: WEEK_SECONDS },
                            cacheableResponse: { statuses: [200] },
                        },
                    })),
                    {
                        urlPattern: STATIC_ASSET_PATTERN,
                        handler: 'CacheFirst' as const,
                        options: {
                            cacheName: STATIC_ASSET_CACHE,
                            expiration: { maxEntries: 60, maxAgeSeconds: 4 * WEEK_SECONDS },
                            cacheableResponse: { statuses: [200] },
                        },
                    },
                ],
            },
        }),
    ],
    server: {
        port: 4200,
    },
    css: {
        preprocessorOptions: {
            scss: {
                // Component SCSS ported from Angular still uses @import, slash division and darken().
                silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'slash-div'],
            },
        },
    },
});
