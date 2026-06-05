import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                discloseVersion: false,
            },
        }),
    ],
    test: {
        include: ['test/**/*.test.js'],
        testTimeout: 1000,
        browser: {
            enabled: true,
            headless: false,
            screenshotFailures: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
    },
});
