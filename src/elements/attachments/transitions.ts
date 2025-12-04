import { addListener } from '../../utils/dom.js';
import { isFunction } from '../../utils/test.js';

interface TransitionRoute {
    [propertyName: string]: (value: string) => void;
}

interface TransitionTypeRoute {
    [propertyName: string]: {
        start?: (value: string) => void;
        end?: (value: string) => void;
    };
}

/** Define routes for transition event handlers */
export function transitions(
    transitionRoutes: TransitionRoute | TransitionTypeRoute
): (element: HTMLElement) => () => void {
    function handleTransitionEvent(e: TransitionEvent) {
        const { type, target, propertyName } = e;

        // no target or no route for this property
        const transitionRoute = transitionRoutes[propertyName];
        if (!target || !transitionRoute) {
            return;
        }

        // route value to transition handler
        const computedStyles = getComputedStyle(target as HTMLElement);
        const propertyValue = computedStyles.getPropertyValue(propertyName);

        if (isFunction(transitionRoute)) {
            transitionRoute(propertyValue);
        }

        const typeKey = type.substring(10);
        // @ts-ignore
        if (isFunction(transitionRoute[typeKey])) {
            // @ts-ignore
            transitionRoute[typeKey](propertyValue);
        }
    }

    return (element) => {
        const unsubStart = addListener(element, 'transitionstart', handleTransitionEvent);
        const unsubEnd = addListener(element, 'transitionend', handleTransitionEvent);

        return () => {
            unsubStart();
            unsubEnd();
        };
    };
}
