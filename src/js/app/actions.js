import { isEmpty } from '../utils/isEmpty';
import { forin } from '../utils/forin';
import { fromCamels } from '../utils/fromCamels';
import { hasRoomForItem } from './utils/hasRoomForItem';
import { insertItem } from './utils/insertItem';
import { createFileLoader } from './utils/createFileLoader';
import { createFetchFunction } from './utils/createFetchFunction';
import { createProcessorFunction } from './utils/createProcessorFunction';
import { createRevertFunction } from './utils/createRevertFunction';
import { createFileProcessor } from './utils/createFileProcessor';
import { createItem } from './utils/createItem';
import { ItemStatus } from './enum/ItemStatus';
import { FileOrigin } from './enum/FileOrigin';
import { getItemById } from './utils/getItemById';
import { getItemByQuery } from './utils/getItemByQuery';
import { InteractionMethod } from './enum/InteractionMethod';
import { applyFilterChain, applyFilters } from '../filter';
import { createItemAPI } from './utils/createItemAPI';
import { createResponse } from '../utils/createResponse';
import { fetchLocal } from './utils/fetchLocal';
import { isExternalURL } from '../utils/isExternalURL';
import { isString } from '../utils/isString';
import { isFile } from '../utils/isFile';
import { dynamicLabel } from './utils/dynamicLabel';
import { getActiveItems } from './utils/getActiveItems';
import { isFunction } from '../utils/isFunction';
import { limit } from '../utils/limit';

const isMockItem = (item) => !isFile(item.file);

const listUpdated = (dispatch, state) => {
    clearTimeout(state.listUpdateTimeout);
    state.listUpdateTimeout = setTimeout(() => {
        dispatch('DID_UPDATE_ITEMS', { items: getActiveItems(state.items) });
    }, 0);
}

const optionalPromise = (fn, ...params) => new Promise((resolve) => {

    if (!fn) {
        return resolve(true);
    }

    const result = fn(...params);

    if (result == null) {
        return resolve(true);
    }

    if (typeof result === 'boolean') {
        return resolve(result);
    }

    if (typeof result.then === 'function') {
        result.then(resolve);
    }

});

const sortItems = (state, compare) => {
    state.items.sort((a, b) => compare(createItemAPI(a), createItemAPI(b)));
}

// returns item based on state
const getItemByQueryFromState = (state, itemHandler) => ({
    query,
    success = () => { },
    failure = () => { }
} = {}) => {
    const item = getItemByQuery(state.items, query);
    if (!item) {
        failure({
            error: createResponse(
                'error', 
                0, 
                'Item not found'
            ),
            file: null
        });
        return;
    }
    itemHandler(item, success, failure);
};

