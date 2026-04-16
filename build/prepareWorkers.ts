import { Plugin, ViteDevServer } from 'vite';
import { resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { IncomingMessage, ServerResponse } from 'http';
import { readFile } from 'node:fs/promises';

export function prepareWorkers(options?: { destDir: string }): Plugin {
    const { destDir = './' } = options || {};

    return {
        name: 'vite-plugin-prepare-workers',
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
        generateBundle(_, bundle) {
            for (const [fileName, file] of Object.entries(bundle)) {
                // only deal with worker dir
                if (!fileName.startsWith('workers/') || !fileName.endsWith('.js')) {
                    continue;
                }

                if (file.type !== 'chunk') {
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
}
