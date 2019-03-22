import { Type } from './app/enum/Type';
import { addFilter } from './filter';
import { applyFilterChain } from './filter';
import { forin } from './utils/forin';
import { replaceInString } from './utils/replaceInString';
import { toNaturalFileSize } from './utils/toNaturalFileSize';
import { isString } from './utils/isString';
import { guesstimateMimeType } from './utils/guesstimateMimeType';
import { getExtensionFromFilename } from './utils/getExtensionFromFilename';
import { getFileFromBlob } from './utils/getFileFromBlob';
import { getFilenameFromURL } from './utils/getFilenameFromURL';
import { getFilenameWithoutExtension } from './utils/getFilenameWithoutExtension';
import { createRoute } from './app/frame/createRoute';
import { createWorker } from './utils/createWorker';
import { createView } from './app/frame/createView';
import { loadImage } from './utils/loadImage';
import { copyFile } from './utils/copyFile';
import { renameFile } from './utils/renameFile';
import { extendDefaultOptions } from './app/options';
import { fileActionButton } from './app/view/fileActionButton';
import { isFile } from './utils/isFile';
import { createBlob } from './utils/createBlob';
import { text } from './utils/text';
import { getNumericAspectRatioFromString } from './utils/getNumericAspectRatioFromString';
import { createItemAPI } from './app/utils/createItemAPI';

// already registered plugins (can't register twice)
const registeredPlugins = [];

// pass utils to plugin
export const createAppPlugin = plugin => {

    // already registered
    if (registeredPlugins.includes(plugin)) {
        return;
    }

    // remember this plugin
    registeredPlugins.push(plugin);

    // setup!
    const pluginOutline = plugin({
        addFilter,
        utils: {
            Type,
            forin,
            isString,
            isFile,
            toNaturalFileSize,
            replaceInString,
            getExtensionFromFilename,
            getFilenameWithoutExtension,
            guesstimateMimeType,
            getFileFromBlob,
            getFilenameFromURL,
            createRoute,
            createWorker,
            createView,
            createItemAPI,
            loadImage,
            copyFile,
            renameFile,
            createBlob,
            applyFilterChain,
            text,
            getNumericAspectRatioFromString
        },
        views: {
            fileActionButton
        }
    });

    // add plugin options to default options
    extendDefaultOptions(pluginOutline.options);
};
