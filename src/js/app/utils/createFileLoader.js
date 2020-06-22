import { isBase64DataURI } from '../../utils/isBase64DataURI';
import { getFilenameFromURL } from '../../utils/getFilenameFromURL';
import { getFileFromBase64DataURI } from '../../utils/getFileFromBase64DataURI';
import { getFileFromBlob } from '../../utils/getFileFromBlob';
import { getFileInfoFromHeaders } from '../../utils/getFileInfoFromHeaders';
import { on } from '../utils/on';

export const createFileLoader = fetchFn => {
    const state = {
        source: null,
        complete: false,
        progress: 0,
        size: null,
        timestamp: null,
        duration: 0,
        request: null
    };

    const getProgress = () => state.progress;
    const abort = () => {
        if (state.request && state.request.abort) {
            state.request.abort();
        }
    };

    // load source
    const load = () => {
        // get quick reference
        const source = state.source;

        api.fire('init', source);

        // Load Files
        if (source instanceof File) {
            api.fire('load', source);
        } else if (source instanceof Blob) {
            // Load blobs, set default name to current date
            api.fire('load', getFileFromBlob(source, source.name));
        } else if (isBase64DataURI(source)) {
            // Load base 64, set default name to current date
            api.fire('load', getFileFromBase64DataURI(source));
        } else {
            // Deal as if is external URL, let's load it!
            loadURL(source);
        }
    };

    // loads a url
    const loadURL = url => {

        // is remote url and no fetch method supplied
        if (!fetchFn) {
            api.fire('error', {
                type: 'error',
                body: 'Can\'t load URL',
                code: 400
            });
            return;
        }

        // set request start
        state.timestamp = Date.now();

        // load file
        state.request = fetchFn(
            url,
            response => {

                // update duration
                state.duration = Date.now() - state.timestamp;

                // done!
                state.complete = true;

                // turn blob response into a file
                if (response instanceof Blob) {
                    response = getFileFromBlob(
                        response, 
                        response.name || getFilenameFromURL(url)
                    );
                }

                api.fire(
                    'load',
                    // if has received blob, we go with blob, if no response, we return null
                    response instanceof Blob 
                        ? response 
                        : response 
                            ? response.body
                            : null
                );
            },
            error => {
                api.fire(
                    'error',
                    typeof error === 'string'
                        ? {
                              type: 'error',
                              code: 0,
                              body: error
                          }
                        : error
                );
            },
            (computable, current, total) => {
                // collected some meta data already
                if (total) {
                    state.size = total;
                }

                // update duration
                state.duration = Date.now() - state.timestamp;

                // if we can't compute progress, we're not going to fire progress events
                if (!computable) {
                    state.progress = null;
                    return;
                }

                // update progress percentage
                state.progress = current / total;

                // expose
                api.fire('progress', state.progress);
            },
            () => {
                api.fire('abort');
            },
            response => {
                const fileinfo = getFileInfoFromHeaders(typeof response === 'string' ? response : response.headers);
                api.fire('meta', {
                    size: state.size || fileinfo.size,
                    filename: fileinfo.name,
                    source: fileinfo.source
                });
            }
        );
    };

    const api = {
        ...on(),
        setSource: source => state.source = source,
        getProgress, // file load progress
        abort, // abort file load
        load // start load
    };

    return api;
};
