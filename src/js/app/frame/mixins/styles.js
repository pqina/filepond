import { getViewRect } from '../utils/getViewRect';
import { addGetSet } from './utils/addGetSet';
import { isDefined } from '../../../utils/isDefined';

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

export const styles = ({
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
            Object.assign(currentProps, {...viewProps});

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
        element.style.cssText = styles;
        // store current styles so we can compare them to new styles later on
        // _not_ getting the style value is faster
        element.elementCurrentStyle = styles;
    }
};