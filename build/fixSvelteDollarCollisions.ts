import { OutputChunk } from 'rollup';
import { Plugin } from 'vite';

export function fixSvelteDollarCollisions(): Plugin {
    return {
        name: 'vite-plugin-replace-svelte-dollars',
        generateBundle(_, bundle) {
            for (const [fileName, file] of Object.entries(bundle)) {
                if (!fileName.endsWith('.js')) {
                    continue;
                }

                if (file.type !== 'chunk') {
                    continue;
                }

                const chunk = file as OutputChunk;
                chunk.code = chunk.code.replace(/(?<![\w$])\$(?!\{)/g, '_$');
            }
        },
    };
}
