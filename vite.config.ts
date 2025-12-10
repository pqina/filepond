import packageJson from './package.json' with { type: 'json' };
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const fullReloadAlways = {
    name: 'full-reload-always',
    handleHotUpdate({ server }: any) {
        server.ws.send({ type: 'full-reload' });
        return [];
    },
};

export const fixSvelteDollarCollisions: any = {
    name: 'replace-dollars',
    generateBundle(options: any, bundle: any[]) {
        for (const [fileName, file] of Object.entries(bundle)) {
            if (!fileName.endsWith('.js')) {
                return;
            }

            file.code = file.code.replace(/\$\$/g, '_$$').replace(/\$window/g, '_$window');
        }
    },
};

const banner = `/*!
* FilePond v${packageJson.version}
* Copyright (c) 2017-${new Date().getFullYear()} Pqina B.V.
* Released under the MIT License
* https://filepond.com
*/`;

export const addBanner: any = {
    name: 'banner',
    generateBundle(_: any, bundle: any[]) {
        for (const [fileName, file] of Object.entries(bundle)) {
            if (fileName.startsWith('svelte')) {
                continue;
            }
            file.code = banner + '\n' + file.code;
        }
    },
};

export default defineConfig({
    plugins: [
        svelte({
            compilerOptions: {
                discloseVersion: false,
            },
        }),
        fixSvelteDollarCollisions,
        addBanner,
        fullReloadAlways,
    ],

    resolve: {
        // for dev/index.html
        alias: {
            'filepond/locales/en-gb.js': resolve(__dirname, './src/locales/en-gb.js'),
            'filepond/locales': resolve(__dirname, './src/locales/index.js'),
            'filepond/assets': resolve(__dirname, './src/assets/index.js'),
            'filepond/extensions': resolve(__dirname, './src/extensions/index.js'),
            'filepond/templates': resolve(__dirname, './src/templates/index.js'),
            'filepond/dev': resolve(__dirname, './src/dev/index.js'),
            filepond: resolve(__dirname, './src/index.js'),
        },
    },

    build: {
        minify: true,
        outDir: 'dist/esm',
        cssMinify: true,
        lib: {
            name: 'filepond',
            formats: ['es'],
            entry: {
                index: resolve(__dirname, './src/index.ts'),
                // 'assets/index': resolve(__dirname, './src/assets/index.js'),
                'locales/index': resolve(__dirname, './src/locales/index.js'),
                'extensions/index': resolve(__dirname, './src/extensions/index.ts'),
                'templates/index': resolve(__dirname, './src/templates/index.ts'),
                // 'dev/index': resolve(__dirname, './src/dev/index.ts'),
            },
        },
        rollupOptions: {
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                chunkFileNames: '[name].js',
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name.includes('node_modules')) {
                        return chunkInfo.name.replace('node_modules', 'svelte') + '.js';
                    }
                    return '[name].js';
                },
            },
        },
    },
});
