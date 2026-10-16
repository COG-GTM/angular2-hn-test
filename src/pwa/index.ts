/// <reference types="vite-plugin-pwa/client" />
// Separate entry loaded from index.html, so the app bootstrap (main.tsx) stays untouched.
import { registerSW } from 'virtual:pwa-register';
import { registerServiceWorker } from './registerSW';

registerServiceWorker(registerSW);
