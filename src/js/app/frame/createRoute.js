export const createRoute = (routes, fn) => ({ root, props, actions = [], timestamp, shouldOptimize }) => {
    actions.filter(action => routes[action.type])
        .forEach(action =>
            routes[action.type]({ root, props, action: action.data, timestamp, shouldOptimize })
        );
    if (fn) {
        fn({ root, props, actions, timestamp, shouldOptimize });
    };
};
