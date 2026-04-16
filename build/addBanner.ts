import { OutputChunk } from 'rollup';
import { Plugin } from 'vite';

export function addBanner(options?: { banner: string }): Plugin {
    const { banner } = options || {};

    return {
        name: 'vite-plugin-banner',
        generateBundle(_, bundle) {
            if (!banner) {
                return;
            }
            for (const [fileName, file] of Object.entries(bundle)) {
                if (fileName.startsWith('svelte')) {
                    continue;
                }

                if (file.type !== 'chunk') {
                    continue;
                }

                const chunk = file as OutputChunk;
                chunk.code = banner + '\n' + chunk.code;
            }
        },
    };
}
