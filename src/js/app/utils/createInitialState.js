import { createOptions } from './createOptions';

export const createInitialState = options => ({

    // model
    items: [],

    // timeout used for calling update items
    listUpdateTimeout: null,

    // timeout used for stacking metadata updates
    itemUpdateTimeout: null,
    
    // queue of items waiting to be processed
    processingQueue: [],

    // options
    options: createOptions(options)
});
