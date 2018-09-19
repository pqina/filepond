/*
 * FilePond 2.2.1
 * Licensed under MIT, https://opensource.org/licenses/MIT
 * Please visit https://pqina.nl/filepond for details.
 */
const isNode = value => value instanceof HTMLElement;

const createStore = (initialState, queries = [], actions = []) => {
  // internal state
  const state = Object.assign({}, initialState);

  // contains all actions for next frame, is clear when actions are requested
  const actionQueue = [];
  const dispatchQueue = [];

  // returns a duplicate of the current state
  const getState = () => Object.assign({}, state);

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
    queryHandles = Object.assign({}, query(state), queryHandles);
  });

  let actionHandlers = {};
  actions.forEach(action => {
    actionHandlers = Object.assign(
      {},
      action(dispatch, query, state),
      actionHandlers
    );
  });

  return api;
};

const defineProperty = (obj, property, definition) => {
  if (typeof definition === 'function') {
    obj[property] = definition;
    return;
  }
  Object.defineProperty(obj, property, Object.assign({}, definition));
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
  // todo: expand with location and target option (child, 'before', target)

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
    element: Object.assign({}, elementRect),

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
          resting = true;
          p = reverse ? 0 : 1;
          api.onupdate(p * target);
          api.oncomplete(p * target);
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
  const props = typeof def === 'object' ? Object.assign({}, def) : {};

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

const isEmpty = value => value == null;

const isDefined = value => !isEmpty(value);

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
  const initialProps = Object.assign({}, viewProps);

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
        animation.interpolate(ts);
        if (!animation.resting) {
          resting = false;
        }
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
  rotateZ: 0
};

const styles = ({
  mixinConfig,
  viewProps,
  viewInternalAPI,
  viewExternalAPI,
  view
}) => {
  // initial props
  const initialProps = Object.assign({}, viewProps);

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
      Object.assign(currentProps, Object.assign({}, viewProps));

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
    translateX,
    translateY,
    scaleX,
    scaleY,
    rotateX,
    rotateY,
    rotateZ,
    height
  }
) => {
  const transforms = [];
  const styles = [];

  // transform order is relevant

  // 1. translate
  if (isDefined(translateX) || isDefined(translateY)) {
    transforms.push(
      `translate3d(${translateX || 0}px, ${translateY || 0}px, 0)`
    );
  }

  // 2. scale
  if (isDefined(scaleX) || isDefined(scaleY)) {
    transforms.push(
      `scale3d(${isDefined(scaleX) ? scaleX : 1}, ${
        isDefined(scaleY) ? scaleY : 1
      }, 1)`
    );
  }

  // 3. rotate
  if (isDefined(rotateZ) || isDefined(rotateY) || isDefined(rotateX)) {
    transforms.push(
      `rotate3d(${rotateX || 0}, ${rotateY || 0}, ${rotateZ || 0}, 360deg)`
    );
  }

  // add transforms
  if (transforms.length) {
    styles.push(`transform:${transforms.join(' ')}`);
  }

  // add opacity
  if (isDefined(opacity)) {
    styles.push(`opacity:${opacity}`);

    // if we reach zero, we make the element inaccessible
    if (opacity === 0) {
      styles.push('visibility:hidden');
    }

    // if we're below 100% opacity this element can't be clicked
    if (opacity < 1) {
      styles.push('pointer-events:none;');
    }
  }

  // add height
  if (isDefined(height)) {
    styles.push(`height:${height}px`);
  }

  // apply styles
  const currentStyles = element.getAttribute('style') || '';
  const newStyles = styles.join(';');

  // if new styles does not match current styles, lets update!
  if (
    newStyles.length !== currentStyles.length ||
    newStyles !== currentStyles
  ) {
    element.setAttribute('style', newStyles);
  }
};

const Mixins = {
  styles,
  listeners,
  animations,
  apis
};

const updateRect = (rect = {}, element = {}, style = {}) => {
  rect.paddingTop = parseInt(style.paddingTop, 10) || 0;
  rect.marginTop = parseInt(style.marginTop, 10) || 0;
  rect.marginRight = parseInt(style.marginRight, 10) || 0;
  rect.marginBottom = parseInt(style.marginBottom, 10) || 0;
  rect.marginLeft = parseInt(style.marginLeft, 10) || 0;

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

    // rect related
    ignoreRect = false,

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
    const getChildViews = () => [...childViews];
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

      // update my rectangle
      updateRect(rect, element, style);

      // writers
      readers.forEach(reader => reader({ root: internalAPI, props, rect }));
    };

    /**
     * Write data to DOM
     * @private
     */
    const _write = (ts, frameActions = []) => {
      // if no actions, we assume that the view is resting
      let resting = frameActions.length === 0;

      // writers
      writers.forEach(writer => {
        const writerResting = writer({
          props,
          root: internalAPI,
          actions: frameActions,
          timestamp: ts
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
      childViews.filter(child => !!child.element.parentNode).forEach(child => {
        // if a child view is not resting, we are not resting
        const childResting = child._write(
          ts,
          filterFrameActionsForChild(child, frameActions)
        );
        if (!childResting) {
          resting = false;
        }
      });

      // append new elements to DOM and update those
      childViews
        .filter(child => !child.element.parentNode)
        .forEach((child, index) => {
          // append to DOM
          internalAPI.appendChild(child.element, index);

          // call read (need to know the size of these elements)
          child._read();

          // re-call write
          child._write(ts, filterFrameActionsForChild(child, frameActions));

          // we just added somthing to the dom, no rest
          resting = false;
        });

      // let parent know if we are resting
      return resting;
    };

    const _destroy = () => {
      activeMixins.forEach(mixin => mixin.destroy());
      destroyers.forEach(destroyer => destroyer({ root: internalAPI }));
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
    const internalAPIDefinition = Object.assign({}, sharedAPIDefinition, {
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
      appendChildView: appendChildView(element, childViews),
      removeChildView: removeChildView(element, childViews),
      registerWriter: writer => writers.push(writer),
      registerReader: reader => readers.push(reader),

      // access to data store
      dispatch: store.dispatch,
      query: store.query
    });

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
      isRectIgnored: () => ignoreRect,
      _read,
      _write,
      _destroy
    };

    // mixin API methods
    const mixinAPIDefinition = Object.assign({}, sharedAPIDefinition, {
      rect: {
        get: () => rect
      }
    });

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

const createPainter = (update, fps = 60) => {
  const interval = 1000 / fps;
  let last = null;
  let frame = null;

  const tick = ts => {
    // queue next tick
    frame = window.requestAnimationFrame(tick);

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
    last = ts - delta % interval;

    // update view
    update(ts);
  };

  tick(performance.now());

  return {
    pause: () => {
      window.cancelAnimationFrame(frame);
    }
  };
};

const createUpdater = (apps, reader, writer) => ts => {
  // all reads first (as these are free at the start of the frame)
  apps.forEach(app => app[reader]());

  // now update the DOM
  apps.forEach(app => app[writer](ts));
};

const createRoute = routes => ({ root, props, actions = [] }) => {
  actions
    .filter(action => routes[action.type])
    .forEach(action =>
      routes[action.type]({ root, props, action: action.data })
    );
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
    : isString(value) ? toString(value).replace(/[a-z]+/gi, '') : 0;

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
  api.timeout = outline.timeout ? parseInt(outline.timeout, 10) : 7000;

  forin(methods, key => {
    api[key] = createAction(key, outline[key], methods[key], api.timeout);
  });

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
  float: toFloat,
  bytes: toBytes,
  string: value => (isFunction(value) ? value : toString(value)),
  serverapi: toServerAPI,
  object: value => {
    try {
      return JSON.parse(replaceSingleQuotes(value));
    } catch (e) {
      return null;
    }
  },
  function: value => toFunctionReference(value)
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
      } catch (e) {}
      // nope, failed

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

const forEachDelayed = (items, cb, delay = 75) =>
  items.map(
    (item, index) =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          cb(item);
          resolve();
        }, delay * index);
      })
  );

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
      setTimeout(() => {
        listeners
          .filter(listener => listener.event === event)
          .map(listener => listener.cb)
          .forEach(cb => {
            cb(...args);
          });
      }, 0);
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

const PRIVATE_METHODS = [
  'fire',
  'process',
  'revert',
  'load',
  'on',
  'off',
  'onOnce',
  'retryLoad'
];

const createItemAPI = item => {
  const api = {};
  copyObjectPropertiesToObject(item, api, PRIVATE_METHODS);
  return api;
};

