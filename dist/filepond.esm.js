/*!
 * FilePond 4.4.11
 * Licensed under MIT, https://opensource.org/licenses/MIT/
 * Please visit https://pqina.nl/filepond/ for details.
 */

/* eslint-disable */

const isNode = value => value instanceof HTMLElement;

const createStore = (initialState, queries = [], actions = []) => {
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

const defineProperty = (obj, property, definition) => {
  if (typeof definition === 'function') {
    obj[property] = definition;
    return;
  }
  Object.defineProperty(obj, property, { ...definition });
};

const forin = (obj, cb) => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    cb(key, obj[key]);
  }
};

const createObject = definition => {
  const obj = {};
  forin(definition, property => {
    defineProperty(obj, property, definition[property]);
  });
  return obj;
};

const attr = (node, name, value = null) => {
  if (value === null) {
    return node.getAttribute(name) || node.hasAttribute(name);
  }
  node.setAttribute(name, value);
};

const ns = 'http://www.w3.org/2000/svg';
const svgElements = ['svg', 'path']; // only svg elements used

const isSVGElement = tag => svgElements.includes(tag);

const createElement = (tag, className, attributes = {}) => {
  if (typeof className === 'object') {
    attributes = className;
    className = null;
  }
  const element = isSVGElement(tag)
    ? document.createElementNS(ns, tag)
    : document.createElement(tag);
  if (className) {
    if (isSVGElement(tag)) {
      attr(element, 'class', className);
    } else {
      element.className = className;
    }
  }
  forin(attributes, (name, value) => {
    attr(element, name, value);
  });
  return element;
};

const appendChild = parent => (child, index) => {
  if (typeof index !== 'undefined' && parent.children[index]) {
    parent.insertBefore(child, parent.children[index]);
  } else {
    parent.appendChild(child);
  }
};

const appendChildView = (parent, childViews) => (view, index) => {
  if (typeof index !== 'undefined') {
    childViews.splice(index, 0, view);
  } else {
    childViews.push(view);
  }

  return view;
};

const removeChildView = (parent, childViews) => view => {
  // remove from child views
  childViews.splice(childViews.indexOf(view), 1);

  // remove the element
  if (view.element.parentNode) {
    parent.removeChild(view.element);
  }

  return view;
};

const getViewRect = (elementRect, childViews, offset, scale) => {
  const left = offset[0] || elementRect.left;
  const top = offset[1] || elementRect.top;
  const right = left + elementRect.width;
  const bottom = top + elementRect.height * (scale[1] || 1);

  const rect = {
    // the rectangle of the element itself
    element: {
      ...elementRect
    },

    // the rectangle of the element expanded to contain its children, does not include any margins
    inner: {
      left: elementRect.left,
      top: elementRect.top,
      right: elementRect.right,
      bottom: elementRect.bottom
    },

    // the rectangle of the element expanded to contain its children including own margin and child margins
    // margins will be added after we've recalculated the size
    outer: {
      left,
      top,
      right,
      bottom
    }
  };

  // expand rect to fit all child rectangles
  childViews
    .filter(childView => !childView.isRectIgnored())
    .map(childView => childView.rect)
    .forEach(childViewRect => {
      expandRect(rect.inner, { ...childViewRect.inner });
      expandRect(rect.outer, { ...childViewRect.outer });
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

const expandRect = (parent, child) => {
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

const calculateRectSize = rect => {
  rect.width = rect.right - rect.left;
  rect.height = rect.bottom - rect.top;
};

const isNumber = value => typeof value === 'number';

/**
 * Determines if position is at destination
 * @param position
 * @param destination
 * @param velocity
 * @param errorMargin
 * @returns {boolean}
 */
const thereYet = (position, destination, velocity, errorMargin = 0.001) => {
  return (
    Math.abs(position - destination) < errorMargin &&
    Math.abs(velocity) < errorMargin
  );
};

/**
 * Spring animation
 */
const spring =
  // default options
  ({ stiffness = 0.5, damping = 0.75, mass = 10 } = {}) =>
    // method definition
    {
      let target = null;
      let position = null;
      let velocity = 0;
      let resting = false;

      // updates spring state
      const interpolate = () => {
        // in rest, don't animate
        if (resting) {
          return;
        }

        // need at least a target or position to do springy things
        if (!(isNumber(target) && isNumber(position))) {
          resting = true;
          velocity = 0;
          return;
        }

        // calculate spring force
        const f = -(position - target) * stiffness;

        // update velocity by adding force based on mass
        velocity += f / mass;

        // update position by adding velocity
        position += velocity;

        // slow down based on amount of damping
        velocity *= damping;

        // we've arrived if we're near target and our velocity is near zero
        if (thereYet(position, target, velocity)) {
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
      const setTarget = value => {
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
      const api = createObject({
        interpolate,
        target: {
          set: setTarget,
          get: () => target
        },
        resting: {
          get: () => resting
        },
        onupdate: value => {},
        oncomplete: value => {}
      });

      return api;
    };

const easeLinear = t => t;
const easeInOutQuad = t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

const tween =
  // default values
  ({ duration = 500, easing = easeInOutQuad, delay = 0 } = {}) =>
    // method definition
    {
      let start = null;
      let t;
      let p;
      let resting = true;
      let reverse = false;
      let target = null;

      const interpolate = ts => {
        if (resting || target === null) {
          return;
        }

        if (start === null) {
          start = ts;
        }

        if (ts - start < delay) {
          return;
        }

        t = ts - start - delay;

        if (t < duration) {
          p = t / duration;
          api.onupdate((t >= 0 ? easing(reverse ? 1 - p : p) : 0) * target);
        } else {
          t = 1;
          p = reverse ? 0 : 1;
          api.onupdate(p * target);
          api.oncomplete(p * target);
          resting = true;
        }
      };

      // need 'api' to call onupdate callback
      const api = createObject({
        interpolate,
        target: {
          get: () => (reverse ? 0 : target),
          set: value => {
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
          }
        },
        resting: {
          get: () => resting
        },
        onupdate: value => {},
        oncomplete: value => {}
      });

      return api;
    };

const animator = {
  spring,
  tween
};

/*
 { type: 'spring', stiffness: .5, damping: .75, mass: 10 };
 { translation: { type: 'spring', ... }, ... }
 { translation: { x: { type: 'spring', ... } } }
*/
const createAnimator = (definition, category, property) => {
  // default is single definition
  // we check if transform is set, if so, we check if property is set
  const def =
    definition[category] && typeof definition[category][property] === 'object'
      ? definition[category][property]
      : definition[category] || definition;

  const type = typeof def === 'string' ? def : def.type;
  const props = typeof def === 'object' ? { ...def } : {};

  return animator[type] ? animator[type](props) : null;
};

const addGetSet = (keys, obj, props, overwrite = false) => {
  obj = Array.isArray(obj) ? obj : [obj];
  obj.forEach(o => {
    keys.forEach(key => {
      let name = key;
      let getter = () => props[key];
      let setter = value => (props[key] = value);

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
        set: setter
      };
    });
  });
};

const isDefined = value => value != null;

// add to state,
// add getters and setters to internal and external api (if not set)
// setup animators

const animations = ({
  mixinConfig,
  viewProps,
  viewInternalAPI,
  viewExternalAPI,
  viewState
}) => {
  // initial properties
  const initialProps = { ...viewProps };

  // list of all active animations
  const animations = [];

  // setup animators
  forin(mixinConfig, (property, animation) => {
    const animator = createAnimator(animation);
    if (!animator) {
      return;
    }

    // when the animator updates, update the view state value
    animator.onupdate = value => {
      viewProps[property] = value;
    };

    // set animator target
    animator.target = initialProps[property];

    // when value is set, set the animator target value
    const prop = {
      key: property,
      setter: value => {
        // if already at target, we done!
        if (animator.target === value) {
          return;
        }

        animator.target = value;
      },
      getter: () => viewProps[property]
    };

    // add getters and setters
    addGetSet([prop], [viewInternalAPI, viewExternalAPI], viewProps, true);

    // add it to the list for easy updating from the _write method
    animations.push(animator);
  });

  // expose internal write api
  return {
    write: ts => {
      let resting = true;
      animations.forEach(animation => {
        if (!animation.resting) {
          resting = false;
        }
        animation.interpolate(ts);
      });
      return resting;
    },
    destroy: () => {}
  };
};

const addEvent = element => (type, fn) => {
  element.addEventListener(type, fn);
};

const removeEvent = element => (type, fn) => {
  element.removeEventListener(type, fn);
};

// mixin
const listeners = ({
  mixinConfig,
  viewProps,
  viewInternalAPI,
  viewExternalAPI,
  viewState,
  view
}) => {
  const events = [];

  const add = addEvent(view.element);
  const remove = removeEvent(view.element);

  viewExternalAPI.on = (type, fn) => {
    events.push({
      type,
      fn
    });
    add(type, fn);
  };

  viewExternalAPI.off = (type, fn) => {
    events.splice(
      events.findIndex(event => event.type === type && event.fn === fn),
      1
    );
    remove(type, fn);
  };

  return {
    write: () => {
      // not busy
      return true;
    },
    destroy: () => {
      events.forEach(event => {
        remove(event.type, event.fn);
      });
    }
  };
};

// add to external api and link to props

const apis = ({ mixinConfig, viewProps, viewExternalAPI }) => {
  addGetSet(mixinConfig, viewExternalAPI, viewProps);
};

// add to state,
// add getters and setters to internal and external api (if not set)
// set initial state based on props in viewProps
// apply as transforms each frame

const defaults = {
  opacity: 1,
  scaleX: 1,
  scaleY: 1,
  translateX: 0,
  translateY: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  originX: 0,
  originY: 0
};

const styles = ({
  mixinConfig,
  viewProps,
  viewInternalAPI,
  viewExternalAPI,
  view
}) => {
  // initial props
  const initialProps = { ...viewProps };

  // current props
  const currentProps = {};

  // we will add those properties to the external API and link them to the viewState
  addGetSet(mixinConfig, [viewInternalAPI, viewExternalAPI], viewProps);

  // override rect on internal and external rect getter so it takes in account transforms
  const getOffset = () => [
    viewProps['translateX'] || 0,
    viewProps['translateY'] || 0
  ];
  const getScale = () => [viewProps['scaleX'] || 0, viewProps['scaleY'] || 0];
  const getRect = () =>
    view.rect
      ? getViewRect(view.rect, view.childViews, getOffset(), getScale())
      : null;
  viewInternalAPI.rect = { get: getRect };
  viewExternalAPI.rect = { get: getRect };

  // apply view props
  mixinConfig.forEach(key => {
    viewProps[key] =
      typeof initialProps[key] === 'undefined'
        ? defaults[key]
        : initialProps[key];
  });

  // expose api
  return {
    write: () => {
      // see if props have changed
      if (!propsHaveChanged(currentProps, viewProps)) {
        return;
      }

      // moves element to correct position on screen
      applyStyles(view.element, viewProps);

      // store new transforms
      Object.assign(currentProps, { ...viewProps });

      // no longer busy
      return true;
    },
    destroy: () => {}
  };
};

const propsHaveChanged = (currentProps, newProps) => {
  // different amount of keys
  if (Object.keys(currentProps).length !== Object.keys(newProps).length) {
    return true;
  }

  // lets analyze the individual props
  for (const prop in newProps) {
    if (newProps[prop] !== currentProps[prop]) {
      return true;
    }
  }

  return false;
};

const applyStyles = (
  element,
  {
    opacity,
    perspective,
    translateX,
    translateY,
    scaleX,
    scaleY,
    rotateX,
    rotateY,
    rotateZ,
    originX,
    originY,
    width,
    height
  }
) => {
  let transforms = '';
  let styles = '';

  // handle transform origin
  if (isDefined(originX) || isDefined(originY)) {
    styles += `transform-origin: ${originX || 0}px ${originY || 0}px;`;
  }

  // transform order is relevant
  // 0. perspective
  if (isDefined(perspective)) {
    transforms += `perspective(${perspective}px) `;
  }

  // 1. translate
  if (isDefined(translateX) || isDefined(translateY)) {
    transforms += `translate3d(${translateX || 0}px, ${translateY || 0}px, 0) `;
  }

  // 2. scale
  if (isDefined(scaleX) || isDefined(scaleY)) {
    transforms += `scale3d(${isDefined(scaleX) ? scaleX : 1}, ${
      isDefined(scaleY) ? scaleY : 1
    }, 1) `;
  }

  // 3. rotate
  if (isDefined(rotateZ)) {
    transforms += `rotateZ(${rotateZ}rad) `;
  }

  if (isDefined(rotateX)) {
    transforms += `rotateX(${rotateX}rad) `;
  }

  if (isDefined(rotateY)) {
    transforms += `rotateY(${rotateY}rad) `;
  }

  // add transforms
  if (transforms.length) {
    styles += `transform:${transforms};`;
  }

  // add opacity
  if (isDefined(opacity)) {
    styles += `opacity:${opacity};`;

    // if we reach zero, we make the element inaccessible
    if (opacity === 0) {
      styles += `visibility:hidden;`;
    }

    // if we're below 100% opacity this element can't be clicked
    if (opacity < 1) {
      styles += `pointer-events:none;`;
    }
  }

  // add height
  if (isDefined(height)) {
    styles += `height:${height}px;`;
  }

  // add width
  if (isDefined(width)) {
    styles += `width:${width}px;`;
  }

  // apply styles
  const elementCurrentStyle = element.elementCurrentStyle || '';

  // if new styles does not match current styles, lets update!
  if (
    styles.length !== elementCurrentStyle.length ||
    styles !== elementCurrentStyle
  ) {
    element.setAttribute('style', styles);
    // store current styles so we can compare them to new styles later on
    // _not_ getting the style attribute is faster
    element.elementCurrentStyle = styles;
  }
};

const Mixins = {
  styles,
  listeners,
  animations,
  apis
};

const updateRect = (rect = {}, element = {}, style = {}) => {
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

const createView =
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
      frameRect = getViewRect(rect, childViews, [0, 0], [1, 1]);
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

      const shouldUpdate = !(ignoreRectUpdate && rect.width && rect.height);
      if (shouldUpdate) {
        updateRect(rect, element, style);
      }

      // readers
      const api = { root: internalAPI, props, rect };
      readers.forEach(reader => reader(api));
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
      destroyers.forEach(destroyer => {
        destroyer({ root: internalAPI, props });
      });
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
    const internalAPIDefinition = {
      ...sharedAPIDefinition,
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
      linkView: view => {
        childViews.push(view);
        return view;
      },
      unlinkView: view => {
        childViews.splice(childViews.indexOf(view), 1);
      },
      appendChildView: appendChildView(element, childViews),
      removeChildView: removeChildView(element, childViews),
      registerWriter: writer => writers.push(writer),
      registerReader: reader => readers.push(reader),
      registerDestroyer: destroyer => destroyers.push(destroyer),
      invalidateLayout: () => (element.layoutCalculated = false),

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
    const mixinAPIDefinition = {
      ...sharedAPIDefinition,
      rect: {
        get: () => rect
      }
    };

    // add mixin functionality
    Object.keys(mixins)
      .sort((a, b) => {
        // move styles to the back of the mixin list (so adjustments of other mixins are applied to the props correctly)
        if (a === 'styles') {
          return 1;
        } else if (b === 'styles') {
          return -1;
        }
        return 0;
      })
      .forEach(key => {
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
      });

    // construct private api
    const internalAPI = createObject(internalAPIDefinition);

    // create the view
    create({
      root: internalAPI,
      props
    });

    // append created child views to root node
    const childCount = element.children.length; // need to know the current child count so appending happens in correct order
    childViews.forEach((child, index) => {
      internalAPI.appendChild(child.element, childCount + index);
    });

    // call did create
    didCreateView(internalAPI);

    // expose public api
    return createObject(externalAPIDefinition, props);
  };

const createPainter = (read, write, fps = 60) => {
  const name = '__framePainter';

  // set global painter
  if (window[name]) {
    window[name].readers.push(read);
    window[name].writers.push(write);
    return;
  }

  window[name] = {
    readers: [read],
    writers: [write]
  };

  const painter = window[name];

  const interval = 1000 / fps;
  let last = null;
  let id = null;
  let requestTick = null;
  let cancelTick = null;

  const setTimerType = () => {
    if (document.hidden) {
      requestTick = () =>
        window.setTimeout(() => tick(performance.now()), interval);
      cancelTick = () => window.clearTimeout(id);
    } else {
      requestTick = () => window.requestAnimationFrame(tick);
      cancelTick = () => window.cancelAnimationFrame(id);
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (cancelTick) cancelTick();
    setTimerType();
    tick(performance.now());
  });

  const tick = ts => {
    // queue next tick
    id = requestTick(tick);

    // limit fps
    if (!last) {
      last = ts;
    }

    const delta = ts - last;

    if (delta <= interval) {
      // skip frame
      return;
    }

    // align next frame
    last = ts - (delta % interval);

    // update view
    painter.readers.forEach(read => read());
    painter.writers.forEach(write => write(ts));
  };

  setTimerType();
  tick(performance.now());

  return {
    pause: () => {
      cancelTick(id);
    }
  };
};

const createRoute = (routes, fn) => ({
  root,
  props,
  actions = [],
  timestamp,
  shouldOptimize
}) => {
  actions
    .filter(action => routes[action.type])
    .forEach(action =>
      routes[action.type]({
        root,
        props,
        action: action.data,
        timestamp,
        shouldOptimize
      })
    );
  if (fn) {
    fn({ root, props, actions, timestamp, shouldOptimize });
  }
};

const insertBefore = (newNode, referenceNode) =>
  referenceNode.parentNode.insertBefore(newNode, referenceNode);

const insertAfter = (newNode, referenceNode) => {
  return referenceNode.parentNode.insertBefore(
    newNode,
    referenceNode.nextSibling
  );
};

const isArray = value => Array.isArray(value);

const isEmpty = value => value == null;

const trim = str => str.trim();

const toString = value => '' + value;

const toArray = (value, splitter = ',') => {
  if (isEmpty(value)) {
    return [];
  }
  if (isArray(value)) {
    return value;
  }
  return toString(value)
    .split(splitter)
    .map(trim)
    .filter(str => str.length);
};

const isBoolean = value => typeof value === 'boolean';

const toBoolean = value => (isBoolean(value) ? value : value === 'true');

const isString = value => typeof value === 'string';

const toNumber = value =>
  isNumber(value)
    ? value
    : isString(value)
    ? toString(value).replace(/[a-z]+/gi, '')
    : 0;

const toInt = value => parseInt(toNumber(value), 10);

const toFloat = value => parseFloat(toNumber(value));

const isInt = value =>
  isNumber(value) && isFinite(value) && Math.floor(value) === value;

const toBytes = value => {
  // is in bytes
  if (isInt(value)) {
    return value;
  }

  // is natural file size
  let naturalFileSize = toString(value).trim();

  // if is value in megabytes
  if (/MB$/i.test(naturalFileSize)) {
    naturalFileSize = naturalFileSize.replace(/MB$i/, '').trim();
    return toInt(naturalFileSize) * 1000 * 1000;
  }

  // if is value in kilobytes
  if (/KB/i.test(naturalFileSize)) {
    naturalFileSize = naturalFileSize.replace(/KB$i/, '').trim();
    return toInt(naturalFileSize) * 1000;
  }

  return toInt(naturalFileSize);
};

const isFunction = value => typeof value === 'function';

const toFunctionReference = string => {
  let ref = self;
  let levels = string.split('.');
  let level = null;
  while ((level = levels.shift())) {
    ref = ref[level];
    if (!ref) {
      return null;
    }
  }
  return ref;
};

const methods = {
  process: 'POST',
  revert: 'DELETE',
  fetch: 'GET',
  restore: 'GET',
  load: 'GET'
};

const createServerAPI = outline => {
  const api = {};

  api.url = isString(outline) ? outline : outline.url || '';
  api.timeout = outline.timeout ? parseInt(outline.timeout, 10) : 0;

  forin(methods, key => {
    api[key] = createAction(key, outline[key], methods[key], api.timeout);
  });

  // special treatment for remove
  api.remove = outline.remove || null;

  return api;
};

const createAction = (name, outline, method, timeout) => {
  // is explicitely set to null so disable
  if (outline === null) {
    return null;
  }

  // if is custom function, done! Dev handles everything.
  if (typeof outline === 'function') {
    return outline;
  }

  // build action object
  const action = {
    url: method === 'GET' ? `?${name}=` : '',
    method,
    headers: {},
    withCredentials: false,
    timeout,
    onload: null,
    ondata: null,
    onerror: null
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
    const parts = action.headers.split(/:(.+)/);
    action.headers = {
      header: parts[0],
      value: parts[1]
    };
  }

  // if is bool withCredentials
  action.withCredentials = toBoolean(action.withCredentials);

  return action;
};

const toServerAPI = value => createServerAPI(value);

const isNull = value => value === null;

const isObject = value => typeof value === 'object' && value !== null;

const isAPI = value => {
  return (
    isObject(value) &&
    isString(value.url) &&
    isObject(value.process) &&
    isObject(value.revert) &&
    isObject(value.restore) &&
    isObject(value.fetch)
  );
};

const getType = value => {
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

const replaceSingleQuotes = str =>
  str
    .replace(/{\s*'/g, '{"')
    .replace(/'\s*}/g, '"}')
    .replace(/'\s*:/g, '":')
    .replace(/:\s*'/g, ':"')
    .replace(/,\s*'/g, ',"')
    .replace(/'\s*,/g, '",');

const conversionTable = {
  array: toArray,
  boolean: toBoolean,
  int: value => (getType(value) === 'bytes' ? toBytes(value) : toInt(value)),
  number: toFloat,
  float: toFloat,
  bytes: toBytes,
  string: value => (isFunction(value) ? value : toString(value)),
  function: value => toFunctionReference(value),
  serverapi: toServerAPI,
  object: value => {
    try {
      return JSON.parse(replaceSingleQuotes(value));
    } catch (e) {
      return null;
    }
  }
};

const convertTo = (value, type) => conversionTable[type](value);

const getValueByType = (newValue, defaultValue, valueType) => {
  // can always assign default value
  if (newValue === defaultValue) {
    return newValue;
  }

  // get the type of the new value
  let newValueType = getType(newValue);

  // is valid type?
  if (newValueType !== valueType) {
    // is string input, let's attempt to convert
    const convertedValue = convertTo(newValue, valueType);

    // what is the type now
    newValueType = getType(convertedValue);

    // no valid conversions found
    if (convertedValue === null) {
      throw `Trying to assign value with incorrect type to "${option}", allowed type: "${valueType}"`;
    } else {
      newValue = convertedValue;
    }
  }

  // assign new value
  return newValue;
};

const createOption = (defaultValue, valueType) => {
  let currentValue = defaultValue;
  return {
    enumerable: true,
    get: () => currentValue,
    set: newValue => {
      currentValue = getValueByType(newValue, defaultValue, valueType);
    }
  };
};

const createOptions = options => {
  const obj = {};
  forin(options, prop => {
    const optionDefinition = options[prop];
    obj[prop] = createOption(optionDefinition[0], optionDefinition[1]);
  });
  return createObject(obj);
};

const createInitialState = options => ({
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

const fromCamels = (string, separator = '-') =>
  string
    .split(/(?=[A-Z])/)
    .map(part => part.toLowerCase())
    .join(separator);

const createOptionAPI = (store, options) => {
  const obj = {};
  forin(options, key => {
    obj[key] = {
      get: () => store.getState().options[key],
      set: value => {
        store.dispatch(`SET_${fromCamels(key, '_').toUpperCase()}`, {
          value
        });
      }
    };
  });
  return obj;
};

const createOptionActions = options => (dispatch, query, state) => {
  const obj = {};
  forin(options, key => {
    const name = fromCamels(key, '_').toUpperCase();

    obj[`SET_${name}`] = action => {
      try {
        state.options[key] = action.value;
      } catch (e) {
        // nope, failed
      }

      // we successfully set the value of this option
      dispatch(`DID_SET_${name}`, { value: state.options[key] });
    };
  });
  return obj;
};

const createOptionQueries = options => state => {
  const obj = {};
  forin(options, key => {
    obj[`GET_${fromCamels(key, '_').toUpperCase()}`] = action =>
      state.options[key];
  });
  return obj;
};

const InteractionMethod = {
  API: 1,
  DROP: 2,
  BROWSE: 3,
  PASTE: 4,
  NONE: 5
};

const getUniqueId = () =>
  Math.random()
    .toString(36)
    .substr(2, 9);

const arrayRemove = (arr, index) => arr.splice(index, 1);

const on = () => {
  const listeners = [];
  const off = (event, cb) => {
    arrayRemove(
      listeners,
      listeners.findIndex(
        listener => listener.event === event && (listener.cb === cb || !cb)
      )
    );
  };
  return {
    fire: (event, ...args) => {
      listeners
        .filter(listener => listener.event === event)
        .map(listener => listener.cb)
        .forEach(cb => {
          setTimeout(() => {
            cb(...args);
          }, 0);
        });
    },
    on: (event, cb) => {
      listeners.push({ event, cb });
    },
    onOnce: (event, cb) => {
      listeners.push({
        event,
        cb: (...args) => {
          off(event, cb);
          cb(...args);
        }
      });
    },
    off
  };
};

const copyObjectPropertiesToObject = (src, target, excluded) => {
  Object.getOwnPropertyNames(src)
    .filter(property => !excluded.includes(property))
    .forEach(key =>
      Object.defineProperty(
        target,
        key,
        Object.getOwnPropertyDescriptor(src, key)
      )
    );
};

const PRIVATE = [
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
  'freeze'
];

const createItemAPI = item => {
  const api = {};
  copyObjectPropertiesToObject(item, api, PRIVATE);
  return api;
};

const removeReleasedItems = items => {
  items.forEach((item, index) => {
    if (item.released) {
      arrayRemove(items, index);
    }
  });
};

const ItemStatus = {
  INIT: 1,
  IDLE: 2,
  PROCESSING_QUEUED: 9,
  PROCESSING: 3,
  PROCESSING_COMPLETE: 5,
  PROCESSING_ERROR: 6,
  PROCESSING_REVERT_ERROR: 10,
  LOADING: 7,
  LOAD_ERROR: 8
};

const FileOrigin = {
  INPUT: 1,
  LIMBO: 2,
  LOCAL: 3
};

const getNonNumeric = str => /[^0-9]+/.exec(str);

const getDecimalSeparator = () => getNonNumeric((1.1).toLocaleString())[0];

const getThousandsSeparator = () => {
  // Added for browsers that do not return the thousands separator (happend on native browser Android 4.4.4)
  // We check against the normal toString output and if they're the same return a comma when decimal separator is a dot
  const decimalSeparator = getDecimalSeparator();
  const thousandsStringWithSeparator = (1000.0).toLocaleString();
  const thousandsStringWithoutSeparator = (1000.0).toString();
  if (thousandsStringWithSeparator !== thousandsStringWithoutSeparator) {
    return getNonNumeric(thousandsStringWithSeparator)[0];
  }
  return decimalSeparator === '.' ? ',' : '.';
};

const Type = {
  BOOLEAN: 'boolean',
  INT: 'int',
  NUMBER: 'number',
  STRING: 'string',
  ARRAY: 'array',
  OBJECT: 'object',
  FUNCTION: 'function',
  ACTION: 'action',
  SERVER_API: 'serverapi',
  REGEX: 'regex'
};

// all registered filters
const filters = [];

// loops over matching filters and passes options to each filter, returning the mapped results
const applyFilterChain = (key, value, utils) =>
  new Promise((resolve, reject) => {
    // find matching filters for this key
    const matchingFilters = filters.filter(f => f.key === key).map(f => f.cb);

    // resolve now
    if (matchingFilters.length === 0) {
      resolve(value);
      return;
    }

    // first filter to kick things of
    const initialFilter = matchingFilters.shift();

    // chain filters
    matchingFilters
      .reduce(
        // loop over promises passing value to next promise
        (current, next) => current.then(value => next(value, utils)),

        // call initial filter, will return a promise
        initialFilter(value, utils)

        // all executed
      )
      .then(value => resolve(value))
      .catch(error => reject(error));
  });

const applyFilters = (key, value, utils) =>
  filters.filter(f => f.key === key).map(f => f.cb(value, utils));

// adds a new filter to the list
const addFilter = (key, cb) => filters.push({ key, cb });

const extendDefaultOptions = additionalOptions =>
  Object.assign(defaultOptions, additionalOptions);

const getOptions = () => ({ ...defaultOptions });

const setOptions = opts => {
  forin(opts, (key, value) => {
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
const defaultOptions = {
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

  // Feature toggles
  allowDrop: [true, Type.BOOLEAN], // Allow dropping of files
  allowBrowse: [true, Type.BOOLEAN], // Allow browsing the file system
  allowPaste: [true, Type.BOOLEAN], // Allow pasting files
  allowMultiple: [false, Type.BOOLEAN], // Allow multiple files (disabled by default, as multiple attribute is also required on input to allow multiple)
  allowReplace: [true, Type.BOOLEAN], // Allow dropping a file on other file to replace it (only works when multiple is set to false)
  allowRevert: [true, Type.BOOLEAN], // Allows user to revert file upload

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
  instantUpload: [true, Type.BOOLEAN], // Should upload files immidiately on drop
  maxParallelUploads: [2, Type.INT], // Maximum files to upload in parallel

  // The server api end points to use for uploading (see docs)
  server: [null, Type.SERVER_API],

  // Labels and status messages
  labelDecimalSeparator: [getDecimalSeparator(), Type.STRING], // Default is locale separator
  labelThousandsSeparator: [getThousandsSeparator(), Type.STRING], // Default is locale separator

  labelIdle: [
    'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
    Type.STRING
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
    Type.STRING
  ],
  iconProcess: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M14 10.414v3.585a1 1 0 0 1-2 0v-3.585l-1.293 1.293a1 1 0 0 1-1.414-1.415l3-3a1 1 0 0 1 1.414 0l3 3a1 1 0 0 1-1.414 1.415L14 10.414zM9 18a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2H9z" fill="currentColor" fill-rule="evenodd"/></svg>',
    Type.STRING
  ],
  iconRetry: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M10.81 9.185l-.038.02A4.997 4.997 0 0 0 8 13.683a5 5 0 0 0 5 5 5 5 0 0 0 5-5 1 1 0 0 1 2 0A7 7 0 1 1 9.722 7.496l-.842-.21a.999.999 0 1 1 .484-1.94l3.23.806c.535.133.86.675.73 1.21l-.804 3.233a.997.997 0 0 1-1.21.73.997.997 0 0 1-.73-1.21l.23-.928v-.002z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],
  iconUndo: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M9.185 10.81l.02-.038A4.997 4.997 0 0 1 13.683 8a5 5 0 0 1 5 5 5 5 0 0 1-5 5 1 1 0 0 0 0 2A7 7 0 1 0 7.496 9.722l-.21-.842a.999.999 0 1 0-1.94.484l.806 3.23c.133.535.675.86 1.21.73l3.233-.803a.997.997 0 0 0 .73-1.21.997.997 0 0 0-1.21-.73l-.928.23-.002-.001z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],
  iconDone: [
    '<svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"><path d="M18.293 9.293a1 1 0 0 1 1.414 1.414l-7.002 7a1 1 0 0 1-1.414 0l-3.998-4a1 1 0 1 1 1.414-1.414L12 15.586l6.294-6.293z" fill="currentColor" fill-rule="nonzero"/></svg>',
    Type.STRING
  ],

  // event handlers
  oninit: [null, Type.FUNCTION],
  onwarning: [null, Type.FUNCTION],
  onerror: [null, Type.FUNCTION],
  onactivatefile: [null, Type.FUNCTION],
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

  // hooks
  beforeDropFile: [null, Type.FUNCTION],
  beforeAddFile: [null, Type.FUNCTION],
  beforeRemoveFile: [null, Type.FUNCTION],

  // styles
  stylePanelLayout: [null, Type.STRING], // null 'integrated', 'compact', 'circle'
  stylePanelAspectRatio: [null, Type.STRING], // null or '3:2' or 1
  styleItemPanelAspectRatio: [null, Type.STRING],
  styleButtonRemoveItemPosition: ['left', Type.STRING],
  styleButtonProcessItemPosition: ['right', Type.STRING],
  styleLoadIndicatorPosition: ['right', Type.STRING],
  styleProgressIndicatorPosition: ['right', Type.STRING],

  // custom initial files array
  files: [[], Type.ARRAY]
};

const getItemByQuery = (items, query) => {
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
  return items.find(item => item.id === query) || null;
};

const getNumericAspectRatioFromString = aspectRatio => {
  if (isEmpty(aspectRatio)) {
    return aspectRatio;
  }
  if (/:/.test(aspectRatio)) {
    const parts = aspectRatio.split(':');
    return parts[1] / parts[0];
  }
  return parseFloat(aspectRatio);
};

const getActiveItems = items => items.filter(item => !item.archived);

const Status = {
  EMPTY: 0,
  IDLE: 1, // waiting
  ERROR: 2, // a file is in error state
  BUSY: 3, // busy processing or loading
  READY: 4 // all files uploaded
};

const ITEM_ERROR = [
  ItemStatus.LOAD_ERROR,
  ItemStatus.PROCESSING_ERROR,
  ItemStatus.PROCESSING_REVERT_ERROR
];
const ITEM_BUSY = [
  ItemStatus.LOADING,
  ItemStatus.PROCESSING,
  ItemStatus.PROCESSING_QUEUED,
  ItemStatus.INIT
];
const ITEM_READY = [ItemStatus.PROCESSING_COMPLETE];

const isItemInErrorState = item => ITEM_ERROR.includes(item.status);
const isItemInBusyState = item => ITEM_BUSY.includes(item.status);
const isItemInReadyState = item => ITEM_READY.includes(item.status);

const queries = state => ({
  GET_STATUS: () => {
    const items = getActiveItems(state.items);

    const { EMPTY, ERROR, BUSY, IDLE, READY } = Status;

    if (items.length === 0) return EMPTY;

    if (items.some(isItemInErrorState)) return ERROR;

    if (items.some(isItemInBusyState)) return BUSY;

    if (items.some(isItemInReadyState)) return READY;

    return IDLE;
  },

  GET_ITEM: query => getItemByQuery(state.items, query),

  GET_ACTIVE_ITEM: query => getItemByQuery(getActiveItems(state.items), query),

  GET_ACTIVE_ITEMS: query => getActiveItems(state.items),

  GET_ITEMS: query => state.items,

  GET_ITEM_NAME: query => {
    const item = getItemByQuery(state.items, query);
    return item ? item.filename : null;
  },

  GET_ITEM_SIZE: query => {
    const item = getItemByQuery(state.items, query);
    return item ? item.fileSize : null;
  },

  GET_STYLES: () =>
    Object.keys(state.options)
      .filter(key => /^style/.test(key))
      .map(option => ({
        name: option,
        value: state.options[option]
      })),

  GET_PANEL_ASPECT_RATIO: () => {
    const isShapeCircle = /circle/.test(state.options.stylePanelLayout);
    const aspectRatio = isShapeCircle
      ? 1
      : getNumericAspectRatioFromString(state.options.stylePanelAspectRatio);
    return aspectRatio;
  },

  GET_ITEM_PANEL_ASPECT_RATIO: () => state.options.styleItemPanelAspectRatio,

  GET_ITEMS_BY_STATUS: status =>
    getActiveItems(state.items).filter(item => item.status === status),

  GET_TOTAL_ITEMS: () => getActiveItems(state.items).length,

  IS_ASYNC: () =>
    isObject(state.options.server) &&
    (isObject(state.options.server.process) ||
      isFunction(state.options.server.process))
});

const hasRoomForItem = state => {
  const count = getActiveItems(state.items).length;

  // if cannot have multiple items, to add one item it should currently not contain items
  if (!state.options.allowMultiple) {
    return count === 0;
  }

  // if allows multiple items, we check if a max item count has been set, if not, there's no limit
  const maxFileCount = state.options.maxFiles;
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

const limit = (value, min, max) => Math.max(Math.min(max, value), min);

const arrayInsert = (arr, index, item) => arr.splice(index, 0, item);

const insertItem = (items, item, index) => {
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

const isBase64DataURI = str =>
  /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*)\s*$/i.test(
    str
  );

const getFilenameFromURL = url =>
  url
    .split('/')
    .pop()
    .split('?')
    .shift();

const getExtensionFromFilename = name => name.split('.').pop();

const guesstimateExtension = type => {
  // if no extension supplied, exit here
  if (typeof type !== 'string') {
    return '';
  }

  // get subtype
  const subtype = type.split('/').pop();

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

const leftPad = (value, padding = '') =>
  (padding + value).slice(-padding.length);

const getDateString = (date = new Date()) =>
  `${date.getFullYear()}-${leftPad(date.getMonth() + 1, '00')}-${leftPad(
    date.getDate(),
    '00'
  )}_${leftPad(date.getHours(), '00')}-${leftPad(
    date.getMinutes(),
    '00'
  )}-${leftPad(date.getSeconds(), '00')}`;

const getFileFromBlob = (blob, filename, type = null, extension = null) => {
  const file =
    typeof type === 'string'
      ? blob.slice(0, blob.size, type)
      : blob.slice(0, blob.size, blob.type);
  file.lastModifiedDate = new Date();

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

const getBlobBuilder = () => {
  return (window.BlobBuilder =
    window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder);
};

const createBlob = (arrayBuffer, mimeType) => {
  const BB = getBlobBuilder();

  if (BB) {
    const bb = new BB();
    bb.append(arrayBuffer);
    return bb.getBlob(mimeType);
  }

  return new Blob([arrayBuffer], {
    type: mimeType
  });
};

const getBlobFromByteStringWithMimeType = (byteString, mimeType) => {
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);

  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return createBlob(ab, mimeType);
};

const getMimeTypeFromBase64DataURI = dataURI => {
  return (/^data:(.+);/.exec(dataURI) || [])[1] || null;
};

const getBase64DataFromBase64DataURI = dataURI => {
  // get data part of string (remove data:image/jpeg...,)
  const data = dataURI.split(',')[1];

  // remove any whitespace as that causes InvalidCharacterError in IE
  return data.replace(/\s/g, '');
};

const getByteStringFromBase64DataURI = dataURI => {
  return atob(getBase64DataFromBase64DataURI(dataURI));
};

const getBlobFromBase64DataURI = dataURI => {
  const mimeType = getMimeTypeFromBase64DataURI(dataURI);
  const byteString = getByteStringFromBase64DataURI(dataURI);

  return getBlobFromByteStringWithMimeType(byteString, mimeType);
};

const getFileFromBase64DataURI = (dataURI, filename, extension) => {
  return getFileFromBlob(
    getBlobFromBase64DataURI(dataURI),
    filename,
    null,
    extension
  );
};

const getFileNameFromHeader = header => {
  // test if is content disposition header, if not exit
  if (!/^content-disposition:/i.test(header)) return null;

  // get filename parts
  const matches = header
    .split(/filename=|filename\*=.+''/)
    .splice(1)
    .map(name => name.trim().replace(/^["']|[;"']{0,2}$/g, ''))
    .filter(name => name.length);

  return matches.length ? decodeURI(matches[matches.length - 1]) : null;
};

const getFileSizeFromHeader = header => {
  if (/content-length:/i.test(header)) {
    const size = header.match(/[0-9]+/)[0];
    return size ? parseInt(size, 10) : null;
  }
  return null;
};

const getTranfserIdFromHeader = header => {
  if (/x-content-transfer-id:/i.test(header)) {
    const id = (header.split(':')[1] || '').trim();
    return id || null;
  }
  return null;
};

const getFileInfoFromHeaders = headers => {
  const info = {
    source: null,
    name: null,
    size: null
  };

  const rows = headers.split('\n');
  for (let header of rows) {
    const name = getFileNameFromHeader(header);
    if (name) {
      info.name = name;
      continue;
    }

    const size = getFileSizeFromHeader(header);
    if (size) {
      info.size = size;
      continue;
    }

    const source = getTranfserIdFromHeader(header);
    if (source) {
      info.source = source;
      continue;
    }
  }

  return info;
};

const createFileLoader = fetchFn => {
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
        body: "Can't load URL",
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
          response = getFileFromBlob(response, getFilenameFromURL(url));
        }

        api.fire('load', response instanceof Blob ? response : response.body);
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
        const fileinfo = getFileInfoFromHeaders(
          typeof response === 'string' ? response : response.headers
        );
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
    setSource: source => (state.source = source),
    getProgress, // file load progress
    abort, // abort file load
    load // start load
  };

  return api;
};

const isGet = method => /GET|HEAD/.test(method);

const sendRequest = (data, url, options) => {
  const api = {
    onheaders: () => {},
    onprogress: () => {},
    onload: () => {},
    ontimeout: () => {},
    onerror: () => {},
    onabort: () => {},
    abort: () => {
      aborted = true;
      xhr.abort();
    }
  };

  // timeout identifier, only used when timeout is defined
  let aborted = false;
  let headersReceived = false;

  // set default options
  options = {
    method: 'POST',
    headers: {},
    withCredentials: false,
    ...options
  };

  // encode url
  url = encodeURI(url);

  // if method is GET, add any received data to url

  if (isGet(options.method) && data) {
    url = `${url}${encodeURIComponent(
      typeof data === 'string' ? data : JSON.stringify(data)
    )}`;
  }

  // create request
  const xhr = new XMLHttpRequest();

  // progress of load
  const process = isGet(options.method) ? xhr : xhr.upload;
  process.onprogress = e => {
    // no progress event when aborted ( onprogress is called once after abort() )
    if (aborted) {
      return;
    }

    api.onprogress(e.lengthComputable, e.loaded, e.total);
  };

  // tries to get header info to the app as fast as possible
  xhr.onreadystatechange = () => {
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
  xhr.onload = () => {
    // is classified as valid response
    if (xhr.status >= 200 && xhr.status < 300) {
      api.onload(xhr);
    } else {
      api.onerror(xhr);
    }
  };

  // error during load
  xhr.onerror = () => api.onerror(xhr);

  // request aborted
  xhr.onabort = () => {
    aborted = true;
    api.onabort();
  };

  // request timeout
  xhr.ontimeout = () => api.ontimeout(xhr);

  // open up open up!
  xhr.open(options.method, url, true);

  // set timeout if defined (do it after open so IE11 plays ball)
  if (isInt(options.timeout)) {
    xhr.timeout = options.timeout;
  }

  // add headers
  Object.keys(options.headers).forEach(key => {
    xhr.setRequestHeader(key, options.headers[key]);
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

const createResponse = (type, code, body, headers) => ({
  type,
  code,
  body,
  headers
});

const createTimeoutResponse = cb => xhr => {
  cb(createResponse('error', 0, 'Timeout', xhr.getAllResponseHeaders()));
};

const createFetchFunction = (apiUrl = '', action) => {
  // custom handler (should also handle file, load, error, progress and abort)
  if (typeof action === 'function') {
    return action;
  }

  // no action supplied
  if (!action || !isString(action.url)) {
    return null;
  }

  // set onload hanlder
  const onload = action.onload || (res => res);
  const onerror = action.onerror || (res => null);

  // internal handler
  return (url, load, error, progress, abort, headers) => {
    // do local or remote request based on if the url is external
    const request = sendRequest(url, apiUrl + action.url, {
      ...action,
      responseType: 'blob'
    });

    request.onload = xhr => {
      // get headers
      const headers = xhr.getAllResponseHeaders();

      // get filename
      const filename =
        getFileInfoFromHeaders(headers).name || getFilenameFromURL(url);

      // create response
      load(
        createResponse(
          'load',
          xhr.status,
          getFileFromBlob(onload(xhr.response), filename),
          headers
        )
      );
    };

    request.onerror = xhr => {
      error(
        createResponse(
          'error',
          xhr.status,
          onerror(xhr.response) || xhr.statusText,
          xhr.getAllResponseHeaders()
        )
      );
    };

    request.onheaders = xhr => {
      headers(
        createResponse('headers', xhr.status, null, xhr.getAllResponseHeaders())
      );
    };

    request.ontimeout = createTimeoutResponse(error);
    request.onprogress = progress;
    request.onabort = abort;

    // should return request
    return request;
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
const createProcessorFunction = (apiUrl = '', action, name) => {
  // custom handler (should also handle file, load, error, progress and abort)
  if (typeof action === 'function') {
    return (...params) => action(name, ...params);
  }

  // no action supplied
  if (!action || !isString(action.url)) {
    return null;
  }

  // internal handler
  return (file, metadata, load, error, progress, abort) => {
    // set onload hanlder
    const ondata = action.ondata || (fd => fd);
    const onload = action.onload || (res => res);
    const onerror = action.onerror || (res => null);

    // no file received
    if (!file) return;

    // create formdata object
    var formData = new FormData();

    // add metadata under same name
    if (isObject(metadata)) {
      formData.append(name, JSON.stringify(metadata));
    }

    // Turn into an array of objects so no matter what the input, we can handle it the same way
    (file instanceof Blob ? [{ name: null, file }] : file).forEach(item => {
      formData.append(
        name,
        item.file,
        item.name === null ? item.file.name : `${item.name}${item.file.name}`
      );
    });

    // send request object
    const request = sendRequest(ondata(formData), apiUrl + action.url, action);
    request.onload = xhr => {
      load(
        createResponse(
          'load',
          xhr.status,
          onload(xhr.response),
          xhr.getAllResponseHeaders()
        )
      );
    };

    request.onerror = xhr => {
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

/*
 function signature:
 (uniqueFileId, load, error) => { }
 */
const createRevertFunction = (apiUrl = '', action) => {
  // is custom implementation
  if (typeof action === 'function') {
    return action;
  }

  // no action supplied, return stub function, interface will work, but file won't be removed
  if (!action || !isString(action.url)) {
    return (uniqueFileId, load) => load();
  }

  // set onload hanlder
  const onload = action.onload || (res => res);
  const onerror = action.onerror || (res => null);

  // internal implementation
  return (uniqueFileId, load, error) => {
    const request = sendRequest(
      uniqueFileId,
      apiUrl + action.url,
      action // contains method, headers and withCredentials properties
    );
    request.onload = xhr => {
      load(
        createResponse(
          'load',
          xhr.status,
          onload(xhr.response),
          xhr.getAllResponseHeaders()
        )
      );
    };

    request.onerror = xhr => {
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

const getRandomNumber = (min = 0, max = 1) => min + Math.random() * (max - min);

const createPerceivedPerformanceUpdater = (
  cb,
  duration = 1000,
  offset = 0,
  tickMin = 25,
  tickMax = 250
) => {
  let timeout = null;
  const start = Date.now();

  const tick = () => {
    let runtime = Date.now() - start;
    let delay = getRandomNumber(tickMin, tickMax);

    if (runtime + delay > duration) {
      delay = runtime + delay - duration;
    }

    let progress = runtime / duration;
    if (progress >= 1) {
      cb(1);
      return;
    }

    cb(progress);

    timeout = setTimeout(tick, delay);
  };

  tick();

  return {
    clear: () => {
      clearTimeout(timeout);
    }
  };
};

const createFileProcessor = processFn => {
  const state = {
    complete: false,
    perceivedProgress: 0,
    perceivedPerformanceUpdater: null,
    progress: null,
    timestamp: null,
    perceivedDuration: 0,
    duration: 0,
    request: null,
    response: null
  };

  const process = (file, metadata) => {
    const progressFn = () => {
      // we've not yet started the real download, stop here
      // the request might not go through, for instance, there might be some server trouble
      // if state.progress is null, the server does not allow computing progress and we show the spinner instead
      if (state.duration === 0 || state.progress === null) {
        return;
      }

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
        if (
          state.response &&
          state.perceivedProgress === 1 &&
          !state.complete
        ) {
          // we done!
          completeFn();
        }
      },
      // random delay as in a list of files you start noticing
      // files uploading at the exact same speed
      getRandomNumber(750, 1500)
    );

    // remember request so we can abort it later
    state.request = processFn(
      // the file to process
      file,

      // the metadata to send along
      metadata,

      // callbacks (load, error, progress, abort)
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
              headers: {}
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
        if (state.perceivedProgress === 1) {
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
                body: `${error}`
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
      }
    );
  };

  const abort = () => {
    // no request running, can't abort
    if (!state.request) return;

    // stop updater
    state.perceivedPerformanceUpdater.clear();

    // abort actual request
    state.request.abort();

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

  const getProgress = () =>
    state.progress ? Math.min(state.progress, state.perceivedProgress) : null;
  const getDuration = () => Math.min(state.duration, state.perceivedDuration);

  const api = {
    ...on(),
    process, // start processing file
    abort, // abort active process request
    getProgress,
    getDuration,
    reset
  };

  return api;
};

const getFilenameWithoutExtension = name =>
  name.substr(0, name.lastIndexOf('.')) || name;

const createFileStub = source => {
  let data = [source.name, source.size, source.type];

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
    type: data[2]
  };
};

const isFile = value =>
  !!(value instanceof File || (value instanceof Blob && value.name));

const deepCloneObject = src => {
  if (!isObject(src)) return src;
  const target = isArray(src) ? [] : {};
  for (const key in src) {
    if (!src.hasOwnProperty(key)) continue;
    const v = src[key];
    target[key] = v && isObject(v) ? deepCloneObject(v) : v;
  }
  return target;
};

const createItem = (origin = null, serverFileReference = null, file = null) => {
  // unique id for this item, is used to identify the item across views
  const id = getUniqueId();

  /**
   * Internal item state
   */
  const state = {
    // is archived
    archived: false,

    // if is frozen, no longer fires events
    frozen: false,

    // removed from view
    released: false,

    // original source
    source: null,

    // file model reference
    file,

    // id of file on server
    serverFileReference,

    // current item status
    status: serverFileReference
      ? ItemStatus.PROCESSING_COMPLETE
      : ItemStatus.INIT,

    // active processes
    activeLoader: null,
    activeProcessor: null
  };

  // callback used when abort processing is called to link back to the resolve method
  let abortProcessingRequestComplete = null;

  /**
   * Externally added item metadata
   */
  const metadata = {};

  // item data
  const setStatus = status => (state.status = status);

  // fire event unless the item has been archived
  const fire = (event, ...params) => {
    if (state.released || state.frozen) return;
    api.fire(event, ...params);
  };

  // file data
  const getFileExtension = () => getExtensionFromFilename(state.file.name);
  const getFileType = () => state.file.type;
  const getFileSize = () => state.file.size;
  const getFile = () => state.file;

  //
  // logic to load a file
  //
  const load = (source, loader, onload) => {
    // remember the original item source
    state.source = source;

    // file stub is already there
    if (state.file) {
      fire('load-skip');
      return;
    }

    // set a stub file object while loading the actual data
    state.file = createFileStub(source);

    // starts loading
    loader.on('init', () => {
      fire('load-init');
    });

    // we'eve received a size indication, let's update the stub
    loader.on('meta', meta => {
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
    loader.on('progress', progress => {
      setStatus(ItemStatus.LOADING);

      fire('load-progress', progress);
    });

    // an error was thrown while loading the file, we need to switch to error state
    loader.on('error', error => {
      setStatus(ItemStatus.LOAD_ERROR);

      fire('load-request-error', error);
    });

    // user or another process aborted the file load (cannot retry)
    loader.on('abort', () => {
      setStatus(ItemStatus.INIT);
      fire('load-abort');
    });

    // done loading
    loader.on('load', file => {
      // as we've now loaded the file the loader is no longer required
      state.activeLoader = null;

      // called when file has loaded succesfully
      const success = result => {
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

      const error = result => {
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

  const retryLoad = () => {
    if (!state.activeLoader) {
      return;
    }
    state.activeLoader.load();
  };

  const abortLoad = () => {
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
  const process = (processor, onprocess) => {
    // now processing
    setStatus(ItemStatus.PROCESSING);

    // reset abort callback
    abortProcessingRequestComplete = null;

    // if no file loaded we'll wait for the load event
    if (!(state.file instanceof Blob)) {
      api.on('load', () => {
        process(processor, onprocess);
      });
      return;
    }

    // setup processor
    processor.on('load', serverFileReference => {
      // need this id to be able to revert the upload
      state.serverFileReference = serverFileReference;
    });

    processor.on('load-perceived', serverFileReference => {
      // no longer required
      state.activeProcessor = null;

      // need this id to be able to rever the upload
      state.serverFileReference = serverFileReference;

      setStatus(ItemStatus.PROCESSING_COMPLETE);
      fire('process-complete', serverFileReference);
    });

    processor.on('start', () => {
      fire('process-start');
    });

    processor.on('error', error => {
      state.activeProcessor = null;
      setStatus(ItemStatus.PROCESSING_ERROR);
      fire('process-error', error);
    });

    processor.on('abort', serverFileReference => {
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

    processor.on('progress', progress => {
      fire('process-progress', progress);
    });

    // when successfully transformed
    const success = file => {
      // if was archived in the mean time, don't process
      if (state.archived) return;

      // process file!
      processor.process(file, { ...metadata });
    };

    // something went wrong during transform phase
    const error = result => {};

    // start processing the file
    onprocess(state.file, success, error);

    // set as active processor
    state.activeProcessor = processor;
  };

  const requestProcessing = () => {
    setStatus(ItemStatus.PROCESSING_QUEUED);
  };

  const abortProcessing = () =>
    new Promise(resolve => {
      if (!state.activeProcessor) {
        setStatus(ItemStatus.IDLE);
        fire('process-abort');

        resolve();
        return;
      }

      abortProcessingRequestComplete = () => {
        resolve();
      };

      state.activeProcessor.abort();
    });

  //
  // logic to revert a processed file
  //
  const revert = (revertFileUpload, forceRevert) =>
    new Promise((resolve, reject) => {
      // cannot revert without a server id for this process
      if (state.serverFileReference === null) {
        resolve();
        return;
      }

      // revert the upload (fire and forget)
      revertFileUpload(
        state.serverFileReference,
        () => {
          // reset file server id as now it's no available on the server
          state.serverFileReference = null;
          resolve();
        },
        error => {
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

  // exposed methods
  const setMetadata = (key, value, silent) => {
    const keys = key.split('.');
    const root = keys[0];
    const last = keys.pop();
    let data = metadata;
    keys.forEach(key => (data = data[key]));

    // compare old value against new value, if they're the same, we're not updating
    if (JSON.stringify(data[last]) === JSON.stringify(value)) return;

    // update value
    data[last] = value;

    // don't fire update
    if (silent) return;

    // fire update
    fire('metadata-update', {
      key: root,
      value: metadata[root]
    });
  };

  const getMetadata = key => deepCloneObject(key ? metadata[key] : metadata);

  const api = {
    id: { get: () => id },
    origin: { get: () => origin },
    serverId: { get: () => state.serverFileReference },
    status: { get: () => state.status },
    filename: { get: () => state.file.name },
    filenameWithoutExtension: {
      get: () => getFilenameWithoutExtension(state.file.name)
    },
    fileExtension: { get: getFileExtension },
    fileType: { get: getFileType },
    fileSize: { get: getFileSize },
    file: { get: getFile },

    source: { get: () => state.source },

    getMetadata,
    setMetadata: (key, value, silent) => {
      if (isObject(key)) {
        const data = key;
        Object.keys(data).forEach(key => {
          setMetadata(key, data[key], value);
        });
        return key;
      }
      setMetadata(key, value, silent);
      return value;
    },

    extend: (name, handler) => (itemAPI[name] = handler),

    abortLoad,
    retryLoad,
    requestProcessing,
    abortProcessing,

    load,
    process,
    revert,

    ...on(),

    freeze: () => (state.frozen = true),

    release: () => (state.released = true),
    released: { get: () => state.released },

    archive: () => (state.archived = true),
    archived: { get: () => state.archived }
  };

  // create it here instead of returning it instantly so we can extend it later
  const itemAPI = createObject(api);

  return itemAPI;
};

const getItemIndexByQuery = (items, query) => {
  // just return first index
  if (isEmpty(query)) {
    return 0;
  }

  // invalid queries
  if (!isString(query)) {
    return -1;
  }

  // return item by id (or -1 if not found)
  return items.findIndex(item => item.id === query);
};

const getItemById = (items, itemId) => {
  const index = getItemIndexByQuery(items, itemId);
  if (index < 0) {
    return;
  }
  return items[index] || null;
};

const fetchLocal = (url, load, error, progress, abort, headers) => {
  const request = sendRequest(null, url, {
    method: 'GET',
    responseType: 'blob'
  });

  request.onload = xhr => {
    // get headers
    const headers = xhr.getAllResponseHeaders();

    // get filename
    const filename =
      getFileInfoFromHeaders(headers).name || getFilenameFromURL(url);

    // create response
    load(
      createResponse(
        'load',
        xhr.status,
        getFileFromBlob(xhr.response, filename),
        headers
      )
    );
  };

  request.onerror = xhr => {
    error(
      createResponse(
        'error',
        xhr.status,
        xhr.statusText,
        xhr.getAllResponseHeaders()
      )
    );
  };

  request.onheaders = xhr => {
    headers(
      createResponse('headers', xhr.status, null, xhr.getAllResponseHeaders())
    );
  };

  request.ontimeout = createTimeoutResponse(error);
  request.onprogress = progress;
  request.onabort = abort;

  // should return request
  return request;
};

const getDomainFromURL = url => {
  if (url.indexOf('//') === 0) {
    url = location.protocol + url;
  }
  return url
    .toLowerCase()
    .replace('blob:', '')
    .replace(/([a-z])?:\/\//, '$1')
    .split('/')[0];
};

const isExternalURL = url =>
  (url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
  getDomainFromURL(location.href) !== getDomainFromURL(url);

const dynamicLabel = label => (...params) =>
  isFunction(label) ? label(...params) : label;

const isMockItem = item => !isFile(item.file);

const listUpdated = (dispatch, state) => {
  clearTimeout(state.listUpdateTimeout);
  state.listUpdateTimeout = setTimeout(() => {
    dispatch('DID_UPDATE_ITEMS', { items: getActiveItems(state.items) });
  }, 0);
};

const optionalPromise = (fn, ...params) =>
  new Promise(resolve => {
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
};

// returns item based on state
const getItemByQueryFromState = (state, itemHandler) => ({
  query,
  success = () => {},
  failure = () => {}
} = {}) => {
  const item = getItemByQuery(state.items, query);
  if (!item) {
    failure({
      error: createResponse('error', 0, 'Item not found'),
      file: null
    });
    return;
  }
  itemHandler(item, success, failure);
};

const actions = (dispatch, query, state) => ({
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
      if (
        !files.find(
          file => file.source === item.source || file.source === item.file
        )
      ) {
        dispatch('REMOVE_ITEM', { query: item });
      }
    });

    // add new files
    activeItems = getActiveItems(state.items);
    files.forEach((file, index) => {
      // if file is already in list
      if (
        activeItems.find(
          item => item.source === file.source || item.file === file.source
        )
      )
        return;

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
        applyFilterChain('SHOULD_PREPARE_OUTPUT', false, { item, query }).then(
          shouldPrepareOutput => {
            if (!shouldPrepareOutput) {
              return;
            }
            dispatch(
              'REQUEST_PREPARE_OUTPUT',
              {
                query: id,
                item,
                ready: file => {
                  dispatch('DID_PREPARE_OUTPUT', { id, file });
                }
              },
              true
            );
          }
        );

        return;
      }

      // for async scenarios
      const upload = () => {
        // we push this forward a bit so the interface is updated correctly
        setTimeout(() => {
          dispatch('REQUEST_ITEM_PROCESSING', { query: id });
        }, 32);
      };

      const revert = doUpload => {
        item
          .revert(
            createRevertFunction(
              state.options.server.url,
              state.options.server.revert
            ),
            query('GET_FORCE_REVERT')
          )
          .then(doUpload ? upload : () => {})
          .catch(() => {});
      };

      const abort = doUpload => {
        item.abortProcessing().then(doUpload ? upload : () => {});
      };

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

  SORT: ({ compare }) => {
    sortItems(state, compare);
  },

  ADD_ITEMS: ({
    items,
    index,
    interactionMethod,
    success = () => {},
    failure = () => {}
  }) => {
    let currentIndex = index;

    if (index === -1 || typeof index === 'undefined') {
      const insertLocation = query('GET_ITEM_INSERT_LOCATION');
      const totalItems = query('GET_TOTAL_ITEMS');
      currentIndex = insertLocation === 'before' ? 0 : totalItems;
    }

    const ignoredFiles = query('GET_IGNORED_FILES');
    const isValidFile = source =>
      isFile(source)
        ? !ignoredFiles.includes(source.name.toLowerCase())
        : !isEmpty(source);
    const validItems = items.filter(isValidFile);

    const promises = validItems.map(
      source =>
        new Promise((resolve, reject) => {
          dispatch('ADD_ITEM', {
            interactionMethod,
            source: source.source || source,
            success: resolve,
            failure: reject,
            index: currentIndex++,
            options: source.options || {}
          });
        })
    );

    Promise.all(promises)
      .then(success)
      .catch(failure);
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
    success = () => {},
    failure = () => {},
    options = {}
  }) => {
    // if no source supplied
    if (isEmpty(source)) {
      failure({
        error: createResponse('error', 0, 'No source'),
        file: null
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
        const error = createResponse('warning', 0, 'Max files');

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
      if (
        item.status === ItemStatus.PROCESSING_COMPLETE ||
        item.status === ItemStatus.PROCESSING_REVERT_ERROR
      ) {
        const forceRevert = query('GET_FORCE_REVERT');
        item
          .revert(
            createRevertFunction(
              state.options.server.url,
              state.options.server.revert
            ),
            forceRevert
          )
          .then(() => {
            if (!forceRevert) return;

            // try to add now
            dispatch('ADD_ITEM', {
              source,
              index,
              interactionMethod,
              success,
              failure,
              options
            });
          })
          .catch(() => {}); // no need to handle this catch state for now

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
      const handleAdd = shouldAdd => {
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
        applyFilterChain('SHOULD_PREPARE_OUTPUT', false, { item, query }).then(
          shouldPrepareOutput => {
            const loadComplete = () => {
              dispatch('COMPLETE_LOAD_ITEM', {
                query: id,
                item,
                data: {
                  source,
                  success
                }
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
                  item,
                  ready: file => {
                    dispatch('DID_PREPARE_OUTPUT', { id, file });
                    loadComplete();
                  }
                },
                true
              );

              return;
            }

            loadComplete();
          }
        );
      };

      // item loaded, allow plugins to
      // - read data (quickly)
      // - add metadata
      applyFilterChain('DID_LOAD_ITEM', item, { query, dispatch })
        .then(() => {
          optionalPromise(
            query('GET_BEFORE_ADD_FILE'),
            createItemAPI(item)
          ).then(handleAdd);
        })
        .catch(() => {
          handleAdd(false);
        });
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
          main: dynamicLabel(state.options.labelFileProcessingRevertError)(
            error
          ),
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
          ? // input
            isString(source) && isExternalURL(source)
            ? createFetchFunction(url, fetch) // remote url
            : fetchLocal // local url
          : // limbo or local
          origin === FileOrigin.LIMBO
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

  REQUEST_PREPARE_OUTPUT: ({ item, ready }) => {
    // don't handle archived items, an item could have been archived (load aborted) while waiting to be prepared
    if (item.archived) return;

    // allow plugins to alter the file data
    applyFilterChain('PREPARE_OUTPUT', item.file, { query, item }).then(
      result => {
        applyFilterChain('COMPLETE_PREPARE_OUTPUT', result, {
          query,
          item
        }).then(result => {
          // don't handle archived items, an item could have been archived (load aborted) while being prepared
          if (item.archived) return;

          // we done!
          ready(result);
        });
      }
    );
  },

  COMPLETE_LOAD_ITEM: ({ item, data }) => {
    const { success, source } = data;

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

  REQUEST_ITEM_PROCESSING: getItemByQueryFromState(
    state,
    (item, success, failure) => {
      // cannot be queued (or is already queued)
      const itemCanBeQueuedForProcessing =
        // waiting for something
        item.status === ItemStatus.IDLE ||
        // processing went wrong earlier
        item.status === ItemStatus.PROCESSING_ERROR;

      // not ready to be processed
      if (!itemCanBeQueuedForProcessing) {
        const process = () => {
          setTimeout(() => {
            dispatch('REQUEST_ITEM_PROCESSING', {
              query: item,
              success,
              failure
            });
          }, 32);
        };

        // if already done processing or tried to revert but didn't work, try again
        if (
          item.status === ItemStatus.PROCESSING_COMPLETE ||
          item.status === ItemStatus.PROCESSING_REVERT_ERROR
        ) {
          item
            .revert(
              createRevertFunction(
                state.options.server.url,
                state.options.server.revert
              ),
              query('GET_FORCE_REVERT')
            )
            .then(process)
            .catch(() => {}); // don't continue with processing if something went wrong
        } else if (item.status === ItemStatus.PROCESSING) {
          item.abortProcessing().then(process);
        }

        return;
      }

      // already queued for processing
      if (item.status === ItemStatus.PROCESSING_QUEUED) return;

      item.requestProcessing();

      dispatch('DID_REQUEST_ITEM_PROCESSING', { id: item.id });

      dispatch('PROCESS_ITEM', { query: item, success, failure }, true);
    }
  ),

  PROCESS_ITEM: getItemByQueryFromState(state, (item, success, failure) => {
    const maxParallelUploads = query('GET_MAX_PARALLEL_UPLOADS');
    const totalCurrentUploads = query(
      'GET_ITEMS_BY_STATUS',
      ItemStatus.PROCESSING
    ).length;

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
    }

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
    };

    // we done function
    item.onOnce('process-complete', () => {
      success(createItemAPI(item));
      processNext();

      // All items processed? No errors?
      const allItemsProcessed =
        query('GET_ITEMS_BY_STATUS', ItemStatus.PROCESSING_COMPLETE).length ===
        state.items.length;
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
    item.process(
      createFileProcessor(
        createProcessorFunction(
          state.options.server.url,
          state.options.server.process,
          state.options.name
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

  REQUEST_REMOVE_ITEM: getItemByQueryFromState(state, item => {
    optionalPromise(query('GET_BEFORE_REMOVE_FILE'), createItemAPI(item)).then(
      shouldRemove => {
        if (!shouldRemove) {
          return;
        }
        dispatch('REMOVE_ITEM', { query: item });
      }
    );
  }),

  RELEASE_ITEM: getItemByQueryFromState(state, item => {
    item.release();
  }),

  REMOVE_ITEM: getItemByQueryFromState(state, (item, success) => {
    const removeFromView = () => {
      // get id reference
      const id = item.id;

      // archive the item, this does not remove it from the list
      getItemById(state.items, id).archive();

      // tell the view the item has been removed
      dispatch('DID_REMOVE_ITEM', { error: null, id, item });

      // now the list has been modified
      listUpdated(dispatch, state);

      // correctly removed
      success(createItemAPI(item));
    };

    // if this is a local file and the server.remove function has been configured, send source there so dev can remove file from server
    const server = state.options.server;
    if (
      item.origin === FileOrigin.LOCAL &&
      server &&
      isFunction(server.remove)
    ) {
      dispatch('DID_START_ITEM_REMOVE', { id: item.id });

      server.remove(
        item.source,
        () => removeFromView(),
        status => {
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
    } else {
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
    item.abortProcessing().then(() => {
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
    const handleRevert = shouldRevert => {
      if (!shouldRevert) return;
      dispatch('REVERT_ITEM_PROCESSING', { query: item });
    };

    const fn = query('GET_BEFORE_REMOVE_FILE');
    if (!fn) {
      return handleRevert(true);
    }

    const requestRemoveResult = fn(createItemAPI(item));
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

  REVERT_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
    item
      .revert(
        createRevertFunction(
          state.options.server.url,
          state.options.server.revert
        ),
        query('GET_FORCE_REVERT')
      )
      .then(() => {
        const shouldRemove = state.options.instantUpload || isMockItem(item);
        if (shouldRemove) {
          dispatch('REMOVE_ITEM', { query: item.id });
        }
      })
      .catch(() => {});
  }),

  SET_OPTIONS: ({ options }) => {
    forin(options, (key, value) => {
      dispatch(`SET_${fromCamels(key, '_').toUpperCase()}`, { value });
    });
  }
});

const formatFilename = name => name;

const createElement$1 = tagName => {
  return document.createElement(tagName);
};

const text = (node, value) => {
  let textNode = node.childNodes[0];
  if (!textNode) {
    textNode = document.createTextNode(value);
    node.appendChild(textNode);
  } else if (value !== textNode.nodeValue) {
    textNode.nodeValue = value;
  }
};

const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
  const angleInRadians = (((angleInDegrees % 360) - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians)
  };
};

const describeArc = (x, y, radius, startAngle, endAngle, arcSweep) => {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    arcSweep,
    0,
    end.x,
    end.y
  ].join(' ');
};

const percentageArc = (x, y, radius, from, to) => {
  let arcSweep = 1;
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

const create = ({ root, props }) => {
  // start at 0
  props.spin = false;
  props.progress = 0;
  props.opacity = 0;

  // svg
  const svg = createElement('svg');
  root.ref.path = createElement('path', {
    'stroke-width': 2,
    'stroke-linecap': 'round'
  });
  svg.appendChild(root.ref.path);

  root.ref.svg = svg;

  root.appendChild(svg);
};

const write = ({ root, props }) => {
  if (props.opacity === 0) {
    return;
  }

  if (props.align) {
    root.element.dataset.align = props.align;
  }

  // get width of stroke
  const ringStrokeWidth = parseInt(attr(root.ref.path, 'stroke-width'), 10);

  // calculate size of ring
  const size = root.rect.element.width * 0.5;

  // ring state
  let ringFrom = 0;
  let ringTo = 0;

  // now in busy mode
  if (props.spin) {
    ringFrom = 0;
    ringTo = 0.5;
  } else {
    ringFrom = 0;
    ringTo = props.progress;
  }

  // get arc path
  const coordinates = percentageArc(
    size,
    size,
    size - ringStrokeWidth,
    ringFrom,
    ringTo
  );

  // update progress bar
  attr(root.ref.path, 'd', coordinates);

  // hide while contains 0 value
  attr(
    root.ref.path,
    'stroke-opacity',
    props.spin || props.progress > 0 ? 1 : 0
  );
};

const progressIndicator = createView({
  tag: 'div',
  name: 'progress-indicator',
  ignoreRectUpdate: true,
  ignoreRect: true,
  create,
  write,
  mixins: {
    apis: ['progress', 'spin', 'align'],
    styles: ['opacity'],
    animations: {
      opacity: { type: 'tween', duration: 500 },
      progress: {
        type: 'spring',
        stiffness: 0.95,
        damping: 0.65,
        mass: 10
      }
    }
  }
});

const create$1 = ({ root, props }) => {
  root.element.innerHTML = (props.icon || '') + `<span>${props.label}</span>`;

  props.isDisabled = false;
};

const write$1 = ({ root, props }) => {
  const { isDisabled } = props;
  const shouldDisable = root.query('GET_DISABLED') || props.opacity === 0;

  if (shouldDisable && !isDisabled) {
    props.isDisabled = true;
    attr(root.element, 'disabled', 'disabled');
  } else if (!shouldDisable && isDisabled) {
    props.isDisabled = false;
    root.element.removeAttribute('disabled');
  }
};

const fileActionButton = createView({
  tag: 'button',
  attributes: {
    type: 'button'
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
      opacity: { type: 'tween', duration: 250 }
    },
    listeners: true
  },
  create: create$1,
  write: write$1
});

const toNaturalFileSize = (bytes, decimalSeparator = '.') => {
  // nope, no negative byte sizes
  bytes = Math.round(Math.abs(bytes));

  // just bytes
  if (bytes < 1000) {
    return `${bytes} bytes`;
  }

  // kilobytes
  if (bytes < MB) {
    return `${Math.floor(bytes / KB)} KB`;
  }

  // megabytes
  if (bytes < GB) {
    return `${removeDecimalsWhenZero(bytes / MB, 1, decimalSeparator)} MB`;
  }

  // gigabytes
  return `${removeDecimalsWhenZero(bytes / GB, 2, decimalSeparator)} GB`;
};

const KB = 1000;
const MB = 1000000;
const GB = 1000000000;

const removeDecimalsWhenZero = (value, decimalCount, separator) => {
  return value
    .toFixed(decimalCount)
    .split('.')
    .filter(part => part !== '0')
    .join(separator);
};

const create$2 = ({ root, props }) => {
  // filename
  const fileName = createElement$1('span');
  fileName.className = 'filepond--file-info-main';
  // hide for screenreaders
  // the file is contained in a fieldset with legend that contains the filename
  // no need to read it twice
  attr(fileName, 'aria-hidden', 'true');
  root.appendChild(fileName);
  root.ref.fileName = fileName;

  // filesize
  const fileSize = createElement$1('span');
  fileSize.className = 'filepond--file-info-sub';
  root.appendChild(fileSize);
  root.ref.fileSize = fileSize;

  // set initial values
  text(fileSize, root.query('GET_LABEL_FILE_WAITING_FOR_SIZE'));
  text(fileName, formatFilename(root.query('GET_ITEM_NAME', props.id)));
};

const updateFile = ({ root, props }) => {
  text(
    root.ref.fileSize,
    toNaturalFileSize(root.query('GET_ITEM_SIZE', props.id))
  );
  text(
    root.ref.fileName,
    formatFilename(root.query('GET_ITEM_NAME', props.id))
  );
};

const updateFileSizeOnError = ({ root, props }) => {
  // if size is available don't fallback to unknown size message
  if (isInt(root.query('GET_ITEM_SIZE', props.id))) {
    return;
  }

  text(root.ref.fileSize, root.query('GET_LABEL_FILE_SIZE_NOT_AVAILABLE'));
};

const fileInfo = createView({
  name: 'file-info',
  ignoreRect: true,
  ignoreRectUpdate: true,
  write: createRoute({
    DID_LOAD_ITEM: updateFile,
    DID_UPDATE_ITEM_META: updateFile,
    DID_THROW_ITEM_LOAD_ERROR: updateFileSizeOnError,
    DID_THROW_ITEM_INVALID: updateFileSizeOnError
  }),
  didCreateView: root => {
    applyFilters('CREATE_VIEW', { ...root, view: root });
  },
  create: create$2,
  mixins: {
    styles: ['translateX', 'translateY'],
    animations: {
      translateX: 'spring',
      translateY: 'spring'
    }
  }
});

const toPercentage = value => Math.round(value * 100);

const create$3 = ({ root, props }) => {
  // main status
  const main = createElement$1('span');
  main.className = 'filepond--file-status-main';
  root.appendChild(main);
  root.ref.main = main;

  // sub status
  const sub = createElement$1('span');
  sub.className = 'filepond--file-status-sub';
  root.appendChild(sub);
  root.ref.sub = sub;

  didSetItemLoadProgress({ root, action: { progress: null } });
};

const didSetItemLoadProgress = ({ root, action }) => {
  const title =
    action.progress === null
      ? root.query('GET_LABEL_FILE_LOADING')
      : `${root.query('GET_LABEL_FILE_LOADING')} ${toPercentage(
          action.progress
        )}%`;
  text(root.ref.main, title);
  text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
};

const didSetItemProcessProgress = ({ root, action }) => {
  const title =
    action.progress === null
      ? root.query('GET_LABEL_FILE_PROCESSING')
      : `${root.query('GET_LABEL_FILE_PROCESSING')} ${toPercentage(
          action.progress
        )}%`;
  text(root.ref.main, title);
  text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
};

const didRequestItemProcessing = ({ root }) => {
  text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING'));
  text(root.ref.sub, root.query('GET_LABEL_TAP_TO_CANCEL'));
};

const didAbortItemProcessing = ({ root }) => {
  text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING_ABORTED'));
  text(root.ref.sub, root.query('GET_LABEL_TAP_TO_RETRY'));
};

const didCompleteItemProcessing = ({ root }) => {
  text(root.ref.main, root.query('GET_LABEL_FILE_PROCESSING_COMPLETE'));
  text(root.ref.sub, root.query('GET_LABEL_TAP_TO_UNDO'));
};

const clear = ({ root }) => {
  text(root.ref.main, '');
  text(root.ref.sub, '');
};

const error = ({ root, action }) => {
  text(root.ref.main, action.status.main);
  text(root.ref.sub, action.status.sub);
};

const fileStatus = createView({
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
    DID_THROW_ITEM_REMOVE_ERROR: error
  }),
  didCreateView: root => {
    applyFilters('CREATE_VIEW', { ...root, view: root });
  },
  create: create$3,
  mixins: {
    styles: ['translateX', 'translateY', 'opacity'],
    animations: {
      opacity: { type: 'tween', duration: 250 },
      translateX: 'spring',
      translateY: 'spring'
    }
  }
});

/**
 * Button definitions for the file view
 */

const Buttons = {
  AbortItemLoad: {
    label: 'GET_LABEL_BUTTON_ABORT_ITEM_LOAD',
    action: 'ABORT_ITEM_LOAD',
    className: 'filepond--action-abort-item-load',
    align: 'LOAD_INDICATOR_POSITION' // right
  },
  RetryItemLoad: {
    label: 'GET_LABEL_BUTTON_RETRY_ITEM_LOAD',
    action: 'RETRY_ITEM_LOAD',
    icon: 'GET_ICON_RETRY',
    className: 'filepond--action-retry-item-load',
    align: 'BUTTON_PROCESS_ITEM_POSITION' // right
  },
  RemoveItem: {
    label: 'GET_LABEL_BUTTON_REMOVE_ITEM',
    action: 'REQUEST_REMOVE_ITEM',
    icon: 'GET_ICON_REMOVE',
    className: 'filepond--action-remove-item',
    align: 'BUTTON_REMOVE_ITEM_POSITION' // left
  },
  ProcessItem: {
    label: 'GET_LABEL_BUTTON_PROCESS_ITEM',
    action: 'REQUEST_ITEM_PROCESSING',
    icon: 'GET_ICON_PROCESS',
    className: 'filepond--action-process-item',
    align: 'BUTTON_PROCESS_ITEM_POSITION' // right
  },
  AbortItemProcessing: {
    label: 'GET_LABEL_BUTTON_ABORT_ITEM_PROCESSING',
    action: 'ABORT_ITEM_PROCESSING',
    className: 'filepond--action-abort-item-processing',
    align: 'BUTTON_PROCESS_ITEM_POSITION' // right
  },
  RetryItemProcessing: {
    label: 'GET_LABEL_BUTTON_RETRY_ITEM_PROCESSING',
    action: 'RETRY_ITEM_PROCESSING',
    icon: 'GET_ICON_RETRY',
    className: 'filepond--action-retry-item-processing',
    align: 'BUTTON_PROCESS_ITEM_POSITION' // right
  },
  RevertItemProcessing: {
    label: 'GET_LABEL_BUTTON_UNDO_ITEM_PROCESSING',
    action: 'REQUEST_REVERT_ITEM_PROCESSING',
    icon: 'GET_ICON_UNDO',
    className: 'filepond--action-revert-item-processing',
    align: 'BUTTON_PROCESS_ITEM_POSITION' // right
  }
};

// make a list of buttons, we can then remove buttons from this list if they're disabled
const ButtonKeys = [];
forin(Buttons, key => {
  ButtonKeys.push(key);
});

const calculateFileInfoOffset = root => {
  const buttonRect = root.ref.buttonRemoveItem.rect.element;
  return buttonRect.hidden ? null : buttonRect.width + buttonRect.left;
};

// Force on full pixels so text stays crips
const calculateFileVerticalCenterOffset = root =>
  Math.floor(root.ref.buttonRemoveItem.rect.element.height / 4);
const calculateFileHorizontalCenterOffset = root =>
  Math.floor(root.ref.buttonRemoveItem.rect.element.left / 2);

const getLoadIndicatorAlignment = root =>
  root.query('GET_STYLE_LOAD_INDICATOR_POSITION');
const getProcessIndicatorAlignment = root =>
  root.query('GET_STYLE_PROGRESS_INDICATOR_POSITION');
const getRemoveIndicatorAligment = root =>
  root.query('GET_STYLE_BUTTON_REMOVE_ITEM_POSITION');

const DefaultStyle = {
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
  status: { translateX: 0, translateY: 0, opacity: 0 }
};

const IdleStyle = {
  buttonRemoveItem: { opacity: 1 },
  buttonProcessItem: { opacity: 1 },
  info: { translateX: calculateFileInfoOffset },
  status: { translateX: calculateFileInfoOffset }
};

const ProcessingStyle = {
  buttonAbortItemProcessing: { opacity: 1 },
  processProgressIndicator: { opacity: 1 },
  status: { opacity: 1 }
};

const StyleMap = {
  DID_THROW_ITEM_INVALID: {
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { translateX: calculateFileInfoOffset, opacity: 1 }
  },

  DID_START_ITEM_LOAD: {
    buttonAbortItemLoad: { opacity: 1 },
    loadProgressIndicator: { opacity: 1 },
    status: { opacity: 1 }
  },
  DID_THROW_ITEM_LOAD_ERROR: {
    buttonRetryItemLoad: { opacity: 1 },
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 1 }
  },

  DID_START_ITEM_REMOVE: {
    processProgressIndicator: { opacity: 1, align: getRemoveIndicatorAligment },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 0 }
  },

  DID_THROW_ITEM_REMOVE_ERROR: {
    processProgressIndicator: { opacity: 0, align: getRemoveIndicatorAligment },
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 1, translateX: calculateFileInfoOffset }
  },

  DID_LOAD_ITEM: IdleStyle,
  DID_LOAD_LOCAL_ITEM: {
    buttonRemoveItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { translateX: calculateFileInfoOffset }
  },
  DID_START_ITEM_PROCESSING: ProcessingStyle,
  DID_REQUEST_ITEM_PROCESSING: ProcessingStyle,
  DID_UPDATE_ITEM_PROCESS_PROGRESS: ProcessingStyle,
  DID_COMPLETE_ITEM_PROCESSING: {
    buttonRevertItemProcessing: { opacity: 1 },
    info: { opacity: 1 },
    status: { opacity: 1 }
  },
  DID_THROW_ITEM_PROCESSING_ERROR: {
    buttonRemoveItem: { opacity: 1 },
    buttonRetryItemProcessing: { opacity: 1 },
    status: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset }
  },
  DID_THROW_ITEM_PROCESSING_REVERT_ERROR: {
    buttonRevertItemProcessing: { opacity: 1 },
    status: { opacity: 1 },
    info: { opacity: 1 }
  },
  DID_ABORT_ITEM_PROCESSING: {
    buttonRemoveItem: { opacity: 1 },
    buttonProcessItem: { opacity: 1 },
    info: { translateX: calculateFileInfoOffset },
    status: { opacity: 1 }
  },
  DID_REVERT_ITEM_PROCESSING: IdleStyle
};

// complete indicator view
const processingCompleteIndicatorView = createView({
  create: ({ root }) => {
    root.element.innerHTML = root.query('GET_ICON_DONE');
  },
  name: 'processing-complete-indicator',
  ignoreRect: true,
  mixins: {
    styles: ['scaleX', 'scaleY', 'opacity'],
    animations: {
      scaleX: 'spring',
      scaleY: 'spring',
      opacity: { type: 'tween', duration: 250 }
    }
  }
});

/**
 * Creates the file view
 */
const create$4 = ({ root, props }) => {
  const { id } = props;

  // allow reverting upload
  const allowRevert = root.query('GET_ALLOW_REVERT');

  // is instant uploading, need this to determine the icon of the undo button
  const instantUpload = root.query('GET_INSTANT_UPLOAD');

  // is async set up
  const isAsync = root.query('IS_ASYNC');

  // enabled buttons array
  const enabledButtons = isAsync
    ? ButtonKeys.concat()
    : ButtonKeys.filter(key => !/Process/.test(key));

  // remove last button (revert) if not allowed
  if (isAsync && !allowRevert) {
    enabledButtons.splice(-1, 1);
    const map = StyleMap['DID_COMPLETE_ITEM_PROCESSING'];
    map.info.translateX = calculateFileHorizontalCenterOffset;
    map.info.translateY = calculateFileVerticalCenterOffset;
    map.status.translateY = calculateFileVerticalCenterOffset;
    map.processingCompleteIndicator = { opacity: 1, scaleX: 1, scaleY: 1 };
  }

  // update icon and label for revert button when instant uploading
  if (instantUpload && allowRevert) {
    Buttons['RevertItemProcessing'].label = 'GET_LABEL_BUTTON_REMOVE_ITEM';
    Buttons['RevertItemProcessing'].icon = 'GET_ICON_REMOVE';
  }

  // create the button views
  forin(Buttons, (key, definition) => {
    // create button
    const buttonView = root.createChildView(fileActionButton, {
      label: root.query(definition.label),
      icon: root.query(definition.icon),
      opacity: 0
    });

    // should be appended?
    if (enabledButtons.includes(key)) {
      root.appendChildView(buttonView);
    }

    // add position attribute
    buttonView.element.dataset.align = root.query(
      `GET_STYLE_${definition.align}`
    );

    // add class
    buttonView.element.classList.add(definition.className);

    // handle interactions
    buttonView.on('click', e => {
      e.stopPropagation();
      root.dispatch(definition.action, { query: id });
    });

    // set reference
    root.ref[`button${key}`] = buttonView;
  });

  // create file info view
  root.ref.info = root.appendChildView(root.createChildView(fileInfo, { id }));

  // create file status view
  root.ref.status = root.appendChildView(
    root.createChildView(fileStatus, { id })
  );

  // checkmark
  root.ref.processingCompleteIndicator = root.appendChildView(
    root.createChildView(processingCompleteIndicatorView)
  );
  root.ref.processingCompleteIndicator.element.dataset.align = root.query(
    `GET_STYLE_BUTTON_PROCESS_ITEM_POSITION`
  );

  // add progress indicators
  const loadIndicatorView = root.appendChildView(
    root.createChildView(progressIndicator, {
      opacity: 0,
      align: root.query(`GET_STYLE_LOAD_INDICATOR_POSITION`)
    })
  );
  loadIndicatorView.element.classList.add('filepond--load-indicator');
  root.ref.loadProgressIndicator = loadIndicatorView;

  const progressIndicatorView = root.appendChildView(
    root.createChildView(progressIndicator, {
      opacity: 0,
      align: root.query(`GET_STYLE_PROGRESS_INDICATOR_POSITION`)
    })
  );
  progressIndicatorView.element.classList.add('filepond--process-indicator');
  root.ref.processProgressIndicator = progressIndicatorView;

  // current active styles
  root.ref.activeStyles = [];
};

const write$2 = ({ root, actions, props }) => {
  // route actions
  route({ root, actions, props });

  // select last state change action
  let action = actions
    .concat()
    .filter(action => /^DID_/.test(action.type))
    .reverse()
    .find(action => StyleMap[action.type]);

  // a new action happened, let's get the matching styles
  if (action) {
    // define new active styles
    root.ref.activeStyles = [];

    const stylesToApply = StyleMap[action.type];
    forin(DefaultStyle, (name, defaultStyles) => {
      // get reference to control
      const control = root.ref[name];

      // loop over all styles for this control
      forin(defaultStyles, (key, defaultValue) => {
        const value =
          stylesToApply[name] && typeof stylesToApply[name][key] !== 'undefined'
            ? stylesToApply[name][key]
            : defaultValue;
        root.ref.activeStyles.push({ control, key, value });
      });
    });
  }

  // apply active styles to element
  root.ref.activeStyles.forEach(({ control, key, value }) => {
    control[key] = typeof value === 'function' ? value(root) : value;
  });
};

const route = createRoute({
  DID_SET_LABEL_BUTTON_ABORT_ITEM_PROCESSING: ({ root, action }) => {
    root.ref.buttonAbortItemProcessing.label = action.value;
  },
  DID_SET_LABEL_BUTTON_ABORT_ITEM_LOAD: ({ root, action }) => {
    root.ref.buttonAbortItemLoad.label = action.value;
  },
  DID_SET_LABEL_BUTTON_ABORT_ITEM_REMOVAL: ({ root, action }) => {
    root.ref.buttonAbortItemRemoval.label = action.value;
  },
  DID_REQUEST_ITEM_PROCESSING: ({ root }) => {
    root.ref.processProgressIndicator.spin = true;
    root.ref.processProgressIndicator.progress = 0;
  },
  DID_START_ITEM_LOAD: ({ root }) => {
    root.ref.loadProgressIndicator.spin = true;
    root.ref.loadProgressIndicator.progress = 0;
  },
  DID_START_ITEM_REMOVE: ({ root }) => {
    root.ref.processProgressIndicator.spin = true;
    root.ref.processProgressIndicator.progress = 0;
  },
  DID_UPDATE_ITEM_LOAD_PROGRESS: ({ root, action }) => {
    root.ref.loadProgressIndicator.spin = false;
    root.ref.loadProgressIndicator.progress = action.progress;
  },
  DID_UPDATE_ITEM_PROCESS_PROGRESS: ({ root, action }) => {
    root.ref.processProgressIndicator.spin = false;
    root.ref.processProgressIndicator.progress = action.progress;
  }
});

const file = createView({
  create: create$4,
  write: write$2,
  didCreateView: root => {
    applyFilters('CREATE_VIEW', { ...root, view: root });
  },
  name: 'file'
});

/**
 * Creates the file view
 */
const create$5 = ({ root, props }) => {
  // filename
  root.ref.fileName = createElement$1('legend');
  root.appendChild(root.ref.fileName);

  // file appended
  root.ref.file = root.appendChildView(
    root.createChildView(file, { id: props.id })
  );

  // create data container
  const dataContainer = createElement$1('input');
  dataContainer.type = 'hidden';
  dataContainer.name = root.query('GET_NAME');
  dataContainer.disabled = root.query('GET_DISABLED');
  root.ref.data = dataContainer;
  root.appendChild(dataContainer);
};

const didSetDisabled = ({ root }) => {
  root.ref.data.disabled = root.query('GET_DISABLED');
};

/**
 * Data storage
 */
const didLoadItem = ({ root, action, props }) => {
  root.ref.data.value = action.serverFileReference;

  // updates the legend of the fieldset so screenreaders can better group buttons
  text(
    root.ref.fileName,
    formatFilename(root.query('GET_ITEM_NAME', props.id))
  );
};

const didRemoveItem = ({ root }) => {
  root.ref.data.removeAttribute('value');
};

const didCompleteItemProcessing$1 = ({ root, action }) => {
  root.ref.data.value = action.serverFileReference;
};

const didRevertItemProcessing = ({ root }) => {
  root.ref.data.removeAttribute('value');
};

const fileWrapper = createView({
  create: create$5,
  ignoreRect: true,
  write: createRoute({
    DID_SET_DISABLED: didSetDisabled,
    DID_LOAD_ITEM: didLoadItem,
    DID_REMOVE_ITEM: didRemoveItem,
    DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing$1,
    DID_REVERT_ITEM_PROCESSING: didRevertItemProcessing
  }),
  didCreateView: root => {
    applyFilters('CREATE_VIEW', { ...root, view: root });
  },
  tag: 'fieldset',
  name: 'file-wrapper'
});

const PANEL_SPRING_PROPS = { type: 'spring', damping: 0.6, mass: 7 };

const create$6 = ({ root, props }) => {
  [
    {
      name: 'top'
    },
    {
      name: 'center',
      props: {
        translateY: null,
        scaleY: null
      },
      mixins: {
        animations: {
          scaleY: PANEL_SPRING_PROPS
        },
        styles: ['translateY', 'scaleY']
      }
    },
    {
      name: 'bottom',
      props: {
        translateY: null
      },
      mixins: {
        animations: {
          translateY: PANEL_SPRING_PROPS
        },
        styles: ['translateY']
      }
    }
  ].forEach(section => {
    createSection(root, section, props.name);
  });

  root.element.classList.add(`filepond--${props.name}`);

  root.ref.scalable = null;
};

const createSection = (root, section, className) => {
  const viewConstructor = createView({
    name: `panel-${section.name} filepond--${className}`,
    mixins: section.mixins,
    ignoreRectUpdate: true
  });

  const view = root.createChildView(viewConstructor, section.props);

  root.ref[section.name] = root.appendChildView(view);
};

const write$3 = ({ root, props }) => {
  // update scalable state
  if (root.ref.scalable === null || props.scalable !== root.ref.scalable) {
    root.ref.scalable = isBoolean(props.scalable) ? props.scalable : true;
    root.element.dataset.scalable = root.ref.scalable;
  }

  // no height, can't set
  if (!props.height) return;

  // get child rects
  const topRect = root.ref.top.rect.element;
  const bottomRect = root.ref.bottom.rect.element;

  // make sure height never is smaller than bottom and top seciton heights combined (will probably never happen, but who knows)
  const height = Math.max(topRect.height + bottomRect.height, props.height);

  // offset center part
  root.ref.center.translateY = topRect.height;

  // scale center part
  // use math ceil to prevent transparent lines because of rounding errors
  root.ref.center.scaleY = (height - topRect.height - bottomRect.height) / 100;

  // offset bottom part
  root.ref.bottom.translateY = height - bottomRect.height;
};

const panel = createView({
  name: 'panel',
  write: write$3,
  create: create$6,
  ignoreRect: true,
  mixins: {
    apis: ['height', 'scalable']
  }
});

const ITEM_TRANSLATE_SPRING = {
  type: 'spring',
  stiffness: 0.75,
  damping: 0.45,
  mass: 10
};

const ITEM_SCALE_SPRING = 'spring';

/**
 * Creates the file view
 */
const create$7 = ({ root, props }) => {
  // select
  root.ref.handleClick = () =>
    root.dispatch('DID_ACTIVATE_ITEM', { id: props.id });

  // set id
  root.element.id = `filepond--item-${props.id}`;
  root.element.addEventListener('click', root.ref.handleClick);

  // file view
  root.ref.container = root.appendChildView(
    root.createChildView(fileWrapper, { id: props.id })
  );

  // file panel
  root.ref.panel = root.appendChildView(
    root.createChildView(panel, { name: 'item-panel' })
  );

  // default start height
  root.ref.panel.height = null;

  // by default not marked for removal
  props.markedForRemoval = false;
};

const StateMap = {
  DID_START_ITEM_LOAD: 'busy',
  DID_UPDATE_ITEM_LOAD_PROGRESS: 'loading',
  DID_THROW_ITEM_INVALID: 'load-invalid',
  DID_THROW_ITEM_LOAD_ERROR: 'load-error',
  DID_LOAD_ITEM: 'idle',
  DID_THROW_ITEM_REMOVE_ERROR: 'remove-error',
  DID_START_ITEM_REMOVE: 'busy',
  DID_START_ITEM_PROCESSING: 'busy',
  DID_REQUEST_ITEM_PROCESSING: 'busy',
  DID_UPDATE_ITEM_PROCESS_PROGRESS: 'processing',
  DID_COMPLETE_ITEM_PROCESSING: 'processing-complete',
  DID_THROW_ITEM_PROCESSING_ERROR: 'processing-error',
  DID_THROW_ITEM_PROCESSING_REVERT_ERROR: 'processing-revert-error',
  DID_ABORT_ITEM_PROCESSING: 'cancelled',
  DID_REVERT_ITEM_PROCESSING: 'idle'
};

const route$1 = createRoute({
  DID_UPDATE_PANEL_HEIGHT: ({ root, action }) => {
    const { height } = action;
    root.height = height;
  }
});

const write$4 = ({ root, actions, props, shouldOptimize }) => {
  // select last state change action
  let action = actions
    .concat()
    .filter(action => /^DID_/.test(action.type))
    .reverse()
    .find(action => StateMap[action.type]);

  // no need to set same state twice
  if (action && action.type !== props.currentState) {
    // set current state
    props.currentState = action.type;

    // set state
    root.element.dataset.filepondItemState = StateMap[props.currentState] || '';
  }

  // route actions
  const aspectRatio =
    root.query('GET_ITEM_PANEL_ASPECT_RATIO') ||
    root.query('GET_PANEL_ASPECT_RATIO');
  if (!aspectRatio) {
    route$1({ root, actions, props });
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
};

const item = createView({
  create: create$7,
  write: write$4,
  destroy: ({ root, props }) => {
    root.element.removeEventListener('click', root.ref.handleClick);
    root.dispatch('RELEASE_ITEM', { query: props.id });
  },
  tag: 'li',
  name: 'item',
  mixins: {
    apis: ['id', 'interactionMethod', 'markedForRemoval', 'spawnDate'],
    styles: [
      'translateX',
      'translateY',
      'scaleX',
      'scaleY',
      'opacity',
      'height'
    ],
    animations: {
      scaleX: ITEM_SCALE_SPRING,
      scaleY: ITEM_SCALE_SPRING,
      translateX: ITEM_TRANSLATE_SPRING,
      translateY: ITEM_TRANSLATE_SPRING,
      opacity: { type: 'tween', duration: 150 }
    }
  }
});

const getItemIndexByPosition = (view, positionInView) => {
  if (!positionInView) return;

  const horizontalSpace = view.rect.element.width;
  const children = view.childViews;
  const l = children.length;
  let last = null;

  // -1, don't move items to accomodate (either add to top or bottom)
  if (l === 0 || positionInView.top < children[0].rect.element.top) return -1;

  // let's get the item width
  const item = children[0];
  const itemRect = item.rect.element;
  const itemHorizontalMargin = itemRect.marginLeft + itemRect.marginRight;
  const itemWidth = itemRect.width + itemHorizontalMargin;
  const itemsPerRow = Math.round(horizontalSpace / itemWidth);

  // stack
  if (itemsPerRow === 1) {
    for (let index = 0; index < l; index++) {
      const child = children[index];
      const childMid = child.rect.outer.top + child.rect.element.height * 0.5;
      if (positionInView.top < childMid) {
        return index;
      }
    }
    return l;
  }

  // grid
  const itemVerticalMargin = itemRect.marginTop + itemRect.marginBottom;
  const itemHeight = itemRect.height + itemVerticalMargin;
  for (let index = 0; index < l; index++) {
    const indexX = index % itemsPerRow;
    const indexY = Math.floor(index / itemsPerRow);

    const offsetX = indexX * itemWidth;
    const offsetY = indexY * itemHeight;

    const itemTop = offsetY - itemRect.marginTop;
    const itemRight = offsetX + itemWidth;
    const itemBottom = offsetY + itemHeight + itemRect.marginBottom;

    if (positionInView.top < itemBottom && positionInView.top > itemTop) {
      if (positionInView.left < itemRight) {
        return index;
      } else if (index !== l - 1) {
        last = index;
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

const create$8 = ({ root }) => {
  // need to set role to list as otherwise it won't be read as a list by VoiceOver
  attr(root.element, 'role', 'list');

  root.ref.lastItemSpanwDate = Date.now();
};

/**
 * Inserts a new item
 * @param root
 * @param action
 */
const addItemView = ({ root, action }) => {
  const { id, index, interactionMethod } = action;

  root.ref.addIndex = index;

  const now = Date.now();
  let spawnDate = now;
  let opacity = 1;

  if (interactionMethod !== InteractionMethod.NONE) {
    opacity = 0;
    const cooldown = root.query('GET_ITEM_INSERT_INTERVAL');
    const dist = now - root.ref.lastItemSpanwDate;
    spawnDate = dist < cooldown ? now + (cooldown - dist) : now;
  }

  root.ref.lastItemSpanwDate = spawnDate;

  root.appendChildView(
    root.createChildView(
      // view type
      item,

      // props
      {
        spawnDate,
        id,
        opacity,
        interactionMethod
      }
    ),
    index
  );
};

const moveItem = (item, x, y, vx = 0, vy = 1) => {
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
};

const introItemView = (item, x, y, vx, vy) => {
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
const removeItemView = ({ root, action }) => {
  const { id } = action;

  // get the view matching the given id
  const view = root.childViews.find(child => child.id === id);

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

/**
 * Setup action routes
 */
const route$2 = createRoute({
  DID_ADD_ITEM: addItemView,
  DID_REMOVE_ITEM: removeItemView
});

/**
 * Write to view
 * @param root
 * @param actions
 * @param props
 */
const write$5 = ({ root, props, actions, shouldOptimize }) => {
  // route actions
  route$2({ root, props, actions });

  const { dragCoordinates } = props;

  // get index
  const dragIndex = dragCoordinates
    ? getItemIndexByPosition(root, dragCoordinates)
    : null;

  // available space on horizontal axis
  const horizontalSpace = root.rect.element.width;

  // only draw children that have dimensions
  const visibleChildren = root.childViews.filter(
    child => child.rect.element.height
  );

  // sort based on current active items
  const children = root
    .query('GET_ACTIVE_ITEMS')
    .map(item => visibleChildren.find(child => child.id === item.id))
    .filter(item => item);

  // add index is used to reserve the dropped/added item index till the actual item is rendered
  const addIndex = root.ref.addIndex || null;

  // add index no longer needed till possibly next draw
  root.ref.addIndex = null;

  let dragIndexOffset = 0;
  let removeIndexOffset = 0;
  let addIndexOffset = 0;

  if (children.length === 0) return;

  const childRect = children[0].rect.element;
  const itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
  const itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;
  const itemWidth = childRect.width + itemHorizontalMargin;
  const itemHeight = childRect.height + itemVerticalMargin;
  const itemsPerRow = Math.round(horizontalSpace / itemWidth);

  // stack
  if (itemsPerRow === 1) {
    let offsetY = 0;
    let dragOffset = 0;

    children.forEach((child, index) => {
      if (dragIndex) {
        let dist = index - dragIndex;
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

      let itemHeight = child.rect.element.height + itemVerticalMargin;

      let visualHeight =
        itemHeight * (child.markedForRemoval ? child.opacity : 1);

      offsetY += visualHeight;
    });
  }
  // grid
  else {
    let prevX = 0;
    let prevY = 0;

    children.forEach((child, index) => {
      if (index === dragIndex) {
        dragIndexOffset = 1;
      }

      if (index === addIndex) {
        addIndexOffset += 1;
      }

      if (child.markedForRemoval && child.opacity < 0.5) {
        removeIndexOffset -= 1;
      }

      const visualIndex =
        index + addIndexOffset + dragIndexOffset + removeIndexOffset;

      const indexX = visualIndex % itemsPerRow;
      const indexY = Math.floor(visualIndex / itemsPerRow);

      const offsetX = indexX * itemWidth;
      const offsetY = indexY * itemHeight;

      const vectorX = Math.sign(offsetX - prevX);
      const vectorY = Math.sign(offsetY - prevY);

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
const filterSetItemActions = (child, actions) =>
  actions.filter(action => {
    // if action has an id, filter out actions that don't have this child id
    if (action.data && action.data.id) {
      return child.id === action.data.id;
    }

    // allow all other actions
    return true;
  });

const list = createView({
  create: create$8,
  write: write$5,
  tag: 'ul',
  name: 'list',
  didWriteView: ({ root }) => {
    root.childViews
      .filter(
        view => view.markedForRemoval && view.opacity === 0 && view.resting
      )
      .forEach(view => {
        view._destroy();
        root.removeChildView(view);
      });
  },
  filterFrameActionsForChild: filterSetItemActions,
  mixins: {
    apis: ['dragCoordinates']
  }
});

const create$9 = ({ root, props }) => {
  root.ref.list = root.appendChildView(root.createChildView(list));
  props.dragCoordinates = null;
  props.overflowing = false;
};

const storeDragCoordinates = ({ root, props, action }) => {
  if (!root.query('GET_ITEM_INSERT_LOCATION_FREEDOM')) return;
  props.dragCoordinates = {
    left: action.position.scopeLeft - root.ref.list.rect.element.left,
    top:
      action.position.scopeTop -
      (root.rect.outer.top +
        root.rect.element.marginTop +
        root.rect.element.scrollTop)
  };
};

const clearDragCoordinates = ({ props }) => {
  props.dragCoordinates = null;
};

const route$3 = createRoute({
  DID_DRAG: storeDragCoordinates,
  DID_END_DRAG: clearDragCoordinates
});

const write$6 = ({ root, props, actions }) => {
  // route actions
  route$3({ root, props, actions });

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
    const newHeight = Math.round(props.overflow);
    if (newHeight !== root.height) {
      props.overflowing = true;
      root.element.dataset.state = 'overflow';
      root.height = newHeight;
    }
  }
};

const listScroller = createView({
  create: create$9,
  write: write$6,
  name: 'list-scroller',
  mixins: {
    apis: ['overflow', 'dragCoordinates'],
    styles: ['height', 'translateY'],
    animations: {
      translateY: 'spring'
    }
  }
});

const attrToggle = (element, name, state, enabledValue = '') => {
  if (state) {
    attr(element, name, enabledValue);
  } else {
    element.removeAttribute(name);
  }
};

const resetFileInput = input => {
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
    const form = createElement$1('form');
    const parentNode = input.parentNode;
    const ref = input.nextSibling;
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

const create$a = ({ root, props }) => {
  // set id so can be referenced from outside labels
  root.element.id = `filepond--browser-${props.id}`;

  // set name of element (is removed when a value is set)
  attr(root.element, 'name', root.query('GET_NAME'));

  // we have to link this element to the status element
  attr(root.element, 'aria-controls', `filepond--assistant-${props.id}`);

  // set label, we use labelled by as otherwise the screenreader does not read the "browse" text in the label (as it has tabindex: 0)
  attr(root.element, 'aria-labelledby', `filepond--drop-label-${props.id}`);

  // handle changes to the input field
  root.ref.handleChange = e => {
    if (!root.element.value) {
      return;
    }

    // extract files
    const files = Array.from(root.element.files);

    // we add a little delay so the OS file select window can move out of the way before we add our file
    setTimeout(() => {
      // load files
      props.onload(files);

      // reset input, it's just for exposing a method to drop files, should not retain any state
      resetFileInput(root.element);
    }, 250);
  };
  root.element.addEventListener('change', root.ref.handleChange);
};

const setAcceptedFileTypes = ({ root, action }) => {
  attrToggle(
    root.element,
    'accept',
    !!action.value,
    action.value ? action.value.join(',') : ''
  );
};

const toggleAllowMultiple = ({ root, action }) => {
  attrToggle(root.element, 'multiple', action.value);
};

const toggleDisabled = ({ root, action }) => {
  const isDisabled = root.query('GET_DISABLED');
  const doesAllowBrowse = root.query('GET_ALLOW_BROWSE');
  const disableField = isDisabled || !doesAllowBrowse;
  attrToggle(root.element, 'disabled', disableField);
};

const toggleRequired = ({ root, action }) => {
  // want to remove required, always possible
  if (!action.value) {
    attrToggle(root.element, 'required', false);
  }
  // if want to make required, only possible when zero items
  else if (root.query('GET_TOTAL_ITEMS') === 0) {
    attrToggle(root.element, 'required', true);
  }
};

const setCaptureMethod = ({ root, action }) => {
  attrToggle(
    root.element,
    'capture',
    !!action.value,
    action.value === true ? '' : action.value
  );
};

const updateRequiredStatus = ({ root }) => {
  const { element } = root;
  // always remove the required attribute when more than zero items
  if (root.query('GET_TOTAL_ITEMS') > 0) {
    attrToggle(element, 'required', false);
    attrToggle(element, 'name', false);
  } else {
    // add name attribute
    attrToggle(element, 'name', true, root.query('GET_NAME'));

    // remove any validation messages
    const shouldCheckValidity = root.query('GET_CHECK_VALIDITY');
    if (shouldCheckValidity) {
      element.setCustomValidity('');
    }

    // we only add required if the field has been deemed required
    if (root.query('GET_REQUIRED')) {
      attrToggle(element, 'required', true);
    }
  }
};

const updateFieldValidityStatus = ({ root }) => {
  const shouldCheckValidity = root.query('GET_CHECK_VALIDITY');
  if (!shouldCheckValidity) return;
  root.element.setCustomValidity(root.query('GET_LABEL_INVALID_FIELD'));
};

const browser = createView({
  tag: 'input',
  name: 'browser',
  ignoreRect: true,
  ignoreRectUpdate: true,
  attributes: {
    type: 'file'
  },
  create: create$a,
  destroy: ({ root }) => {
    root.element.removeEventListener('change', root.ref.handleChange);
  },
  write: createRoute({
    DID_LOAD_ITEM: updateRequiredStatus,
    DID_REMOVE_ITEM: updateRequiredStatus,
    DID_THROW_ITEM_INVALID: updateFieldValidityStatus,

    DID_SET_DISABLED: toggleDisabled,
    DID_SET_ALLOW_BROWSE: toggleDisabled,
    DID_SET_ALLOW_MULTIPLE: toggleAllowMultiple,
    DID_SET_ACCEPTED_FILE_TYPES: setAcceptedFileTypes,
    DID_SET_CAPTURE_METHOD: setCaptureMethod,
    DID_SET_REQUIRED: toggleRequired
  })
});

const Key = {
  ENTER: 13,
  SPACE: 32
};

const create$b = ({ root, props }) => {
  // create the label and link it to the file browser
  const label = createElement$1('label');
  attr(label, 'for', `filepond--browser-${props.id}`);

  // use for labeling file input (aria-labelledby on file input)
  attr(label, 'id', `filepond--drop-label-${props.id}`);

  // hide the label for screenreaders, the input element will read the contents of the label when it's focussed. If we don't set aria-hidden the screenreader will also navigate the contents of the label separately from the input.
  attr(label, 'aria-hidden', 'true');

  // handle keys
  label.addEventListener('keydown', e => {
    const isActivationKey = e.keyCode === Key.ENTER || e.keyCode === Key.SPACE;
    if (!isActivationKey) return;
    // stops from triggering the element a second time
    e.preventDefault();

    // click link (will then in turn activate file input)
    root.ref.label.click();
  });

  root.element.addEventListener('click', e => {
    const isLabelClick = e.target === label || label.contains(e.target);

    // don't want to click twice
    if (isLabelClick) return;

    // click link (will then in turn activate file input)
    root.ref.label.click();
  });

  // update
  updateLabelValue(label, props.caption);

  // add!
  root.appendChild(label);
  root.ref.label = label;
};

const updateLabelValue = (label, value) => {
  label.innerHTML = value;
  const clickable = label.querySelector('.filepond--label-action');
  if (clickable) {
    attr(clickable, 'tabindex', '0');
  }
  return value;
};

const dropLabel = createView({
  name: 'drop-label',
  ignoreRect: true,
  create: create$b,
  write: createRoute({
    DID_SET_LABEL_IDLE: ({ root, action }) => {
      updateLabelValue(root.ref.label, action.value);
    }
  }),
  mixins: {
    styles: ['opacity', 'translateX', 'translateY'],
    animations: {
      opacity: { type: 'tween', duration: 150 },
      translateX: 'spring',
      translateY: 'spring'
    }
  }
});

const blob = createView({
  name: 'drip-blob',
  ignoreRect: true,
  mixins: {
    styles: ['translateX', 'translateY', 'scaleX', 'scaleY', 'opacity'],
    animations: {
      scaleX: 'spring',
      scaleY: 'spring',
      translateX: 'spring',
      translateY: 'spring',
      opacity: { type: 'tween', duration: 250 }
    }
  }
});

const addBlob = ({ root }) => {
  const centerX = root.rect.element.width * 0.5;
  const centerY = root.rect.element.height * 0.5;

  root.ref.blob = root.appendChildView(
    root.createChildView(blob, {
      opacity: 0,
      scaleX: 2.5,
      scaleY: 2.5,
      translateX: centerX,
      translateY: centerY
    })
  );
};

const moveBlob = ({ root, action }) => {
  if (!root.ref.blob) {
    addBlob({ root });
    return;
  }

  root.ref.blob.translateX = action.position.scopeLeft;
  root.ref.blob.translateY = action.position.scopeTop;
  root.ref.blob.scaleX = 1;
  root.ref.blob.scaleY = 1;
  root.ref.blob.opacity = 1;
};

const hideBlob = ({ root }) => {
  if (!root.ref.blob) {
    return;
  }
  root.ref.blob.opacity = 0;
};

const explodeBlob = ({ root }) => {
  if (!root.ref.blob) {
    return;
  }
  root.ref.blob.scaleX = 2.5;
  root.ref.blob.scaleY = 2.5;
  root.ref.blob.opacity = 0;
};

const write$7 = ({ root, props, actions }) => {
  route$4({ root, props, actions });

  const { blob } = root.ref;

  if (actions.length === 0 && blob && blob.opacity === 0) {
    root.removeChildView(blob);
    root.ref.blob = null;
  }
};

const route$4 = createRoute({
  DID_DRAG: moveBlob,
  DID_DROP: explodeBlob,
  DID_END_DRAG: hideBlob
});

const drip = createView({
  ignoreRect: true,
  ignoreRectUpdate: true,
  name: 'drip',
  write: write$7
});

const getRootNode = element =>
  'getRootNode' in element ? element.getRootNode() : document;

const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
const text$1 = ['css', 'csv', 'html', 'txt'];
const apps = ['rtf', 'pdf', 'json'];
const map = {
  zip: 'zip|compressed',
  epub: 'application/epub+zip'
};

const guesstimateMimeType = (extension = '') => {
  extension = extension.toLowerCase();
  if (images.includes(extension)) {
    return (
      'image/' +
      (extension === 'jpg'
        ? 'jpeg'
        : extension === 'svg'
        ? 'svg+xml'
        : extension)
    );
  }
  if (text$1.includes(extension)) {
    return 'text/' + extension;
  }
  return map[extension] || null;
};

const requestDataTransferItems = dataTransfer =>
  new Promise((resolve, reject) => {
    // try to get links from transfer, if found, we'll exit immidiately
    // as only one link can be dragged at once
    const links = getLinks(dataTransfer);
    if (links.length) {
      resolve(links);
      return;
    }

    // try to get files from the transfer
    getFiles(dataTransfer).then(resolve);
  });

/**
 * Extracts files from a DataTransfer object
 */
const getFiles = dataTransfer =>
  new Promise((resolve, reject) => {
    // get the transfer items as promises
    const promisedFiles = (dataTransfer.items
      ? Array.from(dataTransfer.items)
      : []
    )

      // only keep file system items (files and directories)
      .filter(item => isFileSystemItem(item))

      // map each item to promise
      .map(item => getFilesFromItem(item));

    // if is empty, see if we can extract some info from the files property as a fallback
    if (!promisedFiles.length) {
      // TODO: test for directories (should not be allowed)
      // Use FileReader, problem is that the files property gets lost in the process

      resolve(dataTransfer.files ? Array.from(dataTransfer.files) : []);
      return;
    }

    // done!
    Promise.all(promisedFiles).then(returendFileGroups => {
      // flatten groups
      const files = [];
      returendFileGroups.forEach(group => {
        files.push.apply(files, group);
      });

      // done (filter out empty files)!
      resolve(files.filter(file => file));
    });
  });

const isFileSystemItem = item => {
  if (isEntry(item)) {
    const entry = getAsEntry(item);
    if (entry) {
      return entry.isFile || entry.isDirectory;
    }
  }
  return item.kind === 'file';
};

const getFilesFromItem = item =>
  new Promise((resolve, reject) => {
    if (isDirectoryEntry(item)) {
      getFilesInDirectory(getAsEntry(item)).then(resolve);
      return;
    }

    resolve([item.getAsFile()]);
  });

const getFilesInDirectory = entry =>
  new Promise((resolve, reject) => {
    const files = [];

    // the total entries to read
    let totalFilesFound = 0;

    // the recursive function
    const readEntries = dirEntry => {
      const directoryReader = dirEntry.createReader();
      directoryReader.readEntries(entries => {
        entries.forEach(entry => {
          // recursively read more directories
          if (entry.isDirectory) {
            readEntries(entry);
          } else {
            // read as file
            totalFilesFound++;
            entry.file(file => {
              files.push(correctMissingFileType(file));

              if (totalFilesFound === files.length) {
                resolve(files);
              }
            });
          }
        });
      });
    };

    // go!
    readEntries(entry);
  });

const correctMissingFileType = file => {
  if (file.type.length) return file;
  const date = file.lastModifiedDate;
  const name = file.name;
  file = file.slice(
    0,
    file.size,
    guesstimateMimeType(getExtensionFromFilename(file.name))
  );
  file.name = name;
  file.lastModifiedDate = date;
  return file;
};

const isDirectoryEntry = item =>
  isEntry(item) && (getAsEntry(item) || {}).isDirectory;

const isEntry = item => 'webkitGetAsEntry' in item;

const getAsEntry = item => item.webkitGetAsEntry();

/**
 * Extracts links from a DataTransfer object
 */
const getLinks = dataTransfer => {
  let links = [];
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

const getLinksFromTransferURLData = dataTransfer => {
  let data = dataTransfer.getData('url');
  if (typeof data === 'string' && data.length) {
    return [data];
  }
  return [];
};

const getLinksFromTransferMetaData = dataTransfer => {
  let data = dataTransfer.getData('text/html');
  if (typeof data === 'string' && data.length) {
    const matches = data.match(/src\s*=\s*"(.+?)"/);
    if (matches) {
      return [matches[1]];
    }
  }
  return [];
};

const dragNDropObservers = [];

const eventPosition = e => ({
  pageLeft: e.pageX,
  pageTop: e.pageY,
  scopeLeft: e.offsetX || e.layerX,
  scopeTop: e.offsetY || e.layerY
});

const createDragNDropClient = (element, scopeToObserve, filterElement) => {
  const observer = getDragNDropObserver(scopeToObserve);

  const client = {
    element,
    filterElement,
    state: null,
    ondrop: () => {},
    onenter: () => {},
    ondrag: () => {},
    onexit: () => {},
    onload: () => {},
    allowdrop: () => {}
  };

  client.destroy = observer.addListener(client);

  return client;
};

const getDragNDropObserver = element => {
  // see if already exists, if so, return
  const observer = dragNDropObservers.find(item => item.element === element);
  if (observer) {
    return observer;
  }

  // create new observer, does not yet exist for this element
  const newObserver = createDragNDropObserver(element);
  dragNDropObservers.push(newObserver);
  return newObserver;
};

const createDragNDropObserver = element => {
  const clients = [];

  const routes = {
    dragenter,
    dragover,
    dragleave,
    drop
  };

  const handlers = {};

  forin(routes, (event, createHandler) => {
    handlers[event] = createHandler(element, clients);
    element.addEventListener(event, handlers[event], false);
  });

  const observer = {
    element,
    addListener: client => {
      // add as client
      clients.push(client);

      // return removeListener function
      return () => {
        // remove client
        clients.splice(clients.indexOf(client), 1);

        // if no more clients, clean up observer
        if (clients.length === 0) {
          dragNDropObservers.splice(dragNDropObservers.indexOf(observer), 1);

          forin(routes, event => {
            element.removeEventListener(event, handlers[event], false);
          });
        }
      };
    }
  };

  return observer;
};

const elementFromPoint = (root, point) => {
  if (!('elementFromPoint' in root)) {
    root = document;
  }
  return root.elementFromPoint(point.x, point.y);
};

const isEventTarget = (e, target) => {
  // get root
  const root = getRootNode(target);

  // get element at position
  // if root is not actual shadow DOM and does not have elementFromPoint method, use the one on document
  const elementAtPosition = elementFromPoint(root, {
    x: e.pageX - window.pageXOffset,
    y: e.pageY - window.pageYOffset
  });

  // test if target is the element or if one of its children is
  return elementAtPosition === target || target.contains(elementAtPosition);
};

let initialTarget = null;

const setDropEffect = (dataTransfer, effect) => {
  // is in try catch as IE11 will throw error if not
  try {
    dataTransfer.dropEffect = effect;
  } catch (e) {}
};

const dragenter = (root, clients) => e => {
  e.preventDefault();

  initialTarget = e.target;

  clients.forEach(client => {
    const { element, onenter } = client;

    if (isEventTarget(e, element)) {
      client.state = 'enter';

      // fire enter event
      onenter(eventPosition(e));
    }
  });
};

const dragover = (root, clients) => e => {
  e.preventDefault();

  const dataTransfer = e.dataTransfer;

  requestDataTransferItems(dataTransfer).then(items => {
    let overDropTarget = false;

    clients.some(client => {
      const {
        filterElement,
        element,
        onenter,
        onexit,
        ondrag,
        allowdrop
      } = client;

      // by default we can drop
      setDropEffect(dataTransfer, 'copy');

      // allow transfer of these items
      const allowsTransfer = allowdrop(items);

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

const drop = (root, clients) => e => {
  e.preventDefault();

  const dataTransfer = e.dataTransfer;

  requestDataTransferItems(dataTransfer).then(items => {
    clients.forEach(client => {
      const { filterElement, element, ondrop, onexit, allowdrop } = client;

      client.state = null;

      const allowsTransfer = allowdrop(items);

      // no transfer for this client
      if (!allowsTransfer) {
        onexit(eventPosition(e));
        return;
      }

      // if we're filtering on element we need to be over the element to drop
      if (filterElement && !isEventTarget(e, element)) {
        return;
      }

      ondrop(eventPosition(e), items);
    });
  });
};

const dragleave = (root, clients) => e => {
  if (initialTarget !== e.target) {
    return;
  }

  clients.forEach(client => {
    const { onexit } = client;

    client.state = null;

    onexit(eventPosition(e));
  });
};

const createHopper = (scope, validateItems, options) => {
  // is now hopper scope
  scope.classList.add('filepond--hopper');

  // shortcuts
  const {
    catchesDropsOnPage,
    requiresDropOnElement,
    filterItems = items => items
  } = options;

  // create a dnd client
  const client = createDragNDropClient(
    scope,
    catchesDropsOnPage ? document.documentElement : scope,
    requiresDropOnElement
  );

  // current client state
  let lastState = '';
  let currentState = '';

  // determines if a file may be dropped
  client.allowdrop = items => {
    // TODO: if we can, throw error to indicate the items cannot by dropped

    return validateItems(filterItems(items));
  };

  client.ondrop = (position, items) => {
    const filteredItems = filterItems(items);

    if (!validateItems(filteredItems)) {
      api.ondragend(position);
      return;
    }

    currentState = 'drag-drop';

    api.onload(filteredItems, position);
  };

  client.ondrag = position => {
    api.ondrag(position);
  };

  client.onenter = position => {
    currentState = 'drag-over';

    api.ondragstart(position);
  };

  client.onexit = position => {
    currentState = 'drag-exit';

    api.ondragend(position);
  };

  const api = {
    updateHopperState: () => {
      if (lastState !== currentState) {
        scope.dataset.hopperState = currentState;
        lastState = currentState;
      }
    },
    onload: () => {},
    ondragstart: () => {},
    ondrag: () => {},
    ondragend: () => {},
    destroy: () => {
      // destroy client
      client.destroy();
    }
  };

  return api;
};

let listening = false;
const listeners$1 = [];

const handlePaste = e => {
  requestDataTransferItems(e.clipboardData).then(files => {
    // no files received
    if (!files.length) {
      return;
    }

    // notify listeners of received files
    listeners$1.forEach(listener => listener(files));
  });
};

const listen = cb => {
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

const unlisten = listener => {
  arrayRemove(listeners$1, listeners$1.indexOf(listener));

  // clean up
  if (listeners$1.length === 0) {
    document.removeEventListener('paste', handlePaste);
    listening = false;
  }
};

const createPaster = () => {
  const cb = files => {
    api.onload(files);
  };

  const api = {
    destroy: () => {
      unlisten(cb);
    },
    onload: () => {}
  };

  listen(cb);

  return api;
};

/**
 * Creates the file view
 */
const create$c = ({ root, props }) => {
  root.element.id = `filepond--assistant-${props.id}`;
  attr(root.element, 'role', 'status');
  attr(root.element, 'aria-live', 'polite');
  attr(root.element, 'aria-relevant', 'additions');
};

let addFilesNotificationTimeout = null;
let notificationClearTimeout = null;

const filenames = [];

const assist = (root, message) => {
  root.element.textContent = message;
};

const clear$1 = root => {
  root.element.textContent = '';
};

const listModified = (root, filename, label) => {
  const total = root.query('GET_TOTAL_ITEMS');
  assist(
    root,
    `${label} ${filename}, ${total} ${
      total === 1
        ? root.query('GET_LABEL_FILE_COUNT_SINGULAR')
        : root.query('GET_LABEL_FILE_COUNT_PLURAL')
    }`
  );

  // clear group after set amount of time so the status is not read twice
  clearTimeout(notificationClearTimeout);
  notificationClearTimeout = setTimeout(() => {
    clear$1(root);
  }, 1500);
};

const isUsingFilePond = root =>
  root.element.parentNode.contains(document.activeElement);

const itemAdded = ({ root, action }) => {
  if (!isUsingFilePond(root)) {
    return;
  }

  root.element.textContent = '';
  const item = root.query('GET_ITEM', action.id);
  filenames.push(item.filename);

  clearTimeout(addFilesNotificationTimeout);
  addFilesNotificationTimeout = setTimeout(() => {
    listModified(
      root,
      filenames.join(', '),
      root.query('GET_LABEL_FILE_ADDED')
    );
    filenames.length = 0;
  }, 750);
};

const itemRemoved = ({ root, action }) => {
  if (!isUsingFilePond(root)) {
    return;
  }

  const item = action.item;
  listModified(root, item.filename, root.query('GET_LABEL_FILE_REMOVED'));
};

const itemProcessed = ({ root, action }) => {
  // will also notify the user when FilePond is not being used, as the user might be occupied with other activities while uploading a file

  const item = root.query('GET_ITEM', action.id);
  const filename = item.filename;
  const label = root.query('GET_LABEL_FILE_PROCESSING_COMPLETE');

  assist(root, `${filename} ${label}`);
};

const itemProcessedUndo = ({ root, action }) => {
  const item = root.query('GET_ITEM', action.id);
  const filename = item.filename;
  const label = root.query('GET_LABEL_FILE_PROCESSING_ABORTED');

  assist(root, `${filename} ${label}`);
};

const itemError = ({ root, action }) => {
  const item = root.query('GET_ITEM', action.id);
  const filename = item.filename;

  // will also notify the user when FilePond is not being used, as the user might be occupied with other activities while uploading a file

  assist(root, `${action.status.main} ${filename} ${action.status.sub}`);
};

const assistant = createView({
  create: create$c,
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
    DID_THROW_ITEM_PROCESSING_ERROR: itemError
  }),
  tag: 'span',
  name: 'assistant'
});

const toCamels = (string, separator = '-') =>
  string.replace(new RegExp(`${separator}.`, 'g'), sub =>
    sub.charAt(1).toUpperCase()
  );

const debounce = (func, interval = 16, immidiateOnly = true) => {
  let last = Date.now();
  let timeout = null;

  return (...args) => {
    clearTimeout(timeout);

    const dist = Date.now() - last;

    const fn = () => {
      last = Date.now();
      func(...args);
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

const MAX_FILES_LIMIT = 1000000;

const create$d = ({ root, props }) => {
  // Add id
  const id = root.query('GET_ID');
  if (id) {
    root.element.id = id;
  }

  // Add className
  const className = root.query('GET_CLASS_NAME');
  if (className) {
    className.split(' ').forEach(name => {
      root.element.classList.add(name);
    });
  }

  // Field label
  root.ref.label = root.appendChildView(
    root.createChildView(dropLabel, {
      ...props,
      translateY: null,
      caption: root.query('GET_LABEL_IDLE')
    })
  );

  // List of items
  root.ref.list = root.appendChildView(
    root.createChildView(listScroller, { translateY: null })
  );

  // Background panel
  root.ref.panel = root.appendChildView(
    root.createChildView(panel, { name: 'panel-root' })
  );

  // Assistant notifies assistive tech when content changes
  root.ref.assistant = root.appendChildView(
    root.createChildView(assistant, { ...props })
  );

  // Measure (tests if fixed height was set)
  // DOCTYPE needs to be set for this to work
  root.ref.measure = createElement$1('div');
  root.ref.measure.style.height = '100%';
  root.element.appendChild(root.ref.measure);

  // information on the root height or fixed height status
  root.ref.bounds = null;

  // apply initial style properties
  root
    .query('GET_STYLES')
    .filter(style => !isEmpty(style.value))
    .map(({ name, value }) => {
      root.element.dataset[name] = value;
    });

  // determine if width changed
  root.ref.widthPrevious = null;
  root.ref.widthUpdated = debounce(() => {
    root.ref.updateHistory = [];
    root.dispatch('DID_RESIZE_ROOT');
  }, 250);

  // history of updates
  root.ref.previousAspectRatio = null;
  root.ref.updateHistory = [];
};

const write$8 = ({ root, props, actions }) => {
  // route actions
  route$5({ root, props, actions });

  // apply style properties
  actions
    .filter(action => /^DID_SET_STYLE_/.test(action.type))
    .filter(action => !isEmpty(action.data.value))
    .map(({ type, data }) => {
      const name = toCamels(type.substr(8).toLowerCase(), '_');
      root.element.dataset[name] = data.value;
      root.invalidateLayout();
    });

  if (root.rect.element.hidden) return;

  if (root.rect.element.width !== root.ref.widthPrevious) {
    root.ref.widthPrevious = root.rect.element.width;
    root.ref.widthUpdated();
  }

  // get box bounds, we do this only once
  let bounds = root.ref.bounds;
  if (!bounds) {
    bounds = root.ref.bounds = calculateRootBoundingBoxHeight(root);

    // destroy measure element
    root.element.removeChild(root.ref.measure);
    root.ref.measure = null;
  }

  // get quick references to various high level parts of the upload tool
  const { hopper, label, list, panel } = root.ref;

  // sets correct state to hopper scope
  if (hopper) {
    hopper.updateHopperState();
  }

  // bool to indicate if we're full or not
  const aspectRatio = root.query('GET_PANEL_ASPECT_RATIO');
  const isMultiItem = root.query('GET_ALLOW_MULTIPLE');
  const totalItems = root.query('GET_TOTAL_ITEMS');
  const maxItems = isMultiItem
    ? root.query('GET_MAX_FILES') || MAX_FILES_LIMIT
    : 1;
  const atMaxCapacity = totalItems === maxItems;

  // action used to add item
  const addAction = actions.find(action => action.type === 'DID_ADD_ITEM');

  // if reached max capacity and we've just reached it
  if (atMaxCapacity && addAction) {
    // get interaction type
    const interactionMethod = addAction.data.interactionMethod;

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

  const listItemMargin = calculateListItemMargin(root);

  const listHeight = calculateListHeight(root);

  const labelHeight = label.rect.element.height;
  const currentLabelHeight = !isMultiItem || atMaxCapacity ? 0 : labelHeight;

  const listMarginTop = atMaxCapacity ? list.rect.element.marginTop : 0;
  const listMarginBottom =
    totalItems === 0 ? 0 : list.rect.element.marginBottom;

  const visualHeight =
    currentLabelHeight + listMarginTop + listHeight.visual + listMarginBottom;
  const boundsHeight =
    currentLabelHeight + listMarginTop + listHeight.bounds + listMarginBottom;

  // link list to label bottom position
  list.translateY =
    Math.max(0, currentLabelHeight - list.rect.element.marginTop) -
    listItemMargin.top;

  if (aspectRatio) {
    // fixed aspect ratio

    // calculate height based on width
    const width = root.rect.element.width;
    const height = width * aspectRatio;

    // clear history if aspect ratio has changed
    if (aspectRatio !== root.ref.previousAspectRatio) {
      root.ref.previousAspectRatio = aspectRatio;
      root.ref.updateHistory = [];
    }

    // remember this width
    const history = root.ref.updateHistory;
    history.push(width);

    const MAX_BOUNCES = 2;
    if (history.length > MAX_BOUNCES * 2) {
      const l = history.length;
      const bottom = l - 10;
      let bounces = 0;
      for (let i = l; i >= bottom; i--) {
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
    const listAvailableHeight =
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
    const listAvailableHeight =
      // the height of the panel minus the label height
      bounds.fixedHeight -
      currentLabelHeight -
      // the room we leave open between the end of the list and the panel bottom
      (listMarginBottom - listItemMargin.bottom) -
      // if we're full we need to leave some room between the top of the panel and the list
      (atMaxCapacity ? listMarginTop : 0);

    // set list height
    if (listHeight.visual > listAvailableHeight) {
      list.overflow = listAvailableHeight;
    } else {
      list.overflow = null;
    }

    // no need to set container bounds as these are handles by CSS fixed height
  } else if (bounds.cappedHeight) {
    // max-height

    // not a fixed height panel
    const isCappedHeight = visualHeight >= bounds.cappedHeight;
    const panelHeight = Math.min(bounds.cappedHeight, visualHeight);
    panel.scalable = true;
    panel.height = isCappedHeight
      ? panelHeight
      : panelHeight - listItemMargin.top - listItemMargin.bottom;

    // available height for list
    const listAvailableHeight =
      // the height of the panel minus the label height
      panelHeight -
      currentLabelHeight -
      // the room we leave open between the end of the list and the panel bottom
      (listMarginBottom - listItemMargin.bottom) -
      // if we're full we need to leave some room between the top of the panel and the list
      (atMaxCapacity ? listMarginTop : 0);

    // set list height (if is overflowing)
    if (
      visualHeight > bounds.cappedHeight &&
      listHeight.visual > listAvailableHeight
    ) {
      list.overflow = listAvailableHeight;
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
    const itemMargin =
      totalItems > 0 ? listItemMargin.top + listItemMargin.bottom : 0;
    panel.scalable = true;
    panel.height = Math.max(labelHeight, visualHeight - itemMargin);

    // set container bounds (so pushes siblings downwards)
    root.height = Math.max(labelHeight, boundsHeight - itemMargin);
  }
};

const calculateListItemMargin = root => {
  const item = root.ref.list.childViews[0].childViews[0];
  return item
    ? {
        top: item.rect.element.marginTop,
        bottom: item.rect.element.marginBottom
      }
    : {
        top: 0,
        bottom: 0
      };
};

const calculateListHeight = root => {
  let visual = 0;
  let bounds = 0;

  // get file list reference
  const scrollList = root.ref.list;
  const itemList = scrollList.childViews[0];
  const children = itemList.childViews;

  // no children, done!
  if (children.length === 0) return { visual, bounds };

  const horizontalSpace = itemList.rect.element.width;
  const dragIndex = getItemIndexByPosition(
    itemList,
    scrollList.dragCoordinates
  );

  const childRect = children[0].rect.element;

  const itemVerticalMargin = childRect.marginTop + childRect.marginBottom;
  const itemHorizontalMargin = childRect.marginLeft + childRect.marginRight;

  const itemWidth = childRect.width + itemHorizontalMargin;
  const itemHeight = childRect.height + itemVerticalMargin;

  const newItem = typeof dragIndex !== 'undefined' && dragIndex >= 0 ? 1 : 0;
  const removedItem = children.find(
    child => child.markedForRemoval && child.opacity < 0.45
  )
    ? -1
    : 0;
  const verticalItemCount = children.length + newItem + removedItem;
  const itemsPerRow = Math.round(horizontalSpace / itemWidth);

  // stack
  if (itemsPerRow === 1) {
    children.forEach(item => {
      const height = item.rect.element.height + itemVerticalMargin;
      bounds += height;
      visual += height * item.opacity;
    });
  }
  // grid
  else {
    bounds = Math.ceil(verticalItemCount / itemsPerRow) * itemHeight;
    visual = bounds;
  }

  return { visual, bounds };
};

const calculateRootBoundingBoxHeight = root => {
  const height = root.ref.measureHeight || null;
  const cappedHeight = parseInt(root.style.maxHeight, 10) || null;
  const fixedHeight = height === 0 ? null : height;

  return {
    cappedHeight,
    fixedHeight
  };
};

const exceedsMaxFiles = (root, items) => {
  const allowReplace = root.query('GET_ALLOW_REPLACE');
  const allowMultiple = root.query('GET_ALLOW_MULTIPLE');
  const totalItems = root.query('GET_TOTAL_ITEMS');
  let maxItems = root.query('GET_MAX_FILES');

  // total amount of items being dragged
  const totalBrowseItems = items.length;

  // if does not allow multiple items and dragging more than one item
  if (!allowMultiple && totalBrowseItems > 1) {
    return true;
  }

  // limit max items to one if not allowed to drop multiple items
  maxItems = allowMultiple ? maxItems : allowReplace ? maxItems : 1;

  // no more room?
  const hasMaxItems = isInt(maxItems);
  if (hasMaxItems && totalItems + totalBrowseItems > maxItems) {
    root.dispatch('DID_THROW_MAX_FILES', {
      source: items,
      error: createResponse('warning', 0, 'Max files')
    });
    return true;
  }

  return false;
};

const getDragIndex = (list, position) => {
  const itemList = list.childViews[0];
  return getItemIndexByPosition(itemList, {
    left: position.scopeLeft - itemList.rect.element.left,
    top:
      position.scopeTop -
      (list.rect.outer.top +
        list.rect.element.marginTop +
        list.rect.element.scrollTop)
  });
};

/**
 * Enable or disable file drop functionality
 */
const toggleDrop = root => {
  const isAllowed = root.query('GET_ALLOW_DROP');
  const isDisabled = root.query('GET_DISABLED');
  const enabled = isAllowed && !isDisabled;
  if (enabled && !root.ref.hopper) {
    const hopper = createHopper(
      root.element,
      items => {
        // these files don't fit so stop here
        if (exceedsMaxFiles(root, items)) return false;

        // allow quick validation of dropped items
        const beforeDropFile =
          root.query('GET_BEFORE_DROP_FILE') || (() => true);

        // all items should be validated by all filters as valid
        const dropValidation = root.query('GET_DROP_VALIDATION');
        return dropValidation
          ? items.every(
              item =>
                applyFilters('ALLOW_HOPPER_ITEM', item, {
                  query: root.query
                }).every(result => result === true) && beforeDropFile(item)
            )
          : true;
      },
      {
        filterItems: items => {
          const ignoredFiles = root.query('GET_IGNORED_FILES');
          return items.filter(item => {
            if (isFile(item)) {
              return !ignoredFiles.includes(item.name.toLowerCase());
            }
            return true;
          });
        },
        catchesDropsOnPage: root.query('GET_DROP_ON_PAGE'),
        requiresDropOnElement: root.query('GET_DROP_ON_ELEMENT')
      }
    );

    hopper.onload = (items, position) => {
      root.dispatch('ADD_ITEMS', {
        items,
        index: getDragIndex(root.ref.list, position),
        interactionMethod: InteractionMethod.DROP
      });

      root.dispatch('DID_DROP', { position });

      root.dispatch('DID_END_DRAG', { position });
    };

    hopper.ondragstart = position => {
      root.dispatch('DID_START_DRAG', { position });
    };

    hopper.ondrag = debounce(position => {
      root.dispatch('DID_DRAG', { position });
    });

    hopper.ondragend = position => {
      root.dispatch('DID_END_DRAG', { position });
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
const toggleBrowse = (root, props) => {
  const isAllowed = root.query('GET_ALLOW_BROWSE');
  const isDisabled = root.query('GET_DISABLED');
  const enabled = isAllowed && !isDisabled;
  if (enabled && !root.ref.browser) {
    root.ref.browser = root.appendChildView(
      root.createChildView(browser, {
        ...props,
        onload: items => {
          // these files don't fit so stop here
          if (exceedsMaxFiles(root, items)) return false;

          // add items!
          root.dispatch('ADD_ITEMS', {
            items,
            index: -1,
            interactionMethod: InteractionMethod.BROWSE
          });
        }
      }),
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
const togglePaste = root => {
  const isAllowed = root.query('GET_ALLOW_PASTE');
  const isDisabled = root.query('GET_DISABLED');
  const enabled = isAllowed && !isDisabled;
  if (enabled && !root.ref.paster) {
    root.ref.paster = createPaster();
    root.ref.paster.onload = items => {
      root.dispatch('ADD_ITEMS', {
        items,
        index: -1,
        interactionMethod: InteractionMethod.PASTE
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
const route$5 = createRoute({
  DID_SET_ALLOW_BROWSE: ({ root, props }) => {
    toggleBrowse(root, props);
  },
  DID_SET_ALLOW_DROP: ({ root }) => {
    toggleDrop(root);
  },
  DID_SET_ALLOW_PASTE: ({ root }) => {
    togglePaste(root);
  },
  DID_SET_DISABLED: ({ root, props }) => {
    toggleDrop(root);
    togglePaste(root);
    toggleBrowse(root, props);
    const isDisabled = root.query('GET_DISABLED');
    if (isDisabled) {
      root.element.dataset.disabled = 'disabled';
    } else {
      delete root.element.dataset.disabled;
    }
  }
});

const root = createView({
  name: 'root',
  read: ({ root }) => {
    if (root.ref.measure) {
      root.ref.measureHeight = root.ref.measure.offsetHeight;
    }
  },
  create: create$d,
  write: write$8,
  destroy: ({ root }) => {
    if (root.ref.paster) {
      root.ref.paster.destroy();
    }
    if (root.ref.hopper) {
      root.ref.hopper.destroy();
    }
  },
  mixins: {
    styles: ['height']
  }
});

// creates the app
const createApp = (initialOptions = {}) => {
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
  };
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

        if (
          !isResizingHorizontally &&
          currentWindowWidth !== initialWindowWidth
        ) {
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
      const item = data.item ? data.item : store.query('GET_ITEM', data.id);
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

    return event;
  };

  const eventRoutes = {
    DID_DESTROY: createEvent('destroy'),

    DID_INIT: createEvent('init'),

    DID_THROW_MAX_FILES: createEvent('warning'),

    DID_START_ITEM_LOAD: createEvent('addfilestart'),
    DID_UPDATE_ITEM_LOAD_PROGRESS: createEvent('addfileprogress'),
    DID_LOAD_ITEM: createEvent('addfile'),

    DID_THROW_ITEM_INVALID: [createEvent('error'), createEvent('addfile')],

    DID_THROW_ITEM_LOAD_ERROR: [createEvent('error'), createEvent('addfile')],

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

    DID_ACTIVATE_ITEM: createEvent('activatefile')
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
    if (!actions.length) {
      return;
    }

    actions.forEach(action => {
      if (!eventRoutes[action.type]) {
        return;
      }
      const routes = eventRoutes[action.type];
      (Array.isArray(routes) ? routes : [routes]).forEach(route => {
        setTimeout(() => {
          exposeEvent(route(action.data));
        }, 0);
      });
    });
  };

  //
  // PUBLIC API -------------------------------------------------------------------------------------
  //
  const setOptions = options => store.dispatch('SET_OPTIONS', { options });

  const getFile = query => store.query('GET_ACTIVE_ITEM', query);

  const addFile = (source, options = {}) =>
    new Promise((resolve, reject) => {
      addFiles([{ source, options }], { index: options.index })
        .then(items => resolve(items && items[0]))
        .catch(reject);
    });

  const removeFile = query => {
    // request item removal
    store.dispatch('REMOVE_ITEM', { query });

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
      } else {
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

  const processFile = query =>
    new Promise((resolve, reject) => {
      store.dispatch('REQUEST_ITEM_PROCESSING', {
        query,
        success: item => {
          resolve(item);
        },
        failure: error => {
          reject(error);
        }
      });
    });

  const processFiles = (...args) => {
    const queries = Array.isArray(args[0]) ? args[0] : args;
    if (!queries.length) {
      const files = getFiles().filter(
        item =>
          !(
            item.status === ItemStatus.IDLE && item.origin === FileOrigin.LOCAL
          ) &&
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
    const files = getFiles();

    if (!queries.length) {
      return Promise.all(files.map(removeFile));
    }

    // when removing by index the indexes shift after each file removal so we need to convert indexes to ids
    const mappedQueries = queries
      .map(query =>
        isNumber(query) ? (files[query] ? files[query].id : null) : query
      )
      .filter(query => query);

    return mappedQueries.map(removeFile);
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
     * Removes a file by its name
     * @param query { string, number, null  }
     */
    removeFile,

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
     * Sort list of files
     */
    sort: compare => store.dispatch('SORT', { compare }),

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
      document.addEventListener('visibilitychange', visibilityHandler);

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

const createAppObject = (customOptions = {}) => {
  // default options
  const defaultOptions = {};
  forin(getOptions(), (key, value) => {
    defaultOptions[key] = value[0];
  });

  // set app options
  const app = createApp({
    // default options
    ...defaultOptions,

    // custom options
    ...customOptions
  });

  // return the plugin instance
  return app;
};

const lowerCaseFirstLetter = string =>
  string.charAt(0).toLowerCase() + string.slice(1);

const attributeNameToPropertyName = attributeName =>
  toCamels(attributeName.replace(/^data-/, ''));

const mapObject = (object, propertyMap) => {
  // remove unwanted
  forin(propertyMap, (selector, mapping) => {
    forin(object, (property, value) => {
      // create regexp shortcut
      const selectorRegExp = new RegExp(selector);

      // tests if
      const matches = selectorRegExp.test(property);

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
      const group = mapping.group;
      if (isObject(mapping) && !object[group]) {
        object[group] = {};
      }

      object[group][
        lowerCaseFirstLetter(property.replace(selectorRegExp, ''))
      ] = value;
    });

    // do submapping
    if (mapping.mapping) {
      mapObject(object[mapping.group], mapping.mapping);
    }
  });
};

const getAttributesAsObject = (node, attributeMapping = {}) => {
  // turn attributes into object
  const attributes = [];
  forin(node.attributes, index => {
    attributes.push(node.attributes[index]);
  });

  const output = attributes
    .filter(attribute => attribute.name)
    .reduce((obj, attribute) => {
      const value = attr(node, attribute.name);

      obj[attributeNameToPropertyName(attribute.name)] =
        value === attribute.name ? true : value;
      return obj;
    }, {});

  // do mapping of object properties
  mapObject(output, attributeMapping);

  return output;
};

const createAppAtElement = (element, options = {}) => {
  // how attributes of the input element are mapped to the options for the plugin
  const attributeMapping = {
    // translate to other name
    '^class$': 'className',
    '^multiple$': 'allowMultiple',
    '^capture$': 'captureMethod',

    // group under single property
    '^server': {
      group: 'server',
      mapping: {
        '^process': {
          group: 'process'
        },
        '^revert': {
          group: 'revert'
        },
        '^fetch': {
          group: 'fetch'
        },
        '^restore': {
          group: 'restore'
        },
        '^load': {
          group: 'load'
        }
      }
    },

    // don't include in object
    '^type$': false,
    '^files$': false
  };

  // add additional option translators
  applyFilters('SET_ATTRIBUTE_TO_OPTION_MAP', attributeMapping);

  // create final options object by setting options object and then overriding options supplied on element
  const mergedOptions = {
    ...options
  };

  const attributeOptions = getAttributesAsObject(
    element.nodeName === 'FIELDSET'
      ? element.querySelector('input[type=file]')
      : element,
    attributeMapping
  );

  // merge with options object
  Object.keys(attributeOptions).forEach(key => {
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
    Array.from(element.querySelectorAll('input:not([type=file])')).map(
      input => ({
        source: input.value,
        options: {
          type: input.dataset.type
        }
      })
    )
  );

  // build plugin
  const app = createAppObject(mergedOptions);

  // add already selected files
  if (element.files) {
    Array.from(element.files).forEach(file => {
      app.addFile(file);
    });
  }

  // replace the target element
  app.replaceElement(element);

  // expose
  return app;
};

// if an element is passed, we create the instance at that element, if not, we just create an up object
const createApp$1 = (...args) =>
  isNode(args[0]) ? createAppAtElement(...args) : createAppObject(...args);

const PRIVATE_METHODS = ['fire', '_read', '_write'];

const createAppAPI = app => {
  const api = {};

  copyObjectPropertiesToObject(app, api, PRIVATE_METHODS);

  return api;
};

/**
 * Replaces placeholders in given string with replacements
 * @param string - "Foo {bar}""
 * @param replacements - { "bar": 10 }
 */
const replaceInString = (string, replacements) =>
  string.replace(/(?:{([a-zA-Z]+)})/g, (match, group) => replacements[group]);

const createWorker = fn => {
  const workerBlob = new Blob(['(', fn.toString(), ')()'], {
    type: 'application/javascript'
  });
  const workerURL = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerURL);

  return {
    transfer: (message, cb) => {},
    post: (message, cb, transferList) => {
      const id = getUniqueId();

      worker.onmessage = e => {
        if (e.data.id === id) {
          cb(e.data.message);
        }
      };

      worker.postMessage(
        {
          id,
          message
        },
        transferList
      );
    },
    terminate: () => {
      worker.terminate();
      URL.revokeObjectURL(workerURL);
    }
  };
};

const loadImage = url =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = e => {
      reject(e);
    };
    img.src = url;
  });

const renameFile = (file, name) => {
  const renamedFile = file.slice(0, file.size, file.type);
  renamedFile.lastModifiedDate = file.lastModifiedDate;
  renamedFile.name = name;
  return renamedFile;
};

const copyFile = file => renameFile(file, file.name);

// already registered plugins (can't register twice)
const registeredPlugins = [];

// pass utils to plugin
const createAppPlugin = plugin => {
  // already registered
  if (registeredPlugins.includes(plugin)) {
    return;
  }

  // remember this plugin
  registeredPlugins.push(plugin);

  // setup!
  const pluginOutline = plugin({
    addFilter,
    utils: {
      Type,
      forin,
      isString,
      isFile,
      toNaturalFileSize,
      replaceInString,
      getExtensionFromFilename,
      getFilenameWithoutExtension,
      guesstimateMimeType,
      getFileFromBlob,
      getFilenameFromURL,
      createRoute,
      createWorker,
      createView,
      createItemAPI,
      loadImage,
      copyFile,
      renameFile,
      createBlob,
      applyFilterChain,
      text,
      getNumericAspectRatioFromString
    },
    views: {
      fileActionButton
    }
  });

  // add plugin options to default options
  extendDefaultOptions(pluginOutline.options);
};

// feature detection used by supported() method
const isOperaMini = () =>
  Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
const hasPromises = () => 'Promise' in window;
const hasBlobSlice = () => 'slice' in Blob.prototype;
const hasCreateObjectURL = () =>
  'URL' in window && 'createObjectURL' in window.URL;
const hasVisibility = () => 'visibilityState' in document;
const hasTiming = () => 'performance' in window; // iOS 8.x
const isBrowser = () =>
  typeof window !== 'undefined' && typeof window.document !== 'undefined';

const supported = (() => {
  // Runs immidiately and then remembers result for subsequent calls
  const isSupported =
    // Has to be a browser
    isBrowser() &&
    // Can't run on Opera Mini due to lack of everything
    !isOperaMini() &&
    // Require these APIs to feature detect a modern browser
    hasVisibility() &&
    hasPromises() &&
    hasBlobSlice() &&
    hasCreateObjectURL() &&
    hasTiming();

  return () => isSupported;
})();

/**
 * Plugin internal state (over all instances)
 */
const state = {
  // active app instances, used to redraw the apps and to find the later
  apps: []
};

// plugin name
const name = 'filepond';

/**
 * Public Plugin methods
 */
const fn = () => {};
let Status$1 = {};
let FileStatus = {};
let FileOrigin$1 = {};
let OptionTypes = {};
let create$e = fn;
let destroy = fn;
let parse = fn;
let find = fn;
let registerPlugin = fn;
let getOptions$1 = fn;
let setOptions$1 = fn;

// if not supported, no API
if (supported()) {
  // start painter and fire load event
  createPainter(
    () => {
      state.apps.forEach(app => app._read());
    },
    ts => {
      state.apps.forEach(app => app._write(ts));
    }
  );

  // fire loaded event so we know when FilePond is available
  const dispatch = () => {
    // let others know we have area ready
    document.dispatchEvent(
      new CustomEvent('FilePond:loaded', {
        detail: {
          supported,
          create: create$e,
          destroy,
          parse,
          find,
          registerPlugin,
          setOptions: setOptions$1
        }
      })
    );

    // clean up event
    document.removeEventListener('DOMContentLoaded', dispatch);
  };

  if (document.readyState !== 'loading') {
    // move to back of execution queue, FilePond should have been exported by then
    setTimeout(() => dispatch(), 0);
  } else {
    document.addEventListener('DOMContentLoaded', dispatch);
  }

  // updates the OptionTypes object based on the current options
  const updateOptionTypes = () =>
    forin(getOptions(), (key, value) => {
      OptionTypes[key] = value[1];
    });

  Status$1 = { ...Status };
  FileOrigin$1 = { ...FileOrigin };
  FileStatus = { ...ItemStatus };

  OptionTypes = {};
  updateOptionTypes();

  // create method, creates apps and adds them to the app array
  create$e = (...args) => {
    const app = createApp$1(...args);
    app.on('destroy', destroy);
    state.apps.push(app);
    return createAppAPI(app);
  };

  // destroys apps and removes them from the app array
  destroy = hook => {
    // returns true if the app was destroyed successfully
    const indexToRemove = state.apps.findIndex(app => app.isAttachedTo(hook));
    if (indexToRemove >= 0) {
      // remove from apps
      const app = state.apps.splice(indexToRemove, 1)[0];

      // restore original dom element
      app.restoreElement();

      return true;
    }

    return false;
  };

  // parses the given context for plugins (does not include the context element itself)
  parse = context => {
    // get all possible hooks
    const matchedHooks = Array.from(context.querySelectorAll(`.${name}`));

    // filter out already active hooks
    const newHooks = matchedHooks.filter(
      newHook => !state.apps.find(app => app.isAttachedTo(newHook))
    );

    // create new instance for each hook
    return newHooks.map(hook => create$e(hook));
  };

  // returns an app based on the given element hook
  find = hook => {
    const app = state.apps.find(app => app.isAttachedTo(hook));
    if (!app) {
      return null;
    }
    return createAppAPI(app);
  };

  // adds a plugin extension
  registerPlugin = (...plugins) => {
    // register plugins
    plugins.forEach(createAppPlugin);

    // update OptionTypes, each plugin might have extended the default options
    updateOptionTypes();
  };

  getOptions$1 = () => {
    const opts = {};
    forin(getOptions(), (key, value) => {
      opts[key] = value[0];
    });
    return opts;
  };

  setOptions$1 = opts => {
    if (isObject(opts)) {
      // update existing plugins
      state.apps.forEach(app => {
        app.setOptions(opts);
      });

      // override defaults
      setOptions(opts);
    }

    // return new options
    return getOptions$1();
  };
}

export {
  FileOrigin$1 as FileOrigin,
  FileStatus,
  OptionTypes,
  Status$1 as Status,
  create$e as create,
  destroy,
  find,
  getOptions$1 as getOptions,
  parse,
  registerPlugin,
  setOptions$1 as setOptions,
  supported
};