export const actions = (dispatch, query, state) => ({
    /**
     * Aborts all ongoing processes
     */
    ABORT_ALL: () => {
        getActiveItems(state.items).forEach(item => {
            item.freeze();
            item.abortLoad();
            item.abortProcessing();
        });
    },

    /**
     * Sets initial files
     */
    DID_SET_FILES: ({ value = [] }) => {
        
        // map values to file objects
        const files = value.map(file => ({
            source: file.source ? file.source : file,
            options: file.options
        }));

        // loop over files, if file is in list, leave it be, if not, remove
        // test if items should be moved
        let activeItems = getActiveItems(state.items);

        activeItems.forEach(item => {
            // if item not is in new value, remove
            if (!files.find(file => file.source === item.source || file.source === item.file)) {
                dispatch('REMOVE_ITEM', { query: item });
            }
        });

        // add new files
        activeItems = getActiveItems(state.items);
        files.forEach((file, index) => {

            // if file is already in list
            if (activeItems.find(item => item.source === file.source || item.file === file.source)) return;

            // not in list, add
            dispatch('ADD_ITEM', {
                ...file,
                interactionMethod: InteractionMethod.NONE,
                index
            });

        });

    },

    DID_UPDATE_ITEM_METADATA: ({ id }) => {

        // if is called multiple times in close succession we combined all calls together to save resources
        clearTimeout(state.itemUpdateTimeout);
        state.itemUpdateTimeout = setTimeout(() => {

            const item = getItemById(state.items, id);

            // only revert and attempt to upload when we're uploading to a server
            if (!query('IS_ASYNC')) {
    
                // should we update the output data
                applyFilterChain('SHOULD_PREPARE_OUTPUT', false, { item, query })
                .then(shouldPrepareOutput => {
                    if (!shouldPrepareOutput) {
                        return;
                    }
                    dispatch('REQUEST_PREPARE_OUTPUT', {
                        query: id,
                        item,
                        success: (file) => {
                            dispatch('DID_PREPARE_OUTPUT', { id, file });
                        }
                    }, true);
                });
    
                return;
            }
    
            // for async scenarios
            const upload = () => {
                // we push this forward a bit so the interface is updated correctly
                setTimeout(() => {
                    dispatch('REQUEST_ITEM_PROCESSING', { query: id })
                }, 32);
            }
    
            const revert = (doUpload) => {
                item.revert(createRevertFunction(state.options.server.url, state.options.server.revert), query('GET_FORCE_REVERT'))
                .then(doUpload ? upload : () => {})
                .catch(() => {})
            }
    
            const abort = (doUpload) => {
                item.abortProcessing()
                .then(doUpload ? upload : () => {});
            }
    
            // if we should re-upload the file immidiately
            if (item.status === ItemStatus.PROCESSING_COMPLETE) {
                return revert(state.options.instantUpload);
            }
            
            // if currently uploading, cancel upload
            if (item.status === ItemStatus.PROCESSING) {
                return abort(state.options.instantUpload);
            }
    
            if (state.options.instantUpload) {
                upload();
            }
            
        }, 0);

    },

    MOVE_ITEM: ({ query, index }) => {
        const item = getItemByQuery(state.items, query);
        if (!item) return;
        const currentIndex = state.items.indexOf(item);
        index = limit(index, 0, state.items.length - 1);
        if (currentIndex === index) return;
        state.items.splice(index, 0, state.items.splice(currentIndex, 1)[0]);
    },

    SORT: ({ compare }) => {
        sortItems(state, compare);
    },

    ADD_ITEMS: ({ items, index, interactionMethod, success = () => { }, failure = () => { } }) => {

        let currentIndex = index;

        if (index === -1 || typeof index === 'undefined') {
            const insertLocation = query('GET_ITEM_INSERT_LOCATION');
            const totalItems = query('GET_TOTAL_ITEMS');
            currentIndex = insertLocation === 'before' ? 0 : totalItems;
        }

        const ignoredFiles = query('GET_IGNORED_FILES');
        const isValidFile = source => isFile(source) ? !ignoredFiles.includes(source.name.toLowerCase()) : !isEmpty(source);
        const validItems = items.filter(isValidFile);

        const promises = validItems.map(source => 
            new Promise((resolve, reject) => {
                dispatch('ADD_ITEM', {
                    interactionMethod,
                    source: source.source || source,
                    success: resolve,
                    failure: reject,
                    index: currentIndex++,
                    options: source.options || {}
                });
            }
        ));

        Promise.all(promises)
            .then(success)
            .catch(failure)
    },

    /**
     * @param source
     * @param index
     * @param interactionMethod
     */
    ADD_ITEM: ({
        source,
        index = -1,
        interactionMethod,
        success = () => { },
        failure = () => { },
        options = {}
    }) => {

        // if no source supplied
        if (isEmpty(source)) {
            failure({
                error: createResponse(
                    'error', 
                    0, 
                    'No source'
                ),
                file: null
            });
            return;
        }

        // filter out invalid file items, used to filter dropped directory contents
        if (isFile(source) && state.options.ignoredFiles.includes(source.name.toLowerCase())) {
            // fail silently
            return;
        }
        
        // test if there's still room in the list of files
        if (!hasRoomForItem(state)) {

            // if multiple allowed, we can't replace
            // or if only a single item is allowed but we're not allowed to replace it we exit
            if (
                state.options.allowMultiple ||
                (!state.options.allowMultiple && !state.options.allowReplace)
            ) {
                const error = createResponse(
                    'warning', 
                    0, 
                    'Max files'
                );

                dispatch('DID_THROW_MAX_FILES', {
                    source,
                    error
                });

                failure({ error, file: null });

                return;
            }

            // let's replace the item
            // id of first item we're about to remove
            const item = getActiveItems(state.items)[0];
            
            // if has been processed remove it from the server as well
            if (item.status === ItemStatus.PROCESSING_COMPLETE || item.status === ItemStatus.PROCESSING_REVERT_ERROR) {
                
                const forceRevert = query('GET_FORCE_REVERT');
                item.revert(createRevertFunction(state.options.server.url, state.options.server.revert), forceRevert)
                    .then(() => {

                        if (!forceRevert) return;

                        // try to add now
                        dispatch('ADD_ITEM', { source, index, interactionMethod, success, failure, options });
                    })
                    .catch(() => {}) // no need to handle this catch state for now
                
                if (forceRevert) return;
            }

            // remove first item as it will be replaced by this item
            dispatch('REMOVE_ITEM', { query: item.id });
        }

        // where did the file originate
        const origin = 
            options.type === 'local' 
                ? FileOrigin.LOCAL 
                : options.type === 'limbo' 
                    ? FileOrigin.LIMBO 
                    : FileOrigin.INPUT;

        // create a new blank item
        const item = createItem(
            // where did this file come from
            origin,

            // an input file never has a server file reference
            origin === FileOrigin.INPUT ? null : source,

            // file mock data, if defined
            options.file
        );

        // set initial meta data
        Object.keys(options.metadata || {}).forEach(key => {
            item.setMetadata(key, options.metadata[key]);
        });

        // created the item, let plugins add methods
        applyFilters('DID_CREATE_ITEM', item, { query, dispatch });

        // where to insert new items
        const itemInsertLocation = query('GET_ITEM_INSERT_LOCATION');

        // adjust index if is not allowed to pick location
        if (!state.options.itemInsertLocationFreedom) {
            index = itemInsertLocation === 'before' ? -1 : state.items.length;
        }

        // add item to list
        insertItem(state.items, item, index);

        // sort items in list
        if (isFunction(itemInsertLocation) && source) {
            sortItems(state, itemInsertLocation);
        }

        // get a quick reference to the item id
        const id = item.id;

        // observe item events
        item.on('load-init', () => {
            dispatch('DID_START_ITEM_LOAD', { id });
        });

        item.on('load-meta', () => {
            dispatch('DID_UPDATE_ITEM_META', { id });
        });

        item.on('load-progress', progress => {
            dispatch('DID_UPDATE_ITEM_LOAD_PROGRESS', { id, progress });
        });

        item.on('load-request-error', error => {

            const mainStatus = dynamicLabel(state.options.labelFileLoadError)(error);

            // is client error, no way to recover
            if (error.code >= 400 && error.code < 500) {
                dispatch('DID_THROW_ITEM_INVALID', {
                    id,
                    error,
                    status: {
                        main: mainStatus,
                        sub: `${error.code} (${error.body})`
                    }
                });

                // reject the file so can be dealt with through API
                failure({ error, file: createItemAPI(item) });
                return;
            }

            // is possible server error, so might be possible to retry
            dispatch('DID_THROW_ITEM_LOAD_ERROR', {
                id,
                error,
                status: {
                    main: mainStatus,
                    sub: state.options.labelTapToRetry
                }
            });
        });

        item.on('load-file-error', error => {
            dispatch('DID_THROW_ITEM_INVALID', {
                id,
                error: error.status,
                status: error.status
            });
            failure({ error: error.status, file: createItemAPI(item) });
        });

        item.on('load-abort', () => {
            dispatch('REMOVE_ITEM', { query: id });
        });

        item.on('load-skip', () => {

            dispatch('COMPLETE_LOAD_ITEM', {
                query: id,
                item,
                data: {
                    source,
                    success
                }
            });

        });

        item.on('load', () => {

            const handleAdd = (shouldAdd) => {

                // no should not add this file
                if (!shouldAdd) {
                    dispatch('REMOVE_ITEM', {
                        query: id
                    });
                    return;
                }

                // now interested in metadata updates
                item.on('metadata-update', change => {
                    dispatch('DID_UPDATE_ITEM_METADATA', { id, change });
                });

                // let plugins decide if the output data should be prepared at this point
                // means we'll do this and wait for idle state
                applyFilterChain('SHOULD_PREPARE_OUTPUT', false, { item, query })
                .then(shouldPrepareOutput => {

                    const loadComplete = () => {

                        dispatch('COMPLETE_LOAD_ITEM', {
                            query: id,
                            item,
                            data:{
                                source,
                                success
                            }
                        });

                        listUpdated(dispatch, state);
                        
                    }

                    // exit
                    if (shouldPrepareOutput) {
                        
                        // wait for idle state and then run PREPARE_OUTPUT
                        dispatch('REQUEST_PREPARE_OUTPUT', {
                            query: id,
                            item,
                            success: (file) => {
                                dispatch('DID_PREPARE_OUTPUT', { id, file });
                                loadComplete();
                            }
                        }, true)

                        return;
                    }

                    loadComplete();

                });

            }

            // item loaded, allow plugins to
            // - read data (quickly)
            // - add metadata
            applyFilterChain('DID_LOAD_ITEM', item, { query, dispatch })
            .then(() => {
                optionalPromise(query('GET_BEFORE_ADD_FILE'), createItemAPI(item))
                    .then(handleAdd);
            }).catch(() => {
                handleAdd(false);
            })
        });

        item.on('process-start', () => {
            dispatch('DID_START_ITEM_PROCESSING', { id });
        });

        item.on('process-progress', progress => {
            dispatch('DID_UPDATE_ITEM_PROCESS_PROGRESS', { id, progress });
        });

        item.on('process-error', error => {
            dispatch('DID_THROW_ITEM_PROCESSING_ERROR', {
                id,
                error,
                status: {
                    main: dynamicLabel(state.options.labelFileProcessingError)(error),
                    sub: state.options.labelTapToRetry
                }
            });
        });

        item.on('process-revert-error', error => {
            dispatch('DID_THROW_ITEM_PROCESSING_REVERT_ERROR', {
                id,
                error,
                status: {
                    main: dynamicLabel(state.options.labelFileProcessingRevertError)(error),
                    sub: state.options.labelTapToRetry
                }
            });
        });

        item.on('process-complete', serverFileReference => {
            dispatch('DID_COMPLETE_ITEM_PROCESSING', {
                id,
                error: null,
                serverFileReference
            });
        });

        item.on('process-abort', () => {
            dispatch('DID_ABORT_ITEM_PROCESSING', { id });
        });

        item.on('process-revert', () => {
            dispatch('DID_REVERT_ITEM_PROCESSING', { id });
        });

        // let view know the item has been inserted
        dispatch('DID_ADD_ITEM', { id, index, interactionMethod });

        listUpdated(dispatch, state);

        // start loading the source
        const { url, load, restore, fetch } = state.options.server || {};

        item.load(
            source,

            // this creates a function that loads the file based on the type of file (string, base64, blob, file) and location of file (local, remote, limbo)
            createFileLoader(
                origin === FileOrigin.INPUT 
                    // input
                    ? isString(source) && isExternalURL(source)
                        ? createFetchFunction(url, fetch) // remote url
                        : fetchLocal // local url
                    // limbo or local
                    : origin === FileOrigin.LIMBO
                        ? createFetchFunction(url, restore) // limbo
                        : createFetchFunction(url, load) // local

            ),

            // called when the file is loaded so it can be piped through the filters
            (file, success, error) => {
                // let's process the file
                applyFilterChain('LOAD_FILE', file, { query })
                    .then(success)
                    .catch(error);
            }
        );
    },

    REQUEST_PREPARE_OUTPUT: ({ item, success, failure = () => {} }) => {

        // error response if item archived
        const err = {
            error: createResponse(
                'error', 
                0, 
                'Item not found'
            ),
            file: null
        };

        // don't handle archived items, an item could have been archived (load aborted) while waiting to be prepared
        if (item.archived) return failure(err);
        
        // allow plugins to alter the file data
        applyFilterChain('PREPARE_OUTPUT', item.file, { query, item })
        .then(result => {
            applyFilterChain('COMPLETE_PREPARE_OUTPUT', result, { query, item })
            .then(result => {

                // don't handle archived items, an item could have been archived (load aborted) while being prepared
                if (item.archived) return failure(err);
                
                // we done!
                success(result);
            });
        });
            
    },

    COMPLETE_LOAD_ITEM: ({item, data}) => {
        
        const {
            success,
            source,
        } = data;

        // sort items in list
        const itemInsertLocation = query('GET_ITEM_INSERT_LOCATION');
        if (isFunction(itemInsertLocation) && source) {
            sortItems(state, itemInsertLocation);
        }

        // let interface know the item has loaded
        dispatch('DID_LOAD_ITEM', {
            id: item.id,
            error: null,
            serverFileReference: item.origin === FileOrigin.INPUT ? null : source
        });

        // item has been successfully loaded and added to the
        // list of items so can now be safely returned for use
        success(createItemAPI(item));

        // if this is a local server file we need to show a different state
        if (item.origin === FileOrigin.LOCAL) {
            dispatch('DID_LOAD_LOCAL_ITEM', { id: item.id });
            return;
        }

        // if is a temp server file we prevent async upload call here (as the file is already on the server)
        if (item.origin === FileOrigin.LIMBO) {
            dispatch('DID_COMPLETE_ITEM_PROCESSING', {
                id: item.id,
                error: null,
                serverFileReference: source
            });
            return;
        }

        // id we are allowed to upload the file immidiately, lets do it
        if (query('IS_ASYNC') && state.options.instantUpload) {
            dispatch('REQUEST_ITEM_PROCESSING', { query: item.id });
        }

    },

    RETRY_ITEM_LOAD: getItemByQueryFromState(state, item => {
        // try loading the source one more time
        item.retryLoad();
    }),

    REQUEST_ITEM_PREPARE: getItemByQueryFromState(state,  (item, success, failure) => {
        dispatch('REQUEST_PREPARE_OUTPUT', {
            query: item.id,
            item,
            success: (file) => {
                dispatch('DID_PREPARE_OUTPUT', { id: item.id, file });
                success({
                    file: item,
                    output: file
                });
            },
            failure
        }, true);
    }),

    REQUEST_ITEM_PROCESSING: getItemByQueryFromState(state,  (item, success, failure) => {
        
        // cannot be queued (or is already queued)
        const itemCanBeQueuedForProcessing = 
            // waiting for something
            (item.status === ItemStatus.IDLE) ||
            // processing went wrong earlier
            (item.status === ItemStatus.PROCESSING_ERROR);

        // not ready to be processed
        if (!itemCanBeQueuedForProcessing) {

            const process = () => {
                setTimeout(() => {
                    dispatch('REQUEST_ITEM_PROCESSING', { query: item, success, failure });
                }, 32);
            }

            // if already done processing or tried to revert but didn't work, try again
            if (item.status === ItemStatus.PROCESSING_COMPLETE || item.status === ItemStatus.PROCESSING_REVERT_ERROR) {
                item.revert(createRevertFunction(state.options.server.url,state.options.server.revert), query('GET_FORCE_REVERT'))
                .then(process)
                .catch(() => {}) // don't continue with processing if something went wrong
            }

            else if (item.status === ItemStatus.PROCESSING) {
                item.abortProcessing()
                .then(process);
            }

            return;
        }

        // already queued for processing
        if (item.status === ItemStatus.PROCESSING_QUEUED) return;

        item.requestProcessing();

        dispatch('DID_REQUEST_ITEM_PROCESSING', { id: item.id });

        dispatch('PROCESS_ITEM', { query: item, success, failure }, true);
    }),

    PROCESS_ITEM: getItemByQueryFromState(state, (item, success, failure) => {
        
        const maxParallelUploads = query('GET_MAX_PARALLEL_UPLOADS');
        const totalCurrentUploads = query('GET_ITEMS_BY_STATUS', ItemStatus.PROCESSING).length;

        // queue and wait till queue is freed up
        if (totalCurrentUploads === maxParallelUploads) {

            // queue for later processing
            state.processingQueue.push({
                id: item.id,
                success,
                failure
            });

            // stop it!
            return;
        };

        // if was not queued or is already processing exit here
        if (item.status === ItemStatus.PROCESSING) return;

        const processNext = () => {

            // process queueud items
            const queueEntry = state.processingQueue.shift();

            // no items left
            if (!queueEntry) return;

            // get item reference
            const { id, success, failure } = queueEntry;
            const itemReference = getItemByQuery(state.items, id);

            // if item was archived while in queue, jump to next
            if (!itemReference || itemReference.archived) {
                processNext();
                return;
            }

            // process queued item
            dispatch('PROCESS_ITEM', { query: id, success, failure }, true);
        }

        // we done function
        item.onOnce('process-complete', () => {
            success(createItemAPI(item));
            processNext();

            // All items processed? No errors?
            const allItemsProcessed = query('GET_ITEMS_BY_STATUS', ItemStatus.PROCESSING_COMPLETE).length === state.items.length;
            if (allItemsProcessed) {
                dispatch('DID_COMPLETE_ITEM_PROCESSING_ALL');
            }
        });

        // we error function
        item.onOnce('process-error', error => {
            failure({ error, file: createItemAPI(item) });
            processNext();
        });

        // start file processing
        const options = state.options;
        item.process(
            createFileProcessor(
                createProcessorFunction(
                    options.server.url,
                    options.server.process,
                    options.name,
                    {
                        chunkTransferId: item.transferId,
                        chunkServer: options.server.patch,
                        chunkUploads: options.chunkUploads,
                        chunkForce: options.chunkForce,
                        chunkSize: options.chunkSize,
                        chunkRetryDelays: options.chunkRetryDelays,
                    }
                )
            ),
            // called when the file is about to be processed so it can be piped through the transform filters
            (file, success, error) => {

                // allow plugins to alter the file data
                applyFilterChain('PREPARE_OUTPUT', file, { query, item })
                    .then(file => {
                        dispatch('DID_PREPARE_OUTPUT', { id: item.id, file });

                        success(file);
                    })
                    .catch(error);
            }
        );
    }),

    RETRY_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
        dispatch('REQUEST_ITEM_PROCESSING', { query: item });
    }),

    REQUEST_REMOVE_ITEM: getItemByQueryFromState(state, (item) => {
        optionalPromise(query('GET_BEFORE_REMOVE_FILE'), createItemAPI(item))
            .then((shouldRemove) => {
                if (!shouldRemove) {
                    return;
                }
                dispatch('REMOVE_ITEM', { query: item });
            });
    }),

    RELEASE_ITEM: getItemByQueryFromState(state, (item) => {
        item.release();
    }),

    REMOVE_ITEM: getItemByQueryFromState(state, (item, success) => {

        const removeFromView = () => {

            // get id reference
            const id = item.id;

            // archive the item, this does not remove it from the list
            getItemById(state.items, id).archive();

            // tell the view the item has been removed
            dispatch('DID_REMOVE_ITEM', { error:null, id, item });

            // now the list has been modified
            listUpdated(dispatch, state);
            
            // correctly removed
            success(createItemAPI(item));
        }

        // if this is a local file and the server.remove function has been configured, send source there so dev can remove file from server
        const server = state.options.server;
        if (item.origin === FileOrigin.LOCAL && 
            server && isFunction(server.remove)) {
            
            dispatch('DID_START_ITEM_REMOVE', { id: item.id });

            server.remove(
                item.source, 
                () => removeFromView(),
                (status) => {
                    dispatch('DID_THROW_ITEM_REMOVE_ERROR', {
                        id: item.id,
                        error: createResponse('error', 0, status, null),
                        status: {
                            main: dynamicLabel(state.options.labelFileRemoveError)(status),
                            sub: state.options.labelTapToRetry
                        }
                    });
                }
            );
        }
        else {
            removeFromView();
        }

    }),

    ABORT_ITEM_LOAD: getItemByQueryFromState(state, item => {
        item.abortLoad();
    }),

    ABORT_ITEM_PROCESSING: getItemByQueryFromState(state, item => {

        // test if is already processed
        if (item.serverId) {
            dispatch('REVERT_ITEM_PROCESSING', { id: item.id });
            return;
        }

        // abort
        item.abortProcessing()
            .then(() => {
                const shouldRemove = state.options.instantUpload;
                if (shouldRemove) {
                    dispatch('REMOVE_ITEM', { query: item.id });
                }
            });
    }),

    REQUEST_REVERT_ITEM_PROCESSING: getItemByQueryFromState(state, item => {

        // not instant uploading, revert immidiately
        if (!state.options.instantUpload) {
            dispatch('REVERT_ITEM_PROCESSING', { query: item });
            return;
        }

        // if we're instant uploading the file will also be removed if we revert, 
        // so if a before remove file hook is defined we need to run it now
        const handleRevert = (shouldRevert) => {
            if (!shouldRevert) return;
            dispatch('REVERT_ITEM_PROCESSING', { query: item });
        }

        const fn = query('GET_BEFORE_REMOVE_FILE');
        if (!fn) {
            return handleRevert(true);
        }
    
        const requestRemoveResult = fn(createItemAPI(item));
        if (requestRemoveResult == null) { // undefined or null
            return handleRevert(true);
        }
    
        if (typeof requestRemoveResult === 'boolean') {
            return handleRevert(requestRemoveResult);
        }
    
        if (typeof requestRemoveResult.then === 'function') {
            requestRemoveResult.then(handleRevert);
        }
    
    }),

    REVERT_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
        item.revert(createRevertFunction(state.options.server.url, state.options.server.revert), query('GET_FORCE_REVERT'))
            .then(() => {
                const shouldRemove = state.options.instantUpload || isMockItem(item);
                if (shouldRemove) {
                    dispatch('REMOVE_ITEM', { query: item.id });
                }
            }).catch(() => {})
    }),

    SET_OPTIONS: ({ options }) => {
        forin(options, (key, value) => {
            dispatch(`SET_${fromCamels(key, '_').toUpperCase()}`, { value });
        });
    }
});
