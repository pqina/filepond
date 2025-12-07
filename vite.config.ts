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

export default defineConfig({
    html: {
        cspNonce: '1234',
    },
    plugins: [svelte(), fixSvelteDollarCollisions, fullReloadAlways],
    resolve: {
        // for dev/index.html
        alias: {
            'filepond/locales/en-gb.js': resolve(__dirname, './src/locales/en-gb.js'),
            'filepond/locales': resolve(__dirname, './src/locales/index.js'),
            'filepond/assets': resolve(__dirname, './src/assets/index.js'),
            'filepond/extension': resolve(__dirname, './src/extensions/index.js'),
            'filepond/dev': resolve(__dirname, './src/dev/index.js'),
            filepond: resolve(__dirname, './src/index.js'),
        },
    },
    build: {
        minify: false,
        outDir: 'dist/esm',
        cssMinify: true,
        lib: {
            formats: ['es'],
            entry: {
                index: resolve(__dirname, './src/index.ts'),
                'assets/index': resolve(__dirname, './src/assets/index.js'),
                'locales/index': resolve(__dirname, './src/locales/index.js'),
                'extensions/index': resolve(__dirname, './src/extensions/index.ts'),
                // 'elements/index': resolve(__dirname, './src/elements/index.ts'),
                'dev/index': resolve(__dirname, './src/dev/index.ts'),
            },
        },
        rollupOptions: {
            output: {
                preserveModules: true,
                preserveModulesRoot: 'src',
                chunkFileNames: '[name].js',
                entryFileNames: (chunkInfo) => {
                    if (chunkInfo.name.includes('node_modules')) {
                        return chunkInfo.name.replace('node_modules', 'views/svelte') + '.js';
                    }
                    return '[name].js';
                },
            },
        },
    },
});
