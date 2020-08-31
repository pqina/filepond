import { createStore } from './frame/index';
import { insertBefore } from '../utils/insertBefore';
import { insertAfter } from '../utils/insertAfter';
import { createInitialState } from './utils/createInitialState';
import { createObject } from '../utils/createObject';
import { createOptionAPI } from './utils/createOptionAPI';
import { createOptionActions } from './utils/createOptionActions';
import { createOptionQueries } from './utils/createOptionQueries';
import { InteractionMethod } from './enum/InteractionMethod';
import { getUniqueId } from '../utils/getUniqueId';
import { on } from './utils/on';
import { isArray } from '../utils/isArray';
import { isNumber } from '../utils/isNumber';
import { createItemAPI } from './utils/createItemAPI';
import { removeReleasedItems } from './utils/removeReleasedItems';
import { ItemStatus } from './enum/ItemStatus';
import { FileOrigin } from './enum/FileOrigin';

// defaults
import { getOptions } from './options';
import { queries } from './queries';
import { actions } from './actions';

// view
import { root } from './view/root';

// creates the app
export const createApp = (initialOptions = {}) => {
    // let element
    let originalElement = null;

    // get default options
    const defaultOptions = getOptions();

    // create the data store, this will contain all our app info
    const store = createStore(
        // initial state (should be serializable)
        createInitialState(defaultOptions),

        // queries
        [queries, createOptionQueries(defaultOptions)],

        // action handlers
        [actions, createOptionActions(defaultOptions)]
    );

    // set initial options
    store.dispatch('SET_OPTIONS', { options: initialOptions });

    // kick thread if visibility changes
    const visibilityHandler = () => {
        if (document.hidden) return;
        store.dispatch('KICK');
    }
    document.addEventListener('visibilitychange', visibilityHandler);

    // re-render on window resize start and finish
    let resizeDoneTimer = null;
    let isResizing = false;
    let isResizingHorizontally = false;
    let initialWindowWidth = null;
    let currentWindowWidth = null;
    const resizeHandler = () => {
        if (!isResizing) {
            isResizing = true;
        }
        clearTimeout(resizeDoneTimer);
        resizeDoneTimer = setTimeout(() => {
            isResizing = false;
            initialWindowWidth = null;
            currentWindowWidth = null;
            if (isResizingHorizontally) {
                isResizingHorizontally = false;
                store.dispatch('DID_STOP_RESIZE');
            }
        }, 500);
    };
    window.addEventListener('resize', resizeHandler);

    // render initial view
    const view = root(store, { id: getUniqueId() });

    //
    // PRIVATE API -------------------------------------------------------------------------------------
    //
    let isResting = false;
    let isHidden = false;

    const readWriteApi = {
        // necessary for update loop

        /**
         * Reads from dom (never call manually)
         * @private
         */
        _read: () => {

            // test if we're resizing horizontally
            // TODO: see if we can optimize this by measuring root rect
            if (isResizing) {

                currentWindowWidth = window.innerWidth;
                if (!initialWindowWidth) {
                    initialWindowWidth = currentWindowWidth;
                }

                if (!isResizingHorizontally && currentWindowWidth !== initialWindowWidth) {
                    store.dispatch('DID_START_RESIZE');
                    isResizingHorizontally = true;
                }
            }

            if (isHidden && isResting) {
                // test if is no longer hidden
                isResting = view.element.offsetParent === null;
            }

            // if resting, no need to read as numbers will still all be correct
            if (isResting) return;

            // read view data
            view._read();

            // if is hidden we need to know so we exit rest mode when revealed
            isHidden = view.rect.element.hidden;
        },

        /**
         * Writes to dom (never call manually)
         * @private
         */
        _write: ts => {

            // get all actions from store
            const actions = store
                .processActionQueue()

                // filter out set actions (these will automatically trigger DID_SET)
                .filter(action => !/^SET_/.test(action.type));

            // if was idling and no actions stop here
            if (isResting && !actions.length) return;
            
            // some actions might trigger events
            routeActionsToEvents(actions);

            // update the view
            isResting = view._write(ts, actions, isResizingHorizontally);

            // will clean up all archived items
            removeReleasedItems(store.query('GET_ITEMS'));
            
            // now idling
            if (isResting) {
                store.processDispatchQueue();
            }

        }
    };

    //
    // EXPOSE EVENTS -------------------------------------------------------------------------------------
    //
    const createEvent = name => data => {
        // create default event
        const event = {
            type: name
        };

        // no data to add
        if (!data) {
            return event;
        }

        // copy relevant props
        if (data.hasOwnProperty('error')) {
            event.error = data.error ? { ...data.error } : null;
        }

        if (data.status) {
            event.status = { ...data.status };
        }

        if (data.file) {
            event.output = data.file;
        }

        // only source is available, else add item if possible
        if (data.source) {
            event.file = data.source;
        } else if (data.item || data.id) {
            const item = data.item
                ? data.item
                : store.query('GET_ITEM', data.id);
            event.file = item ? createItemAPI(item) : null;
        }

        // map all items in a possible items array
        if (data.items) {
            event.items = data.items.map(createItemAPI);
        }

        // if this is a progress event add the progress amount
        if (/progress/.test(name)) {
            event.progress = data.progress;
        }

        // copy relevant props
        if (data.hasOwnProperty('origin') && data.hasOwnProperty('target')) {
            event.origin = data.origin;
            event.target = data.target;
        }

        return event;
    };

    const eventRoutes = {
        DID_DESTROY: createEvent('destroy'),

        DID_INIT: createEvent('init'),

        DID_THROW_MAX_FILES: createEvent('warning'),

        DID_INIT_ITEM: createEvent('initfile'),
        DID_START_ITEM_LOAD: createEvent('addfilestart'),
        DID_UPDATE_ITEM_LOAD_PROGRESS: createEvent('addfileprogress'),
        DID_LOAD_ITEM: createEvent('addfile'),
        
        DID_THROW_ITEM_INVALID: [
            createEvent('error'), 
            createEvent('addfile')
        ],

        DID_THROW_ITEM_LOAD_ERROR: [
            createEvent('error'),
            createEvent('addfile')
        ],

        DID_THROW_ITEM_REMOVE_ERROR: [
            createEvent('error'),
            createEvent('removefile')
        ],

        DID_PREPARE_OUTPUT: createEvent('preparefile'),

        DID_START_ITEM_PROCESSING: createEvent('processfilestart'),
        DID_UPDATE_ITEM_PROCESS_PROGRESS: createEvent('processfileprogress'),
        DID_ABORT_ITEM_PROCESSING: createEvent('processfileabort'),
        DID_COMPLETE_ITEM_PROCESSING: createEvent('processfile'),
        DID_COMPLETE_ITEM_PROCESSING_ALL: createEvent('processfiles'),
        DID_REVERT_ITEM_PROCESSING: createEvent('processfilerevert'),

        DID_THROW_ITEM_PROCESSING_ERROR: [
            createEvent('error'),
            createEvent('processfile')
        ],

        DID_REMOVE_ITEM: createEvent('removefile'),

        DID_UPDATE_ITEMS: createEvent('updatefiles'),

        DID_ACTIVATE_ITEM: createEvent('activatefile'),

        DID_REORDER_ITEMS: createEvent('reorderfiles')
    };

    const exposeEvent = event => {

        // create event object to be dispatched
        const detail = { pond: exports, ...event };
        delete detail.type;
        view.element.dispatchEvent(
            new CustomEvent(`FilePond:${event.type}`, {
                // event info
                detail,

                // event behaviour
                bubbles: true,
                cancelable: true,
                composed: true // triggers listeners outside of shadow root
            })
        );

        // event object to params used for `on()` event handlers and callbacks `oninit()`
        const params = [];

        // if is possible error event, make it the first param
        if (event.hasOwnProperty('error')) {
            params.push(event.error);
        }
        
        // file is always section
        if (event.hasOwnProperty('file')) {
            params.push(event.file);
        }

        // append other props
        const filtered = ['type', 'error', 'file'];
        Object.keys(event)
            .filter(key => !filtered.includes(key))
            .forEach(key => params.push(event[key]));

        // on(type, () => { })
        exports.fire(event.type, ...params);

        // oninit = () => {}
        const handler = store.query(`GET_ON${event.type.toUpperCase()}`);
        if (handler) {
            handler(...params);
        }
    };

    const routeActionsToEvents = actions => {
        if (!actions.length) return;
        actions
            .filter(action => eventRoutes[action.type])
            .forEach(action => {
                const routes = eventRoutes[action.type];
                (Array.isArray(routes) ? routes : [routes]).forEach(route => {
                    // this isn't fantastic, but because of the stacking of settimeouts plugins can handle the did_load before the did_init
                    if (action.type === 'DID_INIT_ITEM') {
                        exposeEvent(route(action.data));
                    }
                    else {
                        setTimeout(() => {
                            exposeEvent(route(action.data));
                        }, 0);
                    }
                });
            });
    };

    //
    // PUBLIC API -------------------------------------------------------------------------------------
    //
    const setOptions = options => store.dispatch('SET_OPTIONS', { options });

    const getFile = query => store.query('GET_ACTIVE_ITEM', query);

    const prepareFile = query => new Promise((resolve, reject) => {
        store.dispatch('REQUEST_ITEM_PREPARE', {
            query,
            success: (item) => {
                resolve(item)
            },
            failure: (error) => {
                reject(error)
            },
        });
    });

    const addFile = (source, options = {}) => new Promise((resolve, reject) => {
        addFiles([{source, options}], { index: options.index })
            .then(items => resolve(items && items[0]))
            .catch(reject)
    });

    const isFilePondFile = (obj) => obj.file && obj.id;

    const removeFile = (query, options) => {

        // if only passed options
        if (typeof query === 'object' && !isFilePondFile(query) && !options) {
            options = query;
            query = undefined;
        }

        // request item removal
        store.dispatch('REMOVE_ITEM', { ...options, query });

        // see if item has been removed
        return store.query('GET_ACTIVE_ITEM', query) === null;
    };

    const addFiles = (...args) =>
        new Promise((resolve, reject) => {

            const sources = [];
            const options = {};

            // user passed a sources array
            if (isArray(args[0])) {
                sources.push.apply(sources, args[0]);
                Object.assign(options, args[1] || {});
            } 
            else {
                // user passed sources as arguments, last one might be options object
                const lastArgument = args[args.length - 1];
                if (
                    typeof lastArgument === 'object' &&
                    !(lastArgument instanceof Blob)
                ) {
                    Object.assign(options, args.pop());
                }

                // add rest to sources
                sources.push(...args);
            }

            store.dispatch('ADD_ITEMS', {
                items: sources,
                index: options.index,
                interactionMethod: InteractionMethod.API,
                success: resolve,
                failure: reject
            });

        });

    const getFiles = () => store.query('GET_ACTIVE_ITEMS');

    const processFile = query => new Promise((resolve, reject) => {
        store.dispatch('REQUEST_ITEM_PROCESSING', {
            query,
            success: (item) => {
                resolve(item)
            },
            failure: (error) => {
                reject(error)
            },
        });
    });

    const prepareFiles = (...args) => {
        const queries = Array.isArray(args[0]) ? args[0] : args;
        const items = queries.length ? queries : getFiles();
        return Promise.all(items.map(prepareFile));
    };

    const processFiles = (...args) => {
        const queries = Array.isArray(args[0]) ? args[0] : args;
        if (!queries.length) {
            const files = getFiles().filter(item => 
                !(item.status === ItemStatus.IDLE && item.origin === FileOrigin.LOCAL) &&
                item.status !== ItemStatus.PROCESSING &&
                item.status !== ItemStatus.PROCESSING_COMPLETE &&
                item.status !== ItemStatus.PROCESSING_REVERT_ERROR
            );
            return Promise.all(files.map(processFile));
        }
        return Promise.all(queries.map(processFile));
    };

    const removeFiles = (...args) => {

        const queries = Array.isArray(args[0]) ? args[0] : args;

        let options;
        if (typeof queries[queries.length - 1] === 'object') {
            options = queries.pop();
        }
        else if (Array.isArray(args[0])) {
            options = args[1];
        }

        const files = getFiles();

        if (!queries.length) return Promise.all(files.map(file => removeFile(file, options)));

        // when removing by index the indexes shift after each file removal so we need to convert indexes to ids
        const mappedQueries = queries.map(query =>
            isNumber(query) ? files[query] ? files[query].id : null : query
        ).filter(query => query);

        return mappedQueries.map(q => removeFile(q, options));
    };

    const exports = {
        // supports events
        ...on(),

        // inject private api methods
        ...readWriteApi,

        // inject all getters and setters
        ...createOptionAPI(store, defaultOptions),

        /**
         * Override options defined in options object
         * @param options
         */
        setOptions,

        /**
         * Load the given file
         * @param source - the source of the file (either a File, base64 data uri or url)
         * @param options - object, { index: 0 }
         */
        addFile,

        /**
         * Load the given files
         * @param sources - the sources of the files to load
         * @param options - object, { index: 0 }
         */
        addFiles,

        /**
         * Returns the file objects matching the given query
         * @param query { string, number, null }
         */
        getFile,

        /**
         * Upload file with given name
         * @param query { string, number, null  }
         */
        processFile,


        /**
         * Request prepare output for file with given name
         * @param query { string, number, null  }
         */
        prepareFile,

        /**
         * Removes a file by its name
         * @param query { string, number, null  }
         */
        removeFile,

        /**
         * Moves a file to a new location in the files list
         */
        moveFile: (query, index) => store.dispatch('MOVE_ITEM', { query, index }),

        /**
         * Returns all files (wrapped in public api)
         */
        getFiles,

        /**
         * Starts uploading all files
         */
        processFiles,

        /**
         * Clears all files from the files list
         */
        removeFiles,

        /**
         * Starts preparing output of all files
         */
        prepareFiles,

        /**
         * Sort list of files
         */
        sort: (compare) => store.dispatch('SORT', { compare }),

        /**
         * Browse the file system for a file
         */
        browse: () => {
            // needs to be trigger directly as user action needs to be traceable (is not traceable in requestAnimationFrame)
            var input = view.element.querySelector('input[type=file]');
            if (input) {
                input.click();
            }
        },

        /**
         * Destroys the app
         */
        destroy: () => {
            // request destruction
            exports.fire('destroy', view.element);

            // stop active processes (file uploads, fetches, stuff like that)
            // loop over items and depending on states call abort for ongoing processes
            store.dispatch('ABORT_ALL');

            // destroy view
            view._destroy();

            // stop listening to resize
            window.removeEventListener('resize', resizeHandler);

            // stop listening to the visiblitychange event
            document.removeEventListener('visibilitychange', visibilityHandler);

            // dispatch destroy
            store.dispatch('DID_DESTROY');
        },

        /**
         * Inserts the plugin before the target element
         */
        insertBefore: element => insertBefore(view.element, element),

        /**
         * Inserts the plugin after the target element
         */
        insertAfter: element => insertAfter(view.element, element),

        /**
         * Appends the plugin to the target element
         */
        appendTo: element => element.appendChild(view.element),

        /**
         * Replaces an element with the app
         */
        replaceElement: element => {
            // insert the app before the element
            insertBefore(view.element, element);

            // remove the original element
            element.parentNode.removeChild(element);

            // remember original element
            originalElement = element;
        },

        /**
         * Restores the original element
         */
        restoreElement: () => {
            if (!originalElement) {
                return; // no element to restore
            }

            // restore original element
            insertAfter(originalElement, view.element);

            // remove our element
            view.element.parentNode.removeChild(view.element);

            // remove reference
            originalElement = null;
        },

        /**
         * Returns true if the app root is attached to given element
         * @param element
         */
        isAttachedTo: element =>
            view.element === element || originalElement === element,

        /**
         * Returns the root element
         */
        element: {
            get: () => view.element
        },

        /**
         * Returns the current pond status
         */
        status: {
            get: () => store.query('GET_STATUS')
        }
    };

    // Done!
    store.dispatch('DID_INIT');

    // create actual api object
    return createObject(exports);
};