const nextTick = fn => {
  setTimeout(fn, 16);
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

const getOptions$1 = () => Object.assign({}, defaultOptions);

const setOptions$1 = opts => {
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
  // TODO: allowDrag: [true, Type.BOOLEAN],					// Allow dragging files
  // TODO: allowSwipe: [true, Type.BOOLEAN],					// Allow swipe to remove files
  // TODO: allowRemoveAll: [true, Type.BOOLEAN],				// Allow removing all items at once
  // TODO: allowUploadAll: [true, Type.BOOLEAN],				// Allow uploading all items at once

  // Input requirements
  maxFiles: [null, Type.INT], // Max number of files

  // Drag 'n Drop related
  dropOnPage: [false, Type.BOOLEAN], // Allow dropping of files anywhere on page (prevents browser from opening file if dropped outside of Up)
  dropOnElement: [true, Type.BOOLEAN], // Drop needs to happen on element (set to false to also load drops outside of Up)
  dropValidation: [false, Type.BOOLEAN], // Enable or disable validating files on drop
  ignoredFiles: [['.ds_store', 'thumbs.db', 'desktop.ini'], Type.ARRAY],
  // catchDirectories: [true, Type.BOOLEAN],					// Allow dropping directories in modern browsers

  // Upload related
  instantUpload: [true, Type.BOOLEAN], // Should upload files immidiately on drop
  // TODO: parallel: [1, Type.INT],							// Maximum files to upload in parallel
  // TODO: chunks: [false, Type.BOOLEAN],						// Use chunk uploading
  // TODO: chunkSize: [.5 * (1024 * 1024), Type.INT],			// Upload in 512KB chunks

  // by default no async api is supplied
  /* expected format
    {
    url: '',
    timeout: 1000,
    process: {
    url: '',
    method: 'POST',
            withCredentials: false,
    headers: {},
            onload: (response) => {
                return response.id
            }
    },
    revert: {
    url: '',
    method: 'DELETE',
    withCredentials: false,
    headers: {},
            onload: null
    },
    fetch: {
    url: '',
    method: 'GET',
    withCredentials: false,
    headers: {},
            onload: null
    },
    restore: {
    url: '',
    method: 'GET',
    withCredentials: false,
    headers: {},
            onload: null
    }
    }
    */
  server: [null, Type.SERVER_API],

  // Labels and status messages
  labelDecimalSeparator: [getDecimalSeparator(), Type.STRING], // Default is locale separator
  labelThousandsSeparator: [getThousandsSeparator(), Type.STRING], // Default is locale separator

  labelIdle: [
    'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
    Type.STRING
  ],

  labelFileWaitingForSize: ['Waiting for size', Type.STRING],
  labelFileSizeNotAvailable: ['Size not available', Type.STRING],
  labelFileCountSingular: ['file in list', Type.STRING],
  labelFileCountPlural: ['files in list', Type.STRING],
  labelFileLoading: ['Loading', Type.STRING],
  labelFileAdded: ['Added', Type.STRING], // assistive only
  labelFileRemoved: ['Removed', Type.STRING], // assistive only
  labelFileLoadError: ['Error during load', Type.STRING],
  labelFileProcessing: ['Uploading', Type.STRING],
  labelFileProcessingComplete: ['Upload complete', Type.STRING],
  labelFileProcessingAborted: ['Upload cancelled', Type.STRING],
  labelFileProcessingError: ['Error during upload', Type.STRING],
  // labelFileProcessingPaused: ['Upload paused', Type.STRING],

  labelTapToCancel: ['tap to cancel', Type.STRING],
  labelTapToRetry: ['tap to retry', Type.STRING],
  labelTapToUndo: ['tap to undo', Type.STRING],
  // labelTapToPause: ['tap to pause', Type.STRING],
  // labelTapToResume: ['tap to resume', Type.STRING],

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
  onaddfilestart: [null, Type.FUNCTION],
  onaddfileprogress: [null, Type.FUNCTION],
  onaddfile: [null, Type.FUNCTION],
  onprocessfilestart: [null, Type.FUNCTION],
  onprocessfileprogress: [null, Type.FUNCTION],
  onprocessfileabort: [null, Type.FUNCTION],
  onprocessfilerevert: [null, Type.FUNCTION],
  onprocessfile: [null, Type.FUNCTION],
  onremovefile: [null, Type.FUNCTION],

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

const queries = state => ({
  GET_ITEM: query => getItemByQuery(state.items, query),

  GET_ITEMS: query => [...state.items],

  GET_ITEM_NAME: query => {
    const item = getItemByQuery(state.items, query);
    return item ? item.filename : null;
  },

  GET_ITEM_SIZE: query => {
    const item = getItemByQuery(state.items, query);
    return item ? item.fileSize : null;
  },

  GET_TOTAL_ITEMS: () => state.items.length,

  IS_ASYNC: () =>
    isObject(state.options.server) &&
    (isObject(state.options.server.process) ||
      isFunction(state.options.server.process))
});

const hasRoomForItem = state => {
  const count = state.items.length;

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

const getFilenameFromHeaders = headers => {
  const rows = headers.split('\n');
  for (const header of rows) {
    const matches = header.match(/filename="(.+)"/);
    if (!matches || !matches[1]) {
      continue;
    }
    return matches[1];
  }
  return null;
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
    if (!state.request) {
      return;
    }
    state.request.abort();
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
        api.fire('meta', {
          size: state.size,
          filename: getFilenameFromHeaders(
            typeof response === 'string' ? response : response.headers
          )
        });
      }
    );
  };

  const api = Object.assign({}, on(), {
    setSource: source => (state.source = source),
    getProgress, // file load progress
    abort, // abort file load
    load // start load
  });

  return api;
};

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
  let timeoutId = null;
  let timedOut = false;
  let aborted = false;
  let headersReceived = false;

  // set default options
  options = Object.assign(
    {
      method: 'POST',
      headers: {},
      withCredentials: false
    },
    options
  );

  // if method is GET, add any received data to url
  if (/GET/i.test(options.method) && data) {
    //url = `${ url }${ hasQueryString(url) ? '&' : '?' }data=${ encodeURIComponent(typeof data === 'string' ? data : JSON.stringify(data)) }`;
    url = `${url}${encodeURIComponent(
      typeof data === 'string' ? data : JSON.stringify(data)
    )}`;
  }

  // create request
  const xhr = new XMLHttpRequest();

  // progress of load
  const process = /GET/i.test(options.method) ? xhr : xhr.upload;
  process.onprogress = e => {
    // progress event received, timeout no longer needed
    clearTimeout(timeoutId);

    // no progress event when aborted ( onprogress is called once after abort() )
    if (aborted || timedOut) {
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

    // timeout no longer needed as connection is setup
    clearTimeout(timeoutId);

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
  xhr.onerror = () => {
    api.onerror(xhr);
  };

  // request aborted
  xhr.onabort = () => {
    if (timedOut) {
      return;
    }
    aborted = true;
    api.onabort();
  };

  // set timeout if defined
  if (isInt(options.timeout)) {
    timeoutId = setTimeout(() => {
      timedOut = true;
      api.ontimeout(xhr);
      api.abort();
    }, options.timeout);
  }

  // add headers
  xhr.open(options.method, url, true);
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
    const request = sendRequest(
      url,
      apiUrl + action.url,
      Object.assign({}, action, {
        responseType: 'blob'
      })
    );

    request.onload = xhr => {
      // get headers
      const headers = xhr.getAllResponseHeaders();

      // get filename
      const filename =
        getFilenameFromHeaders(headers) || getFilenameFromURL(url);

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
    // no file received
    if (!file) {
      return;
    }

    // create formdata object
    var formData = new FormData();
    formData.append(name, file, file.name);

    // add metadata under same name
    if (isObject(metadata)) {
      formData.append(name, JSON.stringify(metadata));
    }

    // set onload hanlder
    const onload = action.onload || (res => res);
    const onerror = action.onerror || (res => null);

    // send request object
    const request = sendRequest(formData, apiUrl + action.url, action);
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

      api.fire('load', state.response.body);
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
        api.fire('abort');
      }
    );
  };

  const abort = () => {
    // no request running, can't abort
    if (!state.request) {
      return;
    }

    // stop updater
    state.perceivedPerformanceUpdater.clear();

    // abort actual request
    state.request.abort();

    // if has response object, we've completed the request
    state.complete = true;

    // now aborted, if server returned a response, let's pass it along
    api.fire('abort', state.response ? state.response.body : null);
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

  const api = Object.assign({}, on(), {
    process, // start processing file
    abort, // abort active process request
    getProgress,
    getDuration,
    reset
  });

  return api;
};

const getFilenameWithoutExtension = name =>
  name.substr(0, name.lastIndexOf('.')) || name;

const ItemStatus = {
  INIT: 1,
  IDLE: 2,
  PROCESSING: 3,
  PROCESSING_PAUSED: 4,
  PROCESSING_COMPLETE: 5,
  PROCESSING_ERROR: 6,
  LOADING: 7,
  LOAD_ERROR: 8
};

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

const FileOrigin = {
  INPUT: 1,
  LIMBO: 2,
  LOCAL: 3
};

