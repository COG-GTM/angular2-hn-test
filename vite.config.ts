/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            // public/manifest.json (linked from index.html) is the single manifest, as in the Angular app.
            manifest: false,
            includeManifestIcons: false,
            workbox: {
                // ngsw-config.json "app" group (prefetch): index.html, favicon, JS, CSS and the manifest,
                // plus the app-shell images so the header renders offline.
                globPatterns: ['**/*.{js,css,html,ico}', 'manifest.json', 'assets/images/*.svg'],
                navigateFallback: 'index.html',
                runtimeCaching: [
                    {
                        // ngsw-config.json "assets" group (lazy): cache other static assets on first use.
                        urlPattern: ({ sameOrigin, url }) => sameOrigin && url.pathname.startsWith('/assets/'),
                        handler: 'CacheFirst',
                        options: { cacheName: 'assets' },
                    },
                    {
                        // HN API: network first, fall back to the last cached response when offline
                        // (the Angular app's Workbox networkFirst rule for node-hnapi).
                        urlPattern: /^https:\/\/(node-hnapi\.herokuapp\.com|api\.hnpwa\.com)\/.*/,
                        handler: 'NetworkFirst',
                        options: {
                            cacheName: 'hn-api',
                            networkTimeoutSeconds: 10,
                            expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 },
                            cacheableResponse: { statuses: [0, 200] },
                        },
                    },
                ],
            },
        }),
    ],
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        css: false,
        restoreMocks: true,
    },
});
