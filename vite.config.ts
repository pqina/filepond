import { defineConfig } from 'vite';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { banner } from './banner.js';
import { preventConsoleUsage } from './build/preventConsoleUsage.js';
import { prepareWorkers } from './build/prepareWorkers.js';
import { fullReloadAlways } from './build/fullReloadAlways.js';
import { addBanner } from './build/addBanner.js';

const srcDir = './src';
const destDir = './esm';

export default defineConfig(({ command }) => ({
    // dev
    html: {
        cspNonce: '1234',
    },
    root: command === 'serve' ? './dev' : './',
    resolve: {
        // modules
        alias: [
            // locales
            {
                find: /^filepond\/locales\/(.*)\.js$/,
                replacement: resolve(__dirname, srcDir + '/locales/$1.js'),
            },
            {
                find: 'filepond/locales',
                replacement: resolve(__dirname, srcDir + '/locales/index.js'),
            },

            // assets
            {
                find: 'filepond/assets',
                replacement: resolve(__dirname, srcDir + '/assets/index.js'),
            },

            // extensions
            {
                find: 'filepond/extensions',
                replacement: resolve(__dirname, srcDir + '/extensions/index.js'),
            },

            // utils
            {
                find: 'filepond/utils',
                replacement: resolve(__dirname, srcDir + '/utils/index.js'),
            },

            // templates
            {
                find: 'filepond/templates',
                replacement: resolve(__dirname, srcDir + '/templates/index.js'),
            },

            // dev helpers
            { find: 'filepond/dev', replacement: resolve(__dirname, srcDir + '/dev/index.js') },

            // root
            { find: 'filepond', replacement: resolve(__dirname, srcDir + '/index.js') },
        ],
    },

    plugins: [
        svelte({
            compilerOptions: {
                discloseVersion: false,
            },
        }),
        preventConsoleUsage(),
        prepareWorkers({
            destDir,
        }),
        fullReloadAlways(),
        addBanner({
            banner,
        }),
    ],

    // build
    build: {
        minify: 'esbuild',
        outDir: destDir,
        cssMinify: true,
        lib: {
            name: 'filepond',
            formats: ['es'],
            entry: {
                index: srcDir + '/index.ts',
                'locales/index': srcDir + '/locales/index.js',
                'extensions/index': srcDir + '/extensions/index.ts',
                'utils/index': srcDir + '/utils/index.ts',
                'templates/index': srcDir + '/templates/index.ts',

                // dev helpers
                'dev/index': srcDir + '/dev/index.ts',
            },
        },
        rollupOptions: {
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                chunkFileNames: '[name].js',
                entryFileNames: (chunkInfo) => {
                    // Things from node modules are svelte deps
                    if (chunkInfo.name.includes('node_modules')) {
                        return chunkInfo.name.replace('node_modules', 'svelte') + '.js';
                    }
                    // To fix 'The $ prefix is reserved and cannot be used for variables or imports' when used in a Svelte project
                    else if (chunkInfo.name.includes('.svelte')) {
                        return chunkInfo.name.replace('.svelte', '-svelte.js');
                    }
                    return '[name].js';
                },
            },
        },
    },
}));
