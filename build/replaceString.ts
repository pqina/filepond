import { OutputChunk } from 'rollup';
import { Plugin } from 'vite';

export function replaceString(options?: { patterns: { [key: string]: string } }): Plugin {
    const { patterns } = options || {};

    return {
        name: 'vite-plugin-replace-string',
        generateBundle(_, bundle) {
            if (!patterns) {
                return;
            }
            for (const [fileName, file] of Object.entries(bundle)) {
                if (file.type !== 'chunk') {
                    continue;
                }

                const chunk = file as OutputChunk;
                Object.entries(patterns).forEach(([needle, replacement]) => {
                    chunk.code = chunk.code.replaceAll(needle, replacement);
                });
            }
        },
    };
}
