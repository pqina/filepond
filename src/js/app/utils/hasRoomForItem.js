import { getActiveItems } from './getActiveItems';
export const hasRoomForItem = state => {
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
