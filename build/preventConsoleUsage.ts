import path from 'node:path';
import { Plugin } from 'vite';

const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

// vite-plugin-no-console-log.js
export function preventConsoleUsage(options?: { include: RegExp; exclude: RegExp }): Plugin {
    const { include = /\.(js|ts|svelte)$/, exclude = /node_modules/ } = options || {};

    const cwd = process.cwd();

    const violations: string[] = [];

    return {
        name: 'vite-plugin-prevent-console-usage',
        apply: 'build',

        transform(code: string, id: string) {
            if (!include.test(id) || exclude.test(id)) {
                return null;
            }

            if (!/console\.[a-z]+\(/.test(code)) {
                return;
            }

            violations.push(path.relative(cwd, id));
        },

        buildEnd() {
            if (!violations.length) {
                return;
            }

            const unique = [...new Set(violations)];

            console.error(
                '\n' +
                    red('✖') +
                    ' Build failed because the following files contained console statements:'
            );

            for (const id of unique) {
                console.error(`- ${id}`);
            }

            console.log('');

            process.exit(1);
        },
    };
}
