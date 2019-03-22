import { createOptions } from './createOptions';

export const createInitialState = options => ({

    // model
    items: [],

    // timeout used for calling update items
    listUpdateTimeout: null,
    
    // queue of items waiting to be processed
    processingQueue: [],

    // options
    options: createOptions(options)
});
