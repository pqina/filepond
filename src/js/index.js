import { createApp } from './createApp';
import { createPainter } from './app/frame/index';
import { createAppAPI } from './createAppAPI';
import { createAppPlugin } from './createAppPlugin';
import { getOptions as getDefaultOptions, setOptions as setDefaultOptions } from './app/options';
import { isObject } from './utils/isObject';
import { forin } from './utils/forin';
import { ItemStatus } from './app/enum/ItemStatus';
import { Status as StatusEnum } from './app/enum/Status';
import { FileOrigin as FileOriginEnum } from './app/enum/FileOrigin';
import { isBrowser } from './utils/isBrowser';

// feature detection used by supported() method
const isOperaMini = () => Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
const hasPromises = () => 'Promise' in window;
const hasBlobSlice = () => 'slice' in Blob.prototype;
const hasCreateObjectURL = () => 'URL' in window && 'createObjectURL' in window.URL;
const hasVisibility = () => 'visibilityState' in document;
const hasTiming = () => 'performance' in window; // iOS 8.x

export const supported = (() => {

    // Runs immidiately and then remembers result for subsequent calls
    const isSupported = 

        // Has to be a browser
        isBrowser() &&

        // Can't run on Opera Mini due to lack of everything
        !isOperaMini() &&

        // Require these APIs to feature detect a modern browser
        hasVisibility() &&
        hasPromises() &&
        hasBlobSlice() &&
        hasCreateObjectURL() &&
        hasTiming();

    return () => isSupported;
})();


/**
 * Plugin internal state (over all instances)
 */
const state = {
    // active app instances, used to redraw the apps and to find the later
    apps: []
};

// plugin name
const name = 'filepond';

/**
 * Public Plugin methods
 */
const fn = () => {};
export let Status = {};
export let FileStatus = {};
export let FileOrigin = {};
export let OptionTypes = {};
export let create = fn;
export let destroy = fn;
export let parse = fn;
export let find = fn;
export let registerPlugin = fn;
export let getOptions = fn;
export let setOptions = fn;

// if not supported, no API
if (supported()) {

    // start painter and fire load event
    createPainter(
        () => {
            state.apps.forEach(app => app._read());
        },
        (ts) => {
            state.apps.forEach(app => app._write(ts));
        }
    );

    // fire loaded event so we know when FilePond is available
    const dispatch = () => {
        // let others know we have area ready
        document.dispatchEvent(
            new CustomEvent('FilePond:loaded', {
                detail: {
                    supported,
                    create,
                    destroy,
                    parse,
                    find,
                    registerPlugin,
                    setOptions
                }
            })
        );

        // clean up event
        document.removeEventListener('DOMContentLoaded', dispatch);
    };

    if (document.readyState !== 'loading') {
        // move to back of execution queue, FilePond should have been exported by then
        setTimeout(() => dispatch(), 0);
    } else {
        document.addEventListener('DOMContentLoaded', dispatch);
    }

    // updates the OptionTypes object based on the current options
    const updateOptionTypes = () => forin(getDefaultOptions(), (key, value) => {
        OptionTypes[key] = value[1];
    });

    Status = { ...StatusEnum };
    FileOrigin = { ...FileOriginEnum };
    FileStatus = { ...ItemStatus };

    OptionTypes = {};
    updateOptionTypes();


    // create method, creates apps and adds them to the app array
    create = (...args) => {
        const app = createApp(...args);
        app.on('destroy', destroy);
        state.apps.push(app);
        return createAppAPI(app);
    };

    // destroys apps and removes them from the app array
    destroy = hook => {
        // returns true if the app was destroyed successfully
        const indexToRemove = state.apps.findIndex(app => app.isAttachedTo(hook));
        if (indexToRemove >= 0) {
            
            // remove from apps
            const app = state.apps.splice(indexToRemove, 1)[0];

            // restore original dom element
            app.restoreElement();

            return true;
        }

        return false;
    };

    // parses the given context for plugins (does not include the context element itself)
    parse = context => {
        // get all possible hooks
        const matchedHooks = Array.from(context.querySelectorAll(`.${name}`));

        // filter out already active hooks
        const newHooks = matchedHooks.filter(
            newHook => !state.apps.find(app => app.isAttachedTo(newHook))
        );

        // create new instance for each hook
        return newHooks.map(hook => create(hook));
    };

    // returns an app based on the given element hook
    find = hook => {
        const app = state.apps.find(app => app.isAttachedTo(hook));
        if (!app) {
            return null;
        }
        return createAppAPI(app);
    };

    // adds a plugin extension
    registerPlugin = (...plugins) => {

        // register plugins
        plugins.forEach(createAppPlugin);

        // update OptionTypes, each plugin might have extended the default options
        updateOptionTypes();
    }

    getOptions = () => {
        const opts = {};
        forin(getDefaultOptions(), (key, value) => {
            opts[key] = value[0];
        });
        return opts;
    }

    setOptions = opts => {

        if (isObject(opts)) {
            // update existing plugins
            state.apps.forEach(app => {
                app.setOptions(opts);
            });

            // override defaults
            setDefaultOptions(opts);
        }

        // return new options
        return getOptions();
    };
}