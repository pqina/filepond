import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
    test: {
        include: ['test/**/*.test.js'],
        browser: {
            enabled: true,
            // headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
        },
    },
});
