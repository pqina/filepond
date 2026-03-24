import { defineConfig } from 'vite';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { banner } from './banner.js';

const srcDir = './src';
const cdnDir = './cdn';
const destDir = './esm';

const fullReloadAlways = {
    name: 'full-reload-always',
    handleHotUpdate({ server }: any) {
        server.ws.send({ type: 'full-reload' });
        return [];
    },
};

const fixSvelteDollarCollisions: any = {
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

const addBanner: any = {
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

export default defineConfig(({ command }) => ({
    // dev
    html: {
        cspNonce: '1234',
    },
    root: command === 'serve' ? './dev' : './',
    resolve: {
        alias: {
            'filepond/locales/en-gb.js': resolve(__dirname, srcDir + '/locales/en-gb.js'),
            'filepond/locales/fr-fr.js': resolve(__dirname, srcDir + '/locales/fr-fr.js'),
            'filepond/locales': resolve(__dirname, srcDir + '/locales/index.js'),
            'filepond/assets': resolve(__dirname, srcDir + '/assets/index.js'),
            'filepond/extensions': resolve(__dirname, srcDir + '/extensions/index.js'),
            'filepond/templates': resolve(__dirname, srcDir + '/templates/index.js'),
            'filepond/dev': resolve(__dirname, srcDir + '/dev/index.js'),
            filepond: resolve(__dirname, srcDir + '/index.js'),
        },
    },

    plugins: [
        svelte({
            compilerOptions: {
                discloseVersion: false,
            },
        }),
        fixSvelteDollarCollisions,
        fullReloadAlways,
        addBanner,
    ],

    // build
    build: {
        minify: true,
        outDir: destDir,
        cssMinify: true,
        lib: {
            name: 'filepond',
            formats: ['es'],
            entry: {
                index: srcDir + '/index.ts',
                'locales/index': srcDir + '/locales/index.js',
                'extensions/index': srcDir + '/extensions/index.ts',
                'templates/index': srcDir + '/templates/index.ts',
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
}));
