import { createView, createRoute } from '../frame/index';
import { listScroller } from './listScroller';
import { panel } from './panel';
import { browser } from './browser';
import { dropLabel } from './dropLabel';
import { drip } from './drip';
import { data } from './data';
import { createHopper } from '../utils/createHopper';
import { createPaster } from '../utils/createPaster';
import { InteractionMethod } from '../enum/InteractionMethod';
import { getItemIndexByPosition } from '../utils/getItemIndexByPosition';
import { isInt } from '../../utils/isInt';
import { isEmpty } from '../../utils/isEmpty';
import { assistant } from './assistant';
import { toCamels } from '../../utils/toCamels';
import { createElement } from '../../utils/createElement';
import { createResponse } from '../../utils/createResponse';
import { debounce } from '../../utils/debounce';
import { isFile } from '../../utils/isFile';
import getItemsPerRow from '../utils/getItemsPerRow';

// ... (previous code remains unchanged)

const create = ({ root, props }) => {
    // ... (previous code remains unchanged)

    // prevent scrolling and zooming on iOS (only if supports pointer events, for then we can enable reorder)
    const canHover = window.matchMedia('(pointer: fine) and (hover: hover)').matches;
    const hasPointerEvents = 'PointerEvent' in window;
    if (root.query('GET_ALLOW_REORDER') && hasPointerEvents && !canHover) {
        root.element.addEventListener('touchmove', e => {
            if (root.ref.list.childViews[0].dragState && root.ref.list.childViews[0].dragState.isDragging()) {
                e.preventDefault();
            }
        }, { passive: false });
        root.element.addEventListener('gesturestart', e => {
            if (root.ref.list.childViews[0].dragState && root.ref.list.childViews[0].dragState.isDragging()) {
                e.preventDefault();
            }
        });
    }

    // ... (rest of the code remains unchanged)
};

// ... (rest of the file remains unchanged)