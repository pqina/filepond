import { isObject } from '../utils/isObject';
import { isFunction } from '../utils/isFunction';
import { getItemByQuery } from './utils/getItemByQuery';
import { getNumericAspectRatioFromString } from '../utils/getNumericAspectRatioFromString';
import { getActiveItems } from './utils/getActiveItems';
import { Status } from './enum/Status';
import { ItemStatus } from './enum/ItemStatus';

const ITEM_ERROR = [ItemStatus.LOAD_ERROR, ItemStatus.PROCESSING_ERROR, ItemStatus.PROCESSING_REVERT_ERROR];
const ITEM_BUSY = [ItemStatus.LOADING, ItemStatus.PROCESSING, ItemStatus.PROCESSING_QUEUED, ItemStatus.INIT];
const ITEM_READY = [ItemStatus.PROCESSING_COMPLETE];

const isItemInErrorState = item => ITEM_ERROR.includes(item.status);
const isItemInBusyState = item => ITEM_BUSY.includes(item.status);
const isItemInReadyState = item => ITEM_READY.includes(item.status);

export const queries = state => ({

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

    GET_ACTIVE_ITEMS: () => getActiveItems(state.items),

    GET_ITEMS: () => state.items,

    GET_ITEM_NAME: query => {
        const item = getItemByQuery(state.items, query);
        return item ? item.filename : null;
    },

    GET_ITEM_SIZE: query => {
        const item = getItemByQuery(state.items, query);
        return item ? item.fileSize : null;
    },

    GET_STYLES: () => Object.keys(state.options)
        .filter(key => /^style/.test(key))
        .map(option => ({
            name: option,
            value: state.options[option]
        })),

    GET_PANEL_ASPECT_RATIO: () => {
        const isShapeCircle = /circle/.test(state.options.stylePanelLayout);
        const aspectRatio = isShapeCircle ? 1 : getNumericAspectRatioFromString(state.options.stylePanelAspectRatio);
        return aspectRatio;
    },

    GET_ITEM_PANEL_ASPECT_RATIO: () => state.options.styleItemPanelAspectRatio,

    GET_ITEMS_BY_STATUS: (status) => getActiveItems(state.items).filter(item => item.status === status),

    GET_TOTAL_ITEMS: () => getActiveItems(state.items).length,

    IS_ASYNC: () =>
        isObject(state.options.server) &&
        (isObject(state.options.server.process) ||
            isFunction(state.options.server.process))
});
