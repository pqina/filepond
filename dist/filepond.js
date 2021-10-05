/*!
 * FilePond 4.30.3
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit https://pqina.nl/filepond/ for details.
 */

/* eslint-disable */

(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? factory(exports)
        : typeof define === 'function' && define.amd
        ? define(['exports'], factory)
        : ((global = global || self), factory((global.FilePond = {})));
})(this, function(exports) {
    'use strict';

    var isNode = function isNode(value) {
        return value instanceof HTMLElement;
    };

    var createStore = function createStore(initialState) {
        var queries = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        var actions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        // internal state
        var state = Object.assign({}, initialState);

        // contains all actions for next frame, is clear when actions are requested
        var actionQueue = [];
        var dispatchQueue = [];

        // returns a duplicate of the current state
        var getState = function getState() {
            return Object.assign({}, state);
        };

        // returns a duplicate of the actions array and clears the actions array
        var processActionQueue = function processActionQueue() {
            // create copy of actions queue
            var queue = [].concat(actionQueue);

            // clear actions queue (we don't want no double actions)
            actionQueue.length = 0;

            return queue;
        };

        // processes actions that might block the main UI thread
        var processDispatchQueue = function processDispatchQueue() {
            // create copy of actions queue
            var queue = [].concat(dispatchQueue);

            // clear actions queue (we don't want no double actions)
            dispatchQueue.length = 0;

            // now dispatch these actions
            queue.forEach(function(_ref) {
                var type = _ref.type,
                    data = _ref.data;
                dispatch(type, data);
            });
        };

        // adds a new action, calls its handler and
        var dispatch = function dispatch(type, data, isBlocking) {
            // is blocking action (should never block if document is hidden)
            if (isBlocking && !document.hidden) {
                dispatchQueue.push({ type: type, data: data });
                return;
            }

            // if this action has a handler, handle the action
            if (actionHandlers[type]) {
                actionHandlers[type](data);
            }

            // now add action
            actionQueue.push({
                type: type,
                data: data,
            });
        };

        var query = function query(str) {
            var _queryHandles;
            for (
                var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
                _key < _len;
                _key++
            ) {
                args[_key - 1] = arguments[_key];
            }
            return queryHandles[str]
                ? (_queryHandles = queryHandles)[str].apply(_queryHandles, args)
                : null;
        };

        var api = {
            getState: getState,
            processActionQueue: processActionQueue,
            processDispatchQueue: processDispatchQueue,
            dispatch: dispatch,
            query: query,
        };

        var queryHandles = {};
        queries.forEach(function(query) {
            queryHandles = Object.assign({}, query(state), {}, queryHandles);
        });

        var actionHandlers = {};
        actions.forEach(function(action) {
            actionHandlers = Object.assign({}, action(dispatch, query, state), {}, actionHandlers);
        });

        return api;
    };

    var defineProperty = function defineProperty(obj, property, definition) {
        if (typeof definition === 'function') {
            obj[property] = definition;
            return;
        }
        Object.defineProperty(obj, property, Object.assign({}, definition));
    };

    var forin = function forin(obj, cb) {
        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) {
                continue;
            }

            cb(key, obj[key]);
        }
    };

    var createObject = function createObject(definition) {
        var obj = {};
        forin(definition, function(property) {
            defineProperty(obj, property, definition[property]);
        });
        return obj;
    };

    var attr = function attr(node, name) {
        var value = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        if (value === null) {
            return node.getAttribute(name) || node.hasAttribute(name);
        }
        node.setAttribute(name, value);
    };

    var ns = 'http://www.w3.org/2000/svg';
    var svgElements = ['svg', 'path']; // only svg elements used

    var isSVGElement = function isSVGElement(tag) {
        return svgElements.includes(tag);
    };

    var createElement = function createElement(tag, className) {
        var attributes = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
        if (typeof className === 'object') {
            attributes = className;
            className = null;
        }
        var element = isSVGElement(tag)
            ? document.createElementNS(ns, tag)
            : document.createElement(tag);
        if (className) {
            if (isSVGElement(tag)) {
                attr(element, 'class', className);
            } else {
                element.className = className;
            }
        }
        forin(attributes, function(name, value) {
            attr(element, name, value);
        });
        return element;
    };

    var appendChild = function appendChild(parent) {
        return function(child, index) {
            if (typeof index !== 'undefined' && parent.children[index]) {
                parent.insertBefore(child, parent.children[index]);
            } else {
                parent.appendChild(child);
            }
        };
    };

    var appendChildView = function appendChildView(parent, childViews) {
        return function(view, index) {
            if (typeof index !== 'undefined') {
                childViews.splice(index, 0, view);
            } else {
                childViews.push(view);
            }

            return view;
        };
    };

    var removeChildView = function removeChildView(parent, childViews) {
        return function(view) {
            // remove from child views
            childViews.splice(childViews.indexOf(view), 1);

            // remove the element
            if (view.element.parentNode) {
                parent.removeChild(view.element);
            }

            return view;
        };
    };

    var IS_BROWSER = (function() {
        return typeof window !== 'undefined' && typeof window.document !== 'undefined';
    })();
    var isBrowser = function isBrowser() {
        return IS_BROWSER;
    };

    var testElement = isBrowser() ? createElement('svg') : {};
    var getChildCount =
        'children' in testElement
            ? function(el) {
                  return el.children.length;
              }
            : function(el) {
                  return el.childNodes.length;
              };

    var getViewRect = function getViewRect(elementRect, childViews, offset, scale) {
        var left = offset[0] || elementRect.left;
        var top = offset[1] || elementRect.top;
        var right = left + elementRect.width;
        var bottom = top + elementRect.height * (scale[1] || 1);

        var rect = {
            // the rectangle of the element itself
            element: Object.assign({}, elementRect),

            // the rectangle of the element expanded to contain its children, does not include any margins
            inner: {
                left: elementRect.left,
                top: elementRect.top,
                right: elementRect.right,
                bottom: elementRect.bottom,
            },

            // the rectangle of the element expanded to contain its children including own margin and child margins
            // margins will be added after we've recalculated the size
            outer: {
                left: left,
                top: top,
                right: right,
                bottom: bottom,
            },
        };

        // expand rect to fit all child rectangles
        childViews
            .filter(function(childView) {
                return !childView.isRectIgnored();
            })
            .map(function(childView) {
                return childView.rect;
            })
            .forEach(function(childViewRect) {
                expandRect(rect.inner, Object.assign({}, childViewRect.inner));
                expandRect(rect.outer, Object.assign({}, childViewRect.outer));
            });

        // calculate inner width and height
        calculateRectSize(rect.inner);

        // append additional margin (top and left margins are included in top and left automatically)
        rect.outer.bottom += rect.element.marginBottom;
        rect.outer.right += rect.element.marginRight;

        // calculate outer width and height
        calculateRectSize(rect.outer);

        return rect;
    };

    var expandRect = function expandRect(parent, child) {
        // adjust for parent offset
        child.top += parent.top;
        child.right += parent.left;
        child.bottom += parent.top;
        child.left += parent.left;

        if (child.bottom > parent.bottom) {
            parent.bottom = child.bottom;
        }

        if (child.right > parent.right) {
            parent.right = child.right;
        }
    };

    var calculateRectSize = function calculateRectSize(rect) {
        rect.width = rect.right - rect.left;
        rect.height = rect.bottom - rect.top;
    };

    var isNumber = function isNumber(value) {
        return typeof value === 'number';
    };

    /**
     * Determines if position is at destination
     * @param position
     * @param destination
     * @param velocity
     * @param errorMargin
     * @returns {boolean}
     */
    var thereYet = function thereYet(position, destination, velocity) {
        var errorMargin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0.001;
        return Math.abs(position - destination) < errorMargin && Math.abs(velocity) < errorMargin;
    };

    /**
     * Spring animation
     */
    var spring =
        // default options
        function spring() // method definition
        {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref$stiffness = _ref.stiffness,
                stiffness = _ref$stiffness === void 0 ? 0.5 : _ref$stiffness,
                _ref$damping = _ref.damping,
                damping = _ref$damping === void 0 ? 0.75 : _ref$damping,
                _ref$mass = _ref.mass,
                mass = _ref$mass === void 0 ? 10 : _ref$mass;
            var target = null;
            var position = null;
            var velocity = 0;
            var resting = false;

            // updates spring state
            var interpolate = function interpolate(ts, skipToEndState) {
                // in rest, don't animate
                if (resting) return;

                // need at least a target or position to do springy things
                if (!(isNumber(target) && isNumber(position))) {
                    resting = true;
                    velocity = 0;
                    return;
                }

                // calculate spring force
                var f = -(position - target) * stiffness;

                // update velocity by adding force based on mass
                velocity += f / mass;

                // update position by adding velocity
                position += velocity;

                // slow down based on amount of damping
                velocity *= damping;

                // we've arrived if we're near target and our velocity is near zero
                if (thereYet(position, target, velocity) || skipToEndState) {
                    position = target;
                    velocity = 0;
                    resting = true;

                    // we done
                    api.onupdate(position);
                    api.oncomplete(position);
                } else {
                    // progress update
                    api.onupdate(position);
                }
            };

            /**
             * Set new target value
             * @param value
             */
            var setTarget = function setTarget(value) {
                // if currently has no position, set target and position to this value
                if (isNumber(value) && !isNumber(position)) {
                    position = value;
                }

                // next target value will not be animated to
                if (target === null) {
                    target = value;
                    position = value;
                }

                // let start moving to target
                target = value;

                // already at target
                if (position === target || typeof target === 'undefined') {
                    // now resting as target is current position, stop moving
                    resting = true;
                    velocity = 0;

                    // done!
                    api.onupdate(position);
                    api.oncomplete(position);

                    return;
                }

                resting = false;
            };

            // need 'api' to call onupdate callback
            var api = createObject({
                interpolate: interpolate,
                target: {
                    set: setTarget,
                    get: function get() {
                        return target;
                    },
                },

                resting: {
                    get: function get() {
                        return resting;
                    },
                },

                onupdate: function onupdate(value) {},
                oncomplete: function oncomplete(value) {},
            });

            return api;
        };

    var easeLinear = function easeLinear(t) {
        return t;
    };
    var easeInOutQuad = function easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    };

    var tween =
        // default values
        function tween() // method definition
        {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref$duration = _ref.duration,
                duration = _ref$duration === void 0 ? 500 : _ref$duration,
                _ref$easing = _ref.easing,
                easing = _ref$easing === void 0 ? easeInOutQuad : _ref$easing,
                _ref$delay = _ref.delay,
                delay = _ref$delay === void 0 ? 0 : _ref$delay;
            var start = null;
            var t;
            var p;
            var resting = true;
            var reverse = false;
            var target = null;

            var interpolate = function interpolate(ts, skipToEndState) {
                if (resting || target === null) return;

                if (start === null) {
                    start = ts;
                }

                if (ts - start < delay) return;

                t = ts - start - delay;

                if (t >= duration || skipToEndState) {
                    t = 1;
                    p = reverse ? 0 : 1;
                    api.onupdate(p * target);
                    api.oncomplete(p * target);
                    resting = true;
                } else {
                    p = t / duration;
                    api.onupdate((t >= 0 ? easing(reverse ? 1 - p : p) : 0) * target);
                }
            };

            // need 'api' to call onupdate callback
            var api = createObject({
                interpolate: interpolate,
                target: {
                    get: function get() {
                        return reverse ? 0 : target;
                    },
                    set: function set(value) {
                        // is initial value
                        if (target === null) {
                            target = value;
                            api.onupdate(value);
                            api.oncomplete(value);
                            return;
                        }

                        // want to tween to a smaller value and have a current value
                        if (value < target) {
                            target = 1;
                            reverse = true;
                        } else {
                            // not tweening to a smaller value
                            reverse = false;
                            target = value;
                        }

                        // let's go!
                        resting = false;
                        start = null;
                    },
                },

                resting: {
                    get: function get() {
                        return resting;
                    },
                },

                onupdate: function onupdate(value) {},
                oncomplete: function oncomplete(value) {},
            });

            return api;
        };

    var animator = {
        spring: spring,
        tween: tween,
    };

    /*
                       { type: 'spring', stiffness: .5, damping: .75, mass: 10 };
                       { translation: { type: 'spring', ... }, ... }
                       { translation: { x: { type: 'spring', ... } } }
                      */
    var createAnimator = function createAnimator(definition, category, property) {
        // default is single definition
        // we check if transform is set, if so, we check if property is set
        var def =
            definition[category] && typeof definition[category][property] === 'object'
                ? definition[category][property]
                : definition[category] || definition;

        var type = typeof def === 'string' ? def : def.type;
        var props = typeof def === 'object' ? Object.assign({}, def) : {};

        return animator[type] ? animator[type](props) : null;
    };

    var addGetSet = function addGetSet(keys, obj, props) {
        var overwrite = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        obj = Array.isArray(obj) ? obj : [obj];
        obj.forEach(function(o) {
            keys.forEach(function(key) {
                var name = key;
                var getter = function getter() {
                    return props[key];
                };
                var setter = function setter(value) {
                    return (props[key] = value);
                };

                if (typeof key === 'object') {
                    name = key.key;
                    getter = key.getter || getter;
                    setter = key.setter || setter;
                }

                if (o[name] && !overwrite) {
                    return;
                }

                o[name] = {
                    get: getter,
                    set: setter,
                };
            });
        });
    };

    // add to state,
    // add getters and setters to internal and external api (if not set)
    // setup animators

    var animations = function animations(_ref) {
        var mixinConfig = _ref.mixinConfig,
            viewProps = _ref.viewProps,
            viewInternalAPI = _ref.viewInternalAPI,
            viewExternalAPI = _ref.viewExternalAPI;
        // initial properties
        var initialProps = Object.assign({}, viewProps);

        // list of all active animations
        var animations = [];

        // setup animators
        forin(mixinConfig, function(property, animation) {
            var animator = createAnimator(animation);
            if (!animator) {
                return;
            }

            // when the animator updates, update the view state value
            animator.onupdate = function(value) {
                viewProps[property] = value;
            };

            // set animator target
            animator.target = initialProps[property];

            // when value is set, set the animator target value
            var prop = {
                key: property,
                setter: function setter(value) {
                    // if already at target, we done!
                    if (animator.target === value) {
                        return;
                    }

                    animator.target = value;
                },
                getter: function getter() {
                    return viewProps[property];
                },
            };

            // add getters and setters
            addGetSet([prop], [viewInternalAPI, viewExternalAPI], viewProps, true);

            // add it to the list for easy updating from the _write method
            animations.push(animator);
        });

        // expose internal write api
        return {
            write: function write(ts) {
                var skipToEndState = document.hidden;
                var resting = true;
                animations.forEach(function(animation) {
                    if (!animation.resting) resting = false;
                    animation.interpolate(ts, skipToEndState);
                });
                return resting;
            },
            destroy: function destroy() {},
        };
    };

    var addEvent = function addEvent(element) {
        return function(type, fn) {
            element.addEventListener(type, fn);
        };
    };

    var removeEvent = function removeEvent(element) {
        return function(type, fn) {
            element.removeEventListener(type, fn);
        };
    };

    // mixin
    var listeners = function listeners(_ref) {
        var mixinConfig = _ref.mixinConfig,
            viewProps = _ref.viewProps,
            viewInternalAPI = _ref.viewInternalAPI,
            viewExternalAPI = _ref.viewExternalAPI,
            viewState = _ref.viewState,
            view = _ref.view;
        var events = [];

        var add = addEvent(view.element);
        var remove = removeEvent(view.element);

        viewExternalAPI.on = function(type, fn) {
            events.push({
                type: type,
                fn: fn,
            });

            add(type, fn);
        };

        viewExternalAPI.off = function(type, fn) {
            events.splice(
                events.findIndex(function(event) {
                    return event.type === type && event.fn === fn;
                }),
                1
            );

            remove(type, fn);
        };

        return {
            write: function write() {
                // not busy
                return true;
            },
            destroy: function destroy() {
                events.forEach(function(event) {
                    remove(event.type, event.fn);
                });
            },
        };
    };

    // add to external api and link to props

    var apis = function apis(_ref) {
        var mixinConfig = _ref.mixinConfig,
            viewProps = _ref.viewProps,
            viewExternalAPI = _ref.viewExternalAPI;
        addGetSet(mixinConfig, viewExternalAPI, viewProps);
    };

    var isDefined = function isDefined(value) {
        return value != null;
    };

    // add to state,
    // add getters and setters to internal and external api (if not set)
    // set initial state based on props in viewProps
    // apply as transforms each frame

    var defaults = {
        opacity: 1,
        scaleX: 1,
        scaleY: 1,
        translateX: 0,
        translateY: 0,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        originX: 0,
        originY: 0,
    };

    var styles = function styles(_ref) {
        var mixinConfig = _ref.mixinConfig,
            viewProps = _ref.viewProps,
            viewInternalAPI = _ref.viewInternalAPI,
            viewExternalAPI = _ref.viewExternalAPI,
            view = _ref.view;
        // initial props
        var initialProps = Object.assign({}, viewProps);

        // current props
        var currentProps = {};

        // we will add those properties to the external API and link them to the viewState
        addGetSet(mixinConfig, [viewInternalAPI, viewExternalAPI], viewProps);

        // override rect on internal and external rect getter so it takes in account transforms
        var getOffset = function getOffset() {
            return [viewProps['translateX'] || 0, viewProps['translateY'] || 0];
        };

        var getScale = function getScale() {
            return [viewProps['scaleX'] || 0, viewProps['scaleY'] || 0];
        };
        var getRect = function getRect() {
            return view.rect
                ? getViewRect(view.rect, view.childViews, getOffset(), getScale())
                : null;
        };
        viewInternalAPI.rect = { get: getRect };
        viewExternalAPI.rect = { get: getRect };

        // apply view props
        mixinConfig.forEach(function(key) {
            viewProps[key] =
                typeof initialProps[key] === 'undefined' ? defaults[key] : initialProps[key];
        });

        // expose api
        return {
            write: function write() {
                // see if props have changed
                if (!propsHaveChanged(currentProps, viewProps)) {
                    return;
                }

                // moves element to correct position on screen
                applyStyles(view.element, viewProps);

                // store new transforms
                Object.assign(currentProps, Object.assign({}, viewProps));

                // no longer busy
                return true;
            },
            destroy: function destroy() {},
        };
    };

    var propsHaveChanged = function propsHaveChanged(currentProps, newProps) {
        // different amount of keys
        if (Object.keys(currentProps).length !== Object.keys(newProps).length) {
            return true;
        }

        // lets analyze the individual props
        for (var prop in newProps) {
            if (newProps[prop] !== currentProps[prop]) {
                return true;
            }
        }

        return false;
    };

    var applyStyles = function applyStyles(element, _ref2) {
        var opacity = _ref2.opacity,
            perspective = _ref2.perspective,
            translateX = _ref2.translateX,
            translateY = _ref2.translateY,
            scaleX = _ref2.scaleX,
            scaleY = _ref2.scaleY,
            rotateX = _ref2.rotateX,
            rotateY = _ref2.rotateY,
            rotateZ = _ref2.rotateZ,
            originX = _ref2.originX,
            originY = _ref2.originY,
            width = _ref2.width,
            height = _ref2.height;

        var transforms = '';
        var styles = '';

        // handle transform origin
        if (isDefined(originX) || isDefined(originY)) {
            styles += 'transform-origin: ' + (originX || 0) + 'px ' + (originY || 0) + 'px;';
        }

        // transform order is relevant
        // 0. perspective
        if (isDefined(perspective)) {
            transforms += 'perspective(' + perspective + 'px) ';
        }

        // 1. translate
        if (isDefined(translateX) || isDefined(translateY)) {
            transforms +=
                'translate3d(' + (translateX || 0) + 'px, ' + (translateY || 0) + 'px, 0) ';
        }

        // 2. scale
        if (isDefined(scaleX) || isDefined(scaleY)) {
            transforms +=
                'scale3d(' +
                (isDefined(scaleX) ? scaleX : 1) +
                ', ' +
                (isDefined(scaleY) ? scaleY : 1) +
                ', 1) ';
        }

        // 3. rotate
        if (isDefined(rotateZ)) {
            transforms += 'rotateZ(' + rotateZ + 'rad) ';
        }

        if (isDefined(rotateX)) {
            transforms += 'rotateX(' + rotateX + 'rad) ';
        }

        if (isDefined(rotateY)) {
            transforms += 'rotateY(' + rotateY + 'rad) ';
        }

        // add transforms
        if (transforms.length) {
            styles += 'transform:' + transforms + ';';
        }

        // add opacity
        if (isDefined(opacity)) {
            styles += 'opacity:' + opacity + ';';

            // if we reach zero, we make the element inaccessible
            if (opacity === 0) {
                styles += 'visibility:hidden;';
            }

            // if we're below 100% opacity this element can't be clicked
            if (opacity < 1) {
                styles += 'pointer-events:none;';
            }
        }

        // add height
        if (isDefined(height)) {
            styles += 'height:' + height + 'px;';
        }

        // add width
        if (isDefined(width)) {
            styles += 'width:' + width + 'px;';
        }

        // apply styles
        var elementCurrentStyle = element.elementCurrentStyle || '';

        // if new styles does not match current styles, lets update!
        if (styles.length !== elementCurrentStyle.length || styles !== elementCurrentStyle) {
            element.style.cssText = styles;
            // store current styles so we can compare them to new styles later on
            // _not_ getting the style value is faster
            element.elementCurrentStyle = styles;
        }
    };

    var Mixins = {
        styles: styles,
        listeners: listeners,
        animations: animations,
        apis: apis,
    };

    var updateRect = function updateRect() {
        var rect = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var element = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var style = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

        if (!element.layoutCalculated) {
            rect.paddingTop = parseInt(style.paddingTop, 10) || 0;
            rect.marginTop = parseInt(style.marginTop, 10) || 0;
            rect.marginRight = parseInt(style.marginRight, 10) || 0;
            rect.marginBottom = parseInt(style.marginBottom, 10) || 0;
            rect.marginLeft = parseInt(style.marginLeft, 10) || 0;
            element.layoutCalculated = true;
        }

        rect.left = element.offsetLeft || 0;
        rect.top = element.offsetTop || 0;
        rect.width = element.offsetWidth || 0;
        rect.height = element.offsetHeight || 0;

        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;

        rect.scrollTop = element.scrollTop;

        rect.hidden = element.offsetParent === null;

        return rect;
    };

    var createView =
        // default view definition
        function createView() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref$tag = _ref.tag,
                tag = _ref$tag === void 0 ? 'div' : _ref$tag,
                _ref$name = _ref.name,
                name = _ref$name === void 0 ? null : _ref$name,
                _ref$attributes = _ref.attributes,
                attributes = _ref$attributes === void 0 ? {} : _ref$attributes,
                _ref$read = _ref.read,
                read = _ref$read === void 0 ? function() {} : _ref$read,
                _ref$write = _ref.write,
                write = _ref$write === void 0 ? function() {} : _ref$write,
                _ref$create = _ref.create,
                create = _ref$create === void 0 ? function() {} : _ref$create,
                _ref$destroy = _ref.destroy,
                destroy = _ref$destroy === void 0 ? function() {} : _ref$destroy,
                _ref$filterFrameActio = _ref.filterFrameActionsForChild,
                filterFrameActionsForChild =
                    _ref$filterFrameActio === void 0
                        ? function(child, actions) {
                              return actions;
                          }
                        : _ref$filterFrameActio,
                _ref$didCreateView = _ref.didCreateView,
                didCreateView = _ref$didCreateView === void 0 ? function() {} : _ref$didCreateView,
                _ref$didWriteView = _ref.didWriteView,
                didWriteView = _ref$didWriteView === void 0 ? function() {} : _ref$didWriteView,
                _ref$ignoreRect = _ref.ignoreRect,
                ignoreRect = _ref$ignoreRect === void 0 ? false : _ref$ignoreRect,
                _ref$ignoreRectUpdate = _ref.ignoreRectUpdate,
                ignoreRectUpdate = _ref$ignoreRectUpdate === void 0 ? false : _ref$ignoreRectUpdate,
                _ref$mixins = _ref.mixins,
                mixins = _ref$mixins === void 0 ? [] : _ref$mixins;
            return function(
                // each view requires reference to store
                store
            ) {
                var props = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
                // root element should not be changed
                var element = createElement(tag, 'filepond--' + name, attributes);

                // style reference should also not be changed
                var style = window.getComputedStyle(element, null);

                // element rectangle
                var rect = updateRect();
                var frameRect = null;

                // rest state
                var isResting = false;

                // pretty self explanatory
                var childViews = [];

                // loaded mixins
                var activeMixins = [];

                // references to created children
                var ref = {};

                // state used for each instance
                var state = {};

                // list of writers that will be called to update this view
                var writers = [
                    write, // default writer
                ];

                var readers = [
                    read, // default reader
                ];

                var destroyers = [
                    destroy, // default destroy
                ];

                // core view methods
                var getElement = function getElement() {
                    return element;
                };
                var getChildViews = function getChildViews() {
                    return childViews.concat();
                };
                var getReference = function getReference() {
                    return ref;
                };
                var createChildView = function createChildView(store) {
                    return function(view, props) {
                        return view(store, props);
                    };
                };
                var getRect = function getRect() {
                    if (frameRect) {
                        return frameRect;
                    }
                    frameRect = getViewRect(rect, childViews, [0, 0], [1, 1]);
                    return frameRect;
                };
                var getStyle = function getStyle() {
                    return style;
                };

                /**
                 * Read data from DOM
                 * @private
                 */
                var _read = function _read() {
                    frameRect = null;

                    // read child views
                    childViews.forEach(function(child) {
                        return child._read();
                    });

                    var shouldUpdate = !(ignoreRectUpdate && rect.width && rect.height);
                    if (shouldUpdate) {
                        updateRect(rect, element, style);
                    }

                    // readers
                    var api = { root: internalAPI, props: props, rect: rect };
                    readers.forEach(function(reader) {
                        return reader(api);
                    });
                };

                /**
                 * Write data to DOM
                 * @private
                 */
                var _write = function _write(ts, frameActions, shouldOptimize) {
                    // if no actions, we assume that the view is resting
                    var resting = frameActions.length === 0;

                    // writers
                    writers.forEach(function(writer) {
                        var writerResting = writer({
                            props: props,
                            root: internalAPI,
                            actions: frameActions,
                            timestamp: ts,
                            shouldOptimize: shouldOptimize,
                        });

                        if (writerResting === false) {
                            resting = false;
                        }
                    });

                    // run mixins
                    activeMixins.forEach(function(mixin) {
                        // if one of the mixins is still busy after write operation, we are not resting
                        var mixinResting = mixin.write(ts);
                        if (mixinResting === false) {
                            resting = false;
                        }
                    });

                    // updates child views that are currently attached to the DOM
                    childViews
                        .filter(function(child) {
                            return !!child.element.parentNode;
                        })
                        .forEach(function(child) {
                            // if a child view is not resting, we are not resting
                            var childResting = child._write(
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
                        .forEach(function(child, index) {
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
                        props: props,
                        root: internalAPI,
                        actions: frameActions,
                        timestamp: ts,
                    });

                    // let parent know if we are resting
                    return resting;
                };

                var _destroy = function _destroy() {
                    activeMixins.forEach(function(mixin) {
                        return mixin.destroy();
                    });
                    destroyers.forEach(function(destroyer) {
                        destroyer({ root: internalAPI, props: props });
                    });
                    childViews.forEach(function(child) {
                        return child._destroy();
                    });
                };

                // sharedAPI
                var sharedAPIDefinition = {
                    element: {
                        get: getElement,
                    },

                    style: {
                        get: getStyle,
                    },

                    childViews: {
                        get: getChildViews,
                    },
                };

                // private API definition
                var internalAPIDefinition = Object.assign({}, sharedAPIDefinition, {
                    rect: {
                        get: getRect,
                    },

                    // access to custom children references
                    ref: {
                        get: getReference,
                    },

                    // dom modifiers
                    is: function is(needle) {
                        return name === needle;
                    },
                    appendChild: appendChild(element),
                    createChildView: createChildView(store),
                    linkView: function linkView(view) {
                        childViews.push(view);
                        return view;
                    },
                    unlinkView: function unlinkView(view) {
                        childViews.splice(childViews.indexOf(view), 1);
                    },
                    appendChildView: appendChildView(element, childViews),
                    removeChildView: removeChildView(element, childViews),
                    registerWriter: function registerWriter(writer) {
                        return writers.push(writer);
                    },
                    registerReader: function registerReader(reader) {
                        return readers.push(reader);
                    },
                    registerDestroyer: function registerDestroyer(destroyer) {
                        return destroyers.push(destroyer);
                    },
                    invalidateLayout: function invalidateLayout() {
                        return (element.layoutCalculated = false);
                    },

                    // access to data store
                    dispatch: store.dispatch,
                    query: store.query,
                });

                // public view API methods
                var externalAPIDefinition = {
                    element: {
                        get: getElement,
                    },

                    childViews: {
                        get: getChildViews,
                    },

                    rect: {
                        get: getRect,
                    },

                    resting: {
                        get: function get() {
                            return isResting;
                        },
                    },

                    isRectIgnored: function isRectIgnored() {
                        return ignoreRect;
                    },
                    _read: _read,
                    _write: _write,
                    _destroy: _destroy,
                };

                // mixin API methods
                var mixinAPIDefinition = Object.assign({}, sharedAPIDefinition, {
                    rect: {
                        get: function get() {
                            return rect;
                        },
                    },
                });

                // add mixin functionality
                Object.keys(mixins)
                    .sort(function(a, b) {
                        // move styles to the back of the mixin list (so adjustments of other mixins are applied to the props correctly)
                        if (a === 'styles') {
                            return 1;
                        } else if (b === 'styles') {
                            return -1;
                        }
                        return 0;
                    })
                    .forEach(function(key) {
                        var mixinAPI = Mixins[key]({
                            mixinConfig: mixins[key],
                            viewProps: props,
                            viewState: state,
                            viewInternalAPI: internalAPIDefinition,
                            viewExternalAPI: externalAPIDefinition,
                            view: createObject(mixinAPIDefinition),
                        });

                        if (mixinAPI) {
                            activeMixins.push(mixinAPI);
                        }
                    });

                // construct private api
                var internalAPI = createObject(internalAPIDefinition);

                // create the view
                create({
                    root: internalAPI,
                    props: props,
                });

                // append created child views to root node
                var childCount = getChildCount(element); // need to know the current child count so appending happens in correct order
                childViews.forEach(function(child, index) {
                    internalAPI.appendChild(child.element, childCount + index);
                });

                // call did create
                didCreateView(internalAPI);

                // expose public api
                return createObject(externalAPIDefinition);
            };
        };

    var createPainter = function createPainter(read, write) {
        var fps = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 60;

        var name = '__framePainter';

        // set global painter
        if (window[name]) {
            window[name].readers.push(read);
            window[name].writers.push(write);
            return;
        }

        window[name] = {
            readers: [read],
            writers: [write],
        };

        var painter = window[name];

        var interval = 1000 / fps;
        var last = null;
        var id = null;
        var requestTick = null;
        var cancelTick = null;

        var setTimerType = function setTimerType() {
            if (document.hidden) {
                requestTick = function requestTick() {
                    return window.setTimeout(function() {
                        return tick(performance.now());
                    }, interval);
                };
                cancelTick = function cancelTick() {
                    return window.clearTimeout(id);
                };
            } else {
                requestTick = function requestTick() {
                    return window.requestAnimationFrame(tick);
                };
                cancelTick = function cancelTick() {
                    return window.cancelAnimationFrame(id);
                };
            }
        };

        document.addEventListener('visibilitychange', function() {
            if (cancelTick) cancelTick();
            setTimerType();
            tick(performance.now());
        });

        var tick = function tick(ts) {
            // queue next tick
            id = requestTick(tick);

            // limit fps
            if (!last) {
                last = ts;
            }

            var delta = ts - last;

            if (delta <= interval) {
                // skip frame
                return;
            }

            // align next frame
            last = ts - (delta % interval);

            // update view
            painter.readers.forEach(function(read) {
                return read();
            });
            painter.writers.forEach(function(write) {
                return write(ts);
            });
        };

        setTimerType();
        tick(performance.now());

        return {
            pause: function pause() {
                cancelTick(id);
            },
        };
    };

    var createRoute = function createRoute(routes, fn) {
        return function(_ref) {
            var root = _ref.root,
                props = _ref.props,
                _ref$actions = _ref.actions,
                actions = _ref$actions === void 0 ? [] : _ref$actions,
                timestamp = _ref.timestamp,
                shouldOptimize = _ref.shouldOptimize;
            actions
                .filter(function(action) {
                    return routes[action.type];
                })
                .forEach(function(action) {
                    return routes[action.type]({
                        root: root,
                        props: props,
                        action: action.data,
                        timestamp: timestamp,
                        shouldOptimize: shouldOptimize,
                    });
                });

            if (fn) {
                fn({
                    root: root,
                    props: props,
                    actions: actions,
                    timestamp: timestamp,
                    shouldOptimize: shouldOptimize,
                });
            }
        };
    };

    var insertBefore = function insertBefore(newNode, referenceNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode);
    };

    var insertAfter = function insertAfter(newNode, referenceNode) {
        return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };

    var isArray = function isArray(value) {
        return Array.isArray(value);
    };

    var isEmpty = function isEmpty(value) {
        return value == null;
    };

    var trim = function trim(str) {
        return str.trim();
    };

    var toString = function toString(value) {
        return '' + value;
    };

    var toArray = function toArray(value) {
        var splitter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';
        if (isEmpty(value)) {
            return [];
        }
        if (isArray(value)) {
            return value;
        }
        return toString(value)
            .split(splitter)
            .map(trim)
            .filter(function(str) {
                return str.length;
            });
    };

    var isBoolean = function isBoolean(value) {
        return typeof value === 'boolean';
    };

    var toBoolean = function toBoolean(value) {
        return isBoolean(value) ? value : value === 'true';
    };

    var isString = function isString(value) {
        return typeof value === 'string';
    };

    var toNumber = function toNumber(value) {
        return isNumber(value)
            ? value
            : isString(value)
            ? toString(value).replace(/[a-z]+/gi, '')
            : 0;
    };

    var toInt = function toInt(value) {
        return parseInt(toNumber(value), 10);
    };

    var toFloat = function toFloat(value) {
        return parseFloat(toNumber(value));
    };

    var isInt = function isInt(value) {
        return isNumber(value) && isFinite(value) && Math.floor(value) === value;
    };

    var toBytes = function toBytes(value) {
        var base = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        // is in bytes
        if (isInt(value)) {
            return value;
        }

        // is natural file size
        var naturalFileSize = toString(value).trim();

        // if is value in megabytes
        if (/MB$/i.test(naturalFileSize)) {
            naturalFileSize = naturalFileSize.replace(/MB$i/, '').trim();
            return toInt(naturalFileSize) * base * base;
        }

        // if is value in kilobytes
        if (/KB/i.test(naturalFileSize)) {
            naturalFileSize = naturalFileSize.replace(/KB$i/, '').trim();
            return toInt(naturalFileSize) * base;
        }

        return toInt(naturalFileSize);
    };

    var isFunction = function isFunction(value) {
        return typeof value === 'function';
    };

    var toFunctionReference = function toFunctionReference(string) {
        var ref = self;
        var levels = string.split('.');
        var level = null;
        while ((level = levels.shift())) {
            ref = ref[level];
            if (!ref) {
                return null;
            }
        }
        return ref;
    };

    var methods = {
        process: 'POST',
        patch: 'PATCH',
        revert: 'DELETE',
        fetch: 'GET',
        restore: 'GET',
        load: 'GET',
    };

    var createServerAPI = function createServerAPI(outline) {
        var api = {};

        api.url = isString(outline) ? outline : outline.url || '';
        api.timeout = outline.timeout ? parseInt(outline.timeout, 10) : 0;
        api.headers = outline.headers ? outline.headers : {};

        forin(methods, function(key) {
            api[key] = createAction(key, outline[key], methods[key], api.timeout, api.headers);
        });

        // remove process if no url or process on outline
        api.process = outline.process || isString(outline) || outline.url ? api.process : null;

        // special treatment for remove
        api.remove = outline.remove || null;

        // remove generic headers from api object
        delete api.headers;

        return api;
    };

    var createAction = function createAction(name, outline, method, timeout, headers) {
        // is explicitely set to null so disable
        if (outline === null) {
            return null;
        }

        // if is custom function, done! Dev handles everything.
        if (typeof outline === 'function') {
            return outline;
        }

        // build action object
        var action = {
            url: method === 'GET' || method === 'PATCH' ? '?' + name + '=' : '',
            method: method,
            headers: headers,
            withCredentials: false,
            timeout: timeout,
            onload: null,
            ondata: null,
            onerror: null,
        };

        // is a single url
        if (isString(outline)) {
            action.url = outline;
            return action;
        }

        // overwrite
        Object.assign(action, outline);

        // see if should reformat headers;
        if (isString(action.headers)) {
            var parts = action.headers.split(/:(.+)/);
            action.headers = {
                header: parts[0],
                value: parts[1],
            };
        }

        // if is bool withCredentials
        action.withCredentials = toBoolean(action.withCredentials);

        return action;
    };

    var toServerAPI = function toServerAPI(value) {
        return createServerAPI(value);
    };

    var isNull = function isNull(value) {
        return value === null;
    };

    var isObject = function isObject(value) {
        return typeof value === 'object' && value !== null;
    };

    var isAPI = function isAPI(value) {
        return (
            isObject(value) &&
            isString(value.url) &&
            isObject(value.process) &&
            isObject(value.revert) &&
            isObject(value.restore) &&
            isObject(value.fetch)
        );
    };

    var getType = function getType(value) {
        if (isArray(value)) {
            return 'array';
        }

        if (isNull(value)) {
            return 'null';
        }

        if (isInt(value)) {
            return 'int';
        }

        if (/^[0-9]+ ?(?:GB|MB|KB)$/gi.test(value)) {
            return 'bytes';
        }

        if (isAPI(value)) {
            return 'api';
        }

        return typeof value;
    };

    var replaceSingleQuotes = function replaceSingleQuotes(str) {
        return str
            .replace(/{\s*'/g, '{"')
            .replace(/'\s*}/g, '"}')
            .replace(/'\s*:/g, '":')
            .replace(/:\s*'/g, ':"')
            .replace(/,\s*'/g, ',"')
            .replace(/'\s*,/g, '",');
    };

    var conversionTable = {
        array: toArray,
        boolean: toBoolean,
        int: function int(value) {
            return getType(value) === 'bytes' ? toBytes(value) : toInt(value);
        },
        number: toFloat,
        float: toFloat,
        bytes: toBytes,
        string: function string(value) {
            return isFunction(value) ? value : toString(value);
        },
        function: function _function(value) {
            return toFunctionReference(value);
        },
        serverapi: toServerAPI,
        object: function object(value) {
            try {
                return JSON.parse(replaceSingleQuotes(value));
            } catch (e) {
                return null;
            }
        },
    };

    var convertTo = function convertTo(value, type) {
        return conversionTable[type](value);
    };

    var getValueByType = function getValueByType(newValue, defaultValue, valueType) {
        // can always assign default value
        if (newValue === defaultValue) {
            return newValue;
        }

        // get the type of the new value
        var newValueType = getType(newValue);

        // is valid type?
        if (newValueType !== valueType) {
            // is string input, let's attempt to convert
            var convertedValue = convertTo(newValue, valueType);

            // what is the type now
            newValueType = getType(convertedValue);

            // no valid conversions found
            if (convertedValue === null) {
                throw 'Trying to assign value with incorrect type to "' +
                    option +
                    '", allowed type: "' +
                    valueType +
                    '"';
            } else {
                newValue = convertedValue;
            }
        }

        // assign new value
        return newValue;
    };

    var createOption = function createOption(defaultValue, valueType) {
        var currentValue = defaultValue;
        return {
            enumerable: true,
            get: function get() {
                return currentValue;
            },
            set: function set(newValue) {
                currentValue = getValueByType(newValue, defaultValue, valueType);
            },
        };
    };

    var createOptions = function createOptions(options) {
        var obj = {};
        forin(options, function(prop) {
            var optionDefinition = options[prop];
            obj[prop] = createOption(optionDefinition[0], optionDefinition[1]);
        });
        return createObject(obj);
    };

    var createInitialState = function createInitialState(options) {
        return {
            // model
            items: [],

            // timeout used for calling update items
            listUpdateTimeout: null,

            // timeout used for stacking metadata updates
            itemUpdateTimeout: null,

            // queue of items waiting to be processed
            processingQueue: [],

            // options
            options: createOptions(options),
        };
    };

    var fromCamels = function fromCamels(string) {
        var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';
        return string
            .split(/(?=[A-Z])/)
            .map(function(part) {
                return part.toLowerCase();
            })
            .join(separator);
    };

    var createOptionAPI = function createOptionAPI(store, options) {
        var obj = {};
        forin(options, function(key) {
            obj[key] = {
                get: function get() {
                    return store.getState().options[key];
                },
                set: function set(value) {
                    store.dispatch('SET_' + fromCamels(key, '_').toUpperCase(), {
                        value: value,
                    });
                },
            };
        });
        return obj;
    };

    var createOptionActions = function createOptionActions(options) {
        return function(dispatch, query, state) {
            var obj = {};
            forin(options, function(key) {
                var name = fromCamels(key, '_').toUpperCase();

                obj['SET_' + name] = function(action) {
                    try {
                        state.options[key] = action.value;
                    } catch (e) {} // nope, failed

                    // we successfully set the value of this option
                    dispatch('DID_SET_' + name, { value: state.options[key] });
                };
            });
            return obj;
        };
    };

    var createOptionQueries = function createOptionQueries(options) {
        return function(state) {
            var obj = {};
            forin(options, function(key) {
                obj['GET_' + fromCamels(key, '_').toUpperCase()] = function(action) {
                    return state.options[key];
                };
            });
            return obj;
        };
    };

    var InteractionMethod = {
        API: 1,
        DROP: 2,
        BROWSE: 3,
        PASTE: 4,
        NONE: 5,
    };

    var getUniqueId = function getUniqueId() {
        return Math.random()
            .toString(36)
            .substr(2, 9);
    };

    function _typeof(obj) {
        if (typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol') {
            _typeof = function(obj) {
                return typeof obj;
            };
        } else {
            _typeof = function(obj) {
                return obj &&
                    typeof Symbol === 'function' &&
                    obj.constructor === Symbol &&
                    obj !== Symbol.prototype
                    ? 'symbol'
                    : typeof obj;
            };
        }

        return _typeof(obj);
    }

    var REACT_ELEMENT_TYPE;

    function _jsx(type, props, key, children) {
        if (!REACT_ELEMENT_TYPE) {
            REACT_ELEMENT_TYPE =
                (typeof Symbol === 'function' && Symbol['for'] && Symbol['for']('react.element')) ||
                0xeac7;
        }

        var defaultProps = type && type.defaultProps;
        var childrenLength = arguments.length - 3;

        if (!props && childrenLength !== 0) {
            props = {
                children: void 0,
            };
        }

        if (props && defaultProps) {
            for (var propName in defaultProps) {
                if (props[propName] === void 0) {
                    props[propName] = defaultProps[propName];
                }
            }
        } else if (!props) {
            props = defaultProps || {};
        }

        if (childrenLength === 1) {
            props.children = children;
        } else if (childrenLength > 1) {
            var childArray = new Array(childrenLength);

            for (var i = 0; i < childrenLength; i++) {
                childArray[i] = arguments[i + 3];
            }

            props.children = childArray;
        }

        return {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key === undefined ? null : '' + key,
            ref: null,
            props: props,
            _owner: null,
        };
    }

    function _asyncIterator(iterable) {
        var method;

        if (typeof Symbol !== 'undefined') {
            if (Symbol.asyncIterator) {
                method = iterable[Symbol.asyncIterator];
                if (method != null) return method.call(iterable);
            }

            if (Symbol.iterator) {
                method = iterable[Symbol.iterator];
                if (method != null) return method.call(iterable);
            }
        }

        throw new TypeError('Object is not async iterable');
    }

    function _AwaitValue(value) {
        this.wrapped = value;
    }

    function _AsyncGenerator(gen) {
        var front, back;

        function send(key, arg) {
            return new Promise(function(resolve, reject) {
                var request = {
                    key: key,
                    arg: arg,
                    resolve: resolve,
                    reject: reject,
                    next: null,
                };

                if (back) {
                    back = back.next = request;
                } else {
                    front = back = request;
                    resume(key, arg);
                }
            });
        }

        function resume(key, arg) {
            try {
                var result = gen[key](arg);
                var value = result.value;
                var wrappedAwait = value instanceof _AwaitValue;
                Promise.resolve(wrappedAwait ? value.wrapped : value).then(
                    function(arg) {
                        if (wrappedAwait) {
                            resume('next', arg);
                            return;
                        }

                        settle(result.done ? 'return' : 'normal', arg);
                    },
                    function(err) {
                        resume('throw', err);
                    }
                );
            } catch (err) {
                settle('throw', err);
            }
        }

        function settle(type, value) {
            switch (type) {
                case 'return':
                    front.resolve({
                        value: value,
                        done: true,
                    });
                    break;

                case 'throw':
                    front.reject(value);
                    break;

                default:
                    front.resolve({
                        value: value,
                        done: false,
                    });
                    break;
            }

            front = front.next;

            if (front) {
                resume(front.key, front.arg);
            } else {
                back = null;
            }
        }

        this._invoke = send;

        if (typeof gen.return !== 'function') {
            this.return = undefined;
        }
    }

    if (typeof Symbol === 'function' && Symbol.asyncIterator) {
        _AsyncGenerator.prototype[Symbol.asyncIterator] = function() {
            return this;
        };
    }

    _AsyncGenerator.prototype.next = function(arg) {
        return this._invoke('next', arg);
    };

    _AsyncGenerator.prototype.throw = function(arg) {
        return this._invoke('throw', arg);
    };

    _AsyncGenerator.prototype.return = function(arg) {
        return this._invoke('return', arg);
    };

    function _wrapAsyncGenerator(fn) {
        return function() {
            return new _AsyncGenerator(fn.apply(this, arguments));
        };
    }

    function _awaitAsyncGenerator(value) {
        return new _AwaitValue(value);
    }

    function _asyncGeneratorDelegate(inner, awaitWrap) {
        var iter = {},
            waiting = false;

        function pump(key, value) {
            waiting = true;
            value = new Promise(function(resolve) {
                resolve(inner[key](value));
            });
            return {
                done: false,
                value: awaitWrap(value),
            };
        }

        if (typeof Symbol === 'function' && Symbol.iterator) {
            iter[Symbol.iterator] = function() {
                return this;
            };
        }

        iter.next = function(value) {
            if (waiting) {
                waiting = false;
                return value;
            }

            return pump('next', value);
        };

        if (typeof inner.throw === 'function') {
            iter.throw = function(value) {
                if (waiting) {
                    waiting = false;
                    throw value;
                }

                return pump('throw', value);
            };
        }

        if (typeof inner.return === 'function') {
            iter.return = function(value) {
                return pump('return', value);
            };
        }

        return iter;
    }

    function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
        try {
            var info = gen[key](arg);
            var value = info.value;
        } catch (error) {
            reject(error);
            return;
        }

        if (info.done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(_next, _throw);
        }
    }

    function _asyncToGenerator(fn) {
        return function() {
            var self = this,
                args = arguments;
            return new Promise(function(resolve, reject) {
                var gen = fn.apply(self, args);

                function _next(value) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value);
                }

                function _throw(err) {
                    asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err);
                }

                _next(undefined);
            });
        };
    }

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError('Cannot call a class as a function');
        }
    }

    function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ('value' in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function _defineEnumerableProperties(obj, descs) {
        for (var key in descs) {
            var desc = descs[key];
            desc.configurable = desc.enumerable = true;
            if ('value' in desc) desc.writable = true;
            Object.defineProperty(obj, key, desc);
        }

        if (Object.getOwnPropertySymbols) {
            var objectSymbols = Object.getOwnPropertySymbols(descs);

            for (var i = 0; i < objectSymbols.length; i++) {
                var sym = objectSymbols[i];
                var desc = descs[sym];
                desc.configurable = desc.enumerable = true;
                if ('value' in desc) desc.writable = true;
                Object.defineProperty(obj, sym, desc);
            }
        }

        return obj;
    }

    function _defaults(obj, defaults) {
        var keys = Object.getOwnPropertyNames(defaults);

        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var value = Object.getOwnPropertyDescriptor(defaults, key);

            if (value && value.configurable && obj[key] === undefined) {
                Object.defineProperty(obj, key, value);
            }
        }

        return obj;
    }

    function _defineProperty(obj, key, value) {
        if (key in obj) {
            Object.defineProperty(obj, key, {
                value: value,
                enumerable: true,
                configurable: true,
                writable: true,
            });
        } else {
            obj[key] = value;
        }

        return obj;
    }

    function _extends() {
        _extends =
            Object.assign ||
            function(target) {
                for (var i = 1; i < arguments.length; i++) {
                    var source = arguments[i];

                    for (var key in source) {
                        if (Object.prototype.hasOwnProperty.call(source, key)) {
                            target[key] = source[key];
                        }
                    }
                }

                return target;
            };

        return _extends.apply(this, arguments);
    }

    function _objectSpread(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};
            var ownKeys = Object.keys(source);

            if (typeof Object.getOwnPropertySymbols === 'function') {
                ownKeys = ownKeys.concat(
                    Object.getOwnPropertySymbols(source).filter(function(sym) {
                        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                    })
                );
            }

            ownKeys.forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        }

        return target;
    }

    function ownKeys(object, enumerableOnly) {
        var keys = Object.keys(object);

        if (Object.getOwnPropertySymbols) {
            var symbols = Object.getOwnPropertySymbols(object);
            if (enumerableOnly)
                symbols = symbols.filter(function(sym) {
                    return Object.getOwnPropertyDescriptor(object, sym).enumerable;
                });
            keys.push.apply(keys, symbols);
        }

        return keys;
    }

    function _objectSpread2(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i] != null ? arguments[i] : {};

            if (i % 2) {
                ownKeys(source, true).forEach(function(key) {
                    _defineProperty(target, key, source[key]);
                });
            } else if (Object.getOwnPropertyDescriptors) {
                Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
            } else {
                ownKeys(source).forEach(function(key) {
                    Object.defineProperty(
                        target,
                        key,
                        Object.getOwnPropertyDescriptor(source, key)
                    );
                });
            }
        }

        return target;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== 'function' && superClass !== null) {
            throw new TypeError('Super expression must either be null or a function');
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                writable: true,
                configurable: true,
            },
        });
        if (superClass) _setPrototypeOf(subClass, superClass);
    }

    function _inheritsLoose(subClass, superClass) {
        subClass.prototype = Object.create(superClass.prototype);
        subClass.prototype.constructor = subClass;
        subClass.__proto__ = superClass;
    }

    function _getPrototypeOf(o) {
        _getPrototypeOf = Object.setPrototypeOf
            ? Object.getPrototypeOf
            : function _getPrototypeOf(o) {
                  return o.__proto__ || Object.getPrototypeOf(o);
              };
        return _getPrototypeOf(o);
    }

    function _setPrototypeOf(o, p) {
        _setPrototypeOf =
            Object.setPrototypeOf ||
            function _setPrototypeOf(o, p) {
                o.__proto__ = p;
                return o;
            };

        return _setPrototypeOf(o, p);
    }

    function isNativeReflectConstruct() {
        if (typeof Reflect === 'undefined' || !Reflect.construct) return false;
        if (Reflect.construct.sham) return false;
        if (typeof Proxy === 'function') return true;

        try {
            Date.prototype.toString.call(Reflect.construct(Date, [], function() {}));
            return true;
        } catch (e) {
            return false;
        }
    }

    function _construct(Parent, args, Class) {
        if (isNativeReflectConstruct()) {
            _construct = Reflect.construct;
        } else {
            _construct = function _construct(Parent, args, Class) {
                var a = [null];
                a.push.apply(a, args);
                var Constructor = Function.bind.apply(Parent, a);
                var instance = new Constructor();
                if (Class) _setPrototypeOf(instance, Class.prototype);
                return instance;
            };
        }

        return _construct.apply(null, arguments);
    }

    function _isNativeFunction(fn) {
        return Function.toString.call(fn).indexOf('[native code]') !== -1;
    }

    function _wrapNativeSuper(Class) {
        var _cache = typeof Map === 'function' ? new Map() : undefined;

        _wrapNativeSuper = function _wrapNativeSuper(Class) {
            if (Class === null || !_isNativeFunction(Class)) return Class;

            if (typeof Class !== 'function') {
                throw new TypeError('Super expression must either be null or a function');
            }

            if (typeof _cache !== 'undefined') {
                if (_cache.has(Class)) return _cache.get(Class);

                _cache.set(Class, Wrapper);
            }

            function Wrapper() {
                return _construct(Class, arguments, _getPrototypeOf(this).constructor);
            }

            Wrapper.prototype = Object.create(Class.prototype, {
                constructor: {
                    value: Wrapper,
                    enumerable: false,
                    writable: true,
                    configurable: true,
                },
            });
            return _setPrototypeOf(Wrapper, Class);
        };

        return _wrapNativeSuper(Class);
    }

    function _instanceof(left, right) {
        if (right != null && typeof Symbol !== 'undefined' && right[Symbol.hasInstance]) {
            return !!right[Symbol.hasInstance](left);
        } else {
            return left instanceof right;
        }
    }

    function _interopRequireDefault(obj) {
        return obj && obj.__esModule
            ? obj
            : {
                  default: obj,
              };
    }

    function _interopRequireWildcard(obj) {
        if (obj && obj.__esModule) {
            return obj;
        } else {
            var newObj = {};

            if (obj != null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        var desc =
                            Object.defineProperty && Object.getOwnPropertyDescriptor
                                ? Object.getOwnPropertyDescriptor(obj, key)
                                : {};

                        if (desc.get || desc.set) {
                            Object.defineProperty(newObj, key, desc);
                        } else {
                            newObj[key] = obj[key];
                        }
                    }
                }
            }

            newObj.default = obj;
            return newObj;
        }
    }

    function _newArrowCheck(innerThis, boundThis) {
        if (innerThis !== boundThis) {
            throw new TypeError('Cannot instantiate an arrow function');
        }
    }

    function _objectDestructuringEmpty(obj) {
        if (obj == null) throw new TypeError('Cannot destructure undefined');
    }

    function _objectWithoutPropertiesLoose(source, excluded) {
        if (source == null) return {};
        var target = {};
        var sourceKeys = Object.keys(source);
        var key, i;

        for (i = 0; i < sourceKeys.length; i++) {
            key = sourceKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            target[key] = source[key];
        }

        return target;
    }

    function _objectWithoutProperties(source, excluded) {
        if (source == null) return {};

        var target = _objectWithoutPropertiesLoose(source, excluded);

        var key, i;

        if (Object.getOwnPropertySymbols) {
            var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

            for (i = 0; i < sourceSymbolKeys.length; i++) {
                key = sourceSymbolKeys[i];
                if (excluded.indexOf(key) >= 0) continue;
                if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
                target[key] = source[key];
            }
        }

        return target;
    }

    function _assertThisInitialized(self) {
        if (self === void 0) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return self;
    }

    function _possibleConstructorReturn(self, call) {
        if (call && (typeof call === 'object' || typeof call === 'function')) {
            return call;
        }

        return _assertThisInitialized(self);
    }

    function _superPropBase(object, property) {
        while (!Object.prototype.hasOwnProperty.call(object, property)) {
            object = _getPrototypeOf(object);
            if (object === null) break;
        }

        return object;
    }

    function _get(target, property, receiver) {
        if (typeof Reflect !== 'undefined' && Reflect.get) {
            _get = Reflect.get;
        } else {
            _get = function _get(target, property, receiver) {
                var base = _superPropBase(target, property);

                if (!base) return;
                var desc = Object.getOwnPropertyDescriptor(base, property);

                if (desc.get) {
                    return desc.get.call(receiver);
                }

                return desc.value;
            };
        }

        return _get(target, property, receiver || target);
    }

    function set(target, property, value, receiver) {
        if (typeof Reflect !== 'undefined' && Reflect.set) {
            set = Reflect.set;
        } else {
            set = function set(target, property, value, receiver) {
                var base = _superPropBase(target, property);

                var desc;

                if (base) {
                    desc = Object.getOwnPropertyDescriptor(base, property);

                    if (desc.set) {
                        desc.set.call(receiver, value);
                        return true;
                    } else if (!desc.writable) {
                        return false;
                    }
                }

                desc = Object.getOwnPropertyDescriptor(receiver, property);

                if (desc) {
                    if (!desc.writable) {
                        return false;
                    }

                    desc.value = value;
                    Object.defineProperty(receiver, property, desc);
                } else {
                    _defineProperty(receiver, property, value);
                }

                return true;
            };
        }

        return set(target, property, value, receiver);
    }

    function _set(target, property, value, receiver, isStrict) {
        var s = set(target, property, value, receiver || target);

        if (!s && isStrict) {
            throw new Error('failed to set property');
        }

        return value;
    }

    function _taggedTemplateLiteral(strings, raw) {
        if (!raw) {
            raw = strings.slice(0);
        }

        return Object.freeze(
            Object.defineProperties(strings, {
                raw: {
                    value: Object.freeze(raw),
                },
            })
        );
    }

    function _taggedTemplateLiteralLoose(strings, raw) {
        if (!raw) {
            raw = strings.slice(0);
        }

        strings.raw = raw;
        return strings;
    }

    function _temporalRef(val, name) {
        if (val === _temporalUndefined) {
            throw new ReferenceError(name + ' is not defined - temporal dead zone');
        } else {
            return val;
        }
    }

    function _readOnlyError(name) {
        throw new Error('"' + name + '" is read-only');
    }

    function _classNameTDZError(name) {
        throw new Error('Class "' + name + '" cannot be referenced in computed property keys.');
    }

    var _temporalUndefined = {};

    function _slicedToArray(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
    }

    function _slicedToArrayLoose(arr, i) {
        return _arrayWithHoles(arr) || _iterableToArrayLimitLoose(arr, i) || _nonIterableRest();
    }

    function _toArray(arr) {
        return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest();
    }

    function _toConsumableArray(arr) {
        return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
        if (Array.isArray(arr)) {
            for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

            return arr2;
        }
    }

    function _arrayWithHoles(arr) {
        if (Array.isArray(arr)) return arr;
    }

    function _iterableToArray(iter) {
        if (
            Symbol.iterator in Object(iter) ||
            Object.prototype.toString.call(iter) === '[object Arguments]'
        )
            return Array.from(iter);
    }

    function _iterableToArrayLimit(arr, i) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;

        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);

                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i['return'] != null) _i['return']();
            } finally {
                if (_d) throw _e;
            }
        }

        return _arr;
    }

    function _iterableToArrayLimitLoose(arr, i) {
        var _arr = [];

        for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done; ) {
            _arr.push(_step.value);

            if (i && _arr.length === i) break;
        }

        return _arr;
    }

    function _nonIterableSpread() {
        throw new TypeError('Invalid attempt to spread non-iterable instance');
    }

    function _nonIterableRest() {
        throw new TypeError('Invalid attempt to destructure non-iterable instance');
    }

    function _skipFirstGeneratorNext(fn) {
        return function() {
            var it = fn.apply(this, arguments);
            it.next();
            return it;
        };
    }

    function _toPrimitive(input, hint) {
        if (typeof input !== 'object' || input === null) return input;
        var prim = input[Symbol.toPrimitive];

        if (prim !== undefined) {
            var res = prim.call(input, hint || 'default');
            if (typeof res !== 'object') return res;
            throw new TypeError('@@toPrimitive must return a primitive value.');
        }

        return (hint === 'string' ? String : Number)(input);
    }

    function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, 'string');

        return typeof key === 'symbol' ? key : String(key);
    }

    function _initializerWarningHelper(descriptor, context) {
        throw new Error(
            'Decorating class property failed. Please ensure that ' +
                'proposal-class-properties is enabled and set to use loose mode. ' +
                'To use proposal-class-properties in spec mode with decorators, wait for ' +
                'the next major version of decorators in stage 2.'
        );
    }

    function _initializerDefineProperty(target, property, descriptor, context) {
        if (!descriptor) return;
        Object.defineProperty(target, property, {
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable,
            value: descriptor.initializer ? descriptor.initializer.call(context) : void 0,
        });
    }

    function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
        var desc = {};
        Object.keys(descriptor).forEach(function(key) {
            desc[key] = descriptor[key];
        });
        desc.enumerable = !!desc.enumerable;
        desc.configurable = !!desc.configurable;

        if ('value' in desc || desc.initializer) {
            desc.writable = true;
        }

        desc = decorators
            .slice()
            .reverse()
            .reduce(function(desc, decorator) {
                return decorator(target, property, desc) || desc;
            }, desc);

        if (context && desc.initializer !== void 0) {
            desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
            desc.initializer = undefined;
        }

        if (desc.initializer === void 0) {
            Object.defineProperty(target, property, desc);
            desc = null;
        }

        return desc;
    }

    var id = 0;

    function _classPrivateFieldLooseKey(name) {
        return '__private_' + id++ + '_' + name;
    }

    function _classPrivateFieldLooseBase(receiver, privateKey) {
        if (!Object.prototype.hasOwnProperty.call(receiver, privateKey)) {
            throw new TypeError('attempted to use private field on non-instance');
        }

        return receiver;
    }

    function _classPrivateFieldGet(receiver, privateMap) {
        var descriptor = privateMap.get(receiver);

        if (!descriptor) {
            throw new TypeError('attempted to get private field on non-instance');
        }

        if (descriptor.get) {
            return descriptor.get.call(receiver);
        }

        return descriptor.value;
    }

    function _classPrivateFieldSet(receiver, privateMap, value) {
        var descriptor = privateMap.get(receiver);

        if (!descriptor) {
            throw new TypeError('attempted to set private field on non-instance');
        }

        if (descriptor.set) {
            descriptor.set.call(receiver, value);
        } else {
            if (!descriptor.writable) {
                throw new TypeError('attempted to set read only private field');
            }

            descriptor.value = value;
        }

        return value;
    }

    function _classPrivateFieldDestructureSet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError('attempted to set private field on non-instance');
        }

        var descriptor = privateMap.get(receiver);

        if (descriptor.set) {
            if (!('__destrObj' in descriptor)) {
                descriptor.__destrObj = {
                    set value(v) {
                        descriptor.set.call(receiver, v);
                    },
                };
            }

            return descriptor.__destrObj;
        } else {
            if (!descriptor.writable) {
                throw new TypeError('attempted to set read only private field');
            }

            return descriptor;
        }
    }

    function _classStaticPrivateFieldSpecGet(receiver, classConstructor, descriptor) {
        if (receiver !== classConstructor) {
            throw new TypeError('Private static access of wrong provenance');
        }

        return descriptor.value;
    }

    function _classStaticPrivateFieldSpecSet(receiver, classConstructor, descriptor, value) {
        if (receiver !== classConstructor) {
            throw new TypeError('Private static access of wrong provenance');
        }

        if (!descriptor.writable) {
            throw new TypeError('attempted to set read only private field');
        }

        descriptor.value = value;
        return value;
    }

    function _classStaticPrivateMethodGet(receiver, classConstructor, method) {
        if (receiver !== classConstructor) {
            throw new TypeError('Private static access of wrong provenance');
        }

        return method;
    }

    function _classStaticPrivateMethodSet() {
        throw new TypeError('attempted to set read only static private field');
    }

    function _decorate(decorators, factory, superClass, mixins) {
        var api = _getDecoratorsApi();

        if (mixins) {
            for (var i = 0; i < mixins.length; i++) {
                api = mixins[i](api);
            }
        }

        var r = factory(function initialize(O) {
            api.initializeInstanceElements(O, decorated.elements);
        }, superClass);
        var decorated = api.decorateClass(
            _coalesceClassElements(r.d.map(_createElementDescriptor)),
            decorators
        );
        api.initializeClassElements(r.F, decorated.elements);
        return api.runClassFinishers(r.F, decorated.finishers);
    }

    function _getDecoratorsApi() {
        _getDecoratorsApi = function() {
            return api;
        };

        var api = {
            elementsDefinitionOrder: [['method'], ['field']],
            initializeInstanceElements: function(O, elements) {
                ['method', 'field'].forEach(function(kind) {
                    elements.forEach(function(element) {
                        if (element.kind === kind && element.placement === 'own') {
                            this.defineClassElement(O, element);
                        }
                    }, this);
                }, this);
            },
            initializeClassElements: function(F, elements) {
                var proto = F.prototype;
                ['method', 'field'].forEach(function(kind) {
                    elements.forEach(function(element) {
                        var placement = element.placement;

                        if (
                            element.kind === kind &&
                            (placement === 'static' || placement === 'prototype')
                        ) {
                            var receiver = placement === 'static' ? F : proto;
                            this.defineClassElement(receiver, element);
                        }
                    }, this);
                }, this);
            },
            defineClassElement: function(receiver, element) {
                var descriptor = element.descriptor;

                if (element.kind === 'field') {
                    var initializer = element.initializer;
                    descriptor = {
                        enumerable: descriptor.enumerable,
                        writable: descriptor.writable,
                        configurable: descriptor.configurable,
                        value: initializer === void 0 ? void 0 : initializer.call(receiver),
                    };
                }

                Object.defineProperty(receiver, element.key, descriptor);
            },
            decorateClass: function(elements, decorators) {
                var newElements = [];
                var finishers = [];
                var placements = {
                    static: [],
                    prototype: [],
                    own: [],
                };
                elements.forEach(function(element) {
                    this.addElementPlacement(element, placements);
                }, this);
                elements.forEach(function(element) {
                    if (!_hasDecorators(element)) return newElements.push(element);
                    var elementFinishersExtras = this.decorateElement(element, placements);
                    newElements.push(elementFinishersExtras.element);
                    newElements.push.apply(newElements, elementFinishersExtras.extras);
                    finishers.push.apply(finishers, elementFinishersExtras.finishers);
                }, this);

                if (!decorators) {
                    return {
                        elements: newElements,
                        finishers: finishers,
                    };
                }

                var result = this.decorateConstructor(newElements, decorators);
                finishers.push.apply(finishers, result.finishers);
                result.finishers = finishers;
                return result;
            },
            addElementPlacement: function(element, placements, silent) {
                var keys = placements[element.placement];

                if (!silent && keys.indexOf(element.key) !== -1) {
                    throw new TypeError('Duplicated element (' + element.key + ')');
                }

                keys.push(element.key);
            },
            decorateElement: function(element, placements) {
                var extras = [];
                var finishers = [];

                for (var decorators = element.decorators, i = decorators.length - 1; i >= 0; i--) {
                    var keys = placements[element.placement];
                    keys.splice(keys.indexOf(element.key), 1);
                    var elementObject = this.fromElementDescriptor(element);
                    var elementFinisherExtras = this.toElementFinisherExtras(
                        (0, decorators[i])(elementObject) || elementObject
                    );
                    element = elementFinisherExtras.element;
                    this.addElementPlacement(element, placements);

                    if (elementFinisherExtras.finisher) {
                        finishers.push(elementFinisherExtras.finisher);
                    }

                    var newExtras = elementFinisherExtras.extras;

                    if (newExtras) {
                        for (var j = 0; j < newExtras.length; j++) {
                            this.addElementPlacement(newExtras[j], placements);
                        }

                        extras.push.apply(extras, newExtras);
                    }
                }

                return {
                    element: element,
                    finishers: finishers,
                    extras: extras,
                };
            },
            decorateConstructor: function(elements, decorators) {
                var finishers = [];

                for (var i = decorators.length - 1; i >= 0; i--) {
                    var obj = this.fromClassDescriptor(elements);
                    var elementsAndFinisher = this.toClassDescriptor(
                        (0, decorators[i])(obj) || obj
                    );

                    if (elementsAndFinisher.finisher !== undefined) {
                        finishers.push(elementsAndFinisher.finisher);
                    }

                    if (elementsAndFinisher.elements !== undefined) {
                        elements = elementsAndFinisher.elements;

                        for (var j = 0; j < elements.length - 1; j++) {
                            for (var k = j + 1; k < elements.length; k++) {
                                if (
                                    elements[j].key === elements[k].key &&
                                    elements[j].placement === elements[k].placement
                                ) {
                                    throw new TypeError(
                                        'Duplicated element (' + elements[j].key + ')'
                                    );
                                }
                            }
                        }
                    }
                }

                return {
                    elements: elements,
                    finishers: finishers,
                };
            },
            fromElementDescriptor: function(element) {
                var obj = {
                    kind: element.kind,
                    key: element.key,
                    placement: element.placement,
                    descriptor: element.descriptor,
                };
                var desc = {
                    value: 'Descriptor',
                    configurable: true,
                };
                Object.defineProperty(obj, Symbol.toStringTag, desc);
                if (element.kind === 'field') obj.initializer = element.initializer;
                return obj;
            },
            toElementDescriptors: function(elementObjects) {
                if (elementObjects === undefined) return;
                return _toArray(elementObjects).map(function(elementObject) {
                    var element = this.toElementDescriptor(elementObject);
                    this.disallowProperty(elementObject, 'finisher', 'An element descriptor');
                    this.disallowProperty(elementObject, 'extras', 'An element descriptor');
                    return element;
                }, this);
            },
            toElementDescriptor: function(elementObject) {
                var kind = String(elementObject.kind);

                if (kind !== 'method' && kind !== 'field') {
                    throw new TypeError(
                        'An element descriptor\'s .kind property must be either "method" or' +
                            ' "field", but a decorator created an element descriptor with' +
                            ' .kind "' +
                            kind +
                            '"'
                    );
                }

                var key = _toPropertyKey(elementObject.key);

                var placement = String(elementObject.placement);

                if (placement !== 'static' && placement !== 'prototype' && placement !== 'own') {
                    throw new TypeError(
                        'An element descriptor\'s .placement property must be one of "static",' +
                            ' "prototype" or "own", but a decorator created an element descriptor' +
                            ' with .placement "' +
                            placement +
                            '"'
                    );
                }

                var descriptor = elementObject.descriptor;
                this.disallowProperty(elementObject, 'elements', 'An element descriptor');
                var element = {
                    kind: kind,
                    key: key,
                    placement: placement,
                    descriptor: Object.assign({}, descriptor),
                };

                if (kind !== 'field') {
                    this.disallowProperty(elementObject, 'initializer', 'A method descriptor');
                } else {
                    this.disallowProperty(
                        descriptor,
                        'get',
                        'The property descriptor of a field descriptor'
                    );
                    this.disallowProperty(
                        descriptor,
                        'set',
                        'The property descriptor of a field descriptor'
                    );
                    this.disallowProperty(
                        descriptor,
                        'value',
                        'The property descriptor of a field descriptor'
                    );
                    element.initializer = elementObject.initializer;
                }

                return element;
            },
            toElementFinisherExtras: function(elementObject) {
                var element = this.toElementDescriptor(elementObject);

                var finisher = _optionalCallableProperty(elementObject, 'finisher');

                var extras = this.toElementDescriptors(elementObject.extras);
                return {
                    element: element,
                    finisher: finisher,
                    extras: extras,
                };
            },
            fromClassDescriptor: function(elements) {
                var obj = {
                    kind: 'class',
                    elements: elements.map(this.fromElementDescriptor, this),
                };
                var desc = {
                    value: 'Descriptor',
                    configurable: true,
                };
                Object.defineProperty(obj, Symbol.toStringTag, desc);
                return obj;
            },
            toClassDescriptor: function(obj) {
                var kind = String(obj.kind);

                if (kind !== 'class') {
                    throw new TypeError(
                        'A class descriptor\'s .kind property must be "class", but a decorator' +
                            ' created a class descriptor with .kind "' +
                            kind +
                            '"'
                    );
                }

                this.disallowProperty(obj, 'key', 'A class descriptor');
                this.disallowProperty(obj, 'placement', 'A class descriptor');
                this.disallowProperty(obj, 'descriptor', 'A class descriptor');
                this.disallowProperty(obj, 'initializer', 'A class descriptor');
                this.disallowProperty(obj, 'extras', 'A class descriptor');

                var finisher = _optionalCallableProperty(obj, 'finisher');

                var elements = this.toElementDescriptors(obj.elements);
                return {
                    elements: elements,
                    finisher: finisher,
                };
            },
            runClassFinishers: function(constructor, finishers) {
                for (var i = 0; i < finishers.length; i++) {
                    var newConstructor = (0, finishers[i])(constructor);

                    if (newConstructor !== undefined) {
                        if (typeof newConstructor !== 'function') {
                            throw new TypeError('Finishers must return a constructor.');
                        }

                        constructor = newConstructor;
                    }
                }

                return constructor;
            },
            disallowProperty: function(obj, name, objectType) {
                if (obj[name] !== undefined) {
                    throw new TypeError(objectType + " can't have a ." + name + ' property.');
                }
            },
        };
        return api;
    }

    function _createElementDescriptor(def) {
        var key = _toPropertyKey(def.key);

        var descriptor;

        if (def.kind === 'method') {
            descriptor = {
                value: def.value,
                writable: true,
                configurable: true,
                enumerable: false,
            };
        } else if (def.kind === 'get') {
            descriptor = {
                get: def.value,
                configurable: true,
                enumerable: false,
            };
        } else if (def.kind === 'set') {
            descriptor = {
                set: def.value,
                configurable: true,
                enumerable: false,
            };
        } else if (def.kind === 'field') {
            descriptor = {
                configurable: true,
                writable: true,
                enumerable: true,
            };
        }

        var element = {
            kind: def.kind === 'field' ? 'field' : 'method',
            key: key,
            placement: def.static ? 'static' : def.kind === 'field' ? 'own' : 'prototype',
            descriptor: descriptor,
        };
        if (def.decorators) element.decorators = def.decorators;
        if (def.kind === 'field') element.initializer = def.value;
        return element;
    }

    function _coalesceGetterSetter(element, other) {
        if (element.descriptor.get !== undefined) {
            other.descriptor.get = element.descriptor.get;
        } else {
            other.descriptor.set = element.descriptor.set;
        }
    }

    function _coalesceClassElements(elements) {
        var newElements = [];

        var isSameElement = function(other) {
            return (
                other.kind === 'method' &&
                other.key === element.key &&
                other.placement === element.placement
            );
        };

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            var other;

            if (element.kind === 'method' && (other = newElements.find(isSameElement))) {
                if (_isDataDescriptor(element.descriptor) || _isDataDescriptor(other.descriptor)) {
                    if (_hasDecorators(element) || _hasDecorators(other)) {
                        throw new ReferenceError(
                            'Duplicated methods (' + element.key + ") can't be decorated."
                        );
                    }

                    other.descriptor = element.descriptor;
                } else {
                    if (_hasDecorators(element)) {
                        if (_hasDecorators(other)) {
                            throw new ReferenceError(
                                "Decorators can't be placed on different accessors with for " +
                                    'the same property (' +
                                    element.key +
                                    ').'
                            );
                        }

                        other.decorators = element.decorators;
                    }

                    _coalesceGetterSetter(element, other);
                }
            } else {
                newElements.push(element);
            }
        }

        return newElements;
    }

    function _hasDecorators(element) {
        return element.decorators && element.decorators.length;
    }

    function _isDataDescriptor(desc) {
        return desc !== undefined && !(desc.value === undefined && desc.writable === undefined);
    }

    function _optionalCallableProperty(obj, name) {
        var value = obj[name];

        if (value !== undefined && typeof value !== 'function') {
            throw new TypeError("Expected '" + name + "' to be a function");
        }

        return value;
    }

    function _classPrivateMethodGet(receiver, privateSet, fn) {
        if (!privateSet.has(receiver)) {
            throw new TypeError('attempted to get private field on non-instance');
        }

        return fn;
    }

    function _classPrivateMethodSet() {
        throw new TypeError('attempted to reassign private method');
    }

    function _wrapRegExp(re, groups) {
        _wrapRegExp = function(re, groups) {
            return new BabelRegExp(re, groups);
        };

        var _RegExp = _wrapNativeSuper(RegExp);

        var _super = RegExp.prototype;

        var _groups = new WeakMap();

        function BabelRegExp(re, groups) {
            var _this = _RegExp.call(this, re);

            _groups.set(_this, groups);

            return _this;
        }

        _inherits(BabelRegExp, _RegExp);

        BabelRegExp.prototype.exec = function(str) {
            var result = _super.exec.call(this, str);

            if (result) result.groups = buildGroups(result, this);
            return result;
        };

        BabelRegExp.prototype[Symbol.replace] = function(str, substitution) {
            if (typeof substitution === 'string') {
                var groups = _groups.get(this);

                return _super[Symbol.replace].call(
                    this,
                    str,
                    substitution.replace(/\$<([^>]+)>/g, function(_, name) {
                        return '$' + groups[name];
                    })
                );
            } else if (typeof substitution === 'function') {
                var _this = this;

                return _super[Symbol.replace].call(this, str, function() {
                    var args = [];
                    args.push.apply(args, arguments);

                    if (typeof args[args.length - 1] !== 'object') {
                        args.push(buildGroups(args, _this));
                    }

                    return substitution.apply(this, args);
                });
            } else {
                return _super[Symbol.replace].call(this, str, substitution);
            }
        };

        function buildGroups(result, re) {
            var g = _groups.get(re);

            return Object.keys(g).reduce(function(groups, name) {
                groups[name] = result[g[name]];
                return groups;
            }, Object.create(null));
        }

        return _wrapRegExp.apply(this, arguments);
    }

    var arrayRemove = function arrayRemove(arr, index) {
        return arr.splice(index, 1);
    };

    var run = function run(cb, sync) {
        if (sync) {
            cb();
        } else if (document.hidden) {
            Promise.resolve(1).then(cb);
        } else {
            setTimeout(cb, 0);
        }
    };

    var on = function on() {
        var listeners = [];
        var off = function off(event, cb) {
            arrayRemove(
                listeners,
                listeners.findIndex(function(listener) {
                    return listener.event === event && (listener.cb === cb || !cb);
                })
            );
        };
        var _fire = function fire(event, args, sync) {
            listeners
                .filter(function(listener) {
                    return listener.event === event;
                })
                .map(function(listener) {
                    return listener.cb;
                })
                .forEach(function(cb) {
                    return run(function() {
                        return cb.apply(void 0, _toConsumableArray(args));
                    }, sync);
                });
        };
        return {
            fireSync: function fireSync(event) {
                for (
                    var _len = arguments.length,
                        args = new Array(_len > 1 ? _len - 1 : 0),
                        _key = 1;
                    _key < _len;
                    _key++
                ) {
                    args[_key - 1] = arguments[_key];
                }
                _fire(event, args, true);
            },
            fire: function fire(event) {
                for (
                    var _len2 = arguments.length,
                        args = new Array(_len2 > 1 ? _len2 - 1 : 0),
                        _key2 = 1;
                    _key2 < _len2;
                    _key2++
                ) {
                    args[_key2 - 1] = arguments[_key2];
                }
                _fire(event, args, false);
            },
            on: function on(event, cb) {
                listeners.push({ event: event, cb: cb });
            },
            onOnce: function onOnce(event, _cb) {
                listeners.push({
                    event: event,
                    cb: function cb() {
                        off(event, _cb);
                        _cb.apply(void 0, arguments);
                    },
                });
            },
            off: off,
        };
    };

    var copyObjectPropertiesToObject = function copyObjectPropertiesToObject(
        src,
        target,
        excluded
    ) {
        Object.getOwnPropertyNames(src)
            .filter(function(property) {
                return !excluded.includes(property);
            })
            .forEach(function(key) {
                return Object.defineProperty(
                    target,
                    key,
                    Object.getOwnPropertyDescriptor(src, key)
                );
            });
    };

    var PRIVATE = [
        'fire',
        'process',
        'revert',
        'load',
        'on',
        'off',
        'onOnce',
        'retryLoad',
        'extend',
        'archive',
        'archived',
        'release',
        'released',
        'requestProcessing',
        'freeze',
    ];

    var createItemAPI = function createItemAPI(item) {
        var api = {};
        copyObjectPropertiesToObject(item, api, PRIVATE);
        return api;
    };

    var removeReleasedItems = function removeReleasedItems(items) {
        items.forEach(function(item, index) {
            if (item.released) {
                arrayRemove(items, index);
            }
        });
    };

    var ItemStatus = {
        INIT: 1,
        IDLE: 2,
        PROCESSING_QUEUED: 9,
        PROCESSING: 3,
        PROCESSING_COMPLETE: 5,
        PROCESSING_ERROR: 6,
        PROCESSING_REVERT_ERROR: 10,
        LOADING: 7,
        LOAD_ERROR: 8,
    };

    var FileOrigin = {
        INPUT: 1,
        LIMBO: 2,
        LOCAL: 3,
    };

    var getNonNumeric = function getNonNumeric(str) {
        return /[^0-9]+/.exec(str);
    };

    var getDecimalSeparator = function getDecimalSeparator() {
        return getNonNumeric((1.1).toLocaleString())[0];
    };

    var getThousandsSeparator = function getThousandsSeparator() {
        // Added for browsers that do not return the thousands separator (happend on native browser Android 4.4.4)
        // We check against the normal toString output and if they're the same return a comma when decimal separator is a dot
        var decimalSeparator = getDecimalSeparator();
        var thousandsStringWithSeparator = (1000.0).toLocaleString();
        var thousandsStringWithoutSeparator = (1000.0).toString();
        if (thousandsStringWithSeparator !== thousandsStringWithoutSeparator) {
            return getNonNumeric(thousandsStringWithSeparator)[0];
        }
        return decimalSeparator === '.' ? ',' : '.';
    };

    var Type = {
        BOOLEAN: 'boolean',
        INT: 'int',
        NUMBER: 'number',
        STRING: 'string',
        ARRAY: 'array',
        OBJECT: 'object',
        FUNCTION: 'function',
        ACTION: 'action',
        SERVER_API: 'serverapi',
        REGEX: 'regex',
    };

    // all registered filters
    var filters = [];

    // loops over matching filters and passes options to each filter, returning the mapped results
    var applyFilterChain = function applyFilterChain(key, value, utils) {
        return new Promise(function(resolve, reject) {
            // find matching filters for this key
            var matchingFilters = filters
                .filter(function(f) {
                    return f.key === key;
                })
                .map(function(f) {
                    return f.cb;
                });

            // resolve now
            if (matchingFilters.length === 0) {
                resolve(value);
                return;
            }

            // first filter to kick things of
            var initialFilter = matchingFilters.shift();

            // chain filters
            matchingFilters
                .reduce(
                    // loop over promises passing value to next promise
                    function(current, next) {
                        return current.then(function(value) {
                            return next(value, utils);
                        });
                    },

                    // call initial filter, will return a promise
                    initialFilter(value, utils)

                    // all executed
                )
                .then(function(value) {
                    return resolve(value);
                })
                .catch(function(error) {
                    return reject(error);
                });
        });
    };

    var applyFilters = function applyFilters(key, value, utils) {
        return filters
            .filter(function(f) {
                return f.key === key;
            })
            .map(function(f) {
                return f.cb(value, utils);
            });
    };

    // adds a new filter to the list
    var addFilter = function addFilter(key, cb) {
        return filters.push({ key: key, cb: cb });
    };

    var extendDefaultOptions = function extendDefaultOptions(additionalOptions) {
        return Object.assign(defaultOptions, additionalOptions);
    };

    var getOptions = function getOptions() {
        return Object.assign({}, defaultOptions);
    };

    var setOptions = function setOptions(opts) {
        forin(opts, function(key, value) {
            // key does not exist, so this option cannot be set
            if (!defaultOptions[key]) {
                return;
            }
            defaultOptions[key][0] = getValueByType(
                value,
                defaultOptions[key][0],
                defaultOptions[key][1]
            );
        });
    };

    // default options on app
    var defaultOptions = {
        // the id to add to the root element
        id: [null, Type.STRING],

        // input field name to use
        name: ['filepond', Type.STRING],

        // disable the field
        disabled: [false, Type.BOOLEAN],

        // classname to put on wrapper
        className: [null, Type.STRING],

        // is the field required
        required: [false, Type.BOOLEAN],

        // Allow media capture when value is set
        captureMethod: [null, Type.STRING],
        // - "camera", "microphone" or "camcorder",
        // - Does not work with multiple on apple devices
        // - If set, acceptedFileTypes must be made to match with media wildcard "image/*", "audio/*" or "video/*"

        // sync `acceptedFileTypes` property with `accept` attribute
        allowSyncAcceptAttribute: [true, Type.BOOLEAN],

        // Feature toggles
        allowDrop: [true, Type.BOOLEAN], // Allow dropping of files
        allowBrowse: [true, Type.BOOLEAN], // Allow browsing the file system
        allowPaste: [true, Type.BOOLEAN], // Allow pasting files
        allowMultiple: [false, Type.BOOLEAN], // Allow multiple files (disabled by default, as multiple attribute is also required on input to allow multiple)
        allowReplace: [true, Type.BOOLEAN], // Allow dropping a file on other file to replace it (only works when multiple is set to false)
        allowRevert: [true, Type.BOOLEAN], // Allows user to revert file upload
        allowRemove: [true, Type.BOOLEAN], // Allow user to remove a file
        allowProcess: [true, Type.BOOLEAN], // Allows user to process a file, when set to false, this removes the file upload button
        allowReorder: [false, Type.BOOLEAN], // Allow reordering of files
        allowDirectoriesOnly: [false, Type.BOOLEAN], // Allow only selecting directories with browse (no support for filtering dnd at this point)

        // Try store file if `server` not set
        storeAsFile: [false, Type.BOOLEAN],

        // Revert mode
        forceRevert: [false, Type.BOOLEAN], // Set to 'force' to require the file to be reverted before removal

        // Input requirements
        maxFiles: [null, Type.INT], // Max number of files
        checkValidity: [false, Type.BOOLEAN], // Enables custom validity messages

        // Where to put file
        itemInsertLocationFreedom: [true, Type.BOOLEAN], // Set to false to always add items to begin or end of list
        itemInsertLocation: ['before', Type.STRING], // Default index in list to add items that have been dropped at the top of the list
        itemInsertInterval: [75, Type.INT],

        // Drag 'n Drop related
        dropOnPage: [false, Type.BOOLEAN], // Allow dropping of files anywhere on page (prevents browser from opening file if dropped outside of Up)
        dropOnElement: [true, Type.BOOLEAN], // Drop needs to happen on element (set to false to also load drops outside of Up)
        dropValidation: [false, Type.BOOLEAN], // Enable or disable validating files on drop
        ignoredFiles: [['.ds_store', 'thumbs.db', 'desktop.ini'], Type.ARRAY],

        // Upload related
        instantUpload: [true, Type.BOOLEAN], // Should upload files immediately on drop
        maxParallelUploads: [2, Type.INT], // Maximum files to upload in parallel
        allowMinimumUploadDuration: [true, Type.BOOLEAN], // if true uploads take at least 750 ms, this ensures the user sees the upload progress giving trust the upload actually happened

        // Chunks
        chunkUploads: [false, Type.BOOLEAN], // Enable chunked uploads
        chunkForce: [false, Type.BOOLEAN], // Force use of chunk uploads even for files smaller than chunk size
        chunkSize: [5000000, Type.INT], // Size of chunks (5MB default)
        chunkRetryDelays: [[500, 1000, 3000], Type.ARRAY], // Amount of times to retry upload of a chunk when it fails

        // The server api end points to use for uploading (see docs)
        server: [null, Type.SERVER_API],

        // File size calculations, can set to 1024, this is only used for display, properties use file size base 1000
        fileSizeBase: [1000, Type.INT],

        // Labels and status messages
        labelFileSizeBytes: ['bytes', Type.STRING],
        labelFileSizeKilobytes: ['KB', Type.STRING],
        labelFileSizeMegabytes: ['MB', Type.STRING],
        labelFileSizeGigabytes: ['GB', Type.STRING],

        labelDecimalSeparator: [getDecimalSeparator(), Type.STRING], // Default is locale separator
        labelThousandsSeparator: [getThousandsSeparator(), Type.STRING], // Default is locale separator

        labelIdle: [
            'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
            Type.STRING,
        ],

        labelInvalidField: ['Field contains invalid files', Type.STRING],
        labelFileWaitingForSize: ['Waiting for size', Type.STRING],
        labelFileSizeNotAvailable: ['Size not available', Type.STRING],
        labelFileCountSingular: ['file in list', Type.STRING],
        labelFileCountPlural: ['files in list', Type.STRING],
        labelFileLoading: ['Loading', Type.STRING],
        labelFileAdded: ['Added', Type.STRING], // assistive only
        labelFileLoadError: ['Error during load', Type.STRING],
        labelFileRemoved: ['Removed', Type.STRING], // assistive only
        labelFileRemoveError: ['Error during remove', Type.STRING],
        labelFileProcessing: ['Uploading', Type.STRING],
        labelFileProcessingComplete: ['Upload complete', Type.STRING],
        labelFileProcessingAborted: ['Upload cancelled', Type.STRING],
        labelFileProcessingError: ['Error during upload', Type.STRING],
        labelFileProcessingRevertError: ['Error during revert', Type.STRING],

        labelTapToCancel: ['tap to cancel', Type.STRING],
        labelTapToRetry: ['tap to retry', Type.STRING],
        labelTapToUndo: ['tap to undo', Type.STRING],

        labelButtonRemoveItem: ['Remove', Type.STRING],
        labelButtonAbortItemLoad: ['Abort', Type.STRING],
        labelButtonRetryItemLoad: ['Retry', Type.STRING],
        labelButtonAbortItemProcessing: ['Cancel', Type.STRING],
        labelButtonUndoItemProcessing: ['Undo', Type.STRING],
        labelButtonRetryItemProcessing: ['Retry', Type.STRING],
        labelButtonProcessItem: ['Upload', Type.STRING],

        // make sure width and height plus viewpox are even numbers so icons are nicely centered
        iconRemove: [
            '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M11.586 13l-2.293 2.293a1 1 0 0 0 1.414 1.414L13 14.414l2.293 2.293a1 1 0 0 0 1.414-1.414L14.414 13l2.293-2.293a1 1 0 0 0-1.414-1.414L13 11.586l-2.293-2.293a1 1 0 0 0-1.414 1.414L11.586 13z" fill="currentColor" fill-rule="nonzero"/></svg>',
            Type.STRING,
        ],

        iconProcess: [
            '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.414v3.585a1 1 0 0 1-2 0v-3.585l-1.293 1.293a1 1 0 0 1-1.414-1.415l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.415L14 10.414zM9 18a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2H9z" fill="currentColor" fill-rule="evenodd"/></svg>',
            Type.STRING,
        ],

        iconRetry: [
            '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M10.81 9.185l-.038.02A4.997 4.997 0 0 0 8 13.683a5 5 0 0 0 5 5 5 5 0 0 0 5-5 1 1 0 0 1 2 0A7 7 0 1 1 9.722 7.496l-.842-.21a.999.999 0 1 1 .484-1.94l3.23.806c.535.133.86.675.73 1.21l-.804 3.233a.997.997 0 0 1-1.21.73.997.997 0 0 1-.73-1.21l.23-.928v-.002z" fill="currentColor" fill-rule="nonzero"/></svg>',
            Type.STRING,
        ],

        iconUndo: [
            '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M9.185 10.81l.02-.038A4.997 4.997 0 0 1 13.683 8a5 5 0 0 1 5 5 5 5 0 0 1-5 5 1 1 0 0 0 0 2A7 7 0 1 0 7.496 9.722l-.21-.842a.999.999 0 1 0-1.94.484l.806 3.23c.133.535.675.86 1.21.73l3.233-.803a.997.997 0 0 0 .73-1.21.997.997 0 0 0-1.21-.73l-.928.23-.002-.001z" fill="currentColor" fill-rule="nonzero"/></svg>',
            Type.STRING,
        ],

        iconDone: [
            '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M18.293 9.293a1 1 0 0 1 1.414 1.414l-7.002 7a1 1 0 0 1-1.414 0l-3.998-4a1 1 0 1 1 1.414-1.414L12 15.586l6.294-6.293z" fill="currentColor" fill-rule="nonzero"/></svg>',
            Type.STRING,
        ],

        // event handlers
        oninit: [null, Type.FUNCTION],
        onwarning: [null, Type.FUNCTION],
        onerror: [null, Type.FUNCTION],
        onactivatefile: [null, Type.FUNCTION],
        oninitfile: [null, Type.FUNCTION],
        onaddfilestart: [null, Type.FUNCTION],
        onaddfileprogress: [null, Type.FUNCTION],
        onaddfile: [null, Type.FUNCTION],
        onprocessfilestart: [null, Type.FUNCTION],
        onprocessfileprogress: [null, Type.FUNCTION],
        onprocessfileabort: [null, Type.FUNCTION],
        onprocessfilerevert: [null, Type.FUNCTION],
        onprocessfile: [null, Type.FUNCTION],
        onprocessfiles: [null, Type.FUNCTION],
        onremovefile: [null, Type.FUNCTION],
        onpreparefile: [null, Type.FUNCTION],
        onupdatefiles: [null, Type.FUNCTION],
        onreorderfiles: [null, Type.FUNCTION],

        // hooks
        beforeDropFile: [null, Type.FUNCTION],
        beforeAddFile: [null, Type.FUNCTION],
        beforeRemoveFile: [null, Type.FUNCTION],
        beforePrepareFile: [null, Type.FUNCTION],

        // styles
        stylePanelLayout: [null, Type.STRING], // null 'integrated', 'compact', 'circle'
        stylePanelAspectRatio: [null, Type.STRING], // null or '3:2' or 1
        styleItemPanelAspectRatio: [null, Type.STRING],
        styleButtonRemoveItemPosition: ['left', Type.STRING],
        styleButtonProcessItemPosition: ['right', Type.STRING],
        styleLoadIndicatorPosition: ['right', Type.STRING],
        styleProgressIndicatorPosition: ['right', Type.STRING],
        styleButtonRemoveItemAlign: [false, Type.BOOLEAN],

        // custom initial files array
        files: [[], Type.ARRAY],

        // show support by displaying credits
        credits: [['https://pqina.nl/', 'Powered by PQINA'], Type.ARRAY],
    };

    var getItemByQuery = function getItemByQuery(items, query) {
        // just return first index
        if (isEmpty(query)) {
            return items[0] || null;
        }

        // query is index
        if (isInt(query)) {
            return items[query] || null;
        }

        // if query is item, get the id
        if (typeof query === 'object') {
            query = query.id;
        }

        // assume query is a string and return item by id
        return (
            items.find(function(item) {
                return item.id === query;
            }) || null
        );
    };

    var getNumericAspectRatioFromString = function getNumericAspectRatioFromString(aspectRatio) {
        if (isEmpty(aspectRatio)) {
            return aspectRatio;
        }
        if (/:/.test(aspectRatio)) {
            var parts = aspectRatio.split(':');
            return parts[1] / parts[0];
        }
        return parseFloat(aspectRatio);
    };

    var getActiveItems = function getActiveItems(items) {
        return items.filter(function(item) {
            return !item.archived;
        });
    };

    var Status = {
        EMPTY: 0,
        IDLE: 1, // waiting
        ERROR: 2, // a file is in error state
        BUSY: 3, // busy processing or loading
        READY: 4, // all files uploaded
    };

    var res = null;
    var canUpdateFileInput = function canUpdateFileInput() {
        if (res === null) {
            try {
                var dataTransfer = new DataTransfer();
                dataTransfer.items.add(new File(['hello world'], 'This_Works.txt'));
                var el = document.createElement('input');
                el.setAttribute('type', 'file');
                el.files = dataTransfer.files;
                res = el.files.length === 1;
            } catch (err) {
                res = false;
            }
        }
        return res;
    };

    var ITEM_ERROR = [
        ItemStatus.LOAD_ERROR,
        ItemStatus.PROCESSING_ERROR,
        ItemStatus.PROCESSING_REVERT_ERROR,
    ];

    var ITEM_BUSY = [
        ItemStatus.LOADING,
        ItemStatus.PROCESSING,
        ItemStatus.PROCESSING_QUEUED,
        ItemStatus.INIT,
    ];

    var ITEM_READY = [ItemStatus.PROCESSING_COMPLETE];

    var isItemInErrorState = function isItemInErrorState(item) {
        return ITEM_ERROR.includes(item.status);
    };
    var isItemInBusyState = function isItemInBusyState(item) {
        return ITEM_BUSY.includes(item.status);
    };
    var isItemInReadyState = function isItemInReadyState(item) {
        return ITEM_READY.includes(item.status);
    };

    var isAsync = function isAsync(state) {
        return (
            isObject(state.options.server) &&
            (isObject(state.options.server.process) || isFunction(state.options.server.process))
        );
    };

    var queries = function queries(state) {
        return {
            GET_STATUS: function GET_STATUS() {
                var items = getActiveItems(state.items);
                var EMPTY = Status.EMPTY,
                    ERROR = Status.ERROR,
                    BUSY = Status.BUSY,
                    IDLE = Status.IDLE,
                    READY = Status.READY;

                if (items.length === 0) return EMPTY;

                if (items.some(isItemInErrorState)) return ERROR;

                if (items.some(isItemInBusyState)) return BUSY;

                if (items.some(isItemInReadyState)) return READY;

                return IDLE;
            },

            GET_ITEM: function GET_ITEM(query) {
                return getItemByQuery(state.items, query);
            },

            GET_ACTIVE_ITEM: function GET_ACTIVE_ITEM(query) {
                return getItemByQuery(getActiveItems(state.items), query);
            },

            GET_ACTIVE_ITEMS: function GET_ACTIVE_ITEMS() {
                return getActiveItems(state.items);
            },

            GET_ITEMS: function GET_ITEMS() {
                return state.items;
            },

            GET_ITEM_NAME: function GET_ITEM_NAME(query) {
                var item = getItemByQuery(state.items, query);
                return item ? item.filename : null;
            },

            GET_ITEM_SIZE: function GET_ITEM_SIZE(query) {
                var item = getItemByQuery(state.items, query);
                return item ? item.fileSize : null;
            },

            GET_STYLES: function GET_STYLES() {
                return Object.keys(state.options)
                    .filter(function(key) {
                        return /^style/.test(key);
                    })
                    .map(function(option) {
                        return {
                            name: option,
                            value: state.options[option],
                        };
                    });
            },

            GET_PANEL_ASPECT_RATIO: function GET_PANEL_ASPECT_RATIO() {
                var isShapeCircle = /circle/.test(state.options.stylePanelLayout);
                var aspectRatio = isShapeCircle
                    ? 1
                    : getNumericAspectRatioFromString(state.options.stylePanelAspectRatio);
                return aspectRatio;
            },

            GET_ITEM_PANEL_ASPECT_RATIO: function GET_ITEM_PANEL_ASPECT_RATIO() {
                return state.options.styleItemPanelAspectRatio;
            },

            GET_ITEMS_BY_STATUS: function GET_ITEMS_BY_STATUS(status) {
                return getActiveItems(state.items).filter(function(item) {
                    return item.status === status;
                });
            },

            GET_TOTAL_ITEMS: function GET_TOTAL_ITEMS() {
                return getActiveItems(state.items).length;
            },

            SHOULD_UPDATE_FILE_INPUT: function SHOULD_UPDATE_FILE_INPUT() {
                return state.options.storeAsFile && canUpdateFileInput() && !isAsync(state);
            },

            IS_ASYNC: function IS_ASYNC() {
                return isAsync(state);
            },

            GET_FILE_SIZE_LABELS: function GET_FILE_SIZE_LABELS(query) {
                return {
                    labelBytes: query('GET_LABEL_FILE_SIZE_BYTES') || undefined,
                    labelKilobytes: query('GET_LABEL_FILE_SIZE_KILOBYTES') || undefined,
                    labelMegabytes: query('GET_LABEL_FILE_SIZE_MEGABYTES') || undefined,
                    labelGigabytes: query('GET_LABEL_FILE_SIZE_GIGABYTES') || undefined,
                };
            },
        };
    };

    var hasRoomForItem = function hasRoomForItem(state) {
        var count = getActiveItems(state.items).length;

        // if cannot have multiple items, to add one item it should currently not contain items
        if (!state.options.allowMultiple) {
            return count === 0;
        }

        // if allows multiple items, we check if a max item count has been set, if not, there's no limit
        var maxFileCount = state.options.maxFiles;
        if (maxFileCount === null) {
            return true;
        }

        // we check if the current count is smaller than the max count, if so, another file can still be added
        if (count < maxFileCount) {
            return true;
        }

        // no more room for another file
        return false;
    };

    var limit = function limit(value, min, max) {
        return Math.max(Math.min(max, value), min);
    };

    var arrayInsert = function arrayInsert(arr, index, item) {
        return arr.splice(index, 0, item);
    };

    var insertItem = function insertItem(items, item, index) {
        if (isEmpty(item)) {
            return null;
        }

        // if index is undefined, append
        if (typeof index === 'undefined') {
            items.push(item);
            return item;
        }

        // limit the index to the size of the items array
        index = limit(index, 0, items.length);

        // add item to array
        arrayInsert(items, index, item);

        // expose
        return item;
    };

    var isBase64DataURI = function isBase64DataURI(str) {
        return /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i.test(
            str
        );
    };

    var getFilenameFromURL = function getFilenameFromURL(url) {
        return url
            .split('/')
            .pop()
            .split('?')
            .shift();
    };

    var getExtensionFromFilename = function getExtensionFromFilename(name) {
        return name.split('.').pop();
    };

    var guesstimateExtension = function guesstimateExtension(type) {
        // if no extension supplied, exit here
        if (typeof type !== 'string') {
            return '';
        }

        // get subtype
        var subtype = type.split('/').pop();

        // is svg subtype
        if (/svg/.test(subtype)) {
            return 'svg';
        }

        if (/zip|compressed/.test(subtype)) {
            return 'zip';
        }

        if (/plain/.test(subtype)) {
            return 'txt';
        }

        if (/msword/.test(subtype)) {
            return 'doc';
        }

        // if is valid subtype
        if (/[a-z]+/.test(subtype)) {
            // always use jpg extension
            if (subtype === 'jpeg') {
                return 'jpg';
            }

            // return subtype
            return subtype;
        }

        return '';
    };

    var leftPad = function leftPad(value) {
        var padding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
        return (padding + value).slice(-padding.length);
    };

    var getDateString = function getDateString() {
        var date = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();
        return (
            date.getFullYear() +
            '-' +
            leftPad(date.getMonth() + 1, '00') +
            '-' +
            leftPad(date.getDate(), '00') +
            '_' +
            leftPad(date.getHours(), '00') +
            '-' +
            leftPad(date.getMinutes(), '00') +
            '-' +
            leftPad(date.getSeconds(), '00')
        );
    };

    var getFileFromBlob = function getFileFromBlob(blob, filename) {
        var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        var extension = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
        var file =
            typeof type === 'string'
                ? blob.slice(0, blob.size, type)
                : blob.slice(0, blob.size, blob.type);
        file.lastModifiedDate = new Date();

        // copy relative path
        if (blob._relativePath) file._relativePath = blob._relativePath;

        // if blob has name property, use as filename if no filename supplied
        if (!isString(filename)) {
            filename = getDateString();
        }

        // if filename supplied but no extension and filename has extension
        if (filename && extension === null && getExtensionFromFilename(filename)) {
            file.name = filename;
        } else {
            extension = extension || guesstimateExtension(file.type);
            file.name = filename + (extension ? '.' + extension : '');
        }

        return file;
    };

    var getBlobBuilder = function getBlobBuilder() {
        return (window.BlobBuilder =
            window.BlobBuilder ||
            window.WebKitBlobBuilder ||
            window.MozBlobBuilder ||
            window.MSBlobBuilder);
    };

    var createBlob = function createBlob(arrayBuffer, mimeType) {
        var BB = getBlobBuilder();

        if (BB) {
            var bb = new BB();
            bb.append(arrayBuffer);
            return bb.getBlob(mimeType);
        }

        return new Blob([arrayBuffer], {
            type: mimeType,
        });
    };

    var getBlobFromByteStringWithMimeType = function getBlobFromByteStringWithMimeType(
        byteString,
        mimeType
    ) {
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);

        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }

        return createBlob(ab, mimeType);
    };

    var getMimeTypeFromBase64DataURI = function getMimeTypeFromBase64DataURI(dataURI) {
        return (/^data:(.+);/.exec(dataURI) || [])[1] || null;
    };

    var getBase64DataFromBase64DataURI = function getBase64DataFromBase64DataURI(dataURI) {
        // get data part of string (remove data:image/jpeg...,)
        var data = dataURI.split(',')[1];

        // remove any whitespace as that causes InvalidCharacterError in IE
        return data.replace(/\s/g, '');
    };

    var getByteStringFromBase64DataURI = function getByteStringFromBase64DataURI(dataURI) {
        return atob(getBase64DataFromBase64DataURI(dataURI));
    };

    var getBlobFromBase64DataURI = function getBlobFromBase64DataURI(dataURI) {
        var mimeType = getMimeTypeFromBase64DataURI(dataURI);
        var byteString = getByteStringFromBase64DataURI(dataURI);

        return getBlobFromByteStringWithMimeType(byteString, mimeType);
    };

    var getFileFromBase64DataURI = function getFileFromBase64DataURI(dataURI, filename, extension) {
        return getFileFromBlob(getBlobFromBase64DataURI(dataURI), filename, null, extension);
    };

    var getFileNameFromHeader = function getFileNameFromHeader(header) {
        // test if is content disposition header, if not exit
        if (!/^content-disposition:/i.test(header)) return null;

        // get filename parts
        var matches = header
            .split(/filename=|filename\*=.+''/)
            .splice(1)
            .map(function(name) {
                return name.trim().replace(/^["']|[;"']{0,2}$/g, '');
            })
            .filter(function(name) {
                return name.length;
            });

        return matches.length ? decodeURI(matches[matches.length - 1]) : null;
    };

    var getFileSizeFromHeader = function getFileSizeFromHeader(header) {
        if (/content-length:/i.test(header)) {
            var size = header.match(/[0-9]+/)[0];
            return size ? parseInt(size, 10) : null;
        }
        return null;
    };

    var getTranfserIdFromHeader = function getTranfserIdFromHeader(header) {
        if (/x-content-transfer-id:/i.test(header)) {
            var id = (header.split(':')[1] || '').trim();
            return id || null;
        }
        return null;
    };

    var getFileInfoFromHeaders = function getFileInfoFromHeaders(headers) {
        var info = {
            source: null,
            name: null,
            size: null,
        };

        var rows = headers.split('\n');
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;
        try {
            for (
                var _iterator = rows[Symbol.iterator](), _step;
                !(_iteratorNormalCompletion = (_step = _iterator.next()).done);
                _iteratorNormalCompletion = true
            ) {
                var header = _step.value;

                var name = getFileNameFromHeader(header);
                if (name) {
                    info.name = name;
                    continue;
                }

                var size = getFileSizeFromHeader(header);
                if (size) {
                    info.size = size;
                    continue;
                }

                var source = getTranfserIdFromHeader(header);
                if (source) {
                    info.source = source;
                    continue;
                }
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return != null) {
                    _iterator.return();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return info;
    };

    var createFileLoader = function createFileLoader(fetchFn) {
        var state = {
            source: null,
            complete: false,
            progress: 0,
            size: null,
            timestamp: null,
            duration: 0,
            request: null,
        };

        var getProgress = function getProgress() {
            return state.progress;
        };
        var abort = function abort() {
            if (state.request && state.request.abort) {
                state.request.abort();
            }
        };

        // load source
        var load = function load() {
            // get quick reference
            var source = state.source;

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
        var loadURL = function loadURL(url) {
            // is remote url and no fetch method supplied
            if (!fetchFn) {
                api.fire('error', {
                    type: 'error',
                    body: "Can't load URL",
                    code: 400,
                });

                return;
            }

            // set request start
            state.timestamp = Date.now();

            // load file
            state.request = fetchFn(
                url,
                function(response) {
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
                        response instanceof Blob ? response : response ? response.body : null
                    );
                },
                function(error) {
                    api.fire(
                        'error',
                        typeof error === 'string'
                            ? {
                                  type: 'error',
                                  code: 0,
                                  body: error,
                              }
                            : error
                    );
                },
                function(computable, current, total) {
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
                function() {
                    api.fire('abort');
                },
                function(response) {
                    var fileinfo = getFileInfoFromHeaders(
                        typeof response === 'string' ? response : response.headers
                    );
                    api.fire('meta', {
                        size: state.size || fileinfo.size,
                        filename: fileinfo.name,
                        source: fileinfo.source,
                    });
                }
            );
        };

        var api = Object.assign({}, on(), {
            setSource: function setSource(source) {
                return (state.source = source);
            },
            getProgress: getProgress, // file load progress
            abort: abort, // abort file load
            load: load, // start load
        });

        return api;
    };

    var isGet = function isGet(method) {
        return /GET|HEAD/.test(method);
    };

    var sendRequest = function sendRequest(data, url, options) {
        var api = {
            onheaders: function onheaders() {},
            onprogress: function onprogress() {},
            onload: function onload() {},
            ontimeout: function ontimeout() {},
            onerror: function onerror() {},
            onabort: function onabort() {},
            abort: function abort() {
                aborted = true;
                xhr.abort();
            },
        };

        // timeout identifier, only used when timeout is defined
        var aborted = false;
        var headersReceived = false;

        // set default options
        options = Object.assign(
            {
                method: 'POST',
                headers: {},
                withCredentials: false,
            },
            options
        );

        // encode url
        url = encodeURI(url);

        // if method is GET, add any received data to url

        if (isGet(options.method) && data) {
            url =
                '' +
                url +
                encodeURIComponent(typeof data === 'string' ? data : JSON.stringify(data));
        }

        // create request
        var xhr = new XMLHttpRequest();

        // progress of load
        var process = isGet(options.method) ? xhr : xhr.upload;
        process.onprogress = function(e) {
            // no progress event when aborted ( onprogress is called once after abort() )
            if (aborted) {
                return;
            }

            api.onprogress(e.lengthComputable, e.loaded, e.total);
        };

        // tries to get header info to the app as fast as possible
        xhr.onreadystatechange = function() {
            // not interesting in these states ('unsent' and 'openend' as they don't give us any additional info)
            if (xhr.readyState < 2) {
                return;
            }

            // no server response
            if (xhr.readyState === 4 && xhr.status === 0) {
                return;
            }

            if (headersReceived) {
                return;
            }

            headersReceived = true;

            // we've probably received some useful data in response headers
            api.onheaders(xhr);
        };

        // load successful
        xhr.onload = function() {
            // is classified as valid response
            if (xhr.status >= 200 && xhr.status < 300) {
                api.onload(xhr);
            } else {
                api.onerror(xhr);
            }
        };

        // error during load
        xhr.onerror = function() {
            return api.onerror(xhr);
        };

        // request aborted
        xhr.onabort = function() {
            aborted = true;
            api.onabort();
        };

        // request timeout
        xhr.ontimeout = function() {
            return api.ontimeout(xhr);
        };

        // open up open up!
        xhr.open(options.method, url, true);

        // set timeout if defined (do it after open so IE11 plays ball)
        if (isInt(options.timeout)) {
            xhr.timeout = options.timeout;
        }

        // add headers
        Object.keys(options.headers).forEach(function(key) {
            var value = unescape(encodeURIComponent(options.headers[key]));
            xhr.setRequestHeader(key, value);
        });

        // set type of response
        if (options.responseType) {
            xhr.responseType = options.responseType;
        }

        // set credentials
        if (options.withCredentials) {
            xhr.withCredentials = true;
        }

        // let's send our data
        xhr.send(data);

        return api;
    };

    var createResponse = function createResponse(type, code, body, headers) {
        return {
            type: type,
            code: code,
            body: body,
            headers: headers,
        };
    };

    var createTimeoutResponse = function createTimeoutResponse(cb) {
        return function(xhr) {
            cb(createResponse('error', 0, 'Timeout', xhr.getAllResponseHeaders()));
        };
    };

    var hasQS = function hasQS(str) {
        return /\?/.test(str);
    };
    var buildURL = function buildURL() {
        var url = '';
        for (var _len = arguments.length, parts = new Array(_len), _key = 0; _key < _len; _key++) {
            parts[_key] = arguments[_key];
        }
        parts.forEach(function(part) {
            url += hasQS(url) && hasQS(part) ? part.replace(/\?/, '&') : part;
        });
        return url;
    };

    var createFetchFunction = function createFetchFunction() {
        var apiUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var action = arguments.length > 1 ? arguments[1] : undefined;
        // custom handler (should also handle file, load, error, progress and abort)
        if (typeof action === 'function') {
            return action;
        }

        // no action supplied
        if (!action || !isString(action.url)) {
            return null;
        }

        // set onload hanlder
        var onload =
            action.onload ||
            function(res) {
                return res;
            };
        var onerror =
            action.onerror ||
            function(res) {
                return null;
            };

        // internal handler
        return function(url, load, error, progress, abort, headers) {
            // do local or remote request based on if the url is external
            var request = sendRequest(
                url,
                buildURL(apiUrl, action.url),
                Object.assign({}, action, {
                    responseType: 'blob',
                })
            );

            request.onload = function(xhr) {
                // get headers
                var headers = xhr.getAllResponseHeaders();

                // get filename
                var filename = getFileInfoFromHeaders(headers).name || getFilenameFromURL(url);

                // create response
                load(
                    createResponse(
                        'load',
                        xhr.status,
                        action.method === 'HEAD'
                            ? null
                            : getFileFromBlob(onload(xhr.response), filename),
                        headers
                    )
                );
            };

            request.onerror = function(xhr) {
                error(
                    createResponse(
                        'error',
                        xhr.status,
                        onerror(xhr.response) || xhr.statusText,
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.onheaders = function(xhr) {
                headers(createResponse('headers', xhr.status, null, xhr.getAllResponseHeaders()));
            };

            request.ontimeout = createTimeoutResponse(error);
            request.onprogress = progress;
            request.onabort = abort;

            // should return request
            return request;
        };
    };

    var ChunkStatus = {
        QUEUED: 0,
        COMPLETE: 1,
        PROCESSING: 2,
        ERROR: 3,
        WAITING: 4,
    };

    /*
                                                       function signature:
                                                         (file, metadata, load, error, progress, abort, transfer, options) => {
                                                           return {
                                                           abort:() => {}
                                                         }
                                                       }
                                                       */

    // apiUrl, action, name, file, metadata, load, error, progress, abort, transfer, options
    var processFileChunked = function processFileChunked(
        apiUrl,
        action,
        name,
        file,
        metadata,
        load,
        error,
        progress,
        abort,
        transfer,
        options
    ) {
        // all chunks
        var chunks = [];
        var chunkTransferId = options.chunkTransferId,
            chunkServer = options.chunkServer,
            chunkSize = options.chunkSize,
            chunkRetryDelays = options.chunkRetryDelays;

        // default state
        var state = {
            serverId: chunkTransferId,
            aborted: false,
        };

        // set onload handlers
        var ondata =
            action.ondata ||
            function(fd) {
                return fd;
            };
        var onload =
            action.onload ||
            function(xhr, method) {
                return method === 'HEAD' ? xhr.getResponseHeader('Upload-Offset') : xhr.response;
            };
        var onerror =
            action.onerror ||
            function(res) {
                return null;
            };

        // create server hook
        var requestTransferId = function requestTransferId(cb) {
            var formData = new FormData();

            // add metadata under same name
            if (isObject(metadata)) formData.append(name, JSON.stringify(metadata));

            var headers =
                typeof action.headers === 'function'
                    ? action.headers(file, metadata)
                    : Object.assign({}, action.headers, {
                          'Upload-Length': file.size,
                      });

            var requestParams = Object.assign({}, action, {
                headers: headers,
            });

            // send request object
            var request = sendRequest(
                ondata(formData),
                buildURL(apiUrl, action.url),
                requestParams
            );

            request.onload = function(xhr) {
                return cb(onload(xhr, requestParams.method));
            };

            request.onerror = function(xhr) {
                return error(
                    createResponse(
                        'error',
                        xhr.status,
                        onerror(xhr.response) || xhr.statusText,
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.ontimeout = createTimeoutResponse(error);
        };

        var requestTransferOffset = function requestTransferOffset(cb) {
            var requestUrl = buildURL(apiUrl, chunkServer.url, state.serverId);

            var headers =
                typeof action.headers === 'function'
                    ? action.headers(state.serverId)
                    : Object.assign({}, action.headers);

            var requestParams = {
                headers: headers,
                method: 'HEAD',
            };

            var request = sendRequest(null, requestUrl, requestParams);

            request.onload = function(xhr) {
                return cb(onload(xhr, requestParams.method));
            };

            request.onerror = function(xhr) {
                return error(
                    createResponse(
                        'error',
                        xhr.status,
                        onerror(xhr.response) || xhr.statusText,
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.ontimeout = createTimeoutResponse(error);
        };

        // create chunks
        var lastChunkIndex = Math.floor(file.size / chunkSize);
        for (var i = 0; i <= lastChunkIndex; i++) {
            var offset = i * chunkSize;
            var data = file.slice(offset, offset + chunkSize, 'application/offset+octet-stream');
            chunks[i] = {
                index: i,
                size: data.size,
                offset: offset,
                data: data,
                file: file,
                progress: 0,
                retries: _toConsumableArray(chunkRetryDelays),
                status: ChunkStatus.QUEUED,
                error: null,
                request: null,
                timeout: null,
            };
        }

        var completeProcessingChunks = function completeProcessingChunks() {
            return load(state.serverId);
        };

        var canProcessChunk = function canProcessChunk(chunk) {
            return chunk.status === ChunkStatus.QUEUED || chunk.status === ChunkStatus.ERROR;
        };

        var processChunk = function processChunk(chunk) {
            // processing is paused, wait here
            if (state.aborted) return;

            // get next chunk to process
            chunk = chunk || chunks.find(canProcessChunk);

            // no more chunks to process
            if (!chunk) {
                // all done?
                if (
                    chunks.every(function(chunk) {
                        return chunk.status === ChunkStatus.COMPLETE;
                    })
                ) {
                    completeProcessingChunks();
                }

                // no chunk to handle
                return;
            }

            // now processing this chunk
            chunk.status = ChunkStatus.PROCESSING;
            chunk.progress = null;

            // allow parsing of formdata
            var ondata =
                chunkServer.ondata ||
                function(fd) {
                    return fd;
                };
            var onerror =
                chunkServer.onerror ||
                function(res) {
                    return null;
                };

            // send request object
            var requestUrl = buildURL(apiUrl, chunkServer.url, state.serverId);

            var headers =
                typeof chunkServer.headers === 'function'
                    ? chunkServer.headers(chunk)
                    : Object.assign({}, chunkServer.headers, {
                          'Content-Type': 'application/offset+octet-stream',
                          'Upload-Offset': chunk.offset,
                          'Upload-Length': file.size,
                          'Upload-Name': file.name,
                      });

            var request = (chunk.request = sendRequest(
                ondata(chunk.data),
                requestUrl,
                Object.assign({}, chunkServer, {
                    headers: headers,
                })
            ));

            request.onload = function() {
                // done!
                chunk.status = ChunkStatus.COMPLETE;

                // remove request reference
                chunk.request = null;

                // start processing more chunks
                processChunks();
            };

            request.onprogress = function(lengthComputable, loaded, total) {
                chunk.progress = lengthComputable ? loaded : null;
                updateTotalProgress();
            };

            request.onerror = function(xhr) {
                chunk.status = ChunkStatus.ERROR;
                chunk.request = null;
                chunk.error = onerror(xhr.response) || xhr.statusText;
                if (!retryProcessChunk(chunk)) {
                    error(
                        createResponse(
                            'error',
                            xhr.status,
                            onerror(xhr.response) || xhr.statusText,
                            xhr.getAllResponseHeaders()
                        )
                    );
                }
            };

            request.ontimeout = function(xhr) {
                chunk.status = ChunkStatus.ERROR;
                chunk.request = null;
                if (!retryProcessChunk(chunk)) {
                    createTimeoutResponse(error)(xhr);
                }
            };

            request.onabort = function() {
                chunk.status = ChunkStatus.QUEUED;
                chunk.request = null;
                abort();
            };
        };

        var retryProcessChunk = function retryProcessChunk(chunk) {
            // no more retries left
            if (chunk.retries.length === 0) return false;

            // new retry
            chunk.status = ChunkStatus.WAITING;
            clearTimeout(chunk.timeout);
            chunk.timeout = setTimeout(function() {
                processChunk(chunk);
            }, chunk.retries.shift());

            // we're going to retry
            return true;
        };

        var updateTotalProgress = function updateTotalProgress() {
            // calculate total progress fraction
            var totalBytesTransfered = chunks.reduce(function(p, chunk) {
                if (p === null || chunk.progress === null) return null;
                return p + chunk.progress;
            }, 0);

            // can't compute progress
            if (totalBytesTransfered === null) return progress(false, 0, 0);

            // calculate progress values
            var totalSize = chunks.reduce(function(total, chunk) {
                return total + chunk.size;
            }, 0);

            // can update progress indicator
            progress(true, totalBytesTransfered, totalSize);
        };

        // process new chunks
        var processChunks = function processChunks() {
            var totalProcessing = chunks.filter(function(chunk) {
                return chunk.status === ChunkStatus.PROCESSING;
            }).length;
            if (totalProcessing >= 1) return;
            processChunk();
        };

        var abortChunks = function abortChunks() {
            chunks.forEach(function(chunk) {
                clearTimeout(chunk.timeout);
                if (chunk.request) {
                    chunk.request.abort();
                }
            });
        };

        // let's go!
        if (!state.serverId) {
            requestTransferId(function(serverId) {
                // stop here if aborted, might have happened in between request and callback
                if (state.aborted) return;

                // pass back to item so we can use it if something goes wrong
                transfer(serverId);

                // store internally
                state.serverId = serverId;
                processChunks();
            });
        } else {
            requestTransferOffset(function(offset) {
                // stop here if aborted, might have happened in between request and callback
                if (state.aborted) return;

                // mark chunks with lower offset as complete
                chunks
                    .filter(function(chunk) {
                        return chunk.offset < offset;
                    })
                    .forEach(function(chunk) {
                        chunk.status = ChunkStatus.COMPLETE;
                        chunk.progress = chunk.size;
                    });

                // continue processing
                processChunks();
            });
        }

        return {
            abort: function abort() {
                state.aborted = true;
                abortChunks();
            },
        };
    };

    /*
                                                               function signature:
                                                                 (file, metadata, load, error, progress, abort) => {
                                                                   return {
                                                                   abort:() => {}
                                                                 }
                                                               }
                                                               */
    var createFileProcessorFunction = function createFileProcessorFunction(
        apiUrl,
        action,
        name,
        options
    ) {
        return function(file, metadata, load, error, progress, abort, transfer) {
            // no file received
            if (!file) return;

            // if was passed a file, and we can chunk it, exit here
            var canChunkUpload = options.chunkUploads;
            var shouldChunkUpload = canChunkUpload && file.size > options.chunkSize;
            var willChunkUpload = canChunkUpload && (shouldChunkUpload || options.chunkForce);
            if (file instanceof Blob && willChunkUpload)
                return processFileChunked(
                    apiUrl,
                    action,
                    name,
                    file,
                    metadata,
                    load,
                    error,
                    progress,
                    abort,
                    transfer,
                    options
                );

            // set handlers
            var ondata =
                action.ondata ||
                function(fd) {
                    return fd;
                };
            var onload =
                action.onload ||
                function(res) {
                    return res;
                };
            var onerror =
                action.onerror ||
                function(res) {
                    return null;
                };

            var headers =
                typeof action.headers === 'function'
                    ? action.headers(file, metadata) || {}
                    : Object.assign(
                          {},

                          action.headers
                      );

            var requestParams = Object.assign({}, action, {
                headers: headers,
            });

            // create formdata object
            var formData = new FormData();

            // add metadata under same name
            if (isObject(metadata)) {
                formData.append(name, JSON.stringify(metadata));
            }

            // Turn into an array of objects so no matter what the input, we can handle it the same way
            (file instanceof Blob ? [{ name: null, file: file }] : file).forEach(function(item) {
                formData.append(
                    name,
                    item.file,
                    item.name === null ? item.file.name : '' + item.name + item.file.name
                );
            });

            // send request object
            var request = sendRequest(
                ondata(formData),
                buildURL(apiUrl, action.url),
                requestParams
            );
            request.onload = function(xhr) {
                load(
                    createResponse(
                        'load',
                        xhr.status,
                        onload(xhr.response),
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.onerror = function(xhr) {
                error(
                    createResponse(
                        'error',
                        xhr.status,
                        onerror(xhr.response) || xhr.statusText,
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.ontimeout = createTimeoutResponse(error);
            request.onprogress = progress;
            request.onabort = abort;

            // should return request
            return request;
        };
    };

    var createProcessorFunction = function createProcessorFunction() {
        var apiUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var action = arguments.length > 1 ? arguments[1] : undefined;
        var name = arguments.length > 2 ? arguments[2] : undefined;
        var options = arguments.length > 3 ? arguments[3] : undefined;

        // custom handler (should also handle file, load, error, progress and abort)
        if (typeof action === 'function')
            return function() {
                for (
                    var _len = arguments.length, params = new Array(_len), _key = 0;
                    _key < _len;
                    _key++
                ) {
                    params[_key] = arguments[_key];
                }
                return action.apply(void 0, [name].concat(params, [options]));
            };

        // no action supplied
        if (!action || !isString(action.url)) return null;

        // internal handler
        return createFileProcessorFunction(apiUrl, action, name, options);
    };

    /*
                                                      function signature:
                                                      (uniqueFileId, load, error) => { }
                                                      */
    var createRevertFunction = function createRevertFunction() {
        var apiUrl = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var action = arguments.length > 1 ? arguments[1] : undefined;
        // is custom implementation
        if (typeof action === 'function') {
            return action;
        }

        // no action supplied, return stub function, interface will work, but file won't be removed
        if (!action || !isString(action.url)) {
            return function(uniqueFileId, load) {
                return load();
            };
        }

        // set onload hanlder
        var onload =
            action.onload ||
            function(res) {
                return res;
            };
        var onerror =
            action.onerror ||
            function(res) {
                return null;
            };

        // internal implementation
        return function(uniqueFileId, load, error) {
            var request = sendRequest(
                uniqueFileId,
                apiUrl + action.url,
                action // contains method, headers and withCredentials properties
            );
            request.onload = function(xhr) {
                load(
                    createResponse(
                        'load',
                        xhr.status,
                        onload(xhr.response),
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.onerror = function(xhr) {
                error(
                    createResponse(
                        'error',
                        xhr.status,
                        onerror(xhr.response) || xhr.statusText,
                        xhr.getAllResponseHeaders()
                    )
                );
            };

            request.ontimeout = createTimeoutResponse(error);

            return request;
        };
    };

    var getRandomNumber = function getRandomNumber() {
        var min = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var max = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
        return min + Math.random() * (max - min);
    };

    var createPerceivedPerformanceUpdater = function createPerceivedPerformanceUpdater(cb) {
        var duration = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1000;
        var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var tickMin = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 25;
        var tickMax = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 250;
        var timeout = null;
        var start = Date.now();

        var tick = function tick() {
            var runtime = Date.now() - start;
            var delay = getRandomNumber(tickMin, tickMax);

            if (runtime + delay > duration) {
                delay = runtime + delay - duration;
            }

            var progress = runtime / duration;
            if (progress >= 1 || document.hidden) {
                cb(1);
                return;
            }

            cb(progress);

            timeout = setTimeout(tick, delay);
        };

        if (duration > 0) tick();

        return {
            clear: function clear() {
                clearTimeout(timeout);
            },
        };
    };

    var createFileProcessor = function createFileProcessor(processFn, options) {
        var state = {
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
        var allowMinimumUploadDuration = options.allowMinimumUploadDuration;

        var process = function process(file, metadata) {
            var progressFn = function progressFn() {
                // we've not yet started the real download, stop here
                // the request might not go through, for instance, there might be some server trouble
                // if state.progress is null, the server does not allow computing progress and we show the spinner instead
                if (state.duration === 0 || state.progress === null) return;

                // as we're now processing, fire the progress event
                api.fire('progress', api.getProgress());
            };

            var completeFn = function completeFn() {
                state.complete = true;
                api.fire('load-perceived', state.response.body);
            };

            // let's start processing
            api.fire('start');

            // set request start
            state.timestamp = Date.now();

            // create perceived performance progress indicator
            state.perceivedPerformanceUpdater = createPerceivedPerformanceUpdater(
                function(progress) {
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
                function(response) {
                    // we put the response in state so we can access
                    // it outside of this method
                    state.response = isObject(response)
                        ? response
                        : {
                              type: 'load',
                              code: 200,
                              body: '' + response,
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
                function(error) {
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
                                  body: '' + error,
                              }
                    );
                },

                // actual processing progress
                function(computable, current, total) {
                    // update actual duration
                    state.duration = Date.now() - state.timestamp;

                    // update actual progress
                    state.progress = computable ? current / total : null;

                    progressFn();
                },

                // abort does not expect a value
                function() {
                    // stop updater
                    state.perceivedPerformanceUpdater.clear();

                    // fire the abort event so we can switch visuals
                    api.fire('abort', state.response ? state.response.body : null);
                },

                // register the id for this transfer
                function(transferId) {
                    api.fire('transfer', transferId);
                }
            );
        };

        var abort = function abort() {
            // no request running, can't abort
            if (!state.request) return;

            // stop updater
            state.perceivedPerformanceUpdater.clear();

            // abort actual request
            if (state.request.abort) state.request.abort();

            // if has response object, we've completed the request
            state.complete = true;
        };

        var reset = function reset() {
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

        var getProgress = allowMinimumUploadDuration
            ? function() {
                  return state.progress ? Math.min(state.progress, state.perceivedProgress) : null;
              }
            : function() {
                  return state.progress || null;
              };

        var getDuration = allowMinimumUploadDuration
            ? function() {
                  return Math.min(state.duration, state.perceivedDuration);
              }
            : function() {
                  return state.duration;
              };

        var api = Object.assign({}, on(), {
            process: process, // start processing file
            abort: abort, // abort active process request
            getProgress: getProgress,
            getDuration: getDuration,
            reset: reset,
        });

        return api;
    };

    var getFilenameWithoutExtension = function getFilenameWithoutExtension(name) {
        return name.substr(0, name.lastIndexOf('.')) || name;
    };

    var createFileStub = function createFileStub(source) {
        var data = [source.name, source.size, source.type];

        // is blob or base64, then we need to set the name
        if (source instanceof Blob || isBase64DataURI(source)) {
            data[0] = source.name || getDateString();
        } else if (isBase64DataURI(source)) {
            // if is base64 data uri we need to determine the average size and type
            data[1] = source.length;
            data[2] = getMimeTypeFromBase64DataURI(source);
        } else if (isString(source)) {
            // url
            data[0] = getFilenameFromURL(source);
            data[1] = 0;
            data[2] = 'application/octet-stream';
        }

        return {
            name: data[0],
            size: data[1],
            type: data[2],
        };
    };

    var isFile = function isFile(value) {
        return !!(value instanceof File || (value instanceof Blob && value.name));
    };

    var deepCloneObject = function deepCloneObject(src) {
        if (!isObject(src)) return src;
        var target = isArray(src) ? [] : {};
        for (var key in src) {
            if (!src.hasOwnProperty(key)) continue;
            var v = src[key];
            target[key] = v && isObject(v) ? deepCloneObject(v) : v;
        }
        return target;
    };

    var createItem = function createItem() {
        var origin = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
        var serverFileReference =
            arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
        var file = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
        // unique id for this item, is used to identify the item across views
        var id = getUniqueId();

        /**
         * Internal item state
         */
        var state = {
            // is archived
            archived: false,

            // if is frozen, no longer fires events
            frozen: false,

            // removed from view
            released: false,

            // original source
            source: null,

            // file model reference
            file: file,

            // id of file on server
            serverFileReference: serverFileReference,

            // id of file transfer on server
            transferId: null,

            // is aborted
            processingAborted: false,

            // current item status
            status: serverFileReference ? ItemStatus.PROCESSING_COMPLETE : ItemStatus.INIT,

            // active processes
            activeLoader: null,
            activeProcessor: null,
        };

        // callback used when abort processing is called to link back to the resolve method
        var abortProcessingRequestComplete = null;

        /**
         * Externally added item metadata
         */
        var metadata = {};

        // item data
        var setStatus = function setStatus(status) {
            return (state.status = status);
        };

        // fire event unless the item has been archived
        var fire = function fire(event) {
            if (state.released || state.frozen) return;
            for (
                var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
                _key < _len;
                _key++
            ) {
                params[_key - 1] = arguments[_key];
            }
            api.fire.apply(api, [event].concat(params));
        };

        // file data
        var getFileExtension = function getFileExtension() {
            return getExtensionFromFilename(state.file.name);
        };
        var getFileType = function getFileType() {
            return state.file.type;
        };
        var getFileSize = function getFileSize() {
            return state.file.size;
        };
        var getFile = function getFile() {
            return state.file;
        };

        //
        // logic to load a file
        //
        var load = function load(source, loader, onload) {
            // remember the original item source
            state.source = source;

            // source is known
            api.fireSync('init');

            // file stub is already there
            if (state.file) {
                api.fireSync('load-skip');
                return;
            }

            // set a stub file object while loading the actual data
            state.file = createFileStub(source);

            // starts loading
            loader.on('init', function() {
                fire('load-init');
            });

            // we'eve received a size indication, let's update the stub
            loader.on('meta', function(meta) {
                // set size of file stub
                state.file.size = meta.size;

                // set name of file stub
                state.file.filename = meta.filename;

                // if has received source, we done
                if (meta.source) {
                    origin = FileOrigin.LIMBO;
                    state.serverFileReference = meta.source;
                    state.status = ItemStatus.PROCESSING_COMPLETE;
                }

                // size has been updated
                fire('load-meta');
            });

            // the file is now loading we need to update the progress indicators
            loader.on('progress', function(progress) {
                setStatus(ItemStatus.LOADING);

                fire('load-progress', progress);
            });

            // an error was thrown while loading the file, we need to switch to error state
            loader.on('error', function(error) {
                setStatus(ItemStatus.LOAD_ERROR);

                fire('load-request-error', error);
            });

            // user or another process aborted the file load (cannot retry)
            loader.on('abort', function() {
                setStatus(ItemStatus.INIT);
                fire('load-abort');
            });

            // done loading
            loader.on('load', function(file) {
                // as we've now loaded the file the loader is no longer required
                state.activeLoader = null;

                // called when file has loaded succesfully
                var success = function success(result) {
                    // set (possibly) transformed file
                    state.file = isFile(result) ? result : state.file;

                    // file received
                    if (origin === FileOrigin.LIMBO && state.serverFileReference) {
                        setStatus(ItemStatus.PROCESSING_COMPLETE);
                    } else {
                        setStatus(ItemStatus.IDLE);
                    }

                    fire('load');
                };

                var error = function error(result) {
                    // set original file
                    state.file = file;
                    fire('load-meta');

                    setStatus(ItemStatus.LOAD_ERROR);
                    fire('load-file-error', result);
                };

                // if we already have a server file reference, we don't need to call the onload method
                if (state.serverFileReference) {
                    success(file);
                    return;
                }

                // no server id, let's give this file the full treatment
                onload(file, success, error);
            });

            // set loader source data
            loader.setSource(source);

            // set as active loader
            state.activeLoader = loader;

            // load the source data
            loader.load();
        };

        var retryLoad = function retryLoad() {
            if (!state.activeLoader) {
                return;
            }
            state.activeLoader.load();
        };

        var abortLoad = function abortLoad() {
            if (state.activeLoader) {
                state.activeLoader.abort();
                return;
            }
            setStatus(ItemStatus.INIT);
            fire('load-abort');
        };

        //
        // logic to process a file
        //
        var process = function process(processor, onprocess) {
            // processing was aborted
            if (state.processingAborted) {
                state.processingAborted = false;
                return;
            }

            // now processing
            setStatus(ItemStatus.PROCESSING);

            // reset abort callback
            abortProcessingRequestComplete = null;

            // if no file loaded we'll wait for the load event
            if (!(state.file instanceof Blob)) {
                api.on('load', function() {
                    process(processor, onprocess);
                });
                return;
            }

            // setup processor
            processor.on('load', function(serverFileReference) {
                // need this id to be able to revert the upload
                state.transferId = null;
                state.serverFileReference = serverFileReference;
            });

            // register transfer id
            processor.on('transfer', function(transferId) {
                // need this id to be able to revert the upload
                state.transferId = transferId;
            });

            processor.on('load-perceived', function(serverFileReference) {
                // no longer required
                state.activeProcessor = null;

                // need this id to be able to rever the upload
                state.transferId = null;
                state.serverFileReference = serverFileReference;

                setStatus(ItemStatus.PROCESSING_COMPLETE);
                fire('process-complete', serverFileReference);
            });

            processor.on('start', function() {
                fire('process-start');
            });

            processor.on('error', function(error) {
                state.activeProcessor = null;
                setStatus(ItemStatus.PROCESSING_ERROR);
                fire('process-error', error);
            });

            processor.on('abort', function(serverFileReference) {
                state.activeProcessor = null;

                // if file was uploaded but processing was cancelled during perceived processor time store file reference
                state.serverFileReference = serverFileReference;

                setStatus(ItemStatus.IDLE);
                fire('process-abort');

                // has timeout so doesn't interfere with remove action
                if (abortProcessingRequestComplete) {
                    abortProcessingRequestComplete();
                }
            });

            processor.on('progress', function(progress) {
                fire('process-progress', progress);
            });

            // when successfully transformed
            var success = function success(file) {
                // if was archived in the mean time, don't process
                if (state.archived) return;

                // process file!
                processor.process(file, Object.assign({}, metadata));
            };

            // something went wrong during transform phase
            var error = console.error;

            // start processing the file
            onprocess(state.file, success, error);

            // set as active processor
            state.activeProcessor = processor;
        };

        var requestProcessing = function requestProcessing() {
            state.processingAborted = false;
            setStatus(ItemStatus.PROCESSING_QUEUED);
        };

        var abortProcessing = function abortProcessing() {
            return new Promise(function(resolve) {
                if (!state.activeProcessor) {
                    state.processingAborted = true;

                    setStatus(ItemStatus.IDLE);
                    fire('process-abort');

                    resolve();
                    return;
                }

                abortProcessingRequestComplete = function abortProcessingRequestComplete() {
                    resolve();
                };

                state.activeProcessor.abort();
            });
        };

        //
        // logic to revert a processed file
        //
        var revert = function revert(revertFileUpload, forceRevert) {
            return new Promise(function(resolve, reject) {
                // a completed upload will have a serverFileReference, a failed chunked upload where
                // getting a serverId succeeded but >=0 chunks have been uploaded will have transferId set
                var serverTransferId =
                    state.serverFileReference !== null
                        ? state.serverFileReference
                        : state.transferId;

                // cannot revert without a server id for this process
                if (serverTransferId === null) {
                    resolve();
                    return;
                }

                // revert the upload (fire and forget)
                revertFileUpload(
                    serverTransferId,
                    function() {
                        // reset file server id and transfer id as now it's not available on the server
                        state.serverFileReference = null;
                        state.transferId = null;
                        resolve();
                    },
                    function(error) {
                        // don't set error state when reverting is optional, it will always resolve
                        if (!forceRevert) {
                            resolve();
                            return;
                        }

                        // oh no errors
                        setStatus(ItemStatus.PROCESSING_REVERT_ERROR);
                        fire('process-revert-error');
                        reject(error);
                    }
                );

                // fire event
                setStatus(ItemStatus.IDLE);
                fire('process-revert');
            });
        };

        // exposed methods
        var _setMetadata = function setMetadata(key, value, silent) {
            var keys = key.split('.');
            var root = keys[0];
            var last = keys.pop();
            var data = metadata;
            keys.forEach(function(key) {
                return (data = data[key]);
            });

            // compare old value against new value, if they're the same, we're not updating
            if (JSON.stringify(data[last]) === JSON.stringify(value)) return;

            // update value
            data[last] = value;

            // fire update
            fire('metadata-update', {
                key: root,
                value: metadata[root],
                silent: silent,
            });
        };

        var getMetadata = function getMetadata(key) {
            return deepCloneObject(key ? metadata[key] : metadata);
        };

        var api = Object.assign(
            {
                id: {
                    get: function get() {
                        return id;
                    },
                },
                origin: {
                    get: function get() {
                        return origin;
                    },
                    set: function set(value) {
                        return (origin = value);
                    },
                },
                serverId: {
                    get: function get() {
                        return state.serverFileReference;
                    },
                },
                transferId: {
                    get: function get() {
                        return state.transferId;
                    },
                },
                status: {
                    get: function get() {
                        return state.status;
                    },
                },
                filename: {
                    get: function get() {
                        return state.file.name;
                    },
                },
                filenameWithoutExtension: {
                    get: function get() {
                        return getFilenameWithoutExtension(state.file.name);
                    },
                },
                fileExtension: { get: getFileExtension },
                fileType: { get: getFileType },
                fileSize: { get: getFileSize },
                file: { get: getFile },
                relativePath: {
                    get: function get() {
                        return state.file._relativePath;
                    },
                },

                source: {
                    get: function get() {
                        return state.source;
                    },
                },

                getMetadata: getMetadata,
                setMetadata: function setMetadata(key, value, silent) {
                    if (isObject(key)) {
                        var data = key;
                        Object.keys(data).forEach(function(key) {
                            _setMetadata(key, data[key], value);
                        });
                        return key;
                    }
                    _setMetadata(key, value, silent);
                    return value;
                },

                extend: function extend(name, handler) {
                    return (itemAPI[name] = handler);
                },

                abortLoad: abortLoad,
                retryLoad: retryLoad,
                requestProcessing: requestProcessing,
                abortProcessing: abortProcessing,

                load: load,
                process: process,
                revert: revert,
            },

            on(),
            {
                freeze: function freeze() {
                    return (state.frozen = true);
                },

                release: function release() {
                    return (state.released = true);
                },
                released: {
                    get: function get() {
                        return state.released;
                    },
                },

                archive: function archive() {
                    return (state.archived = true);
                },
                archived: {
                    get: function get() {
                        return state.archived;
                    },
                },
            }
        );

        // create it here instead of returning it instantly so we can extend it later
        var itemAPI = createObject(api);

        return itemAPI;
    };

    var getItemIndexByQuery = function getItemIndexByQuery(items, query) {
        // just return first index
        if (isEmpty(query)) {
            return 0;
        }

        // invalid queries
        if (!isString(query)) {
            return -1;
        }

        // return item by id (or -1 if not found)
        return items.findIndex(function(item) {
            return item.id === query;
        });
    };

    var getItemById = function getItemById(items, itemId) {
        var index = getItemIndexByQuery(items, itemId);
        if (index < 0) {
            return;
        }
        return items[index] || null;
    };

    var fetchBlob = function fetchBlob(url, load, error, progress, abort, headers) {
        var request = sendRequest(null, url, {
            method: 'GET',
            responseType: 'blob',
        });

        request.onload = function(xhr) {
            // get headers
            var headers = xhr.getAllResponseHeaders();

            // get filename
            var filename = getFileInfoFromHeaders(headers).name || getFilenameFromURL(url);

            // create response
            load(
                createResponse('load', xhr.status, getFileFromBlob(xhr.response, filename), headers)
            );
        };

        request.onerror = function(xhr) {
            error(createResponse('error', xhr.status, xhr.statusText, xhr.getAllResponseHeaders()));
        };

        request.onheaders = function(xhr) {
            headers(createResponse('headers', xhr.status, null, xhr.getAllResponseHeaders()));
        };

        request.ontimeout = createTimeoutResponse(error);
        request.onprogress = progress;
        request.onabort = abort;

        // should return request
        return request;
    };

    var getDomainFromURL = function getDomainFromURL(url) {
        if (url.indexOf('//') === 0) {
            url = location.protocol + url;
        }
        return url
            .toLowerCase()
            .replace('blob:', '')
            .replace(/([a-z])?:\/\//, '$1')
            .split('/')[0];
    };

    var isExternalURL = function isExternalURL(url) {
        return (
            (url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
            getDomainFromURL(location.href) !== getDomainFromURL(url)
        );
    };

    var dynamicLabel = function dynamicLabel(label) {
        return function() {
            return isFunction(label) ? label.apply(void 0, arguments) : label;
        };
    };

    var isMockItem = function isMockItem(item) {
        return !isFile(item.file);
    };

    var listUpdated = function listUpdated(dispatch, state) {
        clearTimeout(state.listUpdateTimeout);
        state.listUpdateTimeout = setTimeout(function() {
            dispatch('DID_UPDATE_ITEMS', { items: getActiveItems(state.items) });
        }, 0);
    };

    var optionalPromise = function optionalPromise(fn) {
        for (
            var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
            _key < _len;
            _key++
        ) {
            params[_key - 1] = arguments[_key];
        }
        return new Promise(function(resolve) {
            if (!fn) {
                return resolve(true);
            }

            var result = fn.apply(void 0, params);

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
    };

    var sortItems = function sortItems(state, compare) {
        state.items.sort(function(a, b) {
            return compare(createItemAPI(a), createItemAPI(b));
        });
    };

    // returns item based on state
    var getItemByQueryFromState = function getItemByQueryFromState(state, itemHandler) {
        return function() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            var query = _ref.query,
                _ref$success = _ref.success,
                success = _ref$success === void 0 ? function() {} : _ref$success,
                _ref$failure = _ref.failure,
                failure = _ref$failure === void 0 ? function() {} : _ref$failure,
                options = _objectWithoutProperties(_ref, ['query', 'success', 'failure']);
            var item = getItemByQuery(state.items, query);
            if (!item) {
                failure({
                    error: createResponse('error', 0, 'Item not found'),
                    file: null,
                });

                return;
            }
            itemHandler(item, success, failure, options || {});
        };
    };

    var actions = function actions(dispatch, query, state) {
        return {
            /**
             * Aborts all ongoing processes
             */
            ABORT_ALL: function ABORT_ALL() {
                getActiveItems(state.items).forEach(function(item) {
                    item.freeze();
                    item.abortLoad();
                    item.abortProcessing();
                });
            },

            /**
             * Sets initial files
             */
            DID_SET_FILES: function DID_SET_FILES(_ref2) {
                var _ref2$value = _ref2.value,
                    value = _ref2$value === void 0 ? [] : _ref2$value;
                // map values to file objects
                var files = value.map(function(file) {
                    return {
                        source: file.source ? file.source : file,
                        options: file.options,
                    };
                });

                // loop over files, if file is in list, leave it be, if not, remove
                // test if items should be moved
                var activeItems = getActiveItems(state.items);

                activeItems.forEach(function(item) {
                    // if item not is in new value, remove
                    if (
                        !files.find(function(file) {
                            return file.source === item.source || file.source === item.file;
                        })
                    ) {
                        dispatch('REMOVE_ITEM', { query: item, remove: false });
                    }
                });

                // add new files
                activeItems = getActiveItems(state.items);
                files.forEach(function(file, index) {
                    // if file is already in list
                    if (
                        activeItems.find(function(item) {
                            return item.source === file.source || item.file === file.source;
                        })
                    )
                        return;

                    // not in list, add
                    dispatch(
                        'ADD_ITEM',
                        Object.assign({}, file, {
                            interactionMethod: InteractionMethod.NONE,
                            index: index,
                        })
                    );
                });
            },

            DID_UPDATE_ITEM_METADATA: function DID_UPDATE_ITEM_METADATA(_ref3) {
                var id = _ref3.id,
                    action = _ref3.action,
                    change = _ref3.change;
                // don't do anything
                if (change.silent) return;

                // if is called multiple times in close succession we combined all calls together to save resources
                clearTimeout(state.itemUpdateTimeout);
                state.itemUpdateTimeout = setTimeout(function() {
                    var item = getItemById(state.items, id);

                    // only revert and attempt to upload when we're uploading to a server
                    if (!query('IS_ASYNC')) {
                        // should we update the output data
                        applyFilterChain('SHOULD_PREPARE_OUTPUT', false, {
                            item: item,
                            query: query,
                            action: action,
                            change: change,
                        }).then(function(shouldPrepareOutput) {
                            // plugins determined the output data should be prepared (or not), can be adjusted with beforePrepareOutput hook
                            var beforePrepareFile = query('GET_BEFORE_PREPARE_FILE');
                            if (beforePrepareFile)
                                shouldPrepareOutput = beforePrepareFile(item, shouldPrepareOutput);

                            if (!shouldPrepareOutput) return;

                            dispatch(
                                'REQUEST_PREPARE_OUTPUT',
                                {
                                    query: id,
                                    item: item,
                                    success: function success(file) {
                                        dispatch('DID_PREPARE_OUTPUT', { id: id, file: file });
                                    },
                                },

                                true
                            );
                        });

                        return;
                    }

                    // if is local item we need to enable upload button so change can be propagated to server
                    if (item.origin === FileOrigin.LOCAL) {
                        dispatch('DID_LOAD_ITEM', {
                            id: item.id,
                            error: null,
                            serverFileReference: item.source,
                        });
                    }

                    // for async scenarios
                    var upload = function upload() {
                        // we push this forward a bit so the interface is updated correctly
                        setTimeout(function() {
                            dispatch('REQUEST_ITEM_PROCESSING', { query: id });
                        }, 32);
                    };

                    var revert = function revert(doUpload) {
                        item.revert(
                            createRevertFunction(
                                state.options.server.url,
                                state.options.server.revert
                            ),
                            query('GET_FORCE_REVERT')
                        )
                            .then(doUpload ? upload : function() {})
                            .catch(function() {});
                    };

                    var abort = function abort(doUpload) {
                        item.abortProcessing().then(doUpload ? upload : function() {});
                    };

                    // if we should re-upload the file immediately
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

            MOVE_ITEM: function MOVE_ITEM(_ref4) {
                var query = _ref4.query,
                    index = _ref4.index;
                var item = getItemByQuery(state.items, query);
                if (!item) return;
                var currentIndex = state.items.indexOf(item);
                index = limit(index, 0, state.items.length - 1);
                if (currentIndex === index) return;
                state.items.splice(index, 0, state.items.splice(currentIndex, 1)[0]);
            },

            SORT: function SORT(_ref5) {
                var compare = _ref5.compare;
                sortItems(state, compare);
                dispatch('DID_SORT_ITEMS', {
                    items: query('GET_ACTIVE_ITEMS'),
                });
            },

            ADD_ITEMS: function ADD_ITEMS(_ref6) {
                var items = _ref6.items,
                    index = _ref6.index,
                    interactionMethod = _ref6.interactionMethod,
                    _ref6$success = _ref6.success,
                    success = _ref6$success === void 0 ? function() {} : _ref6$success,
                    _ref6$failure = _ref6.failure,
                    failure = _ref6$failure === void 0 ? function() {} : _ref6$failure;
                var currentIndex = index;

                if (index === -1 || typeof index === 'undefined') {
                    var insertLocation = query('GET_ITEM_INSERT_LOCATION');
                    var totalItems = query('GET_TOTAL_ITEMS');
                    currentIndex = insertLocation === 'before' ? 0 : totalItems;
                }

                var ignoredFiles = query('GET_IGNORED_FILES');
                var isValidFile = function isValidFile(source) {
                    return isFile(source)
                        ? !ignoredFiles.includes(source.name.toLowerCase())
                        : !isEmpty(source);
                };
                var validItems = items.filter(isValidFile);

                var promises = validItems.map(function(source) {
                    return new Promise(function(resolve, reject) {
                        dispatch('ADD_ITEM', {
                            interactionMethod: interactionMethod,
                            source: source.source || source,
                            success: resolve,
                            failure: reject,
                            index: currentIndex++,
                            options: source.options || {},
                        });
                    });
                });

                Promise.all(promises)
                    .then(success)
                    .catch(failure);
            },

            /**
             * @param source
             * @param index
             * @param interactionMethod
             */
            ADD_ITEM: function ADD_ITEM(_ref7) {
                var source = _ref7.source,
                    _ref7$index = _ref7.index,
                    index = _ref7$index === void 0 ? -1 : _ref7$index,
                    interactionMethod = _ref7.interactionMethod,
                    _ref7$success = _ref7.success,
                    success = _ref7$success === void 0 ? function() {} : _ref7$success,
                    _ref7$failure = _ref7.failure,
                    failure = _ref7$failure === void 0 ? function() {} : _ref7$failure,
                    _ref7$options = _ref7.options,
                    options = _ref7$options === void 0 ? {} : _ref7$options;
                // if no source supplied
                if (isEmpty(source)) {
                    failure({
                        error: createResponse('error', 0, 'No source'),
                        file: null,
                    });

                    return;
                }

                // filter out invalid file items, used to filter dropped directory contents
                if (
                    isFile(source) &&
                    state.options.ignoredFiles.includes(source.name.toLowerCase())
                ) {
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
                        var error = createResponse('warning', 0, 'Max files');

                        dispatch('DID_THROW_MAX_FILES', {
                            source: source,
                            error: error,
                        });

                        failure({ error: error, file: null });

                        return;
                    }

                    // let's replace the item
                    // id of first item we're about to remove
                    var _item = getActiveItems(state.items)[0];

                    // if has been processed remove it from the server as well
                    if (
                        _item.status === ItemStatus.PROCESSING_COMPLETE ||
                        _item.status === ItemStatus.PROCESSING_REVERT_ERROR
                    ) {
                        var forceRevert = query('GET_FORCE_REVERT');
                        _item
                            .revert(
                                createRevertFunction(
                                    state.options.server.url,
                                    state.options.server.revert
                                ),
                                forceRevert
                            )
                            .then(function() {
                                if (!forceRevert) return;

                                // try to add now
                                dispatch('ADD_ITEM', {
                                    source: source,
                                    index: index,
                                    interactionMethod: interactionMethod,
                                    success: success,
                                    failure: failure,
                                    options: options,
                                });
                            })
                            .catch(function() {}); // no need to handle this catch state for now

                        if (forceRevert) return;
                    }

                    // remove first item as it will be replaced by this item
                    dispatch('REMOVE_ITEM', { query: _item.id });
                }

                // where did the file originate
                var origin =
                    options.type === 'local'
                        ? FileOrigin.LOCAL
                        : options.type === 'limbo'
                        ? FileOrigin.LIMBO
                        : FileOrigin.INPUT;

                // create a new blank item
                var item = createItem(
                    // where did this file come from
                    origin,

                    // an input file never has a server file reference
                    origin === FileOrigin.INPUT ? null : source,

                    // file mock data, if defined
                    options.file
                );

                // set initial meta data
                Object.keys(options.metadata || {}).forEach(function(key) {
                    item.setMetadata(key, options.metadata[key]);
                });

                // created the item, let plugins add methods
                applyFilters('DID_CREATE_ITEM', item, { query: query, dispatch: dispatch });

                // where to insert new items
                var itemInsertLocation = query('GET_ITEM_INSERT_LOCATION');

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
                var id = item.id;

                // observe item events
                item.on('init', function() {
                    dispatch('DID_INIT_ITEM', { id: id });
                });

                item.on('load-init', function() {
                    dispatch('DID_START_ITEM_LOAD', { id: id });
                });

                item.on('load-meta', function() {
                    dispatch('DID_UPDATE_ITEM_META', { id: id });
                });

                item.on('load-progress', function(progress) {
                    dispatch('DID_UPDATE_ITEM_LOAD_PROGRESS', { id: id, progress: progress });
                });

                item.on('load-request-error', function(error) {
                    var mainStatus = dynamicLabel(state.options.labelFileLoadError)(error);

                    // is client error, no way to recover
                    if (error.code >= 400 && error.code < 500) {
                        dispatch('DID_THROW_ITEM_INVALID', {
                            id: id,
                            error: error,
                            status: {
                                main: mainStatus,
                                sub: error.code + ' (' + error.body + ')',
                            },
                        });

                        // reject the file so can be dealt with through API
                        failure({ error: error, file: createItemAPI(item) });
                        return;
                    }

                    // is possible server error, so might be possible to retry
                    dispatch('DID_THROW_ITEM_LOAD_ERROR', {
                        id: id,
                        error: error,
                        status: {
                            main: mainStatus,
                            sub: state.options.labelTapToRetry,
                        },
                    });
                });

                item.on('load-file-error', function(error) {
                    dispatch('DID_THROW_ITEM_INVALID', {
                        id: id,
                        error: error.status,
                        status: error.status,
                    });

                    failure({ error: error.status, file: createItemAPI(item) });
                });

                item.on('load-abort', function() {
                    dispatch('REMOVE_ITEM', { query: id });
                });

                item.on('load-skip', function() {
                    dispatch('COMPLETE_LOAD_ITEM', {
                        query: id,
                        item: item,
                        data: {
                            source: source,
                            success: success,
                        },
                    });
                });

                item.on('load', function() {
                    var handleAdd = function handleAdd(shouldAdd) {
                        // no should not add this file
                        if (!shouldAdd) {
                            dispatch('REMOVE_ITEM', {
                                query: id,
                            });

                            return;
                        }

                        // now interested in metadata updates
                        item.on('metadata-update', function(change) {
                            dispatch('DID_UPDATE_ITEM_METADATA', { id: id, change: change });
                        });

                        // let plugins decide if the output data should be prepared at this point
                        // means we'll do this and wait for idle state
                        applyFilterChain('SHOULD_PREPARE_OUTPUT', false, {
                            item: item,
                            query: query,
                        }).then(function(shouldPrepareOutput) {
                            // plugins determined the output data should be prepared (or not), can be adjusted with beforePrepareOutput hook
                            var beforePrepareFile = query('GET_BEFORE_PREPARE_FILE');
                            if (beforePrepareFile)
                                shouldPrepareOutput = beforePrepareFile(item, shouldPrepareOutput);

                            var loadComplete = function loadComplete() {
                                dispatch('COMPLETE_LOAD_ITEM', {
                                    query: id,
                                    item: item,
                                    data: {
                                        source: source,
                                        success: success,
                                    },
                                });

                                listUpdated(dispatch, state);
                            };

                            // exit
                            if (shouldPrepareOutput) {
                                // wait for idle state and then run PREPARE_OUTPUT
                                dispatch(
                                    'REQUEST_PREPARE_OUTPUT',
                                    {
                                        query: id,
                                        item: item,
                                        success: function success(file) {
                                            dispatch('DID_PREPARE_OUTPUT', { id: id, file: file });
                                            loadComplete();
                                        },
                                    },

                                    true
                                );

                                return;
                            }

                            loadComplete();
                        });
                    };

                    // item loaded, allow plugins to
                    // - read data (quickly)
                    // - add metadata
                    applyFilterChain('DID_LOAD_ITEM', item, { query: query, dispatch: dispatch })
                        .then(function() {
                            optionalPromise(query('GET_BEFORE_ADD_FILE'), createItemAPI(item)).then(
                                handleAdd
                            );
                        })
                        .catch(function(e) {
                            if (!e || !e.error || !e.status) return handleAdd(false);
                            dispatch('DID_THROW_ITEM_INVALID', {
                                id: id,
                                error: e.error,
                                status: e.status,
                            });
                        });
                });

                item.on('process-start', function() {
                    dispatch('DID_START_ITEM_PROCESSING', { id: id });
                });

                item.on('process-progress', function(progress) {
                    dispatch('DID_UPDATE_ITEM_PROCESS_PROGRESS', { id: id, progress: progress });
                });

                item.on('process-error', function(error) {
                    dispatch('DID_THROW_ITEM_PROCESSING_ERROR', {
                        id: id,
                        error: error,
                        status: {
                            main: dynamicLabel(state.options.labelFileProcessingError)(error),
                            sub: state.options.labelTapToRetry,
                        },
                    });
                });

                item.on('process-revert-error', function(error) {
                    dispatch('DID_THROW_ITEM_PROCESSING_REVERT_ERROR', {
                        id: id,
                        error: error,
                        status: {
                            main: dynamicLabel(state.options.labelFileProcessingRevertError)(error),
                            sub: state.options.labelTapToRetry,
                        },
                    });
                });

                item.on('process-complete', function(serverFileReference) {
                    dispatch('DID_COMPLETE_ITEM_PROCESSING', {
                        id: id,
                        error: null,
                        serverFileReference: serverFileReference,
                    });

                    dispatch('DID_DEFINE_VALUE', { id: id, value: serverFileReference });
                });

                item.on('process-abort', function() {
                    dispatch('DID_ABORT_ITEM_PROCESSING', { id: id });
                });

                item.on('process-revert', function() {
                    dispatch('DID_REVERT_ITEM_PROCESSING', { id: id });
                    dispatch('DID_DEFINE_VALUE', { id: id, value: null });
                });

                // let view know the item has been inserted
                dispatch('DID_ADD_ITEM', {
                    id: id,
                    index: index,
                    interactionMethod: interactionMethod,
                });

                listUpdated(dispatch, state);

                // start loading the source
                var _ref8 = state.options.server || {},
                    url = _ref8.url,
                    load = _ref8.load,
                    restore = _ref8.restore,
                    fetch = _ref8.fetch;

                item.load(
                    source,

                    // this creates a function that loads the file based on the type of file (string, base64, blob, file) and location of file (local, remote, limbo)
                    createFileLoader(
                        origin === FileOrigin.INPUT
                            ? // input, if is remote, see if should use custom fetch, else use default fetchBlob
                              isString(source) && isExternalURL(source)
                                ? fetch
                                    ? createFetchFunction(url, fetch)
                                    : fetchBlob // remote url
                                : fetchBlob // try to fetch url
                            : // limbo or local
                            origin === FileOrigin.LIMBO
                            ? createFetchFunction(url, restore) // limbo
                            : createFetchFunction(url, load) // local
                    ),

                    // called when the file is loaded so it can be piped through the filters
                    function(file, success, error) {
                        // let's process the file
                        applyFilterChain('LOAD_FILE', file, { query: query })
                            .then(success)
                            .catch(error);
                    }
                );
            },

            REQUEST_PREPARE_OUTPUT: function REQUEST_PREPARE_OUTPUT(_ref9) {
                var item = _ref9.item,
                    success = _ref9.success,
                    _ref9$failure = _ref9.failure,
                    failure = _ref9$failure === void 0 ? function() {} : _ref9$failure;
                // error response if item archived
                var err = {
                    error: createResponse('error', 0, 'Item not found'),
                    file: null,
                };

                // don't handle archived items, an item could have been archived (load aborted) while waiting to be prepared
                if (item.archived) return failure(err);

                // allow plugins to alter the file data
                applyFilterChain('PREPARE_OUTPUT', item.file, { query: query, item: item }).then(
                    function(result) {
                        applyFilterChain('COMPLETE_PREPARE_OUTPUT', result, {
                            query: query,
                            item: item,
                        }).then(function(result) {
                            // don't handle archived items, an item could have been archived (load aborted) while being prepared
                            if (item.archived) return failure(err);

                            // we done!
                            success(result);
                        });
                    }
                );
            },

            COMPLETE_LOAD_ITEM: function COMPLETE_LOAD_ITEM(_ref10) {
                var item = _ref10.item,
                    data = _ref10.data;
                var success = data.success,
                    source = data.source;

                // sort items in list
                var itemInsertLocation = query('GET_ITEM_INSERT_LOCATION');
                if (isFunction(itemInsertLocation) && source) {
                    sortItems(state, itemInsertLocation);
                }

                // let interface know the item has loaded
                dispatch('DID_LOAD_ITEM', {
                    id: item.id,
                    error: null,
                    serverFileReference: item.origin === FileOrigin.INPUT ? null : source,
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
                        serverFileReference: source,
                    });

                    dispatch('DID_DEFINE_VALUE', {
                        id: item.id,
                        value: item.serverId || source,
                    });

                    return;
                }

                // id we are allowed to upload the file immediately, lets do it
                if (query('IS_ASYNC') && state.options.instantUpload) {
                    dispatch('REQUEST_ITEM_PROCESSING', { query: item.id });
                }
            },

            RETRY_ITEM_LOAD: getItemByQueryFromState(state, function(item) {
                // try loading the source one more time
                item.retryLoad();
            }),

            REQUEST_ITEM_PREPARE: getItemByQueryFromState(state, function(item, _success, failure) {
                dispatch(
                    'REQUEST_PREPARE_OUTPUT',
                    {
                        query: item.id,
                        item: item,
                        success: function success(file) {
                            dispatch('DID_PREPARE_OUTPUT', { id: item.id, file: file });
                            _success({
                                file: item,
                                output: file,
                            });
                        },
                        failure: failure,
                    },

                    true
                );
            }),

            REQUEST_ITEM_PROCESSING: getItemByQueryFromState(state, function(
                item,
                success,
                failure
            ) {
                // cannot be queued (or is already queued)
                var itemCanBeQueuedForProcessing =
                    // waiting for something
                    item.status === ItemStatus.IDLE ||
                    // processing went wrong earlier
                    item.status === ItemStatus.PROCESSING_ERROR;

                // not ready to be processed
                if (!itemCanBeQueuedForProcessing) {
                    var processNow = function processNow() {
                        return dispatch('REQUEST_ITEM_PROCESSING', {
                            query: item,
                            success: success,
                            failure: failure,
                        });
                    };

                    var process = function process() {
                        return document.hidden ? processNow() : setTimeout(processNow, 32);
                    };

                    // if already done processing or tried to revert but didn't work, try again
                    if (
                        item.status === ItemStatus.PROCESSING_COMPLETE ||
                        item.status === ItemStatus.PROCESSING_REVERT_ERROR
                    ) {
                        item.revert(
                            createRevertFunction(
                                state.options.server.url,
                                state.options.server.revert
                            ),
                            query('GET_FORCE_REVERT')
                        )
                            .then(process)
                            .catch(function() {}); // don't continue with processing if something went wrong
                    } else if (item.status === ItemStatus.PROCESSING) {
                        item.abortProcessing().then(process);
                    }

                    return;
                }

                // already queued for processing
                if (item.status === ItemStatus.PROCESSING_QUEUED) return;

                item.requestProcessing();

                dispatch('DID_REQUEST_ITEM_PROCESSING', { id: item.id });

                dispatch('PROCESS_ITEM', { query: item, success: success, failure: failure }, true);
            }),

            PROCESS_ITEM: getItemByQueryFromState(state, function(item, success, failure) {
                var maxParallelUploads = query('GET_MAX_PARALLEL_UPLOADS');
                var totalCurrentUploads = query('GET_ITEMS_BY_STATUS', ItemStatus.PROCESSING)
                    .length;

                // queue and wait till queue is freed up
                if (totalCurrentUploads === maxParallelUploads) {
                    // queue for later processing
                    state.processingQueue.push({
                        id: item.id,
                        success: success,
                        failure: failure,
                    });

                    // stop it!
                    return;
                }

                // if was not queued or is already processing exit here
                if (item.status === ItemStatus.PROCESSING) return;

                var processNext = function processNext() {
                    // process queueud items
                    var queueEntry = state.processingQueue.shift();

                    // no items left
                    if (!queueEntry) return;

                    // get item reference
                    var id = queueEntry.id,
                        success = queueEntry.success,
                        failure = queueEntry.failure;
                    var itemReference = getItemByQuery(state.items, id);

                    // if item was archived while in queue, jump to next
                    if (!itemReference || itemReference.archived) {
                        processNext();
                        return;
                    }

                    // process queued item
                    dispatch(
                        'PROCESS_ITEM',
                        { query: id, success: success, failure: failure },
                        true
                    );
                };

                // we done function
                item.onOnce('process-complete', function() {
                    success(createItemAPI(item));
                    processNext();

                    // if origin is local, and we're instant uploading, trigger remove of original
                    // as revert will remove file from list
                    var server = state.options.server;
                    var instantUpload = state.options.instantUpload;
                    if (
                        instantUpload &&
                        item.origin === FileOrigin.LOCAL &&
                        isFunction(server.remove)
                    ) {
                        var noop = function noop() {};
                        item.origin = FileOrigin.LIMBO;
                        state.options.server.remove(item.source, noop, noop);
                    }

                    // All items processed? No errors?
                    var allItemsProcessed =
                        query('GET_ITEMS_BY_STATUS', ItemStatus.PROCESSING_COMPLETE).length ===
                        state.items.length;
                    if (allItemsProcessed) {
                        dispatch('DID_COMPLETE_ITEM_PROCESSING_ALL');
                    }
                });

                // we error function
                item.onOnce('process-error', function(error) {
                    failure({ error: error, file: createItemAPI(item) });
                    processNext();
                });

                // start file processing
                var options = state.options;
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
                        ),

                        {
                            allowMinimumUploadDuration: query('GET_ALLOW_MINIMUM_UPLOAD_DURATION'),
                        }
                    ),

                    // called when the file is about to be processed so it can be piped through the transform filters
                    function(file, success, error) {
                        // allow plugins to alter the file data
                        applyFilterChain('PREPARE_OUTPUT', file, { query: query, item: item })
                            .then(function(file) {
                                dispatch('DID_PREPARE_OUTPUT', { id: item.id, file: file });

                                success(file);
                            })
                            .catch(error);
                    }
                );
            }),

            RETRY_ITEM_PROCESSING: getItemByQueryFromState(state, function(item) {
                dispatch('REQUEST_ITEM_PROCESSING', { query: item });
            }),

            REQUEST_REMOVE_ITEM: getItemByQueryFromState(state, function(item) {
                optionalPromise(query('GET_BEFORE_REMOVE_FILE'), createItemAPI(item)).then(function(
                    shouldRemove
                ) {
                    if (!shouldRemove) {
                        return;
                    }
                    dispatch('REMOVE_ITEM', { query: item });
                });
            }),

            RELEASE_ITEM: getItemByQueryFromState(state, function(item) {
                item.release();
            }),

            REMOVE_ITEM: getItemByQueryFromState(state, function(item, success, failure, options) {
                var removeFromView = function removeFromView() {
                    // get id reference
                    var id = item.id;

                    // archive the item, this does not remove it from the list
                    getItemById(state.items, id).archive();

                    // tell the view the item has been removed
                    dispatch('DID_REMOVE_ITEM', { error: null, id: id, item: item });

                    // now the list has been modified
                    listUpdated(dispatch, state);

                    // correctly removed
                    success(createItemAPI(item));
                };

                // if this is a local file and the `server.remove` function has been configured,
                // send source there so dev can remove file from server
                var server = state.options.server;
                if (
                    item.origin === FileOrigin.LOCAL &&
                    server &&
                    isFunction(server.remove) &&
                    options.remove !== false
                ) {
                    dispatch('DID_START_ITEM_REMOVE', { id: item.id });

                    server.remove(
                        item.source,
                        function() {
                            return removeFromView();
                        },
                        function(status) {
                            dispatch('DID_THROW_ITEM_REMOVE_ERROR', {
                                id: item.id,
                                error: createResponse('error', 0, status, null),
                                status: {
                                    main: dynamicLabel(state.options.labelFileRemoveError)(status),
                                    sub: state.options.labelTapToRetry,
                                },
                            });
                        }
                    );
                } else {
                    // if is requesting revert and can revert need to call revert handler (not calling request_ because that would also trigger beforeRemoveHook)
                    if (
                        (options.revert &&
                            item.origin !== FileOrigin.LOCAL &&
                            item.serverId !== null) ||
                        // if chunked uploads are enabled and we're uploading in chunks for this specific file
                        // or if the file isn't big enough for chunked uploads but chunkForce is set then call
                        // revert before removing from the view...
                        (state.options.chunkUploads && item.file.size > state.options.chunkSize) ||
                        (state.options.chunkUploads && state.options.chunkForce)
                    ) {
                        item.revert(
                            createRevertFunction(
                                state.options.server.url,
                                state.options.server.revert
                            ),
                            query('GET_FORCE_REVERT')
                        );
                    }

                    // can now safely remove from view
                    removeFromView();
                }
            }),

            ABORT_ITEM_LOAD: getItemByQueryFromState(state, function(item) {
                item.abortLoad();
            }),

            ABORT_ITEM_PROCESSING: getItemByQueryFromState(state, function(item) {
                // test if is already processed
                if (item.serverId) {
                    dispatch('REVERT_ITEM_PROCESSING', { id: item.id });
                    return;
                }

                // abort
                item.abortProcessing().then(function() {
                    var shouldRemove = state.options.instantUpload;
                    if (shouldRemove) {
                        dispatch('REMOVE_ITEM', { query: item.id });
                    }
                });
            }),

            REQUEST_REVERT_ITEM_PROCESSING: getItemByQueryFromState(state, function(item) {
                // not instant uploading, revert immediately
                if (!state.options.instantUpload) {
                    dispatch('REVERT_ITEM_PROCESSING', { query: item });
                    return;
                }

                // if we're instant uploading the file will also be removed if we revert,
                // so if a before remove file hook is defined we need to run it now
                var handleRevert = function handleRevert(shouldRevert) {
                    if (!shouldRevert) return;
                    dispatch('REVERT_ITEM_PROCESSING', { query: item });
                };

                var fn = query('GET_BEFORE_REMOVE_FILE');
                if (!fn) {
                    return handleRevert(true);
                }

                var requestRemoveResult = fn(createItemAPI(item));
                if (requestRemoveResult == null) {
                    // undefined or null
                    return handleRevert(true);
                }

                if (typeof requestRemoveResult === 'boolean') {
                    return handleRevert(requestRemoveResult);
                }

                if (typeof requestRemoveResult.then === 'function') {
                    requestRemoveResult.then(handleRevert);
                }
            }),

            REVERT_ITEM_PROCESSING: getItemByQueryFromState(state, function(item) {
                item.revert(
                    createRevertFunction(state.options.server.url, state.options.server.revert),
                    query('GET_FORCE_REVERT')
                )
                    .then(function() {
                        var shouldRemove = state.options.instantUpload || isMockItem(item);
                        if (shouldRemove) {
                            dispatch('REMOVE_ITEM', { query: item.id });
                        }
                    })
                    .catch(function() {});
            }),

            SET_OPTIONS: function SET_OPTIONS(_ref11) {
                var options = _ref11.options;
                // get all keys passed
                var optionKeys = Object.keys(options);

                // get prioritized keyed to include (remove once not in options object)
                var prioritizedOptionKeys = PrioritizedOptions.filter(function(key) {
                    return optionKeys.includes(key);
                });

                // order the keys, prioritized first, then rest
                var orderedOptionKeys = [].concat(
                    _toConsumableArray(prioritizedOptionKeys),
                    _toConsumableArray(
                        Object.keys(options).filter(function(key) {
                            return !prioritizedOptionKeys.includes(key);
                        })
                    )
                );

                // dispatch set event for each option
                orderedOptionKeys.forEach(function(key) {
                    dispatch('SET_' + fromCamels(key, '_').toUpperCase(), {
                        value: options[key],
                    });
                });
            },
        };
    };

    var PrioritizedOptions = ['server'];

    var formatFilename = function formatFilename(name) {
        return name;
    };

    var createElement$1 = function createElement(tagName) {
        return document.createElement(tagName);
    };

    var text = function text(node, value) {
        var textNode = node.childNodes[0];
        if (!textNode) {
            textNode = document.createTextNode(value);
            node.appendChild(textNode);
        } else if (value !== textNode.nodeValue) {
            textNode.nodeValue = value;
        }
    };

    var polarToCartesian = function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = (((angleInDegrees % 360) - 90) * Math.PI) / 180.0;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    };

    var describeArc = function describeArc(x, y, radius, startAngle, endAngle, arcSweep) {
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);
        return ['M', start.x, start.y, 'A', radius, radius, 0, arcSweep, 0, end.x, end.y].join(' ');
    };

    var percentageArc = function percentageArc(x, y, radius, from, to) {
        var arcSweep = 1;
        if (to > from && to - from <= 0.5) {
            arcSweep = 0;
        }
        if (from > to && from - to >= 0.5) {
            arcSweep = 0;
        }
        return describeArc(
            x,
            y,
            radius,
            Math.min(0.9999, from) * 360,
            Math.min(0.9999, to) * 360,
            arcSweep
        );
    };

    var create = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        // start at 0
        props.spin = false;
        props.progress = 0;
        props.opacity = 0;

        // svg
        var svg = createElement('svg');
        root.ref.path = createElement('path', {
            'stroke-width': 2,
            'stroke-linecap': 'round',
        });

        svg.appendChild(root.ref.path);

        root.ref.svg = svg;

        root.appendChild(svg);
    };

    var write = function write(_ref2) {
        var root = _ref2.root,
            props = _ref2.props;
        if (props.opacity === 0) {
            return;
        }

        if (props.align) {
            root.element.dataset.align = props.align;
        }

        // get width of stroke
        var ringStrokeWidth = parseInt(attr(root.ref.path, 'stroke-width'), 10);

        // calculate size of ring
        var size = root.rect.element.width * 0.5;

        // ring state
        var ringFrom = 0;
        var ringTo = 0;

        // now in busy mode
        if (props.spin) {
            ringFrom = 0;
            ringTo = 0.5;
        } else {
            ringFrom = 0;
            ringTo = props.progress;
        }

        // get arc path
        var coordinates = percentageArc(size, size, size - ringStrokeWidth, ringFrom, ringTo);

        // update progress bar
        attr(root.ref.path, 'd', coordinates);

        // hide while contains 0 value
        attr(root.ref.path, 'stroke-opacity', props.spin || props.progress > 0 ? 1 : 0);
    };

    var progressIndicator = createView({
        tag: 'div',
        name: 'progress-indicator',
        ignoreRectUpdate: true,
        ignoreRect: true,
        create: create,
        write: write,
        mixins: {
            apis: ['progress', 'spin', 'align'],
            styles: ['opacity'],
            animations: {
                opacity: { type: 'tween', duration: 500 },
                progress: {
                    type: 'spring',
                    stiffness: 0.95,
                    damping: 0.65,
                    mass: 10,
                },
            },
        },
    });

    var create$1 = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        root.element.innerHTML = (props.icon || '') + ('<span>' + props.label + '</span>');

        props.isDisabled = false;
    };

    var write$1 = function write(_ref2) {
        var root = _ref2.root,
            props = _ref2.props;
        var isDisabled = props.isDisabled;
        var shouldDisable = root.query('GET_DISABLED') || props.opacity === 0;

        if (shouldDisable && !isDisabled) {
            props.isDisabled = true;
            attr(root.element, 'disabled', 'disabled');
        } else if (!shouldDisable && isDisabled) {
            props.isDisabled = false;
            root.element.removeAttribute('disabled');
        }
    };

    var fileActionButton = createView({
        tag: 'button',
        attributes: {
            type: 'button',
        },

        ignoreRect: true,
        ignoreRectUpdate: true,
        name: 'file-action-button',
        mixins: {
            apis: ['label'],
            styles: ['translateX', 'translateY', 'scaleX', 'scaleY', 'opacity'],
            animations: {
                scaleX: 'spring',
                scaleY: 'spring',
                translateX: 'spring',
                translateY: 'spring',
                opacity: { type: 'tween', duration: 250 },
            },

            listeners: true,
        },

        create: create$1,
        write: write$1,
    });

    var toNaturalFileSize = function toNaturalFileSize(bytes) {
        var decimalSeparator =
            arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '.';
        var base = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;
        var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
        var _options$labelBytes = options.labelBytes,
            labelBytes = _options$labelBytes === void 0 ? 'bytes' : _options$labelBytes,
            _options$labelKilobyt = options.labelKilobytes,
            labelKilobytes = _options$labelKilobyt === void 0 ? 'KB' : _options$labelKilobyt,
            _options$labelMegabyt = options.labelMegabytes,
            labelMegabytes = _options$labelMegabyt === void 0 ? 'MB' : _options$labelMegabyt,
            _options$labelGigabyt = options.labelGigabytes,
            labelGigabytes = _options$labelGigabyt === void 0 ? 'GB' : _options$labelGigabyt;

        // no negative byte sizes
        bytes = Math.round(Math.abs(bytes));

        var KB = base;
        var MB = base * base;
        var GB = base * base * base;

        // just bytes
        if (bytes < KB) {
            return bytes + ' ' + labelBytes;
        }

        // kilobytes
        if (bytes < MB) {
            return Math.floor(bytes / KB) + ' ' + labelKilobytes;
        }

        // megabytes
        if (bytes < GB) {
            return removeDecimalsWhenZero(bytes / MB, 1, decimalSeparator) + ' ' + labelMegabytes;
        }

        // gigabytes
        return removeDecimalsWhenZero(bytes / GB, 2, decimalSeparator) + ' ' + labelGigabytes;
    };

    var removeDecimalsWhenZero = function removeDecimalsWhenZero(value, decimalCount, separator) {
        return value
            .toFixed(decimalCount)
            .split('.')
            .filter(function(part) {
                return part !== '0';
            })
            .join(separator);
    };

    var create$2 = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        // filename
        var fileName = createElement$1('span');
        fileName.className = 'filepond--file-info-main';
        // hide for screenreaders
        // the file is contained in a fieldset with legend that contains the filename
        // no need to read it twice
        attr(fileName, 'aria-hidden', 'true');
        root.appendChild(fileName);
        root.ref.fileName = fileName;

        // filesize
        var fileSize = createElement$1('span');
        fileSize.className = 'filepond--file-info-sub';
        root.appendChild(fileSize);
        root.ref.fileSize = fileSize;

        // set initial values
        text(fileSize, root.query('GET_LABEL_FILE_WAITING_FOR_SIZE'));
        text(fileName, formatFilename(root.query('GET_ITEM_NAME', props.id)));
    };

    var updateFile = function updateFile(_ref2) {
        var root = _ref2.root,
            props = _ref2.props;
        text(
            root.ref.fileSize,
            toNaturalFileSize(
                root.query('GET_ITEM_SIZE', props.id),
                '.',
                root.query('GET_FILE_SIZE_BASE'),
                root.query('GET_FILE_SIZE_LABELS', root.query)
            )
        );

        text(root.ref.fileName, formatFilename(root.query('GET_ITEM_NAME', props.id)));
    };

    var updateFileSizeOnError = function updateFileSizeOnError(_ref3) {
        var root = _ref3.root,
            props = _ref3.props;
        // if size is available don't fallback to unknown size message
        if (isInt(root.query('GET_ITEM_SIZE', props.id))) {
            updateFile({ root: root, props: props });
            return;
        }

        text(root.ref.fileSize, root.query('GET_LABEL_FILE_SIZE_NOT_AVAILABLE'));
    };

    var fileInfo = createView({
        name: 'file-info',
        ignoreRect: true,
        ignoreRectUpdate: true,
        write: createRoute({
            DID_LOAD_ITEM: updateFile,
            DID_UPDATE_ITEM_META: updateFile,
            DID_THROW_ITEM_LOAD_ERROR: updateFileSizeOnError,
            DID_THROW_ITEM_INVALID: updateFileSizeOnError,
        }),

        didCreateView: function didCreateView(root) {
            applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
        },
        create: create$2,
        mixins: {
            styles: ['translateX', 'translateY'],
            animations: {
                translateX: 'spring',
                translateY: 'spring',
            },
        },
    });

    var toPercentage = function toPercentage(value) {
        return Math.round(value * 100);
    };

    var create$3 = function create(_ref) {
        var root = _ref.root;

        // main status
        var main = createElement$1('span');
        main.className = 'filepond--file-status-main';
        root.appendChild(main);
        root.ref.main = main;

        // sub status
        var sub = createElement$1('span');
        sub.className = 'filepond--file-status-sub';
        root.appendChild(sub);
        root.ref.sub = sub;

        didSetItemLoadProgress({ root: root, action: { progress: null } });
    };

    var didSetItemLoadProgress = function didSetItemLoadProgress(_ref2) {
        var root = _ref2.root,
            action = _ref2.action;
        var title =
            action.progress === null
                ? root.query('GET_LABEL_FILE_LOADING')
                : root.query('GET_LABEL_FILE_LOADING') + ' ' + toPercentage(action.progress) + '%';

        text(root.ref.main, title);
        text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
    };

    var didSetItemProcessProgress = function didSetItemProcessProgress(_ref3) {
        var root = _ref3.root,
            action = _ref3.action;
        var title =
            action.progress === null
                ? root.query('GET_LABEL_FILE_PROCESSING')
                : root.query('GET_LABEL_FILE_PROCESSING') +
                  ' ' +
                  toPercentage(action.progress) +
                  '%';

        text(root.ref.main, title);
        text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
    };

    var didRequestItemProcessing = function didRequestItemProcessing(_ref4) {
        var root = _ref4.root;
        text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING'));
        text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
    };

    var didAbortItemProcessing = function didAbortItemProcessing(_ref5) {
        var root = _ref5.root;
        text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING_ABORTED'));
        text(root.ref.sub, root.query('GET_LABEL_TAP_TO_RETRY'));
    };

    var didCompleteItemProcessing = function didCompleteItemProcessing(_ref6) {
        var root = _ref6.root;
        text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING_COMPLETE'));
        text(root.ref.sub, root.query('GET_LABEL_TAP_TO_UNDO'));
    };

    var clear = function clear(_ref7) {
        var root = _ref7.root;
        text(root.ref.main, '');
        text(root.ref.sub, '');
    };

    var error = function error(_ref8) {
        var root = _ref8.root,
            action = _ref8.action;
        text(root.ref.main, action.status.main);
        text(root.ref.sub, action.status.sub);
    };

    var fileStatus = createView({
        name: 'file-status',
        ignoreRect: true,
        ignoreRectUpdate: true,
        write: createRoute({
            DID_LOAD_ITEM: clear,
            DID_REVERT_ITEM_PROCESSING: clear,
            DID_REQUEST_ITEM_PROCESSING: didRequestItemProcessing,
            DID_ABORT_ITEM_PROCESSING: didAbortItemProcessing,
            DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing,
            DID_UPDATE_ITEM_PROCESS_PROGRESS: didSetItemProcessProgress,
            DID_UPDATE_ITEM_LOAD_PROGRESS: didSetItemLoadProgress,
            DID_THROW_ITEM_LOAD_ERROR: error,
            DID_THROW_ITEM_INVALID: error,
            DID_THROW_ITEM_PROCESSING_ERROR: error,
            DID_THROW_ITEM_PROCESSING_REVERT_ERROR: error,
            DID_THROW_ITEM_REMOVE_ERROR: error,
        }),

        didCreateView: function didCreateView(root) {
            applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
        },
        create: create$3,
        mixins: {
            styles: ['translateX', 'translateY', 'opacity'],
            animations: {
                opacity: { type: 'tween', duration: 250 },
                translateX: 'spring',
                translateY: 'spring',
            },
        },
    });

    /**
     * Button definitions for the file view
     */

    var Buttons = {
        AbortItemLoad: {
            label: 'GET_LABEL_BUTTON_ABORT_ITEM_LOAD',
            action: 'ABORT_ITEM_LOAD',
            className: 'filepond--action-abort-item-load',
            align: 'LOAD_INDICATOR_POSITION', // right
        },
        RetryItemLoad: {
            label: 'GET_LABEL_BUTTON_RETRY_ITEM_LOAD',
            action: 'RETRY_ITEM_LOAD',
            icon: 'GET_ICON_RETRY',
            className: 'filepond--action-retry-item-load',
            align: 'BUTTON_PROCESS_ITEM_POSITION', // right
        },
        RemoveItem: {
            label: 'GET_LABEL_BUTTON_REMOVE_ITEM',
            action: 'REQUEST_REMOVE_ITEM',
            icon: 'GET_ICON_REMOVE',
            className: 'filepond--action-remove-item',
            align: 'BUTTON_REMOVE_ITEM_POSITION', // left
        },
        ProcessItem: {
            label: 'GET_LABEL_BUTTON_PROCESS_ITEM',
            action: 'REQUEST_ITEM_PROCESSING',
            icon: 'GET_ICON_PROCESS',
            className: 'filepond--action-process-item',
            align: 'BUTTON_PROCESS_ITEM_POSITION', // right
        },
        AbortItemProcessing: {
            label: 'GET_LABEL_BUTTON_ABORT_ITEM_PROCESSING',
            action: 'ABORT_ITEM_PROCESSING',
            className: 'filepond--action-abort-item-processing',
            align: 'BUTTON_PROCESS_ITEM_POSITION', // right
        },
        RetryItemProcessing: {
            label: 'GET_LABEL_BUTTON_RETRY_ITEM_PROCESSING',
            action: 'RETRY_ITEM_PROCESSING',
            icon: 'GET_ICON_RETRY',
            className: 'filepond--action-retry-item-processing',
            align: 'BUTTON_PROCESS_ITEM_POSITION', // right
        },
        RevertItemProcessing: {
            label: 'GET_LABEL_BUTTON_UNDO_ITEM_PROCESSING',
            action: 'REQUEST_REVERT_ITEM_PROCESSING',
            icon: 'GET_ICON_UNDO',
            className: 'filepond--action-revert-item-processing',
            align: 'BUTTON_PROCESS_ITEM_POSITION', // right
        },
    };

    // make a list of buttons, we can then remove buttons from this list if they're disabled
    var ButtonKeys = [];
    forin(Buttons, function(key) {
        ButtonKeys.push(key);
    });

    var calculateFileInfoOffset = function calculateFileInfoOffset(root) {
        if (getRemoveIndicatorAligment(root) === 'right') return 0;
        var buttonRect = root.ref.buttonRemoveItem.rect.element;
        return buttonRect.hidden ? null : buttonRect.width + buttonRect.left;
    };

    var calculateButtonWidth = function calculateButtonWidth(root) {
        var buttonRect = root.ref.buttonAbortItemLoad.rect.element;
        return buttonRect.width;
    };

    // Force on full pixels so text stays crips
    var calculateFileVerticalCenterOffset = function calculateFileVerticalCenterOffset(root) {
        return Math.floor(root.ref.buttonRemoveItem.rect.element.height / 4);
    };
    var calculateFileHorizontalCenterOffset = function calculateFileHorizontalCenterOffset(root) {
        return Math.floor(root.ref.buttonRemoveItem.rect.element.left / 2);
    };

    var getLoadIndicatorAlignment = function getLoadIndicatorAlignment(root) {
        return root.query('GET_STYLE_LOAD_INDICATOR_POSITION');
    };
    var getProcessIndicatorAlignment = function getProcessIndicatorAlignment(root) {
        return root.query('GET_STYLE_PROGRESS_INDICATOR_POSITION');
    };
    var getRemoveIndicatorAligment = function getRemoveIndicatorAligment(root) {
        return root.query('GET_STYLE_BUTTON_REMOVE_ITEM_POSITION');
    };

    var DefaultStyle = {
        buttonAbortItemLoad: { opacity: 0 },
        buttonRetryItemLoad: { opacity: 0 },
        buttonRemoveItem: { opacity: 0 },
        buttonProcessItem: { opacity: 0 },
        buttonAbortItemProcessing: { opacity: 0 },
        buttonRetryItemProcessing: { opacity: 0 },
        buttonRevertItemProcessing: { opacity: 0 },
        loadProgressIndicator: { opacity: 0, align: getLoadIndicatorAlignment },
        processProgressIndicator: { opacity: 0, align: getProcessIndicatorAlignment },
        processingCompleteIndicator: { opacity: 0, scaleX: 0.75, scaleY: 0.75 },
        info: { translateX: 0, translateY: 0, opacity: 0 },
        status: { translateX: 0, translateY: 0, opacity: 0 },
    };

    var IdleStyle = {
        buttonRemoveItem: { opacity: 1 },
        buttonProcessItem: { opacity: 1 },
        info: { translateX: calculateFileInfoOffset },
        status: { translateX: calculateFileInfoOffset },
    };

    var ProcessingStyle = {
        buttonAbortItemProcessing: { opacity: 1 },
        processProgressIndicator: { opacity: 1 },
        status: { opacity: 1 },
    };

    var StyleMap = {
        DID_THROW_ITEM_INVALID: {
            buttonRemoveItem: { opacity: 1 },
            info: { translateX: calculateFileInfoOffset },
            status: { translateX: calculateFileInfoOffset, opacity: 1 },
        },

        DID_START_ITEM_LOAD: {
            buttonAbortItemLoad: { opacity: 1 },
            loadProgressIndicator: { opacity: 1 },
            status: { opacity: 1 },
        },

        DID_THROW_ITEM_LOAD_ERROR: {
            buttonRetryItemLoad: { opacity: 1 },
            buttonRemoveItem: { opacity: 1 },
            info: { translateX: calculateFileInfoOffset },
            status: { opacity: 1 },
        },

        DID_START_ITEM_REMOVE: {
            processProgressIndicator: { opacity: 1, align: getRemoveIndicatorAligment },
            info: { translateX: calculateFileInfoOffset },
            status: { opacity: 0 },
        },

        DID_THROW_ITEM_REMOVE_ERROR: {
            processProgressIndicator: { opacity: 0, align: getRemoveIndicatorAligment },
            buttonRemoveItem: { opacity: 1 },
            info: { translateX: calculateFileInfoOffset },
            status: { opacity: 1, translateX: calculateFileInfoOffset },
        },

        DID_LOAD_ITEM: IdleStyle,
        DID_LOAD_LOCAL_ITEM: {
            buttonRemoveItem: { opacity: 1 },
            info: { translateX: calculateFileInfoOffset },
            status: { translateX: calculateFileInfoOffset },
        },

        DID_START_ITEM_PROCESSING: ProcessingStyle,
        DID_REQUEST_ITEM_PROCESSING: ProcessingStyle,
        DID_UPDATE_ITEM_PROCESS_PROGRESS: ProcessingStyle,
        DID_COMPLETE_ITEM_PROCESSING: {
            buttonRevertItemProcessing: { opacity: 1 },
            info: { opacity: 1 },
            status: { opacity: 1 },
        },

        DID_THROW_ITEM_PROCESSING_ERROR: {
            buttonRemoveItem: { opacity: 1 },
            buttonRetryItemProcessing: { opacity: 1 },
            status: { opacity: 1 },
            info: { translateX: calculateFileInfoOffset },
        },

        DID_THROW_ITEM_PROCESSING_REVERT_ERROR: {
            buttonRevertItemProcessing: { opacity: 1 },
            status: { opacity: 1 },
            info: { opacity: 1 },
        },

        DID_ABORT_ITEM_PROCESSING: {
            buttonRemoveItem: { opacity: 1 },
            buttonProcessItem: { opacity: 1 },
            info: { translateX: calculateFileInfoOffset },
            status: { opacity: 1 },
        },

        DID_REVERT_ITEM_PROCESSING: IdleStyle,
    };

    // complete indicator view
    var processingCompleteIndicatorView = createView({
        create: function create(_ref) {
            var root = _ref.root;
            root.element.innerHTML = root.query('GET_ICON_DONE');
        },
        name: 'processing-complete-indicator',
        ignoreRect: true,
        mixins: {
            styles: ['scaleX', 'scaleY', 'opacity'],
            animations: {
                scaleX: 'spring',
                scaleY: 'spring',
                opacity: { type: 'tween', duration: 250 },
            },
        },
    });

    /**
     * Creates the file view
     */
    var create$4 = function create(_ref2) {
        var root = _ref2.root,
            props = _ref2.props;
        // copy Buttons object
        var LocalButtons = Object.keys(Buttons).reduce(function(prev, curr) {
            prev[curr] = Object.assign({}, Buttons[curr]);
            return prev;
        }, {});
        var id = props.id;

        // allow reverting upload
        var allowRevert = root.query('GET_ALLOW_REVERT');

        // allow remove file
        var allowRemove = root.query('GET_ALLOW_REMOVE');

        // allow processing upload
        var allowProcess = root.query('GET_ALLOW_PROCESS');

        // is instant uploading, need this to determine the icon of the undo button
        var instantUpload = root.query('GET_INSTANT_UPLOAD');

        // is async set up
        var isAsync = root.query('IS_ASYNC');

        // should align remove item buttons
        var alignRemoveItemButton = root.query('GET_STYLE_BUTTON_REMOVE_ITEM_ALIGN');

        // enabled buttons array
        var buttonFilter;
        if (isAsync) {
            if (allowProcess && !allowRevert) {
                // only remove revert button
                buttonFilter = function buttonFilter(key) {
                    return !/RevertItemProcessing/.test(key);
                };
            } else if (!allowProcess && allowRevert) {
                // only remove process button
                buttonFilter = function buttonFilter(key) {
                    return !/ProcessItem|RetryItemProcessing|AbortItemProcessing/.test(key);
                };
            } else if (!allowProcess && !allowRevert) {
                // remove all process buttons
                buttonFilter = function buttonFilter(key) {
                    return !/Process/.test(key);
                };
            }
        } else {
            // no process controls available
            buttonFilter = function buttonFilter(key) {
                return !/Process/.test(key);
            };
        }

        var enabledButtons = buttonFilter ? ButtonKeys.filter(buttonFilter) : ButtonKeys.concat();

        // update icon and label for revert button when instant uploading
        if (instantUpload && allowRevert) {
            LocalButtons['RevertItemProcessing'].label = 'GET_LABEL_BUTTON_REMOVE_ITEM';
            LocalButtons['RevertItemProcessing'].icon = 'GET_ICON_REMOVE';
        }

        // remove last button (revert) if not allowed
        if (isAsync && !allowRevert) {
            var map = StyleMap['DID_COMPLETE_ITEM_PROCESSING'];
            map.info.translateX = calculateFileHorizontalCenterOffset;
            map.info.translateY = calculateFileVerticalCenterOffset;
            map.status.translateY = calculateFileVerticalCenterOffset;
            map.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
        }

        // should align center
        if (isAsync && !allowProcess) {
            [
                'DID_START_ITEM_PROCESSING',
                'DID_REQUEST_ITEM_PROCESSING',
                'DID_UPDATE_ITEM_PROCESS_PROGRESS',
                'DID_THROW_ITEM_PROCESSING_ERROR',
            ].forEach(function(key) {
                StyleMap[key].status.translateY = calculateFileVerticalCenterOffset;
            });
            StyleMap['DID_THROW_ITEM_PROCESSING_ERROR'].status.translateX = calculateButtonWidth;
        }

        // move remove button to right
        if (alignRemoveItemButton && allowRevert) {
            LocalButtons['RevertItemProcessing'].align = 'BUTTON_REMOVE_ITEM_POSITION';
            var _map = StyleMap['DID_COMPLETE_ITEM_PROCESSING'];
            _map.info.translateX = calculateFileInfoOffset;
            _map.status.translateY = calculateFileVerticalCenterOffset;
            _map.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
        }

        // show/hide RemoveItem button
        if (!allowRemove) {
            LocalButtons['RemoveItem'].disabled = true;
        }

        // create the button views
        forin(LocalButtons, function(key, definition) {
            // create button
            var buttonView = root.createChildView(fileActionButton, {
                label: root.query(definition.label),
                icon: root.query(definition.icon),
                opacity: 0,
            });

            // should be appended?
            if (enabledButtons.includes(key)) {
                root.appendChildView(buttonView);
            }

            // toggle
            if (definition.disabled) {
                buttonView.element.setAttribute('disabled', 'disabled');
                buttonView.element.setAttribute('hidden', 'hidden');
            }

            // add position attribute
            buttonView.element.dataset.align = root.query('GET_STYLE_' + definition.align);

            // add class
            buttonView.element.classList.add(definition.className);

            // handle interactions
            buttonView.on('click', function(e) {
                e.stopPropagation();
                if (definition.disabled) return;
                root.dispatch(definition.action, { query: id });
            });

            // set reference
            root.ref['button' + key] = buttonView;
        });

        // checkmark
        root.ref.processingCompleteIndicator = root.appendChildView(
            root.createChildView(processingCompleteIndicatorView)
        );

        root.ref.processingCompleteIndicator.element.dataset.align = root.query(
            'GET_STYLE_BUTTON_PROCESS_ITEM_POSITION'
        );

        // create file info view
        root.ref.info = root.appendChildView(root.createChildView(fileInfo, { id: id }));

        // create file status view
        root.ref.status = root.appendChildView(root.createChildView(fileStatus, { id: id }));

        // add progress indicators
        var loadIndicatorView = root.appendChildView(
            root.createChildView(progressIndicator, {
                opacity: 0,
                align: root.query('GET_STYLE_LOAD_INDICATOR_POSITION'),
            })
        );

        loadIndicatorView.element.classList.add('filepond--load-indicator');
        root.ref.loadProgressIndicator = loadIndicatorView;

        var progressIndicatorView = root.appendChildView(
            root.createChildView(progressIndicator, {
                opacity: 0,
                align: root.query('GET_STYLE_PROGRESS_INDICATOR_POSITION'),
            })
        );

        progressIndicatorView.element.classList.add('filepond--process-indicator');
        root.ref.processProgressIndicator = progressIndicatorView;

        // current active styles
        root.ref.activeStyles = [];
    };

    var write$2 = function write(_ref3) {
        var root = _ref3.root,
            actions = _ref3.actions,
            props = _ref3.props;
        // route actions
        route({ root: root, actions: actions, props: props });

        // select last state change action
        var action = actions
            .concat()
            .filter(function(action) {
                return /^DID_/.test(action.type);
            })
            .reverse()
            .find(function(action) {
                return StyleMap[action.type];
            });

        // a new action happened, let's get the matching styles
        if (action) {
            // define new active styles
            root.ref.activeStyles = [];

            var stylesToApply = StyleMap[action.type];
            forin(DefaultStyle, function(name, defaultStyles) {
                // get reference to control
                var control = root.ref[name];

                // loop over all styles for this control
                forin(defaultStyles, function(key, defaultValue) {
                    var value =
                        stylesToApply[name] && typeof stylesToApply[name][key] !== 'undefined'
                            ? stylesToApply[name][key]
                            : defaultValue;
                    root.ref.activeStyles.push({ control: control, key: key, value: value });
                });
            });
        }

        // apply active styles to element
        root.ref.activeStyles.forEach(function(_ref4) {
            var control = _ref4.control,
                key = _ref4.key,
                value = _ref4.value;
            control[key] = typeof value === 'function' ? value(root) : value;
        });
    };

    var route = createRoute({
        DID_SET_LABEL_BUTTON_ABORT_ITEM_PROCESSING: function DID_SET_LABEL_BUTTON_ABORT_ITEM_PROCESSING(
            _ref5
        ) {
            var root = _ref5.root,
                action = _ref5.action;
            root.ref.buttonAbortItemProcessing.label = action.value;
        },
        DID_SET_LABEL_BUTTON_ABORT_ITEM_LOAD: function DID_SET_LABEL_BUTTON_ABORT_ITEM_LOAD(_ref6) {
            var root = _ref6.root,
                action = _ref6.action;
            root.ref.buttonAbortItemLoad.label = action.value;
        },
        DID_SET_LABEL_BUTTON_ABORT_ITEM_REMOVAL: function DID_SET_LABEL_BUTTON_ABORT_ITEM_REMOVAL(
            _ref7
        ) {
            var root = _ref7.root,
                action = _ref7.action;
            root.ref.buttonAbortItemRemoval.label = action.value;
        },
        DID_REQUEST_ITEM_PROCESSING: function DID_REQUEST_ITEM_PROCESSING(_ref8) {
            var root = _ref8.root;
            root.ref.processProgressIndicator.spin = true;
            root.ref.processProgressIndicator.progress = 0;
        },
        DID_START_ITEM_LOAD: function DID_START_ITEM_LOAD(_ref9) {
            var root = _ref9.root;
            root.ref.loadProgressIndicator.spin = true;
            root.ref.loadProgressIndicator.progress = 0;
        },
        DID_START_ITEM_REMOVE: function DID_START_ITEM_REMOVE(_ref10) {
            var root = _ref10.root;
            root.ref.processProgressIndicator.spin = true;
            root.ref.processProgressIndicator.progress = 0;
        },
        DID_UPDATE_ITEM_LOAD_PROGRESS: function DID_UPDATE_ITEM_LOAD_PROGRESS(_ref11) {
            var root = _ref11.root,
                action = _ref11.action;
            root.ref.loadProgressIndicator.spin = false;
            root.ref.loadProgressIndicator.progress = action.progress;
        },
        DID_UPDATE_ITEM_PROCESS_PROGRESS: function DID_UPDATE_ITEM_PROCESS_PROGRESS(_ref12) {
            var root = _ref12.root,
                action = _ref12.action;
            root.ref.processProgressIndicator.spin = false;
            root.ref.processProgressIndicator.progress = action.progress;
        },
    });

    var file = createView({
        create: create$4,
        write: write$2,
        didCreateView: function didCreateView(root) {
            applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
        },
        name: 'file',
    });

    /**
     * Creates the file view
     */
    var create$5 = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;

        // filename
        root.ref.fileName = createElement$1('legend');
        root.appendChild(root.ref.fileName);

        // file appended
        root.ref.file = root.appendChildView(root.createChildView(file, { id: props.id }));

        // data has moved to data.js
        root.ref.data = false;
    };

    /**
     * Data storage
     */
    var didLoadItem = function didLoadItem(_ref2) {
        var root = _ref2.root,
            props = _ref2.props;
        // updates the legend of the fieldset so screenreaders can better group buttons
        text(root.ref.fileName, formatFilename(root.query('GET_ITEM_NAME', props.id)));
    };

    var fileWrapper = createView({
        create: create$5,
        ignoreRect: true,
        write: createRoute({
            DID_LOAD_ITEM: didLoadItem,
        }),

        didCreateView: function didCreateView(root) {
            applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
        },
        tag: 'fieldset',
        name: 'file-wrapper',
    });

    var PANEL_SPRING_PROPS = { type: 'spring', damping: 0.6, mass: 7 };

    var create$6 = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        [
            {
                name: 'top',
            },

            {
                name: 'center',
                props: {
                    translateY: null,
                    scaleY: null,
                },

                mixins: {
                    animations: {
                        scaleY: PANEL_SPRING_PROPS,
                    },

                    styles: ['translateY', 'scaleY'],
                },
            },

            {
                name: 'bottom',
                props: {
                    translateY: null,
                },

                mixins: {
                    animations: {
                        translateY: PANEL_SPRING_PROPS,
                    },

                    styles: ['translateY'],
                },
            },
        ].forEach(function(section) {
            createSection(root, section, props.name);
        });

        root.element.classList.add('filepond--' + props.name);

        root.ref.scalable = null;
    };

    var createSection = function createSection(root, section, className) {
        var viewConstructor = createView({
            name: 'panel-' + section.name + ' filepond--' + className,
            mixins: section.mixins,
            ignoreRectUpdate: true,
        });

        var view = root.createChildView(viewConstructor, section.props);

        root.ref[section.name] = root.appendChildView(view);
    };

    var write$3 = function write(_ref2) {
        var root = _ref2.root,
            props = _ref2.props;

        // update scalable state
        if (root.ref.scalable === null || props.scalable !== root.ref.scalable) {
            root.ref.scalable = isBoolean(props.scalable) ? props.scalable : true;
            root.element.dataset.scalable = root.ref.scalable;
        }

        // no height, can't set
        if (!props.height) return;

        // get child rects
        var topRect = root.ref.top.rect.element;
        var bottomRect = root.ref.bottom.rect.element;

        // make sure height never is smaller than bottom and top seciton heights combined (will probably never happen, but who knows)
        var height = Math.max(topRect.height + bottomRect.height, props.height);

        // offset center part
        root.ref.center.translateY = topRect.height;

        // scale center part
        // use math ceil to prevent transparent lines because of rounding errors
        root.ref.center.scaleY = (height - topRect.height - bottomRect.height) / 100;

        // offset bottom part
        root.ref.bottom.translateY = height - bottomRect.height;
    };

    var panel = createView({
        name: 'panel',
        read: function read(_ref3) {
            var root = _ref3.root,
                props = _ref3.props;
            return (props.heightCurrent = root.ref.bottom.translateY);
        },
        write: write$3,
        create: create$6,
        ignoreRect: true,
        mixins: {
            apis: ['height', 'heightCurrent', 'scalable'],
        },
    });

    var createDragHelper = function createDragHelper(items) {
        var itemIds = items.map(function(item) {
            return item.id;
        });
        var prevIndex = undefined;
        return {
            setIndex: function setIndex(index) {
                prevIndex = index;
            },
            getIndex: function getIndex() {
                return prevIndex;
            },
            getItemIndex: function getItemIndex(item) {
                return itemIds.indexOf(item.id);
            },
        };
    };

    var ITEM_TRANSLATE_SPRING = {
        type: 'spring',
        stiffness: 0.75,
        damping: 0.45,
        mass: 10,
    };

    var ITEM_SCALE_SPRING = 'spring';

    var StateMap = {
        DID_START_ITEM_LOAD: 'busy',
        DID_UPDATE_ITEM_LOAD_PROGRESS: 'loading',
        DID_THROW_ITEM_INVALID: 'load-invalid',
        DID_THROW_ITEM_LOAD_ERROR: 'load-error',
        DID_LOAD_ITEM: 'idle',
        DID_THROW_ITEM_REMOVE_ERROR: 'remove-error',
        DID_START_ITEM_REMOVE: 'busy',
        DID_START_ITEM_PROCESSING: 'busy processing',
        DID_REQUEST_ITEM_PROCESSING: 'busy processing',
        DID_UPDATE_ITEM_PROCESS_PROGRESS: 'processing',
        DID_COMPLETE_ITEM_PROCESSING: 'processing-complete',
        DID_THROW_ITEM_PROCESSING_ERROR: 'processing-error',
        DID_THROW_ITEM_PROCESSING_REVERT_ERROR: 'processing-revert-error',
        DID_ABORT_ITEM_PROCESSING: 'cancelled',
        DID_REVERT_ITEM_PROCESSING: 'idle',
    };

    /**
     * Creates the file view
     */
    var create$7 = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;

        // select
        root.ref.handleClick = function(e) {
            return root.dispatch('DID_ACTIVATE_ITEM', { id: props.id });
        };

        // set id
        root.element.id = 'filepond--item-' + props.id;
        root.element.addEventListener('click', root.ref.handleClick);

        // file view
        root.ref.container = root.appendChildView(
            root.createChildView(fileWrapper, { id: props.id })
        );

        // file panel
        root.ref.panel = root.appendChildView(root.createChildView(panel, { name: 'item-panel' }));

        // default start height
        root.ref.panel.height = null;

        // by default not marked for removal
        props.markedForRemoval = false;

        // if not allowed to reorder file items, exit here
        if (!root.query('GET_ALLOW_REORDER')) return;

        // set to idle so shows grab cursor
        root.element.dataset.dragState = 'idle';

        var grab = function grab(e) {
            if (!e.isPrimary) return;

            var removedActivateListener = false;

            var origin = {
                x: e.pageX,
                y: e.pageY,
            };

            props.dragOrigin = {
                x: root.translateX,
                y: root.translateY,
            };

            props.dragCenter = {
                x: e.offsetX,
                y: e.offsetY,
            };

            var dragState = createDragHelper(root.query('GET_ACTIVE_ITEMS'));

            root.dispatch('DID_GRAB_ITEM', { id: props.id, dragState: dragState });

            var drag = function drag(e) {
                if (!e.isPrimary) return;

                e.stopPropagation();
                e.preventDefault();

                props.dragOffset = {
                    x: e.pageX - origin.x,
                    y: e.pageY - origin.y,
                };

                // if dragged stop listening to clicks, will re-add when done dragging
                var dist =
                    props.dragOffset.x * props.dragOffset.x +
                    props.dragOffset.y * props.dragOffset.y;
                if (dist > 16 && !removedActivateListener) {
                    removedActivateListener = true;
                    root.element.removeEventListener('click', root.ref.handleClick);
                }

                root.dispatch('DID_DRAG_ITEM', { id: props.id, dragState: dragState });
            };

            var drop = function drop(e) {
                if (!e.isPrimary) return;

                document.removeEventListener('pointermove', drag);
                document.removeEventListener('pointerup', drop);

                props.dragOffset = {
                    x: e.pageX - origin.x,
                    y: e.pageY - origin.y,
                };

                root.dispatch('DID_DROP_ITEM', { id: props.id, dragState: dragState });

                // start listening to clicks again
                if (removedActivateListener) {
                    setTimeout(function() {
                        return root.element.addEventListener('click', root.ref.handleClick);
                    }, 0);
                }
            };

            document.addEventListener('pointermove', drag);
            document.addEventListener('pointerup', drop);
        };

        root.element.addEventListener('pointerdown', grab);
    };

    var route$1 = createRoute({
        DID_UPDATE_PANEL_HEIGHT: function DID_UPDATE_PANEL_HEIGHT(_ref2) {
            var root = _ref2.root,
                action = _ref2.action;
            root.height = action.height;
        },
    });

    var write$4 = createRoute(
        {
            DID_GRAB_ITEM: function DID_GRAB_ITEM(_ref3) {
                var root = _ref3.root,
                    props = _ref3.props;
                props.dragOrigin = {
                    x: root.translateX,
                    y: root.translateY,
                };
            },
            DID_DRAG_ITEM: function DID_DRAG_ITEM(_ref4) {
                var root = _ref4.root;
                root.element.dataset.dragState = 'drag';
            },
            DID_DROP_ITEM: function DID_DROP_ITEM(_ref5) {
                var root = _ref5.root,
                    props = _ref5.props;
                props.dragOffset = null;
                props.dragOrigin = null;
                root.element.dataset.dragState = 'drop';
            },
        },
        function(_ref6) {
            var root = _ref6.root,
                actions = _ref6.actions,
                props = _ref6.props,
                shouldOptimize = _ref6.shouldOptimize;

            if (root.element.dataset.dragState === 'drop') {
                if (root.scaleX <= 1) {
                    root.element.dataset.dragState = 'idle';
                }
            }

            // select last state change action
            var action = actions
                .concat()
                .filter(function(action) {
                    return /^DID_/.test(action.type);
                })
                .reverse()
                .find(function(action) {
                    return StateMap[action.type];
                });

            // no need to set same state twice
            if (action && action.type !== props.currentState) {
                // set current state
                props.currentState = action.type;

                // set state
                root.element.dataset.filepondItemState = StateMap[props.currentState] || '';
            }

            // route actions
            var aspectRatio =
                root.query('GET_ITEM_PANEL_ASPECT_RATIO') || root.query('GET_PANEL_ASPECT_RATIO');
            if (!aspectRatio) {
                route$1({ root: root, actions: actions, props: props });
                if (!root.height && root.ref.container.rect.element.height > 0) {
                    root.height = root.ref.container.rect.element.height;
                }
            } else if (!shouldOptimize) {
                root.height = root.rect.element.width * aspectRatio;
            }

            // sync panel height with item height
            if (shouldOptimize) {
                root.ref.panel.height = null;
            }

            root.ref.panel.height = root.height;
        }
    );

    var item = createView({
        create: create$7,
        write: write$4,
        destroy: function destroy(_ref7) {
            var root = _ref7.root,
                props = _ref7.props;
            root.element.removeEventListener('click', root.ref.handleClick);
            root.dispatch('RELEASE_ITEM', { query: props.id });
        },
        tag: 'li',
        name: 'item',
        mixins: {
            apis: [
                'id',
                'interactionMethod',
                'markedForRemoval',
                'spawnDate',
                'dragCenter',
                'dragOrigin',
                'dragOffset',
            ],
            styles: ['translateX', 'translateY', 'scaleX', 'scaleY', 'opacity', 'height'],

            animations: {
                scaleX: ITEM_SCALE_SPRING,
                scaleY: ITEM_SCALE_SPRING,
                translateX: ITEM_TRANSLATE_SPRING,
                translateY: ITEM_TRANSLATE_SPRING,
                opacity: { type: 'tween', duration: 150 },
            },
        },
    });

    var getItemsPerRow = function(horizontalSpace, itemWidth) {
        // add one pixel leeway, when using percentages for item width total items can be 1.99 per row

        return Math.max(1, Math.floor((horizontalSpace + 1) / itemWidth));
    };

    var getItemIndexByPosition = function getItemIndexByPosition(view, children, positionInView) {
        if (!positionInView) return;

        var horizontalSpace = view.rect.element.width;
        // const children = view.childViews;
        var l = children.length;
        var last = null;

        // -1, don't move items to accomodate (either add to top or bottom)
        if (l === 0 || positionInView.top < children[0].rect.element.top) return -1;

        // let's get the item width
        var item = children[0];
        var itemRect = item.rect.element;
        var itemHorizontalMargin = itemRect.marginLeft + itemRect.marginRight;
        var itemWidth = itemRect.width + itemHorizontalMargin;
        var itemsPerRow = getItemsPerRow(horizontalSpace, itemWidth);

        // stack
        if (itemsPerRow === 1) {
            for (var index = 0; index < l; index++) {
                var child = children[index];
                var childMid = child.rect.outer.top + child.rect.element.height * 0.5;
                if (positionInView.top < childMid) {
                    return index;
                }
            }
            return l;
        }

        // grid
        var itemVerticalMargin = itemRect.marginTop + itemRect.marginBottom;
        var itemHeight = itemRect.height + itemVerticalMargin;
        for (var _index = 0; _index < l; _index++) {
            var indexX = _index % itemsPerRow;
            var indexY = Math.floor(_index / itemsPerRow);

            var offsetX = indexX * itemWidth;
            var offsetY = indexY * itemHeight;

            var itemTop = offsetY - itemRect.marginTop;
            var itemRight = offsetX + itemWidth;
            var itemBottom = offsetY + itemHeight + itemRect.marginBottom;

            if (positionInView.top < itemBottom && positionInView.top > itemTop) {
                if (positionInView.left < itemRight) {
                    return _index;
                } else if (_index !== l - 1) {
                    last = _index;
                } else {
                    last = null;
                }
            }
        }

        if (last !== null) {
            return last;
        }

        return l;
    };

    var dropAreaDimensions = {
        height: 0,
        width: 0,
        get getHeight() {
            return this.height;
        },
        set setHeight(val) {
            if (this.height === 0 || val === 0) this.height = val;
        },
        get getWidth() {
            return this.width;
        },
        set setWidth(val) {
            if (this.width === 0 || val === 0) this.width = val;
        },
        setDimensions: function setDimensions(height, width) {
            if (this.height === 0 || height === 0) this.height = height;
            if (this.width === 0 || width === 0) this.width = width;
        },
    };

    var create$8 = function create(_ref) {
        var root = _ref.root;
        // need to set role to list as otherwise it won't be read as a list by VoiceOver
        attr(root.element, 'role', 'list');

        root.ref.lastItemSpanwDate = Date.now();
    };

    /**
     * Inserts a new item
     * @param root
     * @param action
     */
    var addItemView = function addItemView(_ref2) {
        var root = _ref2.root,
            action = _ref2.action;
        var id = action.id,
            index = action.index,
            interactionMethod = action.interactionMethod;

        root.ref.addIndex = index;

        var now = Date.now();
        var spawnDate = now;
        var opacity = 1;

        if (interactionMethod !== InteractionMethod.NONE) {
            opacity = 0;
            var cooldown = root.query('GET_ITEM_INSERT_INTERVAL');
            var dist = now - root.ref.lastItemSpanwDate;
            spawnDate = dist < cooldown ? now + (cooldown - dist) : now;
        }

        root.ref.lastItemSpanwDate = spawnDate;

        root.appendChildView(
            root.createChildView(
                // view type
                item,

                // props
                {
                    spawnDate: spawnDate,
                    id: id,
                    opacity: opacity,
                    interactionMethod: interactionMethod,
                }
            ),

            index
        );
    };

    var moveItem = function moveItem(item, x, y) {
        var vx = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var vy = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 1;
        // set to null to remove animation while dragging
        if (item.dragOffset) {
            item.translateX = null;
            item.translateY = null;
            item.translateX = item.dragOrigin.x + item.dragOffset.x;
            item.translateY = item.dragOrigin.y + item.dragOffset.y;
            item.scaleX = 1.025;
            item.scaleY = 1.025;
        } else {
            item.translateX = x;
            item.translateY = y;

            if (Date.now() > item.spawnDate) {
                // reveal element
                if (item.opacity === 0) {
                    introItemView(item, x, y, vx, vy);
                }

                // make sure is default scale every frame
                item.scaleX = 1;
                item.scaleY = 1;
                item.opacity = 1;
            }
        }
    };

    var introItemView = function introItemView(item, x, y, vx, vy) {
        if (item.interactionMethod === InteractionMethod.NONE) {
            item.translateX = null;
            item.translateX = x;
            item.translateY = null;
            item.translateY = y;
        } else if (item.interactionMethod === InteractionMethod.DROP) {
            item.translateX = null;
            item.translateX = x - vx * 20;

            item.translateY = null;
            item.translateY = y - vy * 10;

            item.scaleX = 0.8;
            item.scaleY = 0.8;
        } else if (item.interactionMethod === InteractionMethod.BROWSE) {
            item.translateY = null;
            item.translateY = y - 30;
        } else if (item.interactionMethod === InteractionMethod.API) {
            item.translateX = null;
            item.translateX = x - 30;
            item.translateY = null;
        }
    };

    /**
     * Removes an existing item
     * @param root
     * @param action
     */
    var removeItemView = function removeItemView(_ref3) {
        var root = _ref3.root,
            action = _ref3.action;
        var id = action.id;

        // get the view matching the given id
        var view = root.childViews.find(function(child) {
            return child.id === id;
        });

        // if no view found, exit
        if (!view) {
            return;
        }

        // animate view out of view
        view.scaleX = 0.9;
        view.scaleY = 0.9;
        view.opacity = 0;

        // mark for removal
        view.markedForRemoval = true;
    };

    var getItemHeight = function getItemHeight(child) {
        return (
            child.rect.element.height +
            child.rect.element.marginBottom * 0.5 +
            child.rect.element.marginTop * 0.5
        );
    };
    var getItemWidth = function getItemWidth(child) {
        return (
            child.rect.element.width +
            child.rect.element.marginLeft * 0.5 +
            child.rect.element.marginRight * 0.5
        );
    };

    var dragItem = function dragItem(_ref4) {
        var root = _ref4.root,
            action = _ref4.action;
        var id = action.id,
            dragState = action.dragState;

        // reference to item
        var item = root.query('GET_ITEM', { id: id });

        // get the view matching the given id
        var view = root.childViews.find(function(child) {
            return child.id === id;
        });

        var numItems = root.childViews.length;
        var oldIndex = dragState.getItemIndex(item);

        // if no view found, exit
        if (!view) return;

        var dragPosition = {
            x: view.dragOrigin.x + view.dragOffset.x + view.dragCenter.x,
            y: view.dragOrigin.y + view.dragOffset.y + view.dragCenter.y,
        };

        // get drag area dimensions
        var dragHeight = getItemHeight(view);
        var dragWidth = getItemWidth(view);

        // get rows and columns (There will always be at least one row and one column if a file is present)
        var cols = Math.floor(root.rect.outer.width / dragWidth);
        if (cols > numItems) cols = numItems;

        // rows are used to find when we have left the preview area bounding box
        var rows = Math.floor(numItems / cols + 1);

        dropAreaDimensions.setHeight = dragHeight * rows;
        dropAreaDimensions.setWidth = dragWidth * cols;

        // get new index of dragged item
        var location = {
            y: Math.floor(dragPosition.y / dragHeight),
            x: Math.floor(dragPosition.x / dragWidth),
            getGridIndex: function getGridIndex() {
                if (
                    dragPosition.y > dropAreaDimensions.getHeight ||
                    dragPosition.y < 0 ||
                    dragPosition.x > dropAreaDimensions.getWidth ||
                    dragPosition.x < 0
                )
                    return oldIndex;
                return this.y * cols + this.x;
            },
            getColIndex: function getColIndex() {
                var items = root.query('GET_ACTIVE_ITEMS');
                var visibleChildren = root.childViews.filter(function(child) {
                    return child.rect.element.height;
                });
                var children = items.map(function(item) {
                    return visibleChildren.find(function(childView) {
                        return childView.id === item.id;
                    });
                });

                var currentIndex = children.findIndex(function(child) {
                    return child === view;
                });
                var dragHeight = getItemHeight(view);
                var l = children.length;
                var idx = l;
                var childHeight = 0;
                var childBottom = 0;
                var childTop = 0;
                for (var i = 0; i < l; i++) {
                    childHeight = getItemHeight(children[i]);
                    childTop = childBottom;
                    childBottom = childTop + childHeight;
                    if (dragPosition.y < childBottom) {
                        if (currentIndex > i) {
                            if (dragPosition.y < childTop + dragHeight) {
                                idx = i;
                                break;
                            }
                            continue;
                        }
                        idx = i;
                        break;
                    }
                }
                return idx;
            },
        };

        // get new index
        var index = cols > 1 ? location.getGridIndex() : location.getColIndex();
        root.dispatch('MOVE_ITEM', { query: view, index: index });

        // if the index of the item changed, dispatch reorder action
        var currentIndex = dragState.getIndex();

        if (currentIndex === undefined || currentIndex !== index) {
            dragState.setIndex(index);

            if (currentIndex === undefined) return;

            root.dispatch('DID_REORDER_ITEMS', {
                items: root.query('GET_ACTIVE_ITEMS'),
                origin: oldIndex,
                target: index,
            });
        }
    };

    /**
     * Setup action routes
     */
    var route$2 = createRoute({
        DID_ADD_ITEM: addItemView,
        DID_REMOVE_ITEM: removeItemView,
        DID_DRAG_ITEM: dragItem,
    });

    /**
     * Write to view
     * @param root
     * @param actions
     * @param props
     */
    var write$5 = function write(_ref5) {
        var root = _ref5.root,
            props = _ref5.props,
            actions = _ref5.actions,
            shouldOptimize = _ref5.shouldOptimize;
        // route actions
        route$2({ root: root, props: props, actions: actions });
        var dragCoordinates = props.dragCoordinates;

        // available space on horizontal axis
        var horizontalSpace = root.rect.element.width;

        // only draw children that have dimensions
        var visibleChildren = root.childViews.filter(function(child) {
            return child.rect.element.height;
        });

        // sort based on current active items
        var children = root
            .query('GET_ACTIVE_ITEMS')
            .map(function(item) {
                return visibleChildren.find(function(child) {
                    return child.id === item.id;
                });
            })
            .filter(function(item) {
                return item;
            });

        // get index
        var dragIndex = dragCoordinates
            ? getItemIndexByPosition(root, children, dragCoordinates)
            : null;

        // add index is used to reserve the dropped/added item index till the actual item is rendered
        var addIndex = root.ref.addIndex || null;

        // add index no longer needed till possibly next draw
        root.ref.addIndex = null;

        var dragIndexOffset = 0;
        var removeIndexOffset = 0;
        var addIndexOffset = 0;

        if (children.length === 0) return;

        var childRect = children[0].rect.element;
        var itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
        var itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;
        var itemWidth = childRect.width + itemHorizontalMargin;
        var itemHeight = childRect.height + itemVerticalMargin;
        var itemsPerRow = getItemsPerRow(horizontalSpace, itemWidth);

        // stack
        if (itemsPerRow === 1) {
            var offsetY = 0;
            var dragOffset = 0;

            children.forEach(function(child, index) {
                if (dragIndex) {
                    var dist = index - dragIndex;
                    if (dist === -2) {
                        dragOffset = -itemVerticalMargin * 0.25;
                    } else if (dist === -1) {
                        dragOffset = -itemVerticalMargin * 0.75;
                    } else if (dist === 0) {
                        dragOffset = itemVerticalMargin * 0.75;
                    } else if (dist === 1) {
                        dragOffset = itemVerticalMargin * 0.25;
                    } else {
                        dragOffset = 0;
                    }
                }

                if (shouldOptimize) {
                    child.translateX = null;
                    child.translateY = null;
                }

                if (!child.markedForRemoval) {
                    moveItem(child, 0, offsetY + dragOffset);
                }

                var itemHeight = child.rect.element.height + itemVerticalMargin;

                var visualHeight = itemHeight * (child.markedForRemoval ? child.opacity : 1);

                offsetY += visualHeight;
            });
        }
        // grid
        else {
            var prevX = 0;
            var prevY = 0;

            children.forEach(function(child, index) {
                if (index === dragIndex) {
                    dragIndexOffset = 1;
                }

                if (index === addIndex) {
                    addIndexOffset += 1;
                }

                if (child.markedForRemoval && child.opacity < 0.5) {
                    removeIndexOffset -= 1;
                }

                var visualIndex = index + addIndexOffset + dragIndexOffset + removeIndexOffset;

                var indexX = visualIndex % itemsPerRow;
                var indexY = Math.floor(visualIndex / itemsPerRow);

                var offsetX = indexX * itemWidth;
                var offsetY = indexY * itemHeight;

                var vectorX = Math.sign(offsetX - prevX);
                var vectorY = Math.sign(offsetY - prevY);

                prevX = offsetX;
                prevY = offsetY;

                if (child.markedForRemoval) return;

                if (shouldOptimize) {
                    child.translateX = null;
                    child.translateY = null;
                }

                moveItem(child, offsetX, offsetY, vectorX, vectorY);
            });
        }
    };

    /**
     * Filters actions that are meant specifically for a certain child of the list
     * @param child
     * @param actions
     */
    var filterSetItemActions = function filterSetItemActions(child, actions) {
        return actions.filter(function(action) {
            // if action has an id, filter out actions that don't have this child id
            if (action.data && action.data.id) {
                return child.id === action.data.id;
            }

            // allow all other actions
            return true;
        });
    };

    var list = createView({
        create: create$8,
        write: write$5,
        tag: 'ul',
        name: 'list',
        didWriteView: function didWriteView(_ref6) {
            var root = _ref6.root;
            root.childViews
                .filter(function(view) {
                    return view.markedForRemoval && view.opacity === 0 && view.resting;
                })
                .forEach(function(view) {
                    view._destroy();
                    root.removeChildView(view);
                });
        },
        filterFrameActionsForChild: filterSetItemActions,
        mixins: {
            apis: ['dragCoordinates'],
        },
    });

    var create$9 = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        root.ref.list = root.appendChildView(root.createChildView(list));
        props.dragCoordinates = null;
        props.overflowing = false;
    };

    var storeDragCoordinates = function storeDragCoordinates(_ref2) {
        var root = _ref2.root,
            props = _ref2.props,
            action = _ref2.action;
        if (!root.query('GET_ITEM_INSERT_LOCATION_FREEDOM')) return;
        props.dragCoordinates = {
            left: action.position.scopeLeft - root.ref.list.rect.element.left,
            top:
                action.position.scopeTop -
                (root.rect.outer.top + root.rect.element.marginTop + root.rect.element.scrollTop),
        };
    };

    var clearDragCoordinates = function clearDragCoordinates(_ref3) {
        var props = _ref3.props;
        props.dragCoordinates = null;
    };

    var route$3 = createRoute({
        DID_DRAG: storeDragCoordinates,
        DID_END_DRAG: clearDragCoordinates,
    });

    var write$6 = function write(_ref4) {
        var root = _ref4.root,
            props = _ref4.props,
            actions = _ref4.actions;

        // route actions
        route$3({ root: root, props: props, actions: actions });

        // current drag position
        root.ref.list.dragCoordinates = props.dragCoordinates;

        // if currently overflowing but no longer received overflow
        if (props.overflowing && !props.overflow) {
            props.overflowing = false;

            // reset overflow state
            root.element.dataset.state = '';
            root.height = null;
        }

        // if is not overflowing currently but does receive overflow value
        if (props.overflow) {
            var newHeight = Math.round(props.overflow);
            if (newHeight !== root.height) {
                props.overflowing = true;
                root.element.dataset.state = 'overflow';
                root.height = newHeight;
            }
        }
    };

    var listScroller = createView({
        create: create$9,
        write: write$6,
        name: 'list-scroller',
        mixins: {
            apis: ['overflow', 'dragCoordinates'],
            styles: ['height', 'translateY'],
            animations: {
                translateY: 'spring',
            },
        },
    });

    var attrToggle = function attrToggle(element, name, state) {
        var enabledValue = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';
        if (state) {
            attr(element, name, enabledValue);
        } else {
            element.removeAttribute(name);
        }
    };

    var resetFileInput = function resetFileInput(input) {
        // no value, no need to reset
        if (!input || input.value === '') {
            return;
        }

        try {
            // for modern browsers
            input.value = '';
        } catch (err) {}

        // for IE10
        if (input.value) {
            // quickly append input to temp form and reset form
            var form = createElement$1('form');
            var parentNode = input.parentNode;
            var ref = input.nextSibling;
            form.appendChild(input);
            form.reset();

            // re-inject input where it originally was
            if (ref) {
                parentNode.insertBefore(input, ref);
            } else {
                parentNode.appendChild(input);
            }
        }
    };

    var create$a = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;

        // set id so can be referenced from outside labels
        root.element.id = 'filepond--browser-' + props.id;

        // set name of element (is removed when a value is set)
        attr(root.element, 'name', root.query('GET_NAME'));

        // we have to link this element to the status element
        attr(root.element, 'aria-controls', 'filepond--assistant-' + props.id);

        // set label, we use labelled by as otherwise the screenreader does not read the "browse" text in the label (as it has tabindex: 0)
        attr(root.element, 'aria-labelledby', 'filepond--drop-label-' + props.id);

        // set configurable props
        setAcceptedFileTypes({
            root: root,
            action: { value: root.query('GET_ACCEPTED_FILE_TYPES') },
        });
        toggleAllowMultiple({ root: root, action: { value: root.query('GET_ALLOW_MULTIPLE') } });
        toggleDirectoryFilter({
            root: root,
            action: { value: root.query('GET_ALLOW_DIRECTORIES_ONLY') },
        });
        toggleDisabled({ root: root });
        toggleRequired({ root: root, action: { value: root.query('GET_REQUIRED') } });
        setCaptureMethod({ root: root, action: { value: root.query('GET_CAPTURE_METHOD') } });

        // handle changes to the input field
        root.ref.handleChange = function(e) {
            if (!root.element.value) {
                return;
            }

            // extract files and move value of webkitRelativePath path to _relativePath
            var files = Array.from(root.element.files).map(function(file) {
                file._relativePath = file.webkitRelativePath;
                return file;
            });

            // we add a little delay so the OS file select window can move out of the way before we add our file
            setTimeout(function() {
                // load files
                props.onload(files);

                // reset input, it's just for exposing a method to drop files, should not retain any state
                resetFileInput(root.element);
            }, 250);
        };

        root.element.addEventListener('change', root.ref.handleChange);
    };

    var setAcceptedFileTypes = function setAcceptedFileTypes(_ref2) {
        var root = _ref2.root,
            action = _ref2.action;
        if (!root.query('GET_ALLOW_SYNC_ACCEPT_ATTRIBUTE')) return;
        attrToggle(
            root.element,
            'accept',
            !!action.value,
            action.value ? action.value.join(',') : ''
        );
    };

    var toggleAllowMultiple = function toggleAllowMultiple(_ref3) {
        var root = _ref3.root,
            action = _ref3.action;
        attrToggle(root.element, 'multiple', action.value);
    };

    var toggleDirectoryFilter = function toggleDirectoryFilter(_ref4) {
        var root = _ref4.root,
            action = _ref4.action;
        attrToggle(root.element, 'webkitdirectory', action.value);
    };

    var toggleDisabled = function toggleDisabled(_ref5) {
        var root = _ref5.root;
        var isDisabled = root.query('GET_DISABLED');
        var doesAllowBrowse = root.query('GET_ALLOW_BROWSE');
        var disableField = isDisabled || !doesAllowBrowse;
        attrToggle(root.element, 'disabled', disableField);
    };

    var toggleRequired = function toggleRequired(_ref6) {
        var root = _ref6.root,
            action = _ref6.action;
        // want to remove required, always possible
        if (!action.value) {
            attrToggle(root.element, 'required', false);
        }
        // if want to make required, only possible when zero items
        else if (root.query('GET_TOTAL_ITEMS') === 0) {
            attrToggle(root.element, 'required', true);
        }
    };

    var setCaptureMethod = function setCaptureMethod(_ref7) {
        var root = _ref7.root,
            action = _ref7.action;
        attrToggle(
            root.element,
            'capture',
            !!action.value,
            action.value === true ? '' : action.value
        );
    };

    var updateRequiredStatus = function updateRequiredStatus(_ref8) {
        var root = _ref8.root;
        var element = root.element;
        // always remove the required attribute when more than zero items
        if (root.query('GET_TOTAL_ITEMS') > 0) {
            attrToggle(element, 'required', false);
            attrToggle(element, 'name', false);
        } else {
            // add name attribute
            attrToggle(element, 'name', true, root.query('GET_NAME'));

            // remove any validation messages
            var shouldCheckValidity = root.query('GET_CHECK_VALIDITY');
            if (shouldCheckValidity) {
                element.setCustomValidity('');
            }

            // we only add required if the field has been deemed required
            if (root.query('GET_REQUIRED')) {
                attrToggle(element, 'required', true);
            }
        }
    };

    var updateFieldValidityStatus = function updateFieldValidityStatus(_ref9) {
        var root = _ref9.root;
        var shouldCheckValidity = root.query('GET_CHECK_VALIDITY');
        if (!shouldCheckValidity) return;
        root.element.setCustomValidity(root.query('GET_LABEL_INVALID_FIELD'));
    };

    var browser = createView({
        tag: 'input',
        name: 'browser',
        ignoreRect: true,
        ignoreRectUpdate: true,
        attributes: {
            type: 'file',
        },

        create: create$a,
        destroy: function destroy(_ref10) {
            var root = _ref10.root;
            root.element.removeEventListener('change', root.ref.handleChange);
        },
        write: createRoute({
            DID_LOAD_ITEM: updateRequiredStatus,
            DID_REMOVE_ITEM: updateRequiredStatus,
            DID_THROW_ITEM_INVALID: updateFieldValidityStatus,

            DID_SET_DISABLED: toggleDisabled,
            DID_SET_ALLOW_BROWSE: toggleDisabled,
            DID_SET_ALLOW_DIRECTORIES_ONLY: toggleDirectoryFilter,
            DID_SET_ALLOW_MULTIPLE: toggleAllowMultiple,
            DID_SET_ACCEPTED_FILE_TYPES: setAcceptedFileTypes,
            DID_SET_CAPTURE_METHOD: setCaptureMethod,
            DID_SET_REQUIRED: toggleRequired,
        }),
    });

    var Key = {
        ENTER: 13,
        SPACE: 32,
    };

    var create$b = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;

        // create the label and link it to the file browser
        var label = createElement$1('label');
        attr(label, 'for', 'filepond--browser-' + props.id);

        // use for labeling file input (aria-labelledby on file input)
        attr(label, 'id', 'filepond--drop-label-' + props.id);

        // hide the label for screenreaders, the input element will read the contents of the label when it's focussed. If we don't set aria-hidden the screenreader will also navigate the contents of the label separately from the input.
        attr(label, 'aria-hidden', 'true');

        // handle keys
        root.ref.handleKeyDown = function(e) {
            var isActivationKey = e.keyCode === Key.ENTER || e.keyCode === Key.SPACE;
            if (!isActivationKey) return;
            // stops from triggering the element a second time
            e.preventDefault();

            // click link (will then in turn activate file input)
            root.ref.label.click();
        };

        root.ref.handleClick = function(e) {
            var isLabelClick = e.target === label || label.contains(e.target);

            // don't want to click twice
            if (isLabelClick) return;

            // click link (will then in turn activate file input)
            root.ref.label.click();
        };

        // attach events
        label.addEventListener('keydown', root.ref.handleKeyDown);
        root.element.addEventListener('click', root.ref.handleClick);

        // update
        updateLabelValue(label, props.caption);

        // add!
        root.appendChild(label);
        root.ref.label = label;
    };

    var updateLabelValue = function updateLabelValue(label, value) {
        label.innerHTML = value;
        var clickable = label.querySelector('.filepond--label-action');
        if (clickable) {
            attr(clickable, 'tabindex', '0');
        }
        return value;
    };

    var dropLabel = createView({
        name: 'drop-label',
        ignoreRect: true,
        create: create$b,
        destroy: function destroy(_ref2) {
            var root = _ref2.root;
            root.ref.label.addEventListener('keydown', root.ref.handleKeyDown);
            root.element.removeEventListener('click', root.ref.handleClick);
        },
        write: createRoute({
            DID_SET_LABEL_IDLE: function DID_SET_LABEL_IDLE(_ref3) {
                var root = _ref3.root,
                    action = _ref3.action;
                updateLabelValue(root.ref.label, action.value);
            },
        }),

        mixins: {
            styles: ['opacity', 'translateX', 'translateY'],
            animations: {
                opacity: { type: 'tween', duration: 150 },
                translateX: 'spring',
                translateY: 'spring',
            },
        },
    });

    var blob = createView({
        name: 'drip-blob',
        ignoreRect: true,
        mixins: {
            styles: ['translateX', 'translateY', 'scaleX', 'scaleY', 'opacity'],
            animations: {
                scaleX: 'spring',
                scaleY: 'spring',
                translateX: 'spring',
                translateY: 'spring',
                opacity: { type: 'tween', duration: 250 },
            },
        },
    });

    var addBlob = function addBlob(_ref) {
        var root = _ref.root;
        var centerX = root.rect.element.width * 0.5;
        var centerY = root.rect.element.height * 0.5;

        root.ref.blob = root.appendChildView(
            root.createChildView(blob, {
                opacity: 0,
                scaleX: 2.5,
                scaleY: 2.5,
                translateX: centerX,
                translateY: centerY,
            })
        );
    };

    var moveBlob = function moveBlob(_ref2) {
        var root = _ref2.root,
            action = _ref2.action;
        if (!root.ref.blob) {
            addBlob({ root: root });
            return;
        }

        root.ref.blob.translateX = action.position.scopeLeft;
        root.ref.blob.translateY = action.position.scopeTop;
        root.ref.blob.scaleX = 1;
        root.ref.blob.scaleY = 1;
        root.ref.blob.opacity = 1;
    };

    var hideBlob = function hideBlob(_ref3) {
        var root = _ref3.root;
        if (!root.ref.blob) {
            return;
        }
        root.ref.blob.opacity = 0;
    };

    var explodeBlob = function explodeBlob(_ref4) {
        var root = _ref4.root;
        if (!root.ref.blob) {
            return;
        }
        root.ref.blob.scaleX = 2.5;
        root.ref.blob.scaleY = 2.5;
        root.ref.blob.opacity = 0;
    };

    var write$7 = function write(_ref5) {
        var root = _ref5.root,
            props = _ref5.props,
            actions = _ref5.actions;
        route$4({ root: root, props: props, actions: actions });
        var blob = root.ref.blob;

        if (actions.length === 0 && blob && blob.opacity === 0) {
            root.removeChildView(blob);
            root.ref.blob = null;
        }
    };

    var route$4 = createRoute({
        DID_DRAG: moveBlob,
        DID_DROP: explodeBlob,
        DID_END_DRAG: hideBlob,
    });

    var drip = createView({
        ignoreRect: true,
        ignoreRectUpdate: true,
        name: 'drip',
        write: write$7,
    });

    var setInputFiles = function setInputFiles(element, files) {
        try {
            // Create a DataTransfer instance and add a newly created file
            var dataTransfer = new DataTransfer();
            files.forEach(function(file) {
                if (file instanceof File) {
                    dataTransfer.items.add(file);
                } else {
                    dataTransfer.items.add(
                        new File([file], file.name, {
                            type: file.type,
                        })
                    );
                }
            });

            // Assign the DataTransfer files list to the file input
            element.files = dataTransfer.files;
        } catch (err) {
            return false;
        }
        return true;
    };

    var create$c = function create(_ref) {
        var root = _ref.root;
        return (root.ref.fields = {});
    };

    var getField = function getField(root, id) {
        return root.ref.fields[id];
    };

    var syncFieldPositionsWithItems = function syncFieldPositionsWithItems(root) {
        root.query('GET_ACTIVE_ITEMS').forEach(function(item) {
            if (!root.ref.fields[item.id]) return;
            root.element.appendChild(root.ref.fields[item.id]);
        });
    };

    var didReorderItems = function didReorderItems(_ref2) {
        var root = _ref2.root;
        return syncFieldPositionsWithItems(root);
    };

    var didAddItem = function didAddItem(_ref3) {
        var root = _ref3.root,
            action = _ref3.action;
        var fileItem = root.query('GET_ITEM', action.id);
        var isLocalFile = fileItem.origin === FileOrigin.LOCAL;
        var shouldUseFileInput = !isLocalFile && root.query('SHOULD_UPDATE_FILE_INPUT');
        var dataContainer = createElement$1('input');
        dataContainer.type = shouldUseFileInput ? 'file' : 'hidden';
        dataContainer.name = root.query('GET_NAME');
        dataContainer.disabled = root.query('GET_DISABLED');
        root.ref.fields[action.id] = dataContainer;
        syncFieldPositionsWithItems(root);
    };

    var didLoadItem$1 = function didLoadItem(_ref4) {
        var root = _ref4.root,
            action = _ref4.action;
        var field = getField(root, action.id);
        if (!field) return;

        // store server ref in hidden input
        if (action.serverFileReference !== null) field.value = action.serverFileReference;

        // store file item in file input
        if (!root.query('SHOULD_UPDATE_FILE_INPUT')) return;

        var fileItem = root.query('GET_ITEM', action.id);
        setInputFiles(field, [fileItem.file]);
    };

    var didPrepareOutput = function didPrepareOutput(_ref5) {
        var root = _ref5.root,
            action = _ref5.action;
        // this timeout pushes the handler after 'load'
        if (!root.query('SHOULD_UPDATE_FILE_INPUT')) return;
        setTimeout(function() {
            var field = getField(root, action.id);
            if (!field) return;
            setInputFiles(field, [action.file]);
        }, 0);
    };

    var didSetDisabled = function didSetDisabled(_ref6) {
        var root = _ref6.root;
        root.element.disabled = root.query('GET_DISABLED');
    };

    var didRemoveItem = function didRemoveItem(_ref7) {
        var root = _ref7.root,
            action = _ref7.action;
        var field = getField(root, action.id);
        if (!field) return;
        if (field.parentNode) field.parentNode.removeChild(field);
        delete root.ref.fields[action.id];
    };

    // only runs for server files (so doesn't deal with file input)
    var didDefineValue = function didDefineValue(_ref8) {
        var root = _ref8.root,
            action = _ref8.action;
        var field = getField(root, action.id);
        if (!field) return;
        if (action.value === null) {
            // clear field value
            field.removeAttribute('value');
        } else {
            // set field value
            field.value = action.value;
        }
        syncFieldPositionsWithItems(root);
    };

    var write$8 = createRoute({
        DID_SET_DISABLED: didSetDisabled,
        DID_ADD_ITEM: didAddItem,
        DID_LOAD_ITEM: didLoadItem$1,
        DID_REMOVE_ITEM: didRemoveItem,
        DID_DEFINE_VALUE: didDefineValue,
        DID_PREPARE_OUTPUT: didPrepareOutput,
        DID_REORDER_ITEMS: didReorderItems,
        DID_SORT_ITEMS: didReorderItems,
    });

    var data = createView({
        tag: 'fieldset',
        name: 'data',
        create: create$c,
        write: write$8,
        ignoreRect: true,
    });

    var getRootNode = function getRootNode(element) {
        return 'getRootNode' in element ? element.getRootNode() : document;
    };

    var images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
    var text$1 = ['css', 'csv', 'html', 'txt'];
    var map = {
        zip: 'zip|compressed',
        epub: 'application/epub+zip',
    };

    var guesstimateMimeType = function guesstimateMimeType() {
        var extension = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        extension = extension.toLowerCase();
        if (images.includes(extension)) {
            return (
                'image/' +
                (extension === 'jpg' ? 'jpeg' : extension === 'svg' ? 'svg+xml' : extension)
            );
        }
        if (text$1.includes(extension)) {
            return 'text/' + extension;
        }

        return map[extension] || '';
    };

    var requestDataTransferItems = function requestDataTransferItems(dataTransfer) {
        return new Promise(function(resolve, reject) {
            // try to get links from transfer, if found we'll exit immediately (unless a file is in the dataTransfer as well, this is because Firefox could represent the file as a URL and a file object at the same time)
            var links = getLinks(dataTransfer);
            if (links.length && !hasFiles(dataTransfer)) {
                return resolve(links);
            }
            // try to get files from the transfer
            getFiles(dataTransfer).then(resolve);
        });
    };

    /**
     * Test if datatransfer has files
     */
    var hasFiles = function hasFiles(dataTransfer) {
        if (dataTransfer.files) return dataTransfer.files.length > 0;
        return false;
    };

    /**
     * Extracts files from a DataTransfer object
     */
    var getFiles = function getFiles(dataTransfer) {
        return new Promise(function(resolve, reject) {
            // get the transfer items as promises
            var promisedFiles = (dataTransfer.items ? Array.from(dataTransfer.items) : [])
                // only keep file system items (files and directories)
                .filter(function(item) {
                    return isFileSystemItem(item);
                })

                // map each item to promise
                .map(function(item) {
                    return getFilesFromItem(item);
                });

            // if is empty, see if we can extract some info from the files property as a fallback
            if (!promisedFiles.length) {
                // TODO: test for directories (should not be allowed)
                // Use FileReader, problem is that the files property gets lost in the process
                resolve(dataTransfer.files ? Array.from(dataTransfer.files) : []);
                return;
            }

            // done!
            Promise.all(promisedFiles)
                .then(function(returnedFileGroups) {
                    // flatten groups
                    var files = [];
                    returnedFileGroups.forEach(function(group) {
                        files.push.apply(files, group);
                    });

                    // done (filter out empty files)!
                    resolve(
                        files
                            .filter(function(file) {
                                return file;
                            })
                            .map(function(file) {
                                if (!file._relativePath)
                                    file._relativePath = file.webkitRelativePath;
                                return file;
                            })
                    );
                })
                .catch(console.error);
        });
    };

    var isFileSystemItem = function isFileSystemItem(item) {
        if (isEntry(item)) {
            var entry = getAsEntry(item);
            if (entry) {
                return entry.isFile || entry.isDirectory;
            }
        }
        return item.kind === 'file';
    };

    var getFilesFromItem = function getFilesFromItem(item) {
        return new Promise(function(resolve, reject) {
            if (isDirectoryEntry(item)) {
                getFilesInDirectory(getAsEntry(item))
                    .then(resolve)
                    .catch(reject);
                return;
            }

            resolve([item.getAsFile()]);
        });
    };

    var getFilesInDirectory = function getFilesInDirectory(entry) {
        return new Promise(function(resolve, reject) {
            var files = [];

            // the total entries to read
            var dirCounter = 0;
            var fileCounter = 0;

            var resolveIfDone = function resolveIfDone() {
                if (fileCounter === 0 && dirCounter === 0) {
                    resolve(files);
                }
            };

            // the recursive function
            var readEntries = function readEntries(dirEntry) {
                dirCounter++;

                var directoryReader = dirEntry.createReader();

                // directories are returned in batches, we need to process all batches before we're done
                var readBatch = function readBatch() {
                    directoryReader.readEntries(function(entries) {
                        if (entries.length === 0) {
                            dirCounter--;
                            resolveIfDone();
                            return;
                        }

                        entries.forEach(function(entry) {
                            // recursively read more directories
                            if (entry.isDirectory) {
                                readEntries(entry);
                            } else {
                                // read as file
                                fileCounter++;

                                entry.file(function(file) {
                                    var correctedFile = correctMissingFileType(file);
                                    if (entry.fullPath)
                                        correctedFile._relativePath = entry.fullPath;
                                    files.push(correctedFile);
                                    fileCounter--;
                                    resolveIfDone();
                                });
                            }
                        });

                        // try to get next batch of files
                        readBatch();
                    }, reject);
                };

                // read first batch of files
                readBatch();
            };

            // go!
            readEntries(entry);
        });
    };

    var correctMissingFileType = function correctMissingFileType(file) {
        if (file.type.length) return file;
        var date = file.lastModifiedDate;
        var name = file.name;
        var type = guesstimateMimeType(getExtensionFromFilename(file.name));
        if (!type.length) return file;
        file = file.slice(0, file.size, type);
        file.name = name;
        file.lastModifiedDate = date;
        return file;
    };

    var isDirectoryEntry = function isDirectoryEntry(item) {
        return isEntry(item) && (getAsEntry(item) || {}).isDirectory;
    };

    var isEntry = function isEntry(item) {
        return 'webkitGetAsEntry' in item;
    };

    var getAsEntry = function getAsEntry(item) {
        return item.webkitGetAsEntry();
    };

    /**
     * Extracts links from a DataTransfer object
     */
    var getLinks = function getLinks(dataTransfer) {
        var links = [];
        try {
            // look in meta data property
            links = getLinksFromTransferMetaData(dataTransfer);
            if (links.length) {
                return links;
            }
            links = getLinksFromTransferURLData(dataTransfer);
        } catch (e) {
            // nope nope nope (probably IE trouble)
        }
        return links;
    };

    var getLinksFromTransferURLData = function getLinksFromTransferURLData(dataTransfer) {
        var data = dataTransfer.getData('url');
        if (typeof data === 'string' && data.length) {
            return [data];
        }
        return [];
    };

    var getLinksFromTransferMetaData = function getLinksFromTransferMetaData(dataTransfer) {
        var data = dataTransfer.getData('text/html');
        if (typeof data === 'string' && data.length) {
            var matches = data.match(/src\s*=\s*"(.+?)"/);
            if (matches) {
                return [matches[1]];
            }
        }
        return [];
    };

    var dragNDropObservers = [];

    var eventPosition = function eventPosition(e) {
        return {
            pageLeft: e.pageX,
            pageTop: e.pageY,
            scopeLeft: e.offsetX || e.layerX,
            scopeTop: e.offsetY || e.layerY,
        };
    };

    var createDragNDropClient = function createDragNDropClient(
        element,
        scopeToObserve,
        filterElement
    ) {
        var observer = getDragNDropObserver(scopeToObserve);

        var client = {
            element: element,
            filterElement: filterElement,
            state: null,
            ondrop: function ondrop() {},
            onenter: function onenter() {},
            ondrag: function ondrag() {},
            onexit: function onexit() {},
            onload: function onload() {},
            allowdrop: function allowdrop() {},
        };

        client.destroy = observer.addListener(client);

        return client;
    };

    var getDragNDropObserver = function getDragNDropObserver(element) {
        // see if already exists, if so, return
        var observer = dragNDropObservers.find(function(item) {
            return item.element === element;
        });
        if (observer) {
            return observer;
        }

        // create new observer, does not yet exist for this element
        var newObserver = createDragNDropObserver(element);
        dragNDropObservers.push(newObserver);
        return newObserver;
    };

    var createDragNDropObserver = function createDragNDropObserver(element) {
        var clients = [];

        var routes = {
            dragenter: dragenter,
            dragover: dragover,
            dragleave: dragleave,
            drop: drop,
        };

        var handlers = {};

        forin(routes, function(event, createHandler) {
            handlers[event] = createHandler(element, clients);
            element.addEventListener(event, handlers[event], false);
        });

        var observer = {
            element: element,
            addListener: function addListener(client) {
                // add as client
                clients.push(client);

                // return removeListener function
                return function() {
                    // remove client
                    clients.splice(clients.indexOf(client), 1);

                    // if no more clients, clean up observer
                    if (clients.length === 0) {
                        dragNDropObservers.splice(dragNDropObservers.indexOf(observer), 1);

                        forin(routes, function(event) {
                            element.removeEventListener(event, handlers[event], false);
                        });
                    }
                };
            },
        };

        return observer;
    };

    var elementFromPoint = function elementFromPoint(root, point) {
        if (!('elementFromPoint' in root)) {
            root = document;
        }
        return root.elementFromPoint(point.x, point.y);
    };

    var isEventTarget = function isEventTarget(e, target) {
        // get root
        var root = getRootNode(target);

        // get element at position
        // if root is not actual shadow DOM and does not have elementFromPoint method, use the one on document
        var elementAtPosition = elementFromPoint(root, {
            x: e.pageX - window.pageXOffset,
            y: e.pageY - window.pageYOffset,
        });

        // test if target is the element or if one of its children is
        return elementAtPosition === target || target.contains(elementAtPosition);
    };

    var initialTarget = null;

    var setDropEffect = function setDropEffect(dataTransfer, effect) {
        // is in try catch as IE11 will throw error if not
        try {
            dataTransfer.dropEffect = effect;
        } catch (e) {}
    };

    var dragenter = function dragenter(root, clients) {
        return function(e) {
            e.preventDefault();

            initialTarget = e.target;

            clients.forEach(function(client) {
                var element = client.element,
                    onenter = client.onenter;

                if (isEventTarget(e, element)) {
                    client.state = 'enter';

                    // fire enter event
                    onenter(eventPosition(e));
                }
            });
        };
    };

    var dragover = function dragover(root, clients) {
        return function(e) {
            e.preventDefault();

            var dataTransfer = e.dataTransfer;

            requestDataTransferItems(dataTransfer).then(function(items) {
                var overDropTarget = false;

                clients.some(function(client) {
                    var filterElement = client.filterElement,
                        element = client.element,
                        onenter = client.onenter,
                        onexit = client.onexit,
                        ondrag = client.ondrag,
                        allowdrop = client.allowdrop;

                    // by default we can drop
                    setDropEffect(dataTransfer, 'copy');

                    // allow transfer of these items
                    var allowsTransfer = allowdrop(items);

                    // only used when can be dropped on page
                    if (!allowsTransfer) {
                        setDropEffect(dataTransfer, 'none');
                        return;
                    }

                    // targetting this client
                    if (isEventTarget(e, element)) {
                        overDropTarget = true;

                        // had no previous state, means we are entering this client
                        if (client.state === null) {
                            client.state = 'enter';
                            onenter(eventPosition(e));
                            return;
                        }

                        // now over element (no matter if it allows the drop or not)
                        client.state = 'over';

                        // needs to allow transfer
                        if (filterElement && !allowsTransfer) {
                            setDropEffect(dataTransfer, 'none');
                            return;
                        }

                        // dragging
                        ondrag(eventPosition(e));
                    } else {
                        // should be over an element to drop
                        if (filterElement && !overDropTarget) {
                            setDropEffect(dataTransfer, 'none');
                        }

                        // might have just left this client?
                        if (client.state) {
                            client.state = null;
                            onexit(eventPosition(e));
                        }
                    }
                });
            });
        };
    };

    var drop = function drop(root, clients) {
        return function(e) {
            e.preventDefault();

            var dataTransfer = e.dataTransfer;

            requestDataTransferItems(dataTransfer).then(function(items) {
                clients.forEach(function(client) {
                    var filterElement = client.filterElement,
                        element = client.element,
                        ondrop = client.ondrop,
                        onexit = client.onexit,
                        allowdrop = client.allowdrop;

                    client.state = null;

                    // if we're filtering on element we need to be over the element to drop
                    if (filterElement && !isEventTarget(e, element)) return;

                    // no transfer for this client
                    if (!allowdrop(items)) return onexit(eventPosition(e));

                    // we can drop these items on this client
                    ondrop(eventPosition(e), items);
                });
            });
        };
    };

    var dragleave = function dragleave(root, clients) {
        return function(e) {
            if (initialTarget !== e.target) {
                return;
            }

            clients.forEach(function(client) {
                var onexit = client.onexit;

                client.state = null;

                onexit(eventPosition(e));
            });
        };
    };

    var createHopper = function createHopper(scope, validateItems, options) {
        // is now hopper scope
        scope.classList.add('filepond--hopper');

        // shortcuts
        var catchesDropsOnPage = options.catchesDropsOnPage,
            requiresDropOnElement = options.requiresDropOnElement,
            _options$filterItems = options.filterItems,
            filterItems =
                _options$filterItems === void 0
                    ? function(items) {
                          return items;
                      }
                    : _options$filterItems;

        // create a dnd client
        var client = createDragNDropClient(
            scope,
            catchesDropsOnPage ? document.documentElement : scope,
            requiresDropOnElement
        );

        // current client state
        var lastState = '';
        var currentState = '';

        // determines if a file may be dropped
        client.allowdrop = function(items) {
            // TODO: if we can, throw error to indicate the items cannot by dropped

            return validateItems(filterItems(items));
        };

        client.ondrop = function(position, items) {
            var filteredItems = filterItems(items);

            if (!validateItems(filteredItems)) {
                api.ondragend(position);
                return;
            }

            currentState = 'drag-drop';

            api.onload(filteredItems, position);
        };

        client.ondrag = function(position) {
            api.ondrag(position);
        };

        client.onenter = function(position) {
            currentState = 'drag-over';

            api.ondragstart(position);
        };

        client.onexit = function(position) {
            currentState = 'drag-exit';

            api.ondragend(position);
        };

        var api = {
            updateHopperState: function updateHopperState() {
                if (lastState !== currentState) {
                    scope.dataset.hopperState = currentState;
                    lastState = currentState;
                }
            },
            onload: function onload() {},
            ondragstart: function ondragstart() {},
            ondrag: function ondrag() {},
            ondragend: function ondragend() {},
            destroy: function destroy() {
                // destroy client
                client.destroy();
            },
        };

        return api;
    };

    var listening = false;
    var listeners$1 = [];

    var handlePaste = function handlePaste(e) {
        // if is pasting in input or textarea and the target is outside of a filepond scope, ignore
        var activeEl = document.activeElement;
        if (activeEl && /textarea|input/i.test(activeEl.nodeName)) {
            // test textarea or input is contained in filepond root
            var inScope = false;
            var element = activeEl;
            while (element !== document.body) {
                if (element.classList.contains('filepond--root')) {
                    inScope = true;
                    break;
                }
                element = element.parentNode;
            }

            if (!inScope) return;
        }

        requestDataTransferItems(e.clipboardData).then(function(files) {
            // no files received
            if (!files.length) {
                return;
            }

            // notify listeners of received files
            listeners$1.forEach(function(listener) {
                return listener(files);
            });
        });
    };

    var listen = function listen(cb) {
        // can't add twice
        if (listeners$1.includes(cb)) {
            return;
        }

        // add initial listener
        listeners$1.push(cb);

        // setup paste listener for entire page
        if (listening) {
            return;
        }

        listening = true;
        document.addEventListener('paste', handlePaste);
    };

    var unlisten = function unlisten(listener) {
        arrayRemove(listeners$1, listeners$1.indexOf(listener));

        // clean up
        if (listeners$1.length === 0) {
            document.removeEventListener('paste', handlePaste);
            listening = false;
        }
    };

    var createPaster = function createPaster() {
        var cb = function cb(files) {
            api.onload(files);
        };

        var api = {
            destroy: function destroy() {
                unlisten(cb);
            },
            onload: function onload() {},
        };

        listen(cb);

        return api;
    };

    /**
     * Creates the file view
     */
    var create$d = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        root.element.id = 'filepond--assistant-' + props.id;
        attr(root.element, 'role', 'status');
        attr(root.element, 'aria-live', 'polite');
        attr(root.element, 'aria-relevant', 'additions');
    };

    var addFilesNotificationTimeout = null;
    var notificationClearTimeout = null;

    var filenames = [];

    var assist = function assist(root, message) {
        root.element.textContent = message;
    };

    var clear$1 = function clear(root) {
        root.element.textContent = '';
    };

    var listModified = function listModified(root, filename, label) {
        var total = root.query('GET_TOTAL_ITEMS');
        assist(
            root,
            label +
                ' ' +
                filename +
                ', ' +
                total +
                ' ' +
                (total === 1
                    ? root.query('GET_LABEL_FILE_COUNT_SINGULAR')
                    : root.query('GET_LABEL_FILE_COUNT_PLURAL'))
        );

        // clear group after set amount of time so the status is not read twice
        clearTimeout(notificationClearTimeout);
        notificationClearTimeout = setTimeout(function() {
            clear$1(root);
        }, 1500);
    };

    var isUsingFilePond = function isUsingFilePond(root) {
        return root.element.parentNode.contains(document.activeElement);
    };

    var itemAdded = function itemAdded(_ref2) {
        var root = _ref2.root,
            action = _ref2.action;
        if (!isUsingFilePond(root)) {
            return;
        }

        root.element.textContent = '';
        var item = root.query('GET_ITEM', action.id);
        filenames.push(item.filename);

        clearTimeout(addFilesNotificationTimeout);
        addFilesNotificationTimeout = setTimeout(function() {
            listModified(root, filenames.join(', '), root.query('GET_LABEL_FILE_ADDED'));

            filenames.length = 0;
        }, 750);
    };

    var itemRemoved = function itemRemoved(_ref3) {
        var root = _ref3.root,
            action = _ref3.action;
        if (!isUsingFilePond(root)) {
            return;
        }

        var item = action.item;
        listModified(root, item.filename, root.query('GET_LABEL_FILE_REMOVED'));
    };

    var itemProcessed = function itemProcessed(_ref4) {
        var root = _ref4.root,
            action = _ref4.action;
        // will also notify the user when FilePond is not being used, as the user might be occupied with other activities while uploading a file

        var item = root.query('GET_ITEM', action.id);
        var filename = item.filename;
        var label = root.query('GET_LABEL_FILE_PROCESSING_COMPLETE');

        assist(root, filename + ' ' + label);
    };

    var itemProcessedUndo = function itemProcessedUndo(_ref5) {
        var root = _ref5.root,
            action = _ref5.action;
        var item = root.query('GET_ITEM', action.id);
        var filename = item.filename;
        var label = root.query('GET_LABEL_FILE_PROCESSING_ABORTED');

        assist(root, filename + ' ' + label);
    };

    var itemError = function itemError(_ref6) {
        var root = _ref6.root,
            action = _ref6.action;
        var item = root.query('GET_ITEM', action.id);
        var filename = item.filename;

        // will also notify the user when FilePond is not being used, as the user might be occupied with other activities while uploading a file

        assist(root, action.status.main + ' ' + filename + ' ' + action.status.sub);
    };

    var assistant = createView({
        create: create$d,
        ignoreRect: true,
        ignoreRectUpdate: true,
        write: createRoute({
            DID_LOAD_ITEM: itemAdded,
            DID_REMOVE_ITEM: itemRemoved,
            DID_COMPLETE_ITEM_PROCESSING: itemProcessed,

            DID_ABORT_ITEM_PROCESSING: itemProcessedUndo,
            DID_REVERT_ITEM_PROCESSING: itemProcessedUndo,

            DID_THROW_ITEM_REMOVE_ERROR: itemError,
            DID_THROW_ITEM_LOAD_ERROR: itemError,
            DID_THROW_ITEM_INVALID: itemError,
            DID_THROW_ITEM_PROCESSING_ERROR: itemError,
        }),

        tag: 'span',
        name: 'assistant',
    });

    var toCamels = function toCamels(string) {
        var separator = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '-';
        return string.replace(new RegExp(separator + '.', 'g'), function(sub) {
            return sub.charAt(1).toUpperCase();
        });
    };

    var debounce = function debounce(func) {
        var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 16;
        var immidiateOnly =
            arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var last = Date.now();
        var timeout = null;

        return function() {
            for (
                var _len = arguments.length, args = new Array(_len), _key = 0;
                _key < _len;
                _key++
            ) {
                args[_key] = arguments[_key];
            }
            clearTimeout(timeout);

            var dist = Date.now() - last;

            var fn = function fn() {
                last = Date.now();
                func.apply(void 0, args);
            };

            if (dist < interval) {
                // we need to delay by the difference between interval and dist
                // for example: if distance is 10 ms and interval is 16 ms,
                // we need to wait an additional 6ms before calling the function)
                if (!immidiateOnly) {
                    timeout = setTimeout(fn, interval - dist);
                }
            } else {
                // go!
                fn();
            }
        };
    };

    var MAX_FILES_LIMIT = 1000000;

    var prevent = function prevent(e) {
        return e.preventDefault();
    };

    var create$e = function create(_ref) {
        var root = _ref.root,
            props = _ref.props;
        // Add id
        var id = root.query('GET_ID');
        if (id) {
            root.element.id = id;
        }

        // Add className
        var className = root.query('GET_CLASS_NAME');
        if (className) {
            className
                .split(' ')
                .filter(function(name) {
                    return name.length;
                })
                .forEach(function(name) {
                    root.element.classList.add(name);
                });
        }

        // Field label
        root.ref.label = root.appendChildView(
            root.createChildView(
                dropLabel,
                Object.assign({}, props, {
                    translateY: null,
                    caption: root.query('GET_LABEL_IDLE'),
                })
            )
        );

        // List of items
        root.ref.list = root.appendChildView(
            root.createChildView(listScroller, { translateY: null })
        );

        // Background panel
        root.ref.panel = root.appendChildView(root.createChildView(panel, { name: 'panel-root' }));

        // Assistant notifies assistive tech when content changes
        root.ref.assistant = root.appendChildView(
            root.createChildView(assistant, Object.assign({}, props))
        );

        // Data
        root.ref.data = root.appendChildView(root.createChildView(data, Object.assign({}, props)));

        // Measure (tests if fixed height was set)
        // DOCTYPE needs to be set for this to work
        root.ref.measure = createElement$1('div');
        root.ref.measure.style.height = '100%';
        root.element.appendChild(root.ref.measure);

        // information on the root height or fixed height status
        root.ref.bounds = null;

        // apply initial style properties
        root.query('GET_STYLES')
            .filter(function(style) {
                return !isEmpty(style.value);
            })
            .map(function(_ref2) {
                var name = _ref2.name,
                    value = _ref2.value;
                root.element.dataset[name] = value;
            });

        // determine if width changed
        root.ref.widthPrevious = null;
        root.ref.widthUpdated = debounce(function() {
            root.ref.updateHistory = [];
            root.dispatch('DID_RESIZE_ROOT');
        }, 250);

        // history of updates
        root.ref.previousAspectRatio = null;
        root.ref.updateHistory = [];

        // prevent scrolling and zooming on iOS (only if supports pointer events, for then we can enable reorder)
        var canHover = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
        var hasPointerEvents = 'PointerEvent' in window;
        if (root.query('GET_ALLOW_REORDER') && hasPointerEvents && !canHover) {
            root.element.addEventListener('touchmove', prevent, { passive: false });
            root.element.addEventListener('gesturestart', prevent);
        }

        // add credits
        var credits = root.query('GET_CREDITS');
        var hasCredits = credits.length === 2;
        if (hasCredits) {
            var frag = document.createElement('a');
            frag.className = 'filepond--credits';
            frag.setAttribute('aria-hidden', 'true');
            frag.href = credits[0];
            frag.tabindex = -1;
            frag.target = '_blank';
            frag.rel = 'noopener noreferrer';
            frag.textContent = credits[1];
            root.element.appendChild(frag);
            root.ref.credits = frag;
        }
    };

    var write$9 = function write(_ref3) {
        var root = _ref3.root,
            props = _ref3.props,
            actions = _ref3.actions;
        // route actions
        route$5({ root: root, props: props, actions: actions });

        // apply style properties
        actions
            .filter(function(action) {
                return /^DID_SET_STYLE_/.test(action.type);
            })
            .filter(function(action) {
                return !isEmpty(action.data.value);
            })
            .map(function(_ref4) {
                var type = _ref4.type,
                    data = _ref4.data;
                var name = toCamels(type.substr(8).toLowerCase(), '_');
                root.element.dataset[name] = data.value;
                root.invalidateLayout();
            });

        if (root.rect.element.hidden) return;

        if (root.rect.element.width !== root.ref.widthPrevious) {
            root.ref.widthPrevious = root.rect.element.width;
            root.ref.widthUpdated();
        }

        // get box bounds, we do this only once
        var bounds = root.ref.bounds;
        if (!bounds) {
            bounds = root.ref.bounds = calculateRootBoundingBoxHeight(root);

            // destroy measure element
            root.element.removeChild(root.ref.measure);
            root.ref.measure = null;
        }

        // get quick references to various high level parts of the upload tool
        var _root$ref = root.ref,
            hopper = _root$ref.hopper,
            label = _root$ref.label,
            list = _root$ref.list,
            panel = _root$ref.panel;

        // sets correct state to hopper scope
        if (hopper) {
            hopper.updateHopperState();
        }

        // bool to indicate if we're full or not
        var aspectRatio = root.query('GET_PANEL_ASPECT_RATIO');
        var isMultiItem = root.query('GET_ALLOW_MULTIPLE');
        var totalItems = root.query('GET_TOTAL_ITEMS');
        var maxItems = isMultiItem ? root.query('GET_MAX_FILES') || MAX_FILES_LIMIT : 1;
        var atMaxCapacity = totalItems === maxItems;

        // action used to add item
        var addAction = actions.find(function(action) {
            return action.type === 'DID_ADD_ITEM';
        });

        // if reached max capacity and we've just reached it
        if (atMaxCapacity && addAction) {
            // get interaction type
            var interactionMethod = addAction.data.interactionMethod;

            // hide label
            label.opacity = 0;

            if (isMultiItem) {
                label.translateY = -40;
            } else {
                if (interactionMethod === InteractionMethod.API) {
                    label.translateX = 40;
                } else if (interactionMethod === InteractionMethod.BROWSE) {
                    label.translateY = 40;
                } else {
                    label.translateY = 30;
                }
            }
        } else if (!atMaxCapacity) {
            label.opacity = 1;
            label.translateX = 0;
            label.translateY = 0;
        }

        var listItemMargin = calculateListItemMargin(root);

        var listHeight = calculateListHeight(root);

        var labelHeight = label.rect.element.height;
        var currentLabelHeight = !isMultiItem || atMaxCapacity ? 0 : labelHeight;

        var listMarginTop = atMaxCapacity ? list.rect.element.marginTop : 0;
        var listMarginBottom = totalItems === 0 ? 0 : list.rect.element.marginBottom;

        var visualHeight =
            currentLabelHeight + listMarginTop + listHeight.visual + listMarginBottom;
        var boundsHeight =
            currentLabelHeight + listMarginTop + listHeight.bounds + listMarginBottom;

        // link list to label bottom position
        list.translateY =
            Math.max(0, currentLabelHeight - list.rect.element.marginTop) - listItemMargin.top;

        if (aspectRatio) {
            // fixed aspect ratio

            // calculate height based on width
            var width = root.rect.element.width;
            var height = width * aspectRatio;

            // clear history if aspect ratio has changed
            if (aspectRatio !== root.ref.previousAspectRatio) {
                root.ref.previousAspectRatio = aspectRatio;
                root.ref.updateHistory = [];
            }

            // remember this width
            var history = root.ref.updateHistory;
            history.push(width);

            var MAX_BOUNCES = 2;
            if (history.length > MAX_BOUNCES * 2) {
                var l = history.length;
                var bottom = l - 10;
                var bounces = 0;
                for (var i = l; i >= bottom; i--) {
                    if (history[i] === history[i - 2]) {
                        bounces++;
                    }

                    if (bounces >= MAX_BOUNCES) {
                        // dont adjust height
                        return;
                    }
                }
            }

            // fix height of panel so it adheres to aspect ratio
            panel.scalable = false;
            panel.height = height;

            // available height for list
            var listAvailableHeight =
                // the height of the panel minus the label height
                height -
                currentLabelHeight -
                // the room we leave open between the end of the list and the panel bottom
                (listMarginBottom - listItemMargin.bottom) -
                // if we're full we need to leave some room between the top of the panel and the list
                (atMaxCapacity ? listMarginTop : 0);

            if (listHeight.visual > listAvailableHeight) {
                list.overflow = listAvailableHeight;
            } else {
                list.overflow = null;
            }

            // set container bounds (so pushes siblings downwards)
            root.height = height;
        } else if (bounds.fixedHeight) {
            // fixed height

            // fix height of panel
            panel.scalable = false;

            // available height for list
            var _listAvailableHeight =
                // the height of the panel minus the label height
                bounds.fixedHeight -
                currentLabelHeight -
                // the room we leave open between the end of the list and the panel bottom
                (listMarginBottom - listItemMargin.bottom) -
                // if we're full we need to leave some room between the top of the panel and the list
                (atMaxCapacity ? listMarginTop : 0);

            // set list height
            if (listHeight.visual > _listAvailableHeight) {
                list.overflow = _listAvailableHeight;
            } else {
                list.overflow = null;
            }

            // no need to set container bounds as these are handles by CSS fixed height
        } else if (bounds.cappedHeight) {
            // max-height

            // not a fixed height panel
            var isCappedHeight = visualHeight >= bounds.cappedHeight;
            var panelHeight = Math.min(bounds.cappedHeight, visualHeight);
            panel.scalable = true;
            panel.height = isCappedHeight
                ? panelHeight
                : panelHeight - listItemMargin.top - listItemMargin.bottom;

            // available height for list
            var _listAvailableHeight2 =
                // the height of the panel minus the label height
                panelHeight -
                currentLabelHeight -
                // the room we leave open between the end of the list and the panel bottom
                (listMarginBottom - listItemMargin.bottom) -
                // if we're full we need to leave some room between the top of the panel and the list
                (atMaxCapacity ? listMarginTop : 0);

            // set list height (if is overflowing)
            if (visualHeight > bounds.cappedHeight && listHeight.visual > _listAvailableHeight2) {
                list.overflow = _listAvailableHeight2;
            } else {
                list.overflow = null;
            }

            // set container bounds (so pushes siblings downwards)
            root.height = Math.min(
                bounds.cappedHeight,
                boundsHeight - listItemMargin.top - listItemMargin.bottom
            );
        } else {
            // flexible height

            // not a fixed height panel
            var itemMargin = totalItems > 0 ? listItemMargin.top + listItemMargin.bottom : 0;
            panel.scalable = true;
            panel.height = Math.max(labelHeight, visualHeight - itemMargin);

            // set container bounds (so pushes siblings downwards)
            root.height = Math.max(labelHeight, boundsHeight - itemMargin);
        }

        // move credits to bottom
        if (root.ref.credits && panel.heightCurrent)
            root.ref.credits.style.transform = 'translateY(' + panel.heightCurrent + 'px)';
    };

    var calculateListItemMargin = function calculateListItemMargin(root) {
        var item = root.ref.list.childViews[0].childViews[0];
        return item
            ? {
                  top: item.rect.element.marginTop,
                  bottom: item.rect.element.marginBottom,
              }
            : {
                  top: 0,
                  bottom: 0,
              };
    };

    var calculateListHeight = function calculateListHeight(root) {
        var visual = 0;
        var bounds = 0;

        // get file list reference
        var scrollList = root.ref.list;
        var itemList = scrollList.childViews[0];
        var visibleChildren = itemList.childViews.filter(function(child) {
            return child.rect.element.height;
        });
        var children = root
            .query('GET_ACTIVE_ITEMS')
            .map(function(item) {
                return visibleChildren.find(function(child) {
                    return child.id === item.id;
                });
            })
            .filter(function(item) {
                return item;
            });

        // no children, done!
        if (children.length === 0) return { visual: visual, bounds: bounds };

        var horizontalSpace = itemList.rect.element.width;
        var dragIndex = getItemIndexByPosition(itemList, children, scrollList.dragCoordinates);

        var childRect = children[0].rect.element;

        var itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
        var itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;

        var itemWidth = childRect.width + itemHorizontalMargin;
        var itemHeight = childRect.height + itemVerticalMargin;

        var newItem = typeof dragIndex !== 'undefined' && dragIndex >= 0 ? 1 : 0;
        var removedItem = children.find(function(child) {
            return child.markedForRemoval && child.opacity < 0.45;
        })
            ? -1
            : 0;
        var verticalItemCount = children.length + newItem + removedItem;
        var itemsPerRow = getItemsPerRow(horizontalSpace, itemWidth);

        // stack
        if (itemsPerRow === 1) {
            children.forEach(function(item) {
                var height = item.rect.element.height + itemVerticalMargin;
                bounds += height;
                visual += height * item.opacity;
            });
        }
        // grid
        else {
            bounds = Math.ceil(verticalItemCount / itemsPerRow) * itemHeight;
            visual = bounds;
        }

        return { visual: visual, bounds: bounds };
    };

    var calculateRootBoundingBoxHeight = function calculateRootBoundingBoxHeight(root) {
        var height = root.ref.measureHeight || null;
        var cappedHeight = parseInt(root.style.maxHeight, 10) || null;
        var fixedHeight = height === 0 ? null : height;

        return {
            cappedHeight: cappedHeight,
            fixedHeight: fixedHeight,
        };
    };

    var exceedsMaxFiles = function exceedsMaxFiles(root, items) {
        var allowReplace = root.query('GET_ALLOW_REPLACE');
        var allowMultiple = root.query('GET_ALLOW_MULTIPLE');
        var totalItems = root.query('GET_TOTAL_ITEMS');
        var maxItems = root.query('GET_MAX_FILES');

        // total amount of items being dragged
        var totalBrowseItems = items.length;

        // if does not allow multiple items and dragging more than one item
        if (!allowMultiple && totalBrowseItems > 1) {
            return true;
        }

        // limit max items to one if not allowed to drop multiple items
        maxItems = allowMultiple ? maxItems : allowReplace ? maxItems : 1;

        // no more room?
        var hasMaxItems = isInt(maxItems);
        if (hasMaxItems && totalItems + totalBrowseItems > maxItems) {
            root.dispatch('DID_THROW_MAX_FILES', {
                source: items,
                error: createResponse('warning', 0, 'Max files'),
            });

            return true;
        }

        return false;
    };

    var getDragIndex = function getDragIndex(list, children, position) {
        var itemList = list.childViews[0];
        return getItemIndexByPosition(itemList, children, {
            left: position.scopeLeft - itemList.rect.element.left,
            top:
                position.scopeTop -
                (list.rect.outer.top + list.rect.element.marginTop + list.rect.element.scrollTop),
        });
    };

    /**
     * Enable or disable file drop functionality
     */
    var toggleDrop = function toggleDrop(root) {
        var isAllowed = root.query('GET_ALLOW_DROP');
        var isDisabled = root.query('GET_DISABLED');
        var enabled = isAllowed && !isDisabled;
        if (enabled && !root.ref.hopper) {
            var hopper = createHopper(
                root.element,
                function(items) {
                    // allow quick validation of dropped items
                    var beforeDropFile =
                        root.query('GET_BEFORE_DROP_FILE') ||
                        function() {
                            return true;
                        };

                    // all items should be validated by all filters as valid
                    var dropValidation = root.query('GET_DROP_VALIDATION');
                    return dropValidation
                        ? items.every(function(item) {
                              return (
                                  applyFilters('ALLOW_HOPPER_ITEM', item, {
                                      query: root.query,
                                  }).every(function(result) {
                                      return result === true;
                                  }) && beforeDropFile(item)
                              );
                          })
                        : true;
                },
                {
                    filterItems: function filterItems(items) {
                        var ignoredFiles = root.query('GET_IGNORED_FILES');
                        return items.filter(function(item) {
                            if (isFile(item)) {
                                return !ignoredFiles.includes(item.name.toLowerCase());
                            }
                            return true;
                        });
                    },
                    catchesDropsOnPage: root.query('GET_DROP_ON_PAGE'),
                    requiresDropOnElement: root.query('GET_DROP_ON_ELEMENT'),
                }
            );

            hopper.onload = function(items, position) {
                // get item children elements and sort based on list sort
                var list = root.ref.list.childViews[0];
                var visibleChildren = list.childViews.filter(function(child) {
                    return child.rect.element.height;
                });
                var children = root
                    .query('GET_ACTIVE_ITEMS')
                    .map(function(item) {
                        return visibleChildren.find(function(child) {
                            return child.id === item.id;
                        });
                    })
                    .filter(function(item) {
                        return item;
                    });

                applyFilterChain('ADD_ITEMS', items, { dispatch: root.dispatch }).then(function(
                    queue
                ) {
                    // these files don't fit so stop here
                    if (exceedsMaxFiles(root, queue)) return false;

                    // go
                    root.dispatch('ADD_ITEMS', {
                        items: queue,
                        index: getDragIndex(root.ref.list, children, position),
                        interactionMethod: InteractionMethod.DROP,
                    });
                });

                root.dispatch('DID_DROP', { position: position });

                root.dispatch('DID_END_DRAG', { position: position });
            };

            hopper.ondragstart = function(position) {
                root.dispatch('DID_START_DRAG', { position: position });
            };

            hopper.ondrag = debounce(function(position) {
                root.dispatch('DID_DRAG', { position: position });
            });

            hopper.ondragend = function(position) {
                root.dispatch('DID_END_DRAG', { position: position });
            };

            root.ref.hopper = hopper;

            root.ref.drip = root.appendChildView(root.createChildView(drip));
        } else if (!enabled && root.ref.hopper) {
            root.ref.hopper.destroy();
            root.ref.hopper = null;
            root.removeChildView(root.ref.drip);
        }
    };

    /**
     * Enable or disable browse functionality
     */
    var toggleBrowse = function toggleBrowse(root, props) {
        var isAllowed = root.query('GET_ALLOW_BROWSE');
        var isDisabled = root.query('GET_DISABLED');
        var enabled = isAllowed && !isDisabled;
        if (enabled && !root.ref.browser) {
            root.ref.browser = root.appendChildView(
                root.createChildView(
                    browser,
                    Object.assign({}, props, {
                        onload: function onload(items) {
                            applyFilterChain('ADD_ITEMS', items, {
                                dispatch: root.dispatch,
                            }).then(function(queue) {
                                // these files don't fit so stop here
                                if (exceedsMaxFiles(root, queue)) return false;

                                // add items!
                                root.dispatch('ADD_ITEMS', {
                                    items: queue,
                                    index: -1,
                                    interactionMethod: InteractionMethod.BROWSE,
                                });
                            });
                        },
                    })
                ),

                0
            );
        } else if (!enabled && root.ref.browser) {
            root.removeChildView(root.ref.browser);
            root.ref.browser = null;
        }
    };

    /**
     * Enable or disable paste functionality
     */
    var togglePaste = function togglePaste(root) {
        var isAllowed = root.query('GET_ALLOW_PASTE');
        var isDisabled = root.query('GET_DISABLED');
        var enabled = isAllowed && !isDisabled;
        if (enabled && !root.ref.paster) {
            root.ref.paster = createPaster();
            root.ref.paster.onload = function(items) {
                applyFilterChain('ADD_ITEMS', items, { dispatch: root.dispatch }).then(function(
                    queue
                ) {
                    // these files don't fit so stop here
                    if (exceedsMaxFiles(root, queue)) return false;

                    // add items!
                    root.dispatch('ADD_ITEMS', {
                        items: queue,
                        index: -1,
                        interactionMethod: InteractionMethod.PASTE,
                    });
                });
            };
        } else if (!enabled && root.ref.paster) {
            root.ref.paster.destroy();
            root.ref.paster = null;
        }
    };

    /**
     * Route actions
     */
    var route$5 = createRoute({
        DID_SET_ALLOW_BROWSE: function DID_SET_ALLOW_BROWSE(_ref5) {
            var root = _ref5.root,
                props = _ref5.props;
            toggleBrowse(root, props);
        },
        DID_SET_ALLOW_DROP: function DID_SET_ALLOW_DROP(_ref6) {
            var root = _ref6.root;
            toggleDrop(root);
        },
        DID_SET_ALLOW_PASTE: function DID_SET_ALLOW_PASTE(_ref7) {
            var root = _ref7.root;
            togglePaste(root);
        },
        DID_SET_DISABLED: function DID_SET_DISABLED(_ref8) {
            var root = _ref8.root,
                props = _ref8.props;
            toggleDrop(root);
            togglePaste(root);
            toggleBrowse(root, props);
            var isDisabled = root.query('GET_DISABLED');
            if (isDisabled) {
                root.element.dataset.disabled = 'disabled';
            } else {
                // delete root.element.dataset.disabled; <= this does not work on iOS 10
                root.element.removeAttribute('data-disabled');
            }
        },
    });

    var root = createView({
        name: 'root',
        read: function read(_ref9) {
            var root = _ref9.root;
            if (root.ref.measure) {
                root.ref.measureHeight = root.ref.measure.offsetHeight;
            }
        },
        create: create$e,
        write: write$9,
        destroy: function destroy(_ref10) {
            var root = _ref10.root;
            if (root.ref.paster) {
                root.ref.paster.destroy();
            }
            if (root.ref.hopper) {
                root.ref.hopper.destroy();
            }
            root.element.removeEventListener('touchmove', prevent);
            root.element.removeEventListener('gesturestart', prevent);
        },
        mixins: {
            styles: ['height'],
        },
    });

    // creates the app
    var createApp = function createApp() {
        var initialOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // let element
        var originalElement = null;

        // get default options
        var defaultOptions = getOptions();

        // create the data store, this will contain all our app info
        var store = createStore(
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
        var visibilityHandler = function visibilityHandler() {
            if (document.hidden) return;
            store.dispatch('KICK');
        };
        document.addEventListener('visibilitychange', visibilityHandler);

        // re-render on window resize start and finish
        var resizeDoneTimer = null;
        var isResizing = false;
        var isResizingHorizontally = false;
        var initialWindowWidth = null;
        var currentWindowWidth = null;
        var resizeHandler = function resizeHandler() {
            if (!isResizing) {
                isResizing = true;
            }
            clearTimeout(resizeDoneTimer);
            resizeDoneTimer = setTimeout(function() {
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
        var view = root(store, { id: getUniqueId() });

        //
        // PRIVATE API -------------------------------------------------------------------------------------
        //
        var isResting = false;
        var isHidden = false;

        var readWriteApi = {
            // necessary for update loop

            /**
             * Reads from dom (never call manually)
             * @private
             */
            _read: function _read() {
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
            _write: function _write(ts) {
                // get all actions from store
                var actions = store
                    .processActionQueue()

                    // filter out set actions (these will automatically trigger DID_SET)
                    .filter(function(action) {
                        return !/^SET_/.test(action.type);
                    });

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
            },
        };

        //
        // EXPOSE EVENTS -------------------------------------------------------------------------------------
        //
        var createEvent = function createEvent(name) {
            return function(data) {
                // create default event
                var event = {
                    type: name,
                };

                // no data to add
                if (!data) {
                    return event;
                }

                // copy relevant props
                if (data.hasOwnProperty('error')) {
                    event.error = data.error ? Object.assign({}, data.error) : null;
                }

                if (data.status) {
                    event.status = Object.assign({}, data.status);
                }

                if (data.file) {
                    event.output = data.file;
                }

                // only source is available, else add item if possible
                if (data.source) {
                    event.file = data.source;
                } else if (data.item || data.id) {
                    var item = data.item ? data.item : store.query('GET_ITEM', data.id);
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
        };

        var eventRoutes = {
            DID_DESTROY: createEvent('destroy'),

            DID_INIT: createEvent('init'),

            DID_THROW_MAX_FILES: createEvent('warning'),

            DID_INIT_ITEM: createEvent('initfile'),
            DID_START_ITEM_LOAD: createEvent('addfilestart'),
            DID_UPDATE_ITEM_LOAD_PROGRESS: createEvent('addfileprogress'),
            DID_LOAD_ITEM: createEvent('addfile'),

            DID_THROW_ITEM_INVALID: [createEvent('error'), createEvent('addfile')],

            DID_THROW_ITEM_LOAD_ERROR: [createEvent('error'), createEvent('addfile')],

            DID_THROW_ITEM_REMOVE_ERROR: [createEvent('error'), createEvent('removefile')],

            DID_PREPARE_OUTPUT: createEvent('preparefile'),

            DID_START_ITEM_PROCESSING: createEvent('processfilestart'),
            DID_UPDATE_ITEM_PROCESS_PROGRESS: createEvent('processfileprogress'),
            DID_ABORT_ITEM_PROCESSING: createEvent('processfileabort'),
            DID_COMPLETE_ITEM_PROCESSING: createEvent('processfile'),
            DID_COMPLETE_ITEM_PROCESSING_ALL: createEvent('processfiles'),
            DID_REVERT_ITEM_PROCESSING: createEvent('processfilerevert'),

            DID_THROW_ITEM_PROCESSING_ERROR: [createEvent('error'), createEvent('processfile')],

            DID_REMOVE_ITEM: createEvent('removefile'),

            DID_UPDATE_ITEMS: createEvent('updatefiles'),

            DID_ACTIVATE_ITEM: createEvent('activatefile'),

            DID_REORDER_ITEMS: createEvent('reorderfiles'),
        };

        var exposeEvent = function exposeEvent(event) {
            // create event object to be dispatched
            var detail = Object.assign({ pond: exports }, event);
            delete detail.type;
            view.element.dispatchEvent(
                new CustomEvent('FilePond:' + event.type, {
                    // event info
                    detail: detail,

                    // event behaviour
                    bubbles: true,
                    cancelable: true,
                    composed: true, // triggers listeners outside of shadow root
                })
            );

            // event object to params used for `on()` event handlers and callbacks `oninit()`
            var params = [];

            // if is possible error event, make it the first param
            if (event.hasOwnProperty('error')) {
                params.push(event.error);
            }

            // file is always section
            if (event.hasOwnProperty('file')) {
                params.push(event.file);
            }

            // append other props
            var filtered = ['type', 'error', 'file'];
            Object.keys(event)
                .filter(function(key) {
                    return !filtered.includes(key);
                })
                .forEach(function(key) {
                    return params.push(event[key]);
                });

            // on(type, () => { })
            exports.fire.apply(exports, [event.type].concat(params));

            // oninit = () => {}
            var handler = store.query('GET_ON' + event.type.toUpperCase());
            if (handler) {
                handler.apply(void 0, params);
            }
        };

        var routeActionsToEvents = function routeActionsToEvents(actions) {
            if (!actions.length) return;
            actions
                .filter(function(action) {
                    return eventRoutes[action.type];
                })
                .forEach(function(action) {
                    var routes = eventRoutes[action.type];
                    (Array.isArray(routes) ? routes : [routes]).forEach(function(route) {
                        // this isn't fantastic, but because of the stacking of settimeouts plugins can handle the did_load before the did_init
                        if (action.type === 'DID_INIT_ITEM') {
                            exposeEvent(route(action.data));
                        } else {
                            setTimeout(function() {
                                exposeEvent(route(action.data));
                            }, 0);
                        }
                    });
                });
        };

        //
        // PUBLIC API -------------------------------------------------------------------------------------
        //
        var setOptions = function setOptions(options) {
            return store.dispatch('SET_OPTIONS', { options: options });
        };

        var getFile = function getFile(query) {
            return store.query('GET_ACTIVE_ITEM', query);
        };

        var prepareFile = function prepareFile(query) {
            return new Promise(function(resolve, reject) {
                store.dispatch('REQUEST_ITEM_PREPARE', {
                    query: query,
                    success: function success(item) {
                        resolve(item);
                    },
                    failure: function failure(error) {
                        reject(error);
                    },
                });
            });
        };

        var addFile = function addFile(source) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            return new Promise(function(resolve, reject) {
                addFiles([{ source: source, options: options }], { index: options.index })
                    .then(function(items) {
                        return resolve(items && items[0]);
                    })
                    .catch(reject);
            });
        };

        var isFilePondFile = function isFilePondFile(obj) {
            return obj.file && obj.id;
        };

        var removeFile = function removeFile(query, options) {
            // if only passed options
            if (typeof query === 'object' && !isFilePondFile(query) && !options) {
                options = query;
                query = undefined;
            }

            // request item removal
            store.dispatch('REMOVE_ITEM', Object.assign({}, options, { query: query }));

            // see if item has been removed
            return store.query('GET_ACTIVE_ITEM', query) === null;
        };

        var addFiles = function addFiles() {
            for (
                var _len = arguments.length, args = new Array(_len), _key = 0;
                _key < _len;
                _key++
            ) {
                args[_key] = arguments[_key];
            }
            return new Promise(function(resolve, reject) {
                var sources = [];
                var options = {};

                // user passed a sources array
                if (isArray(args[0])) {
                    sources.push.apply(sources, args[0]);
                    Object.assign(options, args[1] || {});
                } else {
                    // user passed sources as arguments, last one might be options object
                    var lastArgument = args[args.length - 1];
                    if (typeof lastArgument === 'object' && !(lastArgument instanceof Blob)) {
                        Object.assign(options, args.pop());
                    }

                    // add rest to sources
                    sources.push.apply(sources, args);
                }

                store.dispatch('ADD_ITEMS', {
                    items: sources,
                    index: options.index,
                    interactionMethod: InteractionMethod.API,
                    success: resolve,
                    failure: reject,
                });
            });
        };

        var getFiles = function getFiles() {
            return store.query('GET_ACTIVE_ITEMS');
        };

        var processFile = function processFile(query) {
            return new Promise(function(resolve, reject) {
                store.dispatch('REQUEST_ITEM_PROCESSING', {
                    query: query,
                    success: function success(item) {
                        resolve(item);
                    },
                    failure: function failure(error) {
                        reject(error);
                    },
                });
            });
        };

        var prepareFiles = function prepareFiles() {
            for (
                var _len2 = arguments.length, args = new Array(_len2), _key2 = 0;
                _key2 < _len2;
                _key2++
            ) {
                args[_key2] = arguments[_key2];
            }
            var queries = Array.isArray(args[0]) ? args[0] : args;
            var items = queries.length ? queries : getFiles();
            return Promise.all(items.map(prepareFile));
        };

        var processFiles = function processFiles() {
            for (
                var _len3 = arguments.length, args = new Array(_len3), _key3 = 0;
                _key3 < _len3;
                _key3++
            ) {
                args[_key3] = arguments[_key3];
            }
            var queries = Array.isArray(args[0]) ? args[0] : args;
            if (!queries.length) {
                var files = getFiles().filter(function(item) {
                    return (
                        !(item.status === ItemStatus.IDLE && item.origin === FileOrigin.LOCAL) &&
                        item.status !== ItemStatus.PROCESSING &&
                        item.status !== ItemStatus.PROCESSING_COMPLETE &&
                        item.status !== ItemStatus.PROCESSING_REVERT_ERROR
                    );
                });

                return Promise.all(files.map(processFile));
            }
            return Promise.all(queries.map(processFile));
        };

        var removeFiles = function removeFiles() {
            for (
                var _len4 = arguments.length, args = new Array(_len4), _key4 = 0;
                _key4 < _len4;
                _key4++
            ) {
                args[_key4] = arguments[_key4];
            }

            var queries = Array.isArray(args[0]) ? args[0] : args;

            var options;
            if (typeof queries[queries.length - 1] === 'object') {
                options = queries.pop();
            } else if (Array.isArray(args[0])) {
                options = args[1];
            }

            var files = getFiles();

            if (!queries.length)
                return Promise.all(
                    files.map(function(file) {
                        return removeFile(file, options);
                    })
                );

            // when removing by index the indexes shift after each file removal so we need to convert indexes to ids
            var mappedQueries = queries
                .map(function(query) {
                    return isNumber(query) ? (files[query] ? files[query].id : null) : query;
                })
                .filter(function(query) {
                    return query;
                });

            return mappedQueries.map(function(q) {
                return removeFile(q, options);
            });
        };

        var exports = Object.assign(
            {},

            on(),
            {},

            readWriteApi,
            {},

            createOptionAPI(store, defaultOptions),
            {
                /**
                 * Override options defined in options object
                 * @param options
                 */
                setOptions: setOptions,

                /**
                 * Load the given file
                 * @param source - the source of the file (either a File, base64 data uri or url)
                 * @param options - object, { index: 0 }
                 */
                addFile: addFile,

                /**
                 * Load the given files
                 * @param sources - the sources of the files to load
                 * @param options - object, { index: 0 }
                 */
                addFiles: addFiles,

                /**
                 * Returns the file objects matching the given query
                 * @param query { string, number, null }
                 */
                getFile: getFile,

                /**
                 * Upload file with given name
                 * @param query { string, number, null  }
                 */
                processFile: processFile,

                /**
                 * Request prepare output for file with given name
                 * @param query { string, number, null  }
                 */
                prepareFile: prepareFile,

                /**
                 * Removes a file by its name
                 * @param query { string, number, null  }
                 */
                removeFile: removeFile,

                /**
                 * Moves a file to a new location in the files list
                 */
                moveFile: function moveFile(query, index) {
                    return store.dispatch('MOVE_ITEM', { query: query, index: index });
                },

                /**
                 * Returns all files (wrapped in public api)
                 */
                getFiles: getFiles,

                /**
                 * Starts uploading all files
                 */
                processFiles: processFiles,

                /**
                 * Clears all files from the files list
                 */
                removeFiles: removeFiles,

                /**
                 * Starts preparing output of all files
                 */
                prepareFiles: prepareFiles,

                /**
                 * Sort list of files
                 */
                sort: function sort(compare) {
                    return store.dispatch('SORT', { compare: compare });
                },

                /**
                 * Browse the file system for a file
                 */
                browse: function browse() {
                    // needs to be trigger directly as user action needs to be traceable (is not traceable in requestAnimationFrame)
                    var input = view.element.querySelector('input[type=file]');
                    if (input) {
                        input.click();
                    }
                },

                /**
                 * Destroys the app
                 */
                destroy: function destroy() {
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
                insertBefore: function insertBefore$1(element) {
                    return insertBefore(view.element, element);
                },

                /**
                 * Inserts the plugin after the target element
                 */
                insertAfter: function insertAfter$1(element) {
                    return insertAfter(view.element, element);
                },

                /**
                 * Appends the plugin to the target element
                 */
                appendTo: function appendTo(element) {
                    return element.appendChild(view.element);
                },

                /**
                 * Replaces an element with the app
                 */
                replaceElement: function replaceElement(element) {
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
                restoreElement: function restoreElement() {
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
                isAttachedTo: function isAttachedTo(element) {
                    return view.element === element || originalElement === element;
                },

                /**
                 * Returns the root element
                 */
                element: {
                    get: function get() {
                        return view.element;
                    },
                },

                /**
                 * Returns the current pond status
                 */
                status: {
                    get: function get() {
                        return store.query('GET_STATUS');
                    },
                },
            }
        );

        // Done!
        store.dispatch('DID_INIT');

        // create actual api object
        return createObject(exports);
    };

    var createAppObject = function createAppObject() {
        var customOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // default options
        var defaultOptions = {};
        forin(getOptions(), function(key, value) {
            defaultOptions[key] = value[0];
        });

        // set app options
        var app = createApp(
            Object.assign(
                {},

                defaultOptions,
                {},

                customOptions
            )
        );

        // return the plugin instance
        return app;
    };

    var lowerCaseFirstLetter = function lowerCaseFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    };

    var attributeNameToPropertyName = function attributeNameToPropertyName(attributeName) {
        return toCamels(attributeName.replace(/^data-/, ''));
    };

    var mapObject = function mapObject(object, propertyMap) {
        // remove unwanted
        forin(propertyMap, function(selector, mapping) {
            forin(object, function(property, value) {
                // create regexp shortcut
                var selectorRegExp = new RegExp(selector);

                // tests if
                var matches = selectorRegExp.test(property);

                // no match, skip
                if (!matches) {
                    return;
                }

                // if there's a mapping, the original property is always removed
                delete object[property];

                // should only remove, we done!
                if (mapping === false) {
                    return;
                }

                // move value to new property
                if (isString(mapping)) {
                    object[mapping] = value;
                    return;
                }

                // move to group
                var group = mapping.group;
                if (isObject(mapping) && !object[group]) {
                    object[group] = {};
                }

                object[group][lowerCaseFirstLetter(property.replace(selectorRegExp, ''))] = value;
            });

            // do submapping
            if (mapping.mapping) {
                mapObject(object[mapping.group], mapping.mapping);
            }
        });
    };

    var getAttributesAsObject = function getAttributesAsObject(node) {
        var attributeMapping =
            arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        // turn attributes into object
        var attributes = [];
        forin(node.attributes, function(index) {
            attributes.push(node.attributes[index]);
        });

        var output = attributes
            .filter(function(attribute) {
                return attribute.name;
            })
            .reduce(function(obj, attribute) {
                var value = attr(node, attribute.name);

                obj[attributeNameToPropertyName(attribute.name)] =
                    value === attribute.name ? true : value;
                return obj;
            }, {});

        // do mapping of object properties
        mapObject(output, attributeMapping);

        return output;
    };

    var createAppAtElement = function createAppAtElement(element) {
        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        // how attributes of the input element are mapped to the options for the plugin
        var attributeMapping = {
            // translate to other name
            '^class$': 'className',
            '^multiple$': 'allowMultiple',
            '^capture$': 'captureMethod',
            '^webkitdirectory$': 'allowDirectoriesOnly',

            // group under single property
            '^server': {
                group: 'server',
                mapping: {
                    '^process': {
                        group: 'process',
                    },

                    '^revert': {
                        group: 'revert',
                    },

                    '^fetch': {
                        group: 'fetch',
                    },

                    '^restore': {
                        group: 'restore',
                    },

                    '^load': {
                        group: 'load',
                    },
                },
            },

            // don't include in object
            '^type$': false,
            '^files$': false,
        };

        // add additional option translators
        applyFilters('SET_ATTRIBUTE_TO_OPTION_MAP', attributeMapping);

        // create final options object by setting options object and then overriding options supplied on element
        var mergedOptions = Object.assign({}, options);

        var attributeOptions = getAttributesAsObject(
            element.nodeName === 'FIELDSET' ? element.querySelector('input[type=file]') : element,
            attributeMapping
        );

        // merge with options object
        Object.keys(attributeOptions).forEach(function(key) {
            if (isObject(attributeOptions[key])) {
                if (!isObject(mergedOptions[key])) {
                    mergedOptions[key] = {};
                }
                Object.assign(mergedOptions[key], attributeOptions[key]);
            } else {
                mergedOptions[key] = attributeOptions[key];
            }
        });

        // if parent is a fieldset, get files from parent by selecting all input fields that are not file upload fields
        // these will then be automatically set to the initial files
        mergedOptions.files = (options.files || []).concat(
            Array.from(element.querySelectorAll('input:not([type=file])')).map(function(input) {
                return {
                    source: input.value,
                    options: {
                        type: input.dataset.type,
                    },
                };
            })
        );

        // build plugin
        var app = createAppObject(mergedOptions);

        // add already selected files
        if (element.files) {
            Array.from(element.files).forEach(function(file) {
                app.addFile(file);
            });
        }

        // replace the target element
        app.replaceElement(element);

        // expose
        return app;
    };

    // if an element is passed, we create the instance at that element, if not, we just create an up object
    var createApp$1 = function createApp() {
        return isNode(arguments.length <= 0 ? undefined : arguments[0])
            ? createAppAtElement.apply(void 0, arguments)
            : createAppObject.apply(void 0, arguments);
    };

    var PRIVATE_METHODS = ['fire', '_read', '_write'];

    var createAppAPI = function createAppAPI(app) {
        var api = {};

        copyObjectPropertiesToObject(app, api, PRIVATE_METHODS);

        return api;
    };

    /**
     * Replaces placeholders in given string with replacements
     * @param string - "Foo {bar}""
     * @param replacements - { "bar": 10 }
     */
    var replaceInString = function replaceInString(string, replacements) {
        return string.replace(/(?:{([a-zA-Z]+)})/g, function(match, group) {
            return replacements[group];
        });
    };

    var createWorker = function createWorker(fn) {
        var workerBlob = new Blob(['(', fn.toString(), ')()'], {
            type: 'application/javascript',
        });

        var workerURL = URL.createObjectURL(workerBlob);
        var worker = new Worker(workerURL);

        return {
            transfer: function transfer(message, cb) {},
            post: function post(message, cb, transferList) {
                var id = getUniqueId();

                worker.onmessage = function(e) {
                    if (e.data.id === id) {
                        cb(e.data.message);
                    }
                };

                worker.postMessage(
                    {
                        id: id,
                        message: message,
                    },

                    transferList
                );
            },
            terminate: function terminate() {
                worker.terminate();
                URL.revokeObjectURL(workerURL);
            },
        };
    };

    var loadImage = function loadImage(url) {
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.onerror = function(e) {
                reject(e);
            };
            img.src = url;
        });
    };

    var renameFile = function renameFile(file, name) {
        var renamedFile = file.slice(0, file.size, file.type);
        renamedFile.lastModifiedDate = file.lastModifiedDate;
        renamedFile.name = name;
        return renamedFile;
    };

    var copyFile = function copyFile(file) {
        return renameFile(file, file.name);
    };

    // already registered plugins (can't register twice)
    var registeredPlugins = [];

    // pass utils to plugin
    var createAppPlugin = function createAppPlugin(plugin) {
        // already registered
        if (registeredPlugins.includes(plugin)) {
            return;
        }

        // remember this plugin
        registeredPlugins.push(plugin);

        // setup!
        var pluginOutline = plugin({
            addFilter: addFilter,
            utils: {
                Type: Type,
                forin: forin,
                isString: isString,
                isFile: isFile,
                toNaturalFileSize: toNaturalFileSize,
                replaceInString: replaceInString,
                getExtensionFromFilename: getExtensionFromFilename,
                getFilenameWithoutExtension: getFilenameWithoutExtension,
                guesstimateMimeType: guesstimateMimeType,
                getFileFromBlob: getFileFromBlob,
                getFilenameFromURL: getFilenameFromURL,
                createRoute: createRoute,
                createWorker: createWorker,
                createView: createView,
                createItemAPI: createItemAPI,
                loadImage: loadImage,
                copyFile: copyFile,
                renameFile: renameFile,
                createBlob: createBlob,
                applyFilterChain: applyFilterChain,
                text: text,
                getNumericAspectRatioFromString: getNumericAspectRatioFromString,
            },

            views: {
                fileActionButton: fileActionButton,
            },
        });

        // add plugin options to default options
        extendDefaultOptions(pluginOutline.options);
    };

    // feature detection used by supported() method
    var isOperaMini = function isOperaMini() {
        return Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
    };
    var hasPromises = function hasPromises() {
        return 'Promise' in window;
    };
    var hasBlobSlice = function hasBlobSlice() {
        return 'slice' in Blob.prototype;
    };
    var hasCreateObjectURL = function hasCreateObjectURL() {
        return 'URL' in window && 'createObjectURL' in window.URL;
    };
    var hasVisibility = function hasVisibility() {
        return 'visibilityState' in document;
    };
    var hasTiming = function hasTiming() {
        return 'performance' in window;
    }; // iOS 8.x
    var hasCSSSupports = function hasCSSSupports() {
        return 'supports' in (window.CSS || {});
    }; // use to detect Safari 9+
    var isIE11 = function isIE11() {
        return /MSIE|Trident/.test(window.navigator.userAgent);
    };

    var supported = (function() {
        // Runs immediately and then remembers result for subsequent calls
        var isSupported =
            // Has to be a browser
            isBrowser() &&
            // Can't run on Opera Mini due to lack of everything
            !isOperaMini() &&
            // Require these APIs to feature detect a modern browser
            hasVisibility() &&
            hasPromises() &&
            hasBlobSlice() &&
            hasCreateObjectURL() &&
            hasTiming() &&
            // doesn't need CSSSupports but is a good way to detect Safari 9+ (we do want to support IE11 though)
            (hasCSSSupports() || isIE11());

        return function() {
            return isSupported;
        };
    })();

    /**
     * Plugin internal state (over all instances)
     */
    var state = {
        // active app instances, used to redraw the apps and to find the later
        apps: [],
    };

    // plugin name
    var name = 'filepond';

    /**
     * Public Plugin methods
     */
    var fn = function fn() {};
    exports.Status = {};
    exports.FileStatus = {};
    exports.FileOrigin = {};
    exports.OptionTypes = {};
    exports.create = fn;
    exports.destroy = fn;
    exports.parse = fn;
    exports.find = fn;
    exports.registerPlugin = fn;
    exports.getOptions = fn;
    exports.setOptions = fn;

    // if not supported, no API
    if (supported()) {
        // start painter and fire load event
        createPainter(
            function() {
                state.apps.forEach(function(app) {
                    return app._read();
                });
            },
            function(ts) {
                state.apps.forEach(function(app) {
                    return app._write(ts);
                });
            }
        );

        // fire loaded event so we know when FilePond is available
        var dispatch = function dispatch() {
            // let others know we have area ready
            document.dispatchEvent(
                new CustomEvent('FilePond:loaded', {
                    detail: {
                        supported: supported,
                        create: exports.create,
                        destroy: exports.destroy,
                        parse: exports.parse,
                        find: exports.find,
                        registerPlugin: exports.registerPlugin,
                        setOptions: exports.setOptions,
                    },
                })
            );

            // clean up event
            document.removeEventListener('DOMContentLoaded', dispatch);
        };

        if (document.readyState !== 'loading') {
            // move to back of execution queue, FilePond should have been exported by then
            setTimeout(function() {
                return dispatch();
            }, 0);
        } else {
            document.addEventListener('DOMContentLoaded', dispatch);
        }

        // updates the OptionTypes object based on the current options
        var updateOptionTypes = function updateOptionTypes() {
            return forin(getOptions(), function(key, value) {
                exports.OptionTypes[key] = value[1];
            });
        };

        exports.Status = Object.assign({}, Status);
        exports.FileOrigin = Object.assign({}, FileOrigin);
        exports.FileStatus = Object.assign({}, ItemStatus);

        exports.OptionTypes = {};
        updateOptionTypes();

        // create method, creates apps and adds them to the app array
        exports.create = function create() {
            var app = createApp$1.apply(void 0, arguments);
            app.on('destroy', exports.destroy);
            state.apps.push(app);
            return createAppAPI(app);
        };

        // destroys apps and removes them from the app array
        exports.destroy = function destroy(hook) {
            // returns true if the app was destroyed successfully
            var indexToRemove = state.apps.findIndex(function(app) {
                return app.isAttachedTo(hook);
            });
            if (indexToRemove >= 0) {
                // remove from apps
                var app = state.apps.splice(indexToRemove, 1)[0];

                // restore original dom element
                app.restoreElement();

                return true;
            }

            return false;
        };

        // parses the given context for plugins (does not include the context element itself)
        exports.parse = function parse(context) {
            // get all possible hooks
            var matchedHooks = Array.from(context.querySelectorAll('.' + name));

            // filter out already active hooks
            var newHooks = matchedHooks.filter(function(newHook) {
                return !state.apps.find(function(app) {
                    return app.isAttachedTo(newHook);
                });
            });

            // create new instance for each hook
            return newHooks.map(function(hook) {
                return exports.create(hook);
            });
        };

        // returns an app based on the given element hook
        exports.find = function find(hook) {
            var app = state.apps.find(function(app) {
                return app.isAttachedTo(hook);
            });
            if (!app) {
                return null;
            }
            return createAppAPI(app);
        };

        // adds a plugin extension
        exports.registerPlugin = function registerPlugin() {
            for (
                var _len = arguments.length, plugins = new Array(_len), _key = 0;
                _key < _len;
                _key++
            ) {
                plugins[_key] = arguments[_key];
            }

            // register plugins
            plugins.forEach(createAppPlugin);

            // update OptionTypes, each plugin might have extended the default options
            updateOptionTypes();
        };

        exports.getOptions = function getOptions$1() {
            var opts = {};
            forin(getOptions(), function(key, value) {
                opts[key] = value[0];
            });
            return opts;
        };

        exports.setOptions = function setOptions$1(opts) {
            if (isObject(opts)) {
                // update existing plugins
                state.apps.forEach(function(app) {
                    app.setOptions(opts);
                });

                // override defaults
                setOptions(opts);
            }

            // return new options
            return exports.getOptions();
        };
    }

    exports.supported = supported;

    Object.defineProperty(exports, '__esModule', { value: true });
});