const createItem = (origin = null, serverFileReference = null, file = null) => {
  // unique id for this item, is used to identify the item across views
  const id = getUniqueId();

  /**
   * Internal item state
   */
  const state = {
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

  /**
   * Externally added item metadata
   */
  const metadata = {};

  // item data
  const setStatus = status => (state.status = status);

  // file data
  const getFileExtension = () => getExtensionFromFilename(state.file.name);
  const getFileType = () => state.file.type;
  const getFileSize = () => state.file.size;
  const getFile = () => state.file;

  // loads files
  const load = (source, loader, onload) => {
    // remember the original item source
    state.source = source;

    // file stub is already there
    if (state.file) {
      api.fire('load-skip');
      return;
    }

    // set a stub file object while loading the actual data
    state.file = createFileStub(source);

    // starts loading
    loader.on('init', () => {
      api.fire('load-init');
    });

    // we'eve received a size indication, let's update the stub
    loader.on('meta', meta => {
      // set size of file stub
      state.file.size = meta.size;

      // set name of file stub
      state.file.filename = meta.filename;

      // size has been updated
      api.fire('load-meta');
    });

    // the file is now loading we need to update the progress indicators
    loader.on('progress', progress => {
      setStatus(ItemStatus.LOADING);

      api.fire('load-progress', progress);
    });

    // an error was thrown while loading the file, we need to switch to error state
    loader.on('error', error => {
      setStatus(ItemStatus.LOAD_ERROR);

      api.fire('load-request-error', error);
    });

    // user or another process aborted the file load (cannot retry)
    loader.on('abort', () => {
      setStatus(ItemStatus.INIT);

      api.fire('load-abort');
    });

    // done loading
    loader.on('load', file => {
      // as we've now loaded the file the loader is no longer required
      state.activeLoader = null;

      // called when file has loaded succesfully
      const success = result => {
        // set (possibly) transformed file
        state.file = result;

        // file received
        if (origin === FileOrigin.LIMBO && state.serverFileReference) {
          setStatus(ItemStatus.PROCESSING_COMPLETE);
        } else {
          setStatus(ItemStatus.IDLE);
        }

        api.fire('load');
      };

      const error = result => {
        // set original file
        state.file = file;
        api.fire('load-meta');

        setStatus(ItemStatus.LOAD_ERROR);
        api.fire('load-file-error', result);
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

  // file processor
  const process = (processor, onprocess) => {
    // if no file loaded we'll wait for the load event
    if (!(state.file instanceof Blob)) {
      api.on('load', () => {
        process(processor, onprocess);
      });
      return;
    }

    // setup processor

    processor.on('load', serverFileReference => {
      // no longer required
      state.activeProcessor = null;

      // need this id to be able to rever the upload
      state.serverFileReference = serverFileReference;

      setStatus(ItemStatus.PROCESSING_COMPLETE);
      api.fire('process-complete', serverFileReference);
    });

    processor.on('start', () => {
      api.fire('process-start');
    });

    processor.on('error', error => {
      state.activeProcessor = null;
      setStatus(ItemStatus.PROCESSING_ERROR);
      api.fire('process-error', error);
    });

    processor.on('abort', serverFileReference => {
      state.activeProcessor = null;

      // if file was uploaded but processing was cancelled during perceived processor time store file reference
      state.serverFileReference = serverFileReference;

      setStatus(ItemStatus.IDLE);
      api.fire('process-abort');
    });

    processor.on('progress', progress => {
      setStatus(ItemStatus.PROCESSING);
      api.fire('process-progress', progress);
    });

    // when successfully transformed
    const success = file => {
      processor.process(file, Object.assign({}, metadata));
    };

    // something went wrong during transform phase
    const error = result => {};

    // start processing the file
    onprocess(state.file, success, error);

    // set as active processor
    state.activeProcessor = processor;
  };

  const revert = revertFileUpload => {
    // cannot revert without a server id for this process
    if (state.serverFileReference === null) {
      return;
    }

    // revert the upload (fire and forget)
    revertFileUpload(
      state.serverFileReference,
      () => {
        // reset file server id as now it's no available on the server
        state.serverFileReference = null;
      },
      error => {
        // TODO: handle revert error
      }
    );

    // fire event
    setStatus(ItemStatus.IDLE);
    api.fire('process-revert');
  };

  const abortLoad = () => {
    if (!state.activeLoader) {
      return;
    }
    state.activeLoader.abort();
  };

  const retryLoad = () => {
    if (!state.activeLoader) {
      return;
    }
    state.activeLoader.load();
  };

  const abortProcessing = () => {
    if (!state.activeProcessor) {
      return;
    }
    state.activeProcessor.abort();
  };

  // exposed methods

  const api = Object.assign(
    {
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

      getMetadata: name =>
        name ? metadata[name] : Object.assign({}, metadata),
      setMetadata: (name, value) => (metadata[name] = value),

      abortLoad,
      retryLoad,
      abortProcessing,

      load,
      process,
      revert
    },
    on()
  );

  return createObject(api);
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

const removeIndex = (arr, index) => arr.splice(index, 1);

const removeItem = (items, needle) => {
  // get index of item
  const index = items.findIndex(item => item === needle);

  // remove it from array
  removeIndex(items, index);

  // return removed item
  return needle;
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
    const filename = getFilenameFromHeaders(headers) || getFilenameFromURL(url);

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
    .replace(/([a-z])?:\/\//, '$1')
    .split('/')[0];
};

const isExternalURL = url =>
  (url.indexOf(':') > -1 || url.indexOf('//') > -1) &&
  getDomainFromURL(location.href) !== getDomainFromURL(url);

const isFile = value =>
  value instanceof File || (value instanceof Blob && value.name);

const dynamicLabel = label => (...params) =>
  isFunction(label) ? label(...params) : label;

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
    query('GET_ITEMS').forEach(item => {
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
    [...state.items].forEach(item => {
      // if item not is in new value, remove
      if (!files.find(file => file.source === item.source)) {
        dispatch('REMOVE_ITEM', { query: item });
      }
    });

    // add new files
    files.forEach((file, index) => {
      // if file is already in list
      if ([...state.items].find(item => item.source === file.source)) {
        return;
      }

      // not in list, add
      dispatch(
        'ADD_ITEM',
        Object.assign({}, file, {
          interactionMethod: InteractionMethod.NONE,
          index
        })
      );
    });
  },

  /**
   * @param source
   * @param index
   * @param interactionMethod
   */
  ADD_ITEM: ({
    source,
    index,
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

      // id of first item we're about to remove
      const item = state.items[0];

      // if has been processed remove it from the server as well
      if (item.status === ItemStatus.PROCESSING_COMPLETE) {
        dispatch('REVERT_ITEM_PROCESSING', { query: item.id });
      }

      // remove first item as it will be replaced by this item
      dispatch('REMOVE_ITEM', { query: item.id });
    }

    // where did the file originate
    const origin =
      options.type === 'local'
        ? FileOrigin.LOCAL
        : options.type === 'limbo' ? FileOrigin.LIMBO : FileOrigin.INPUT;

    // create a new blank item
    const item = createItem(
      origin,
      origin === FileOrigin.INPUT ? null : source,
      options.file
    );

    // set initial meta data
    Object.keys(options.metadata || {}).forEach(key => {
      item.setMetadata(key, options.metadata[key]);
    });

    // add item to list
    insertItem(state.items, item, index);

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
      dispatch('DID_THROW_ITEM_INVALID', Object.assign({}, error, { id }));
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
      // item loaded, allow plugins to
      // - read data (quickly)
      // - add metadata
      applyFilterChain('DID_LOAD_ITEM', item, { query }).then(() => {
        // let plugins decide if the output data should be prepared at this point
        // means we'll do this and wait for idle state
        applyFilterChain('SHOULD_PREPARE_OUTPUT', false, { item, query }).then(
          shouldPrepareOutput => {
            const data = {
              source,
              success

              // exit
            };
            if (shouldPrepareOutput) {
              // wait for idle state and then run PREPARE_OUTPUT
              dispatch(
                'REQUEST_PREPARE_LOAD_ITEM',
                {
                  query: id,
                  item,
                  data
                },
                true
              );

              return;
            }

            dispatch('COMPLETE_LOAD_ITEM', {
              query: id,
              item,
              data
            });
          }
        );
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

    item.on('process-abort', serverFileReference => {
      // we'll revert any processed items
      dispatch('REVERT_ITEM_PROCESSING', { query: id });

      // if we're instant uploading, the item is removed
      if (state.options.instantUpload) {
        dispatch('REMOVE_ITEM', { query: id });
      } else {
        // we stopped processing
        dispatch('DID_ABORT_ITEM_PROCESSING', { id });
      }
    });

    item.on('process-complete', serverFileReference => {
      dispatch('DID_COMPLETE_ITEM_PROCESSING', {
        id,
        error: null,
        serverFileReference
      });
    });

    item.on('process-revert', () => {
      // if is instant upload remove the item
      // or is a fake file
      if (state.options.instantUpload || options.file) {
        dispatch('REMOVE_ITEM', { query: id });
      } else {
        dispatch('DID_REVERT_ITEM_PROCESSING', { id });
      }
    });

    // let view know the item has been inserted
    dispatch('DID_ADD_ITEM', { id, index, interactionMethod });

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

  REQUEST_PREPARE_LOAD_ITEM: ({ item, data }) => {
    // allow plugins to alter the file data
    applyFilterChain('PREPARE_OUTPUT', item.file, { query, item }).then(
      result => {
        applyFilterChain('COMPLETE_PREPARE_OUTPUT', result, {
          query,
          item
        }).then(result => {
          dispatch('COMPLETE_LOAD_ITEM', {
            item,
            data
          });
        });
      }
    );
  },

  COMPLETE_LOAD_ITEM: ({ item, data }) => {
    const { success, source } = data;

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

  REQUEST_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
    const id = item.id;

    dispatch('DID_REQUEST_ITEM_PROCESSING', { id });

    dispatch('PROCESS_ITEM', { query: item }, true);
  }),

  PROCESS_ITEM: getItemByQueryFromState(state, (item, success, failure) => {
    // we done function
    item.onOnce('process-complete', () => {
      success(createItemAPI(item));
    });

    // we error function
    item.onOnce('process-error', error => {
      failure({ error, file: createItemAPI(item) });
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
        applyFilterChain('PREPARE_OUTPUT', file, {
          query,
          item
        })
          .then(success)
          .catch(error);
      }
    );
  }),

  RETRY_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
    dispatch('REQUEST_ITEM_PROCESSING', { query: item });
  }),

  REMOVE_ITEM: getItemByQueryFromState(state, (item, success) => {
    // get id reference
    const id = item.id;

    // tell the view the item has been removed
    dispatch('DID_REMOVE_ITEM', { id, item });

    // now remove it from the item list,
    // we remove it from the list after the view has been updated
    // to make sure the item is available for view rendering till removed
    dispatch('SPLICE_ITEM', { id, item });

    // correctly removed
    success(createItemAPI(item));
  }),

  // private action for timing the removal of an item from the items list
  SPLICE_ITEM: ({ id }) =>
    removeItem(state.items, getItemById(state.items, id)),

  ABORT_ITEM_LOAD: getItemByQueryFromState(state, item => {
    // stop loading this file
    item.abortLoad();

    // the file will throw an event and that will take
    // care of removing the item from the list
  }),

  ABORT_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
    // stop processing this file
    item.abortProcessing();

    // the file will throw an event and that will take
    // care of removing the item from the list
  }),

  REVERT_ITEM_PROCESSING: getItemByQueryFromState(state, item => {
    // remove from server
    item.revert(
      createRevertFunction(
        state.options.server.url,
        state.options.server.revert
      )
    );
  }),

  SET_OPTIONS: ({ options }) => {
    forin(options, (key, value) => {
      dispatch(`SET_${fromCamels(key, '_').toUpperCase()}`, { value });
    });
  }
});

const createElement$1 = tagName => {
  return document.createElement(tagName);
};

const formatFilename = name => decodeURI(name);

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
  const angleInRadians = (angleInDegrees % 360 - 90) * Math.PI / 180.0;
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

const create$7 = ({ root, props }) => {
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

const write$5 = ({ root, props }) => {
  if (props.opacity === 0) {
    return;
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
  ignoreRect: true,
  create: create$7,
  write: write$5,
  mixins: {
    apis: ['progress', 'spin'],
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

const create$8 = ({ root, props }) => {
  root.element.title = props.label;
  root.element.innerHTML = props.icon || '';
  props.disabled = false;
};

const write$6 = ({ root, props }) => {
  if (props.opacity === 0 && !props.disabled) {
    props.disabled = true;
    attr(root.element, 'disabled', 'disabled');
  } else if (props.opacity > 0 && props.disabled) {
    props.disabled = false;
    root.element.removeAttribute('disabled');
  }
};

const fileActionButton = createView({
  tag: 'button',
  attributes: {
    type: 'button'
  },
  ignoreRect: true,
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
  create: create$8,
  write: write$6
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

const create$9 = ({ root, props }) => {
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
  write: createRoute({
    DID_LOAD_ITEM: updateFile,
    DID_UPDATE_ITEM_META: updateFile,
    DID_THROW_ITEM_LOAD_ERROR: updateFileSizeOnError,
    DID_THROW_ITEM_INVALID: updateFileSizeOnError
  }),
  didCreateView: root => {
    applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
  },
  create: create$9,
  mixins: {
    styles: ['translateX', 'translateY'],
    animations: {
      translateX: 'spring',
      translateY: 'spring'
    }
  }
});

const toPercentage = value => Math.round(value * 100);

const create$10 = ({ root, props }) => {
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

const didCompleteItemProcessing$1 = ({ root }) => {
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
  write: createRoute({
    DID_LOAD_ITEM: clear,
    DID_REVERT_ITEM_PROCESSING: clear,
    DID_REQUEST_ITEM_PROCESSING: didRequestItemProcessing,
    DID_ABORT_ITEM_PROCESSING: didAbortItemProcessing,
    DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing$1,
    DID_UPDATE_ITEM_PROCESS_PROGRESS: didSetItemProcessProgress,
    DID_UPDATE_ITEM_LOAD_PROGRESS: didSetItemLoadProgress,
    DID_THROW_ITEM_LOAD_ERROR: error,
    DID_THROW_ITEM_INVALID: error,
    DID_THROW_ITEM_PROCESSING_ERROR: error
  }),
  didCreateView: root => {
    applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
  },
  create: create$10,
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
    className: 'filepond--action-abort-item-load'
  },
  RetryItemLoad: {
    label: 'GET_LABEL_BUTTON_RETRY_ITEM_LOAD',
    action: 'RETRY_ITEM_LOAD',
    icon: 'GET_ICON_RETRY',
    className: 'filepond--action-retry-item-load'
  },
  RemoveItem: {
    label: 'GET_LABEL_BUTTON_REMOVE_ITEM',
    action: 'REMOVE_ITEM',
    icon: 'GET_ICON_REMOVE',
    className: 'filepond--action-remove-item'
  },
  ProcessItem: {
    label: 'GET_LABEL_BUTTON_PROCESS_ITEM',
    action: 'REQUEST_ITEM_PROCESSING',
    icon: 'GET_ICON_PROCESS',
    className: 'filepond--action-process-item'
  },
  AbortItemProcessing: {
    label: 'GET_LABEL_BUTTON_ABORT_ITEM_PROCESSING',
    action: 'ABORT_ITEM_PROCESSING',
    className: 'filepond--action-abort-item-processing'
  },
  RetryItemProcessing: {
    label: 'GET_LABEL_BUTTON_RETRY_ITEM_PROCESSING',
    action: 'RETRY_ITEM_PROCESSING',
    icon: 'GET_ICON_RETRY',
    className: 'filepond--action-retry-item-processing'
  },
  RevertItemProcessing: {
    label: 'GET_LABEL_BUTTON_UNDO_ITEM_PROCESSING',
    action: 'REVERT_ITEM_PROCESSING',
    icon: 'GET_ICON_UNDO',
    className: 'filepond--action-revert-item-processing'
  }
};

// make a list of buttons, we can then remove buttons from this list if they're disabled
const ButtonKeys = [];
forin(Buttons, key => {
  ButtonKeys.push(key);
});

const calculateFileInfoOffset = root =>
  root.ref.buttonRemoveItem.rect.element.width +
  root.ref.buttonRemoveItem.rect.element.left;

// Force on full pixels so text stays crips
const calculateFileVerticalCenterOffset = root =>
  Math.floor(root.ref.buttonRemoveItem.rect.element.height / 4);
const calculateFileHorizontalCenterOffset = root =>
  Math.floor(root.ref.buttonRemoveItem.rect.element.left / 2);

const DefaultStyle = {
  buttonAbortItemLoad: { opacity: 0 },
  buttonRetryItemLoad: { opacity: 0 },
  buttonRemoveItem: { opacity: 0 },
  buttonProcessItem: { opacity: 0 },
  buttonAbortItemProcessing: { opacity: 0 },
  buttonRetryItemProcessing: { opacity: 0 },
  buttonRevertItemProcessing: { opacity: 0 },
  loadProgressIndicator: { opacity: 0 },
  processProgressIndicator: { opacity: 0 },
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
const create$6 = ({ root, props }) => {
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

    // add class
    buttonView.element.classList.add(definition.className);

    // handle interactions
    buttonView.on('click', () => {
      root.dispatch(definition.action, { query: props.id });
    });

    // set reference
    root.ref[`button${key}`] = buttonView;
  });

  // create file info view
  root.ref.info = root.appendChildView(
    root.createChildView(fileInfo, { id: props.id })
  );

  // create file status view
  root.ref.status = root.appendChildView(
    root.createChildView(fileStatus, { id: props.id })
  );

  // checkmark
  root.ref.processingCompleteIndicator = root.appendChildView(
    root.createChildView(processingCompleteIndicatorView)
  );

  // add progress indicators
  root.ref.loadProgressIndicator = root.appendChildView(
    root.createChildView(progressIndicator, { opacity: 0 })
  );
  root.ref.loadProgressIndicator.element.classList.add(
    'filepond--load-indicator'
  );

  root.ref.processProgressIndicator = root.appendChildView(
    root.createChildView(progressIndicator, { opacity: 0 })
  );

  root.ref.processProgressIndicator.element.classList.add(
    'filepond--process-indicator'
  );
};

const write$4 = ({ root, actions, props }) => {
  // route actions
  route$3({ root, actions, props });

  // select last state change action
  let action = [...actions]
    .filter(action => /^DID_/.test(action.type))
    .reverse()
    .find(action => StyleMap[action.type]);

  // no need to set same state twice
  if (!action || (action && action.type === props.currentStyle)) {
    return;
  }

  // set current state
  props.currentStyle = action.type;
  const newStyles = StyleMap[props.currentStyle];

  forin(DefaultStyle, (name, defaultStyles) => {
    // get reference to control
    const control = root.ref[name];

    // loop over all styles for this control
    forin(defaultStyles, (key, defaultValue) => {
      const value =
        newStyles[name] && typeof newStyles[name][key] !== 'undefined'
          ? newStyles[name][key]
          : defaultValue;
      control[key] = typeof value === 'function' ? value(root) : value;
    });
  });
};

const route$3 = createRoute({
  DID_SET_LABEL_BUTTON_ABORT_ITEM_PROCESSING: ({ root, action }) => {
    root.ref.buttonAbortItemProcessing.label = action.value;
  },
  DID_SET_LABEL_BUTTON_ABORT_ITEM_LOAD: ({ root, action }) => {
    root.ref.buttonAbortItemLoad.label = action.value;
  },
  DID_REQUEST_ITEM_PROCESSING: ({ root, action }) => {
    root.ref.processProgressIndicator.spin = true;
    root.ref.processProgressIndicator.progress = 0;
  },
  DID_START_ITEM_LOAD: ({ root, action }) => {
    root.ref.loadProgressIndicator.spin = true;
    root.ref.loadProgressIndicator.progress = 0;
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
  create: create$6,
  write: write$4,
  didCreateView: root => {
    applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
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

  // file view
  root.ref.file = root.appendChildView(
    root.createChildView(file, { id: props.id })
  );

  // create data container
  const dataContainer = createElement$1('input');
  dataContainer.type = 'hidden';
  dataContainer.name = root.query('GET_NAME');
  root.ref.data = dataContainer;
  root.appendChild(dataContainer);
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

const didRemoveItem = ({ root, action }) => {
  root.ref.data.removeAttribute('value');
};

const didCompleteItemProcessing = ({ root, action }) => {
  root.ref.data.value = action.serverFileReference;
};

const didRevertItemProcessing = ({ root, action }) => {
  root.ref.data.removeAttribute('value');
};

const fileWrapper = createView({
  create: create$5,
  write: createRoute({
    DID_LOAD_ITEM: didLoadItem,
    DID_REMOVE_ITEM: didRemoveItem,
    DID_COMPLETE_ITEM_PROCESSING: didCompleteItemProcessing,
    DID_REVERT_ITEM_PROCESSING: didRevertItemProcessing
  }),
  didCreateView: root => {
    applyFilters('CREATE_VIEW', Object.assign({}, root, { view: root }));
  },
  tag: 'fieldset',
  name: 'file-wrapper'
});

const PANEL_SPRING_PROPS = { type: 'spring', damping: 0.6, mass: 7 };

const create$11 = ({ root, props }) => {
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
};

const createSection = (root, section, className) => {
  const viewConstructor = createView({
    name: `panel-${section.name} filepond--${className}`,
    mixins: section.mixins
  });

  const view = root.createChildView(viewConstructor, section.props);

  root.ref[section.name] = root.appendChildView(view);
};

const write$7 = ({ root, props }) => {
  if (!props.height) {
    return;
  }

  // can it scale?
  root.element.dataset.scalable = isBoolean(props.scalable)
    ? props.scalable
    : true;

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
  write: write$7,
  create: create$11,
  ignoreRect: true,
  mixins: {
    apis: ['height', 'scalable']
  }
});

/**
 * Creates the file view
 */
const create$4 = ({ root, props }) => {
  // file view
  root.ref.controls = root.appendChildView(
    root.createChildView(fileWrapper, { id: props.id })
  );

  // file panel
  root.ref.panel = root.appendChildView(
    root.createChildView(panel, { name: 'item-panel' })
  );

  // default start height
  root.ref.panel.height = 0;

  // by default not marked for removal
  props.markedForRemoval = false;
};

const StateMap = {
  DID_START_ITEM_LOAD: 'busy',
  DID_UPDATE_ITEM_LOAD_PROGRESS: 'loading',
  DID_THROW_ITEM_INVALID: 'load-invalid',
  DID_THROW_ITEM_LOAD_ERROR: 'load-error',
  DID_LOAD_ITEM: 'idle',
  DID_START_ITEM_PROCESSING: 'busy',
  DID_REQUEST_ITEM_PROCESSING: 'busy',
  DID_UPDATE_ITEM_PROCESS_PROGRESS: 'processing',
  DID_COMPLETE_ITEM_PROCESSING: 'processing-complete',
  DID_THROW_ITEM_PROCESSING_ERROR: 'processing-error',
  DID_ABORT_ITEM_PROCESSING: 'cancelled',
  DID_REVERT_ITEM_PROCESSING: 'idle'
};

const write$3 = ({ root, actions, props }) => {
  // update panel height
  root.ref.panel.height = root.ref.controls.rect.inner.height;

  // set panel height
  root.height = root.ref.controls.rect.inner.height;

  // select last state change action
  let action = [...actions]
    .filter(action => /^DID_/.test(action.type))
    .reverse()
    .find(action => StateMap[action.type]);

  // no need to set same state twice
  if (!action || (action && action.type === props.currentState)) {
    return;
  }

  // set current state
  props.currentState = action.type;

  // set state
  root.element.dataset.filepondItemState = StateMap[props.currentState] || '';
};

const item = createView({
  create: create$4,
  write: write$3,
  tag: 'li',
  name: 'item',
  mixins: {
    apis: ['id', 'markedForRemoval'],
    styles: [
      'translateX',
      'translateY',
      'scaleX',
      'scaleY',
      'opacity',
      'height'
    ],
    animations: {
      scaleX: 'spring',
      scaleY: 'spring',
      translateX: 'spring',
      translateY: 'spring',
      opacity: { type: 'tween', duration: 250 }
    }
  }
});

const create$3 = ({ root, props }) => {
  // need to set role to list as otherwise it won't be read as a list by VoiceOver
  attr(root.element, 'role', 'list');
};

/**
 * Inserts a new item
 * @param root
 * @param action
 */
const addItemView = ({ root, action }) => {
  const { id, index, interactionMethod } = action;

  const animation = {
    opacity: 0
  };

  if (interactionMethod === InteractionMethod.NONE) {
    animation.translateY = null;
  }

  if (interactionMethod === InteractionMethod.DROP) {
    animation.scaleX = 0.8;
    animation.scaleY = 0.8;
    animation.translateY = null;
  }

  if (interactionMethod === InteractionMethod.BROWSE) {
    animation.translateY = -30;
  }

  if (interactionMethod === InteractionMethod.API) {
    animation.translateX = -100;
    animation.translateY = null;
  }

  root.appendChildView(
    root.createChildView(
      // view type
      item,

      // props
      Object.assign(
        {
          id
        },
        animation
      )
    ),
    index
  );
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

const dragTranslation = (childIndex, dragIndex, itemMargin) => {
  if (childIndex - 1 === dragIndex) {
    return itemMargin / 6;
  }

  if (childIndex === dragIndex) {
    return itemMargin / 2;
  }

  if (childIndex + 1 === dragIndex) {
    return -itemMargin / 2;
  }

  if (childIndex + 2 === dragIndex) {
    return -itemMargin / 6;
  }

  return 0;
};

/**
 * Write to view
 * @param root
 * @param actions
 * @param props
 */
const write$2 = ({ root, props, actions }) => {
  // route actions
  route$2({ root, props, actions });

  let resting = true;

  // update item positions
  let offset = 0;
  root.childViews
    .filter(child => child.rect.outer.height)
    .forEach((child, childIndex) => {
      const childRect = child.rect;

      // set this child offset
      child.translateX = 0;
      child.translateY =
        offset +
        (props.dragIndex > -1
          ? dragTranslation(childIndex, props.dragIndex, 10)
          : 0);

      // show child if it's not marked for removal
      if (!child.markedForRemoval) {
        child.scaleX = 1;
        child.scaleY = 1;
        child.opacity = 1;
      }

      // calculate next child offset (reduce height by y scale for views that are being removed)
      offset += childRect.outer.height;
    });

  // remove marked views
  root.childViews
    .filter(view => view.markedForRemoval && view.opacity === 0)
    .forEach(view => {
      root.removeChildView(view);
      resting = false;
    });

  return resting;
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
  create: create$3,
  write: write$2,
  tag: 'ul',
  name: 'list',
  filterFrameActionsForChild: filterSetItemActions,
  mixins: {
    apis: ['dragIndex']
  }
});

const getItemIndexByPosition = (view, positionInView) => {
  let i = 0;
  const childViews = view.childViews;
  const l = childViews.length;
  for (; i < l; i++) {
    const item = childViews[i];
    const itemRect = item.rect.outer;
    const itemRectMid = itemRect.top + itemRect.height * 0.5;

    if (positionInView.top < itemRectMid) {
      return i;
    }
  }

  return l;
};

const create$2 = ({ root, props }) => {
  root.ref.list = root.appendChildView(root.createChildView(list));

  props.dragCoordinates = null;
  props.overflowing = false;
};

const storeDragCoordinates = ({ root, props, action }) => {
  props.dragCoordinates = {
    left: action.position.scopeLeft,
    top:
      action.position.scopeTop -
      root.rect.outer.top +
      root.rect.element.scrollTop
  };
};

const clearDragCoordinates = ({ props }) => {
  props.dragCoordinates = null;
};

const route$1 = createRoute({
  DID_DRAG: storeDragCoordinates,
  DID_END_DRAG: clearDragCoordinates
});

const write$1 = ({ root, props, actions }) => {
  // route actions
  route$1({ root, props, actions });

  // current drag position
  root.ref.list.dragIndex = props.dragCoordinates
    ? getItemIndexByPosition(root.ref.list, props.dragCoordinates)
    : -1;

  // if currently overflowing but no longer received overflow
  if (props.overflowing && !props.overflow) {
    props.overflowing = false;

    // reset overflow state
    root.element.dataset.state = '';
    root.height = null;
  }

  // if is not overflowing currently but does receive overflow value
  // !props.overflowing &&
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
  create: create$2,
  write: write$1,
  name: 'list-scroller',
  mixins: {
    apis: ['overflow'],
    styles: ['height', 'translateY']
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

const create$12 = ({ root, props }) => {
  // set id so can be referenced from outside labels
  root.element.id = `filepond--browser-${props.id}`;

  // we have to link this element to the status element
  attr(root.element, 'aria-controls', `filepond--assistant-${props.id}`);

  // set label, we use labelled by as otherwise the screenreader does not read the "browse" text in the label (as it has tabindex: 0)
  attr(root.element, 'aria-labelledby', `filepond--drop-label-${props.id}`);

  // handle changes to the input field
  root.element.addEventListener('change', () => {
    if (!root.element.value) {
      return;
    }

    // extract files
    const files = [...root.element.files];

    // we add a little delay so the OS file select window can move out of the way before we add our file
    setTimeout(() => {
      // load files
      props.onload(files);

      // reset input, it's just for exposing a method to drop files, should not retain any state
      resetFileInput(root.element);
    }, 250);
  });
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

const toggleAllowBrowse$1 = ({ root, action }) => {
  attrToggle(root.element, 'disabled', !action.value);
};

const toggleRequired = ({ root, action }) => {
  // want to remove required, always possible
  if (!action.value) {
    attrToggle(root.element, 'required', false);
  } else if (root.query('GET_TOTAL_ITEMS') === 0) {
    // if want to make required, only possible when zero items
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

const updateRequiredStatus = ({ root, props }) => {
  // always remove the required attribute when more than zero items
  if (root.query('GET_TOTAL_ITEMS') > 0) {
    attrToggle(root.element, 'required', false);
  } else if (root.query('GET_REQUIRED')) {
    // if zero items, we only add it if the field is required
    attrToggle(root.element, 'required', true);
  }
};

const browser = createView({
  tag: 'input',
  name: 'browser',
  ignoreRect: true,
  attributes: {
    type: 'file'
  },
  create: create$12,
  write: createRoute({
    DID_ADD_ITEM: updateRequiredStatus,
    DID_REMOVE_ITEM: updateRequiredStatus,
    DID_SET_ALLOW_BROWSE: toggleAllowBrowse$1,
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

const create$13 = ({ root, props }) => {
  // create the label and link it to the file browser
  const label = createElement$1('label');
  attr(label, 'for', `filepond--browser-${props.id}`);

  // use for labeling file input (aria-labelledby on file input)
  attr(label, 'id', `filepond--drop-label-${props.id}`);

  // hide the label from screenreaders, the input element has an aria-label
  attr(label, 'aria-hidden', 'true');

  // handle keys
  label.addEventListener('keydown', e => {
    if (e.keyCode === Key.ENTER || e.keyCode === Key.SPACE) {
      // stops from triggering the element a second time
      e.preventDefault();

      // click link (will then in turn activate file input)
      root.ref.label.click();
    }
  });

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
  create: create$13,
  write: createRoute({
    DID_SET_LABEL_IDLE: ({ root, action, props }) => {
      props.caption = updateLabelValue(root.ref.label, action.value);
    }
  }),
  mixins: {
    apis: ['caption'],
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

const write$8 = ({ root, props, actions }) => {
  route$4({ root, props, actions });

  const { blob: blob$$1 } = root.ref;

  if (actions.length === 0 && blob$$1 && blob$$1.opacity === 0) {
    root.removeChildView(blob$$1);
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
  name: 'drip',
  write: write$8
});

const getRootNode = element =>
  'getRootNode' in element ? element.getRootNode() : document;

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
    const promisedFiles = (dataTransfer.items ? [...dataTransfer.items] : [])
      // only keep file system items (files and directories)
      .filter(item => isFileSystemItem(item))

      // map each item to promise
      .map(item => getFilesFromItem(item));

    // if is empty, see if we can extract some info from the files property as a fallback
    if (!promisedFiles.length) {
      // TODO: test for directories (should not be allowed)
      // Use FileReader, problem is that the files property gets lost in the process

      resolve(dataTransfer.files ? [...dataTransfer.files] : []);
      return;
    }

    // done!
    Promise.all(promisedFiles).then(returendFileGroups => {
      // flatten groups
      const files = [];
      returendFileGroups.forEach(group => {
        files.push(...group);
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
              files.push(file);

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
  const { catchesDropsOnPage, requiresDropOnElement } = options;

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

    return validateItems(items);
  };

  client.ondrop = (position, items) => {
    if (!validateItems(items)) {
      api.ondragend(position);
      return;
    }

    currentState = 'drag-drop';

    api.onload(items, position);
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

/**
 * Creates the file view
 */
const create$14 = ({ root, props }) => {
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
  create: create$14,
  ignoreRect: true,
  write: createRoute({
    DID_LOAD_ITEM: itemAdded,
    DID_REMOVE_ITEM: itemRemoved,
    DID_COMPLETE_ITEM_PROCESSING: itemProcessed,

    DID_ABORT_ITEM_PROCESSING: itemProcessedUndo,
    DID_REVERT_ITEM_PROCESSING: itemProcessedUndo,

    DID_THROW_ITEM_LOAD_ERROR: itemError,
    DID_THROW_ITEM_INVALID: itemError,
    DID_THROW_ITEM_PROCESSING_ERROR: itemError
  }),
  tag: 'span',
  name: 'assistant'
});

const create$1 = ({ root, props }) => {
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
    root.createChildView(
      dropLabel,
      Object.assign({}, props, { translateY: null })
    )
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
    root.createChildView(assistant, Object.assign({}, props))
  );

  // Measure (tests if fixed height was set)
  // DOCTYPE needs to be set for this to work
  root.ref.measure = createElement$1('div');
  root.ref.measure.style.height = '100%';
  root.element.appendChild(root.ref.measure);
};

const write = ({ root, props, actions }) => {
  // route actions
  route({ root, props, actions });

  // get quick references to various high level parts of the upload tool
  const { hopper, label, list, panel: panel$$1 } = root.ref;

  // bool to indicate if we're full or not
  const isMultiItem = root.query('GET_ALLOW_MULTIPLE');
  const totalItems = root.query('GET_TOTAL_ITEMS');
  const maxItems = root.query('GET_MAX_FILES');
  const atMaxCapacity = isMultiItem
    ? totalItems === maxItems
    : totalItems === 1;

  // views not used in height calculation
  const childrenUsedForBoundingCalculation = [...list.childViews[0].childViews];

  // views used to calculate the visual height of the container (which is passed to panel)
  const childrenUsedForVisualHeightCalculation = [list];

  // action used to add item
  const addAction = actions.find(action => action.type === 'DID_ADD_ITEM');

  // if at max capacity hide the label
  if (atMaxCapacity && addAction) {
    // get interaction type
    const interactionMethod = addAction.data.interactionMethod;

    // hide label
    label.opacity = 0;

    // if is multi-item, the label is always moved upwards
    if (isMultiItem) {
      label.translateY = -label.rect.element.height;
    } else {
      // based on interaction method we move label in different directions
      if (interactionMethod === InteractionMethod.API) {
        label.translateX = 40;
      } else if (interactionMethod === InteractionMethod.BROWSE) {
        label.translateY = 40;
      } else {
        label.translateY = -40;
      }
    }
  } else if (!atMaxCapacity) {
    // reveal label
    label.opacity = 1;
    label.translateY = root.rect.element.paddingTop;
    label.translateX = 0;

    // we use label for bounding box
    childrenUsedForVisualHeightCalculation.push(label);
    childrenUsedForBoundingCalculation.push(label);
  }

  // sets correct state to hopper scope
  if (hopper) {
    hopper.updateHopperState();
  }

  // need a label to do anything
  if (!label.caption) {
    return;
  }

  // link list to label bottom position (including bottom margin)
  list.translateY = isMultiItem
    ? label.rect.outer.bottom
    : root.rect.element.paddingTop;

  // update bounding box if has changed
  const boxBounding = calculateRootBoundingBoxHeight(root, props);
  const childrenBoundingHeight = calculateChildrenBoundingBoxHeight(
    childrenUsedForBoundingCalculation
  );
  const visualHeight = calculateChildrenVisualHeight(
    childrenUsedForVisualHeightCalculation
  );
  const bottomPadding = totalItems > 0 ? root.rect.element.paddingTop * 0.5 : 0;

  if (boxBounding.fixedHeight) {
    // fixed height

    // fixed height panel
    panel$$1.scalable = false;

    // link panel height to box bounding
    panel$$1.height = boxBounding.fixedHeight + root.rect.element.paddingTop;

    // set list height
    const listHeight = boxBounding.fixedHeight - list.rect.outer.top;

    // set overflow
    list.overflow =
      childrenBoundingHeight > panel$$1.height ? listHeight : null;
  } else if (boxBounding.cappedHeight) {
    // max-height

    // not a fixed height panel
    panel$$1.scalable = true;

    // limit children bounding height to the set capped height
    const cappedChildrenBoundingHeight = Math.min(
      boxBounding.cappedHeight,
      childrenBoundingHeight
    );

    // update root height
    root.height =
      cappedChildrenBoundingHeight +
      bottomPadding +
      root.rect.element.paddingTop;

    const maxHeight = cappedChildrenBoundingHeight + bottomPadding;

    // set visual height
    panel$$1.height = Math.min(
      boxBounding.cappedHeight,
      visualHeight + bottomPadding
    );

    // set list height
    const listHeight =
      cappedChildrenBoundingHeight -
      list.rect.outer.top -
      root.rect.element.paddingTop;

    // if can overflow, test if is currently overflowing
    list.overflow = childrenBoundingHeight > maxHeight ? listHeight : null;
  } else {
    // flexible height

    // not a fixed height panel
    panel$$1.scalable = true;

    // set to new bounding
    root.height =
      childrenBoundingHeight + bottomPadding + root.rect.element.paddingTop;

    // set height to new visual height
    panel$$1.height = visualHeight + bottomPadding;
  }
};

const calculateChildrenVisualHeight = children => {
  return (
    children

      // calculate the total height occupied by all children
      .reduce((max, child) => {
        const bottom = child.rect.outer.bottom;

        if (bottom > max) {
          max = bottom;
        }

        return max;
      }, 0)
  );
};

const calculateRootBoundingBoxHeight = (root, props) => {
  // only calculate first time
  if (props.boxBounding) {
    return props.boxBounding;
  }

  const height = root.ref.measureHeight || null;
  const cappedHeight = parseInt(root.style.maxHeight, 10) || null;
  const fixedHeight = height === 0 ? null : height;

  props.boxBounding = {
    cappedHeight,
    fixedHeight
  };

  // destroy measure element
  root.element.removeChild(root.ref.measure);
  root.ref.measure = null;

  // done!
  return props.boxBounding;
};

const calculateChildrenBoundingBoxHeight = children => {
  return (
    children

      // no use of outer and inner as that includes translations
      .reduce(
        (height, child) =>
          height + child.rect.inner.bottom + child.rect.element.marginBottom,
        0
      )
  );
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
    return true;
  }

  return false;
};

const toggleAllowDrop = ({ root, props, action }) => {
  if (action.value && !root.ref.hopper) {
    const hopper = createHopper(
      root.element,
      items => {
        // these files don't fit so stop here
        if (exceedsMaxFiles(root, items)) {
          return false;
        }

        // all items should be validated by all filters as valid
        const dropValidation = root.query('GET_DROP_VALIDATION');
        return dropValidation
          ? items.every(item =>
              applyFilters('ALLOW_HOPPER_ITEM', item, {
                query: root.query
              }).every(result => result === true)
            )
          : true;
      },
      {
        catchesDropsOnPage: root.query('GET_DROP_ON_PAGE'),
        requiresDropOnElement: root.query('GET_DROP_ON_ELEMENT')
      }
    );

    hopper.onload = (items, position) => {
      const itemList = root.ref.list.childViews[0];
      const index = getItemIndexByPosition(itemList, {
        left: position.scopeLeft,
        top:
          position.scopeTop -
          root.ref.list.rect.outer.top +
          root.ref.list.element.scrollTop
      });

      forEachDelayed(items, source => {
        root.dispatch('ADD_ITEM', {
          interactionMethod: InteractionMethod.DROP,
          source,
          index
        });
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
  } else if (!action.value && root.ref.hopper) {
    root.ref.hopper.destroy();
    root.ref.hopper = null;
    root.removeChildView(root.ref.drip);
  }
};

/**
 * Enable or disable browse functionality
 */
const toggleAllowBrowse = ({ root, props, action }) => {
  if (action.value) {
    root.ref.browser = root.appendChildView(
      root.createChildView(
        browser,
        Object.assign({}, props, {
          onload: items => {
            // these files don't fit so stop here
            if (exceedsMaxFiles(root, items)) {
              return false;
            }

            // add items!
            forEachDelayed(items, source => {
              root.dispatch('ADD_ITEM', {
                interactionMethod: InteractionMethod.BROWSE,
                source,
                index: 0
              });
            });
          }
        })
      ),
      0
    );
  } else if (root.ref.browser) {
    root.removeChildView(root.ref.browser);
  }
};

/**
 * Enable or disable paste functionality
 */
const toggleAllowPaste = ({ root, action }) => {
  if (action.value) {
    root.ref.paster = createPaster();
    root.ref.paster.onload = items => {
      forEachDelayed(items, source => {
        root.dispatch('ADD_ITEM', {
          interactionMethod: InteractionMethod.PASTE,
          source,
          index: 0
        });
      });
    };
  } else if (root.ref.paster) {
    root.ref.paster.destroy();
    root.ref.paster = null;
  }
};

/**
 * Route actions
 */
const route = createRoute({
  DID_SET_ALLOW_BROWSE: toggleAllowBrowse,
  DID_SET_ALLOW_DROP: toggleAllowDrop,
  DID_SET_ALLOW_PASTE: toggleAllowPaste
});

const root = createView({
  name: 'root',
  read: ({ root }) => {
    if (root.ref.measure) {
      root.ref.measureHeight = root.ref.measure.offsetHeight;
    }
  },
  create: create$1,
  write,
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

// defaults
// view
// creates the app
const createApp$1 = (initialOptions = {}) => {
  // let element
  let originalElement = null;

  // get default options
  const defaultOptions$$1 = getOptions$1();

  // create the data store, this will contain all our app info
  const store = createStore(
    // initial state (should be serializable)
    createInitialState(defaultOptions$$1),

    // queries
    [queries, createOptionQueries(defaultOptions$$1)],

    // action handlers
    [actions, createOptionActions(defaultOptions$$1)]
  );

  // set initial options
  store.dispatch('SET_OPTIONS', { options: initialOptions });

  // render initial view
  const view = root(store, { id: getUniqueId() });

  //
  // PRIVATE API -------------------------------------------------------------------------------------
  //
  let resting = false;
  let hidden = false;
  const readWriteApi = {
    // necessary for update loop

    /**
     * Reads from dom (never call manually)
     * @private
     */
    _read: () => {
      // if resting, no need to read as numbers will still all be correct
      if (resting) {
        return;
      }

      // read view data
      view._read();

      // if root is hidden
      hidden = view.rect.element.hidden;
    },

    /**
     * Writes to dom (never call manually)
     * @private
     */
    _write: ts => {
      // don't do anything while hidden
      if (hidden) {
        return;
      }

      // get all actions from store
      const actions$$1 = store
        .processActionQueue()

        // filter out set actions (will trigger DID_SET)
        .filter(action => !/^SET_/.test(action.type));

      // if was idling and no actions stop here
      if (resting && !actions$$1.length) {
        return;
      }

      // some actions might trigger events
      routeActionsToEvents(actions$$1);

      // update the view
      resting = view._write(ts, actions$$1);

      // now idling
      if (resting) {
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
      event.error = data.error ? Object.assign({}, data.error) : null;
    }

    if (data.status) {
      event.status = Object.assign({}, data.status);
    }

    // only source is available, else add item if possible
    if (data.source) {
      event.file = data.source;
    } else if (data.item || data.id) {
      const item = data.item ? data.item : store.query('GET_ITEM', data.id);
      event.file = item ? createItemAPI(item) : null;
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

    DID_START_ITEM_PROCESSING: createEvent('processfilestart'),
    DID_UPDATE_ITEM_PROCESS_PROGRESS: createEvent('processfileprogress'),
    DID_ABORT_ITEM_PROCESSING: createEvent('processfileabort'),
    DID_COMPLETE_ITEM_PROCESSING: createEvent('processfile'),
    DID_REVERT_ITEM_PROCESSING: createEvent('processfilerevert'),

    DID_THROW_ITEM_PROCESSING_ERROR: [
      createEvent('error'),
      createEvent('processfile')
    ],

    SPLICE_ITEM: createEvent('removefile')
  };

  const exposeEvent = event => {
    // create event object to be dispatched
    const detail = Object.assign({ pond: exports }, event);
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

    // append otherp props
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

  const routeActionsToEvents = actions$$1 => {
    if (!actions$$1.length) {
      return;
    }

    actions$$1.forEach(action => {
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

  const getFile = query => store.query('GET_ITEM', query);

  const addFile = (source, options = {}) =>
    new Promise((resolve, reject) => {
      store.dispatch('ADD_ITEM', {
        interactionMethod: InteractionMethod.API,
        source,
        index: options.index,
        success: resolve,
        failure: reject,
        options
      });
    });

  const removeFile = query => {
    // request item removal
    store.dispatch('REMOVE_ITEM', { query });

    // see if item has been removed
    return store.query('GET_ITEM', query) === null;
  };

  const addFiles = (...args) =>
    new Promise((resolve, reject) => {
      const sources = [];
      const options = {};

      // user passed a sources array
      if (isArray(args[0])) {
        sources.push(...args[0]);
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

      const sourcePromises = [];
      const delayPromises = forEachDelayed(sources, source => {
        sourcePromises.push(addFile(source, options));
      });

      Promise.all(delayPromises).then(() => {
        Promise.all(sourcePromises).then(results => {
          resolve(results);
        });
      });
    });

  const getFiles = () => store.query('GET_ITEMS');

  const processFile = query =>
    new Promise((resolve, reject) => {
      store.dispatch('PROCESS_ITEM', {
        query,
        // the nextTick call pushes the resolve forwards,
        // this allows other processes to finish up so when a dev
        // immidiately calls removeFile after it resolves all goes well
        // TODO: improve as this is kinda hacky
        success: item => {
          nextTick(() => {
            resolve(item);
          });
        },
        failure: error => {
          nextTick(() => {
            reject(error);
          });
        }
      });
    });

  const processFiles = (...args) => {
    const queries$$1 = Array.isArray(args[0]) ? args[0] : args;
    if (!queries$$1.length) {
      return Promise.all(getFiles().map(processFile));
    }
    return Promise.all(queries$$1.map(processFile));
  };

  const removeFiles = (...args) => {
    const queries$$1 = Array.isArray(args[0]) ? args[0] : args;
    const files = getFiles();

    if (!queries$$1.length) {
      return Promise.all(files.map(removeFile));
    }

    // when removing by index the indexes shift after each file removal so we need to convert indexes to ids
    const mappedQueries = queries$$1
      .map(
        query =>
          isNumber(query) ? (files[query] ? files[query].id : null) : query
      )
      .filter(query => query);

    return mappedQueries.map(removeFile);
  };

  const exports = Object.assign(
    {},
    on(),
    readWriteApi,
    createOptionAPI(store, defaultOptions$$1),
    {
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
      }
    }
  );

  // Done!
  store.dispatch('DID_INIT');

  // create actual api object
  return createObject(exports);
};

const createAppObject = (customOptions = {}) => {
  // default options
  const defaultOptions$$1 = {};
  forin(getOptions$1(), (key, value) => {
    defaultOptions$$1[key] = value[0];
  });

  // set app options
  const app = createApp$1(Object.assign({}, defaultOptions$$1, customOptions));

  // return the plugin instance
  return app;
};

const toCamels = (string, separator = '-') =>
  string.replace(new RegExp(`${separator}.`, 'g'), sub =>
    sub.charAt(1).toUpperCase()
  );

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
  const output = [...node.attributes].reduce((obj, attribute) => {
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
  const mergedOptions = Object.assign({}, options);

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
    [...element.querySelectorAll('input:not([type=file])')].map(input => ({
      source: input.value,
      options: {
        type: input.dataset.type
      }
    }))
  );

  // build plugin
  const app = createAppObject(mergedOptions);

  // add already selected files
  if (element.files) {
    [...element.files].forEach(file => {
      app.addFile(file);
    });
  }

  // replace the target element
  app.replaceElement(element);

  // expose
  return app;
};

// if an element is passed, we create the instance at that element, if not, we just create an up object
const createApp = (...args) =>
  isNode(args[0]) ? createAppAtElement(...args) : createAppObject(...args);

const PRIVATE_METHODS$1 = ['fire', '_read', '_write'];

const createAppAPI = app => {
  const api = {};

  copyObjectPropertiesToObject(app, api, PRIVATE_METHODS$1);

  return api;
};

/**
 * Replaces placeholders in given string with replacements
 * @param string - "Foo {bar}""
 * @param replacements - { "bar": 10 }
 */
const replaceInString = (string, replacements) =>
  string.replace(/(?:{([a-zA-Z]+)})/g, (match, group) => replacements[group]);

const images = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'tiff'];
const text$1 = ['css', 'csv', 'html', 'txt'];
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
        : extension === 'svg' ? 'svg+xml' : extension)
    );
  }
  if (text$1.includes(extension)) {
    return 'text/' + extension;
  }
  return map[extension] || null;
};

const createWorker = fn => {
  const workerBlob = new Blob(['(', fn.toString(), ')()'], {
    type: 'application/javascript'
  });
  const workerURL = URL.createObjectURL(workerBlob);
  const worker = new Worker(workerURL);
  URL.revokeObjectURL(workerURL);

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

// utilities exposed to plugins
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
      loadImage,
      copyFile,
      renameFile,
      applyFilterChain,
      createBlob
    }
  });

  // add plugin options to default options
  extendDefaultOptions(pluginOutline.options);
};

/**
 * Plugin internal state (over all instances)
 */
const state = {
  // active app instances, used to redraw the apps and to find the later
  apps: []
};

// plugin name
const name = 'filepond';

// is in browser
const hasNavigator =
  typeof navigator !== 'undefined' &&
  typeof window !== 'undefined' &&
  typeof document !== 'undefined';

const hasPerformance =
  typeof performance !== 'undefined';

// app painter, cannot be paused or stopped at the moment
const painter =
  hasNavigator &&
  hasPerformance &&
  createPainter(createUpdater(state.apps, '_read', '_write'), 60);

// fire load event
if (hasNavigator) {
  // fire loaded event so we know when FilePond is available
  const dispatch = () => {
    // let others know we have area ready
    document.dispatchEvent(
      new CustomEvent('FilePond:loaded', {
        detail: {
          supported,
          create,
          destroy,
          parse,
          find,
          registerPlugin,
          setOptions: setOptions$$1
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
}

// updates the OptionTypes object based on the current options
const updateOptionTypes = () =>
  forin(getOptions$1(), (key, value) => {
    OptionTypes[key] = value[1];
  });

/**
 * Public Plugin methods
 */
const FileStatus = Object.assign({}, ItemStatus);

const OptionTypes = {};
updateOptionTypes();

// create method, creates apps and adds them to the app array
const create = (...args) => {
  const app = createApp(...args);
  app.on('destroy', destroy);
  state.apps.push(app);
  return createAppAPI(app);
};

// destroys apps and removes them from the app array
const destroy = hook => {
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
const parse = context => {
  // get all possible hooks
  const matchedHooks = [...context.querySelectorAll(`.${name}`)];

  // filter out already active hooks
  const newHooks = matchedHooks.filter(
    newHook => !state.apps.find(app => app.isAttachedTo(newHook))
  );

  // create new instance for each hook
  return newHooks.map(hook => create(hook));
};

// returns an app based on the given element hook
const find = hook => {
  const app = state.apps.find(app => app.isAttachedTo(hook));
  if (!app) {
    return null;
  }
  return createAppAPI(app);
};

// returns true if plugin is supported
const isOperaMini = () =>
  Object.prototype.toString.call(window.operamini) === '[object OperaMini]';
const hasPromises = () => 'Promise' in window;
const hasBlobSlice = () => 'slice' in Blob.prototype;
const hasCreateObjectURL = () =>
  'URL' in window && 'createObjectURL' in window.URL;
const hasVisibility = () => 'visibilityState' in document;
const hasTiming = () => 'performance' in window; // iOS 8.x

const supported = () => {
  if (!hasNavigator) {
    return false;
  }
  return !(
    isOperaMini() ||
    !hasVisibility() ||
    !hasPromises() ||
    !hasBlobSlice() ||
    !hasCreateObjectURL() ||
    !hasTiming()
  );
};

// adds a plugin extension
const registerPlugin = (...plugins) => {
  // register plugins
  plugins.forEach(createAppPlugin);

  // update OptionTypes, each plugin might have extended the default options
  updateOptionTypes();
};

const getOptions$$1 = () => {
  const opts = {};
  forin(getOptions$1(), (key, value) => {
    opts[key] = value[0];
  });
  return opts;
};

const setOptions$$1 = opts => {
  if (isObject(opts)) {
    // update existing plugins
    state.apps.forEach(app => {
      app.setOptions(opts);
    });

    // override defaults
    setOptions$1(opts);
  }

  // return new options
  return getOptions$$1();
};

export {
  FileStatus,
  OptionTypes,
  create,
  destroy,
  parse,
  find,
  supported,
  registerPlugin,
  getOptions$$1 as getOptions,
  setOptions$$1 as setOptions,
  FileOrigin
};
