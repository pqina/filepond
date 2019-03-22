export const createStore = (initialState, queries = [], actions = []) => {
    // internal state
    const state = {
        ...initialState
    };

    // contains all actions for next frame, is clear when actions are requested
    const actionQueue = [];
    const dispatchQueue = [];

    // returns a duplicate of the current state
    const getState = () => ({ ...state });

    // returns a duplicate of the actions array and clears the actions array
    const processActionQueue = () => {
        // create copy of actions queue
        const queue = [...actionQueue];
        
        // clear actions queue (we don't want no double actions)
        actionQueue.length = 0;

        return queue;
    };

    // processes actions that might block the main UI thread
    const processDispatchQueue = () => {
        // create copy of actions queue
        const queue = [...dispatchQueue];

        // clear actions queue (we don't want no double actions)
        dispatchQueue.length = 0;

        // now dispatch these actions
        queue.forEach(({ type, data }) => {
            dispatch(type, data);
        });
    };

    // adds a new action, calls its handler and
    const dispatch = (type, data, isBlocking) => {

        // is blocking action
        if (isBlocking) {
            dispatchQueue.push({
                type,
                data
            });
            return;
        }

        // if this action has a handler, handle the action
        if (actionHandlers[type]) {
            actionHandlers[type](data);
        }

        // now add action
        actionQueue.push({
            type,
            data
        });
    };

    const query = (str, ...args) =>
        queryHandles[str] ? queryHandles[str](...args) : null;

    const api = {
        getState,
        processActionQueue,
        processDispatchQueue,
        dispatch,
        query
    };

    let queryHandles = {};
    queries.forEach(query => {
        queryHandles = {
            ...query(state),
            ...queryHandles
        };
    });

    let actionHandlers = {};
    actions.forEach(action => {
        actionHandlers = {
            ...action(dispatch, query, state),
            ...actionHandlers
        };
    });

    return api;
};
