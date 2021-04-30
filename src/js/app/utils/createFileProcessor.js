import { createPerceivedPerformanceUpdater } from './createPerceivedPerformanceUpdater';
import { getRandomNumber } from '../../utils/getRandomNumber';
import { on } from '../utils/on';
import { isObject } from '../../utils/isObject';

export const createFileProcessor = (processFn, options) => {
    const state = {
        complete: false,
        perceivedProgress: 0,
        perceivedPerformanceUpdater: null,
        progress: null,
        timestamp: null,
        perceivedDuration: 0,
        duration: 0,
        request: null,
        response: null,
    };

    const { allowMinimumUploadDuration } = options;

    const process = (file, metadata) => {
        const progressFn = () => {
            // we've not yet started the real download, stop here
            // the request might not go through, for instance, there might be some server trouble
            // if state.progress is null, the server does not allow computing progress and we show the spinner instead
            if (state.duration === 0 || state.progress === null) return;

            // as we're now processing, fire the progress event
            api.fire('progress', api.getProgress());
        };

        const completeFn = () => {
            state.complete = true;
            api.fire('load-perceived', state.response.body);
        };

        // let's start processing
        api.fire('start');

        // set request start
        state.timestamp = Date.now();

        // create perceived performance progress indicator
        state.perceivedPerformanceUpdater = createPerceivedPerformanceUpdater(
            progress => {
                state.perceivedProgress = progress;
                state.perceivedDuration = Date.now() - state.timestamp;

                progressFn();

                // if fake progress is done, and a response has been received,
                // and we've not yet called the complete method
                if (state.response && state.perceivedProgress === 1 && !state.complete) {
                    // we done!
                    completeFn();
                }
            },
            // random delay as in a list of files you start noticing
            // files uploading at the exact same speed
            allowMinimumUploadDuration ? getRandomNumber(750, 1500) : 0
        );

        // remember request so we can abort it later
        state.request = processFn(
            // the file to process
            file,

            // the metadata to send along
            metadata,

            // callbacks (load, error, progress, abort, transfer)
            // load expects the body to be a server id if
            // you want to make use of revert
            response => {
                // we put the response in state so we can access
                // it outside of this method
                state.response = isObject(response)
                    ? response
                    : {
                          type: 'load',
                          code: 200,
                          body: `${response}`,
                          headers: {},
                      };

                // update duration
                state.duration = Date.now() - state.timestamp;

                // force progress to 1 as we're now done
                state.progress = 1;

                // actual load is done let's share results
                api.fire('load', state.response.body);

                // we are really done
                // if perceived progress is 1 ( wait for perceived progress to complete )
                // or if server does not support progress ( null )
                if (
                    !allowMinimumUploadDuration ||
                    (allowMinimumUploadDuration && state.perceivedProgress === 1)
                ) {
                    completeFn();
                }
            },

            // error is expected to be an object with type, code, body
            error => {
                // cancel updater
                state.perceivedPerformanceUpdater.clear();

                // update others about this error
                api.fire(
                    'error',
                    isObject(error)
                        ? error
                        : {
                              type: 'error',
                              code: 0,
                              body: `${error}`,
                          }
                );
            },

            // actual processing progress
            (computable, current, total) => {
                // update actual duration
                state.duration = Date.now() - state.timestamp;

                // update actual progress
                state.progress = computable ? current / total : null;

                progressFn();
            },

            // abort does not expect a value
            () => {
                // stop updater
                state.perceivedPerformanceUpdater.clear();

                // fire the abort event so we can switch visuals
                api.fire('abort', state.response ? state.response.body : null);
            },

            // register the id for this transfer
            transferId => {
                api.fire('transfer', transferId);
            }
        );
    };

    const abort = () => {
        // no request running, can't abort
        if (!state.request) return;

        // stop updater
        state.perceivedPerformanceUpdater.clear();

        // abort actual request
        if (state.request.abort) state.request.abort();

        // if has response object, we've completed the request
        state.complete = true;
    };

    const reset = () => {
        abort();
        state.complete = false;
        state.perceivedProgress = 0;
        state.progress = 0;
        state.timestamp = null;
        state.perceivedDuration = 0;
        state.duration = 0;
        state.request = null;
        state.response = null;
    };

    const getProgress = allowMinimumUploadDuration
        ? () => (state.progress ? Math.min(state.progress, state.perceivedProgress) : null)
        : () => state.progress || null;

    const getDuration = allowMinimumUploadDuration
        ? () => Math.min(state.duration, state.perceivedDuration)
        : () => state.duration;

    const api = {
        ...on(),
        process, // start processing file
        abort, // abort active process request
        getProgress,
        getDuration,
        reset,
    };

    return api;
};
