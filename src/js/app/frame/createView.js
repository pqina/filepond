import { createObject } from '../../utils/createObject';
import { createElement } from './utils/createElement';
import { appendChild } from './utils/appendChild';
import { appendChildView } from './utils/appendChildView';
import { removeChildView } from './utils/removeChildView';
import { getChildCount } from './utils/getChildCount';
import { getViewRect } from './utils/getViewRect';
import { Mixins } from './mixins/index';
import { updateRect } from './utils/updateRect';

export const createView =
    // default view definition
    ({
        // element definition
        tag = 'div',
        name = null,
        attributes = {},

        // view interaction
        read = () => {},
        write = () => {},
        create = () => {},
        destroy = () => {},

        // hooks
        filterFrameActionsForChild = (child, actions) => actions,
        didCreateView = () => {},
        didWriteView = () => {},

        // rect related
        ignoreRect = false,
        ignoreRectUpdate = false,

        // mixins
        mixins = []
    } = {}) => (
        // each view requires reference to store
        store,
        // specific properties for this view
        props = {}
    ) => {
            // root element should not be changed
            const element = createElement(tag, `filepond--${name}`, attributes);

            // style reference should also not be changed
            const style = window.getComputedStyle(element, null);

            // element rectangle
            const rect = updateRect();
            let frameRect = null;

            // rest state
            let isResting = false;

            // pretty self explanatory
            const childViews = [];

            // loaded mixins
            const activeMixins = [];

            // references to created children
            const ref = {};

            // state used for each instance
            const state = {};

            // list of writers that will be called to update this view
            const writers = [
                write // default writer
            ];

            const readers = [
                read // default reader
            ];

            const destroyers = [
                destroy // default destroy
            ];

            // core view methods
            const getElement = () => element;
            const getChildViews = () => childViews.concat();
            const getReference = () => ref;
            const createChildView = store => (view, props) => view(store, props);
            const getRect = () => {
                if (frameRect) {
                    return frameRect;
                }
                frameRect = getViewRect(rect, childViews, [0, 0], [1, 1])
                return frameRect;
            };
            const getStyle = () => style;

            /**
             * Read data from DOM
             * @private
             */
            const _read = () => {

                frameRect = null;

                // read child views
                childViews.forEach(child => child._read());

                const shouldUpdate = !(ignoreRectUpdate && rect.width && rect.height)
                if (shouldUpdate) {
                    updateRect(rect, element, style);
                }

                // readers
                const api = { root: internalAPI, props, rect };
                readers.forEach(reader =>
                    reader(api)
                );

            };

            /**
             * Write data to DOM
             * @private
             */
            const _write = (ts, frameActions, shouldOptimize) => {
                // if no actions, we assume that the view is resting
                let resting = frameActions.length === 0;

                // writers
                writers.forEach(writer => {
                    const writerResting = writer({
                        props,
                        root: internalAPI,
                        actions: frameActions,
                        timestamp: ts,
                        shouldOptimize
                    });
                    if (writerResting === false) {
                        resting = false;
                    }
                });

                // run mixins
                activeMixins.forEach(mixin => {
                    // if one of the mixins is still busy after write operation, we are not resting
                    const mixinResting = mixin.write(ts);
                    if (mixinResting === false) {
                        resting = false;
                    }
                });

                // updates child views that are currently attached to the DOM
                childViews
                    .filter(child => !!child.element.parentNode)
                    .forEach(child => {
                        // if a child view is not resting, we are not resting
                        const childResting = child._write(
                            ts,
                            filterFrameActionsForChild(child, frameActions),
                            shouldOptimize
                        );
                        if (!childResting) {
                            resting = false;
                        }
                    });
                    
                // append new elements to DOM and update those
                childViews
                    //.filter(child => !child.element.parentNode)
                    .forEach((child, index) => {

                        // skip 
                        if (child.element.parentNode) {
                            return;
                        }

                        // append to DOM
                        internalAPI.appendChild(child.element, index);

                        // call read (need to know the size of these elements)
                        child._read();

                        // re-call write
                        child._write(
                            ts,
                            filterFrameActionsForChild(child, frameActions),
                            shouldOptimize
                        );

                        // we just added somthing to the dom, no rest
                        resting = false;
                    });

                // update resting state
                isResting = resting;

                didWriteView({
                    props,
                    root: internalAPI,
                    actions: frameActions,
                    timestamp: ts
                });

                // let parent know if we are resting
                return resting;
            };

            const _destroy = () => {
                activeMixins.forEach(mixin => mixin.destroy());
                destroyers.forEach(destroyer => { destroyer({ root: internalAPI, props })});
                childViews.forEach(child => child._destroy());
            };

            // sharedAPI
            const sharedAPIDefinition = {
                element: {
                    get: getElement
                },
                style: {
                    get: getStyle
                },
                childViews: {
                    get: getChildViews
                }
            };

            // private API definition
            const internalAPIDefinition = { ...sharedAPIDefinition,
                rect: {
                    get: getRect
                },

                // access to custom children references
                ref: {
                    get: getReference
                },

                // dom modifiers
                is: needle => name === needle,
                appendChild: appendChild(element),
                createChildView: createChildView(store),
                linkView: view => { childViews.push(view); return view },
                unlinkView: view => { childViews.splice(childViews.indexOf(view), 1); },
                appendChildView: appendChildView(element, childViews),
                removeChildView: removeChildView(element, childViews),
                registerWriter: writer => writers.push(writer),
                registerReader: reader => readers.push(reader),
                registerDestroyer: destroyer => destroyers.push(destroyer),
                invalidateLayout: () => element.layoutCalculated = false,

                // access to data store
                dispatch: store.dispatch,
                query: store.query
            };

            // public view API methods
            const externalAPIDefinition = {
                element: {
                    get: getElement
                },
                childViews: {
                    get: getChildViews
                },
                rect: {
                    get: getRect
                },
                resting: {
                    get: () => isResting
                },
                isRectIgnored: () => ignoreRect,
                _read,
                _write,
                _destroy
            };

            // mixin API methods
            const mixinAPIDefinition = { ...sharedAPIDefinition,
                rect: {
                    get: () => rect
                }
            };

            // add mixin functionality
            Object.keys(mixins).sort((a,b) => {
                // move styles to the back of the mixin list (so adjustments of other mixins are applied to the props correctly)
                if (a === 'styles') {
                    return 1;
                }
                else if (b ==='styles') {
                    return -1;
                }
                return 0;
            }).forEach(key => {

                const mixinAPI = Mixins[key]({
                    mixinConfig: mixins[key],
                    viewProps: props,
                    viewState: state,
                    viewInternalAPI: internalAPIDefinition,
                    viewExternalAPI: externalAPIDefinition,
                    view: createObject(mixinAPIDefinition)
                });

                if (mixinAPI) {
                    activeMixins.push(mixinAPI);
                }
            })

            // construct private api
            const internalAPI = createObject(internalAPIDefinition);

            // create the view
            create({
                root: internalAPI,
                props
            });

            // append created child views to root node
            const childCount = getChildCount(element); // need to know the current child count so appending happens in correct order
            childViews.forEach((child, index) => {
                internalAPI.appendChild(child.element, childCount + index);
            });

            // call did create
            didCreateView(internalAPI);

            // expose public api
            return createObject(externalAPIDefinition);
        };
