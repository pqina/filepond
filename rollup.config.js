import { writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { defineConfig } from 'rollup';
import { globSync } from 'glob';
import { default as license } from 'rollup-plugin-license';
import { banner } from './banner.js';
import cleanup from 'rollup-plugin-cleanup';
// using terser for now, for some reason "rollup-plugin-esbuild-minify" causes an error when appending the image view and loading an image
import terser from '@rollup/plugin-terser';

const srcDir = './esm';
const destDir = './cdn';

const VIRTUAL_INDEX_ID = '\0virtual-index';

// plugin to create the virtual index so we can import all exports
function virtualIndex() {
    return {
        name: 'virtual-index',
        resolveId(id) {
            if (id !== VIRTUAL_INDEX_ID) {
                return;
            }

            return VIRTUAL_INDEX_ID;
        },
        load(id) {
            if (id !== VIRTUAL_INDEX_ID) {
                return;
            }

            return `export * from '${srcDir}/index.js'
export * from '${srcDir}/extensions/index.js';
export * from '${srcDir}/templates/index.js';`;
        },
    };
}

// locales
cpSync(srcDir + '/locales', destDir + '/locales', { recursive: true });

// assets
cpSync(srcDir + '/assets', destDir + '/assets', { recursive: true });

// extensions
createMicroFiles(srcDir + '/extensions/*.js', destDir + '/extensions');

// templates
createMicroFiles(srcDir + '/templates/*.js', destDir + '/templates');

// create mega-lib
export default defineConfig([
    {
        input: VIRTUAL_INDEX_ID,
        output: {
            file: destDir + '/index.js',
            format: 'esm',
        },
        plugins: [
            virtualIndex(),
            terser(),
            cleanup({
                comments: 'none',
            }),
            license({
                banner,
            }),
        ],
        onwarn: function (warning, warn) {
            if (warning.code === 'CIRCULAR_DEPENDENCY') {
                return;
            }

            warn(message);
        },
    },
]);

function createMicroFiles(src, dest) {
    if (!existsSync(dest)) {
        mkdirSync(dest);
    }
    const extensions = globSync(src);
    for (const extension of extensions) {
        const filename = extension.split('/').pop();
        writeFileSync(`${dest}/${filename}`, `export * from '../index.js'`);
    }
}
