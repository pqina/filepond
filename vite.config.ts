import { defineConfig, ViteDevServer } from 'vite';
import { resolve } from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { banner } from './banner.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'node:fs/promises';

const srcDir = './src';
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
                continue;
            }

            file.code = file.code.replace(/\$\$/g, '_$$').replace(/\$window/g, '_$window');
        }
    },
};

const prepareWorkers: any = {
    name: 'prepare-workers',
    configureServer(server: ViteDevServer) {
        server.middlewares.use(
            '/filepond/workers',
            async (req: IncomingMessage, res: ServerResponse, next: Function) => {
                const filePath = resolve(__dirname, destDir + '/workers' + req.url);
                try {
                    const code = await readFile(filePath, 'utf-8');
                    res.setHeader('Content-Type', 'text/javascript');
                    res.end(code);
                } catch (err) {
                    next();
                }
            }
        );
    },
    generateBundle(options: any, bundle: any[]) {
        for (const [fileName, file] of Object.entries(bundle)) {
            // only deal with worker dir
            if (!fileName.startsWith('workers/') || !fileName.endsWith('.js')) {
                continue;
            }

            // get fn name
            const [_, fnName] = file.code.match(/function ([a-z]+)\(/) || [];
            if (!fnName) {
                throw new Error(`Couldn't extract function name from: ${fileName}`);
            }

            // put function name in worker wrapper
            const workerCode = `self.onmessage = function (message) {${fnName}.apply(null, message.data.concat([function (err, response, transferList = []) {const message = { content: response, error: err };return self.postMessage(message, transferList);},{onprogress: function({ lengthComputable, loaded, total }) {self.postMessage({ type: 'progress', content: { lengthComputable, loaded, total }, error: null })}}]))}`;

            // create dir
            if (!existsSync(`${destDir}/workers/`)) {
                mkdirSync(`${destDir}/workers/`, { recursive: true });
            }

            // get name
            const [name, extension] = (fileName.split('/').pop() || '').split('.');
            if (!name) {
                throw new Error(`Couldn't extract name and extension from: ${fileName}`);
            }

            // create worker file
            writeFileSync(
                `${destDir}/workers/${name}Worker.${extension}`,
                `${file.code.replace(/export.+/s, '')}${workerCode}`
            );
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
        fixSvelteDollarCollisions,
        prepareWorkers,
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
                    if (chunkInfo.name.includes('node_modules')) {
                        return chunkInfo.name.replace('node_modules', 'svelte') + '.js';
                    }
                    return '[name].js';
                },
            },
        },
    },
}));
