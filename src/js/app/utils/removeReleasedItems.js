import { arrayRemove } from '../../utils/arrayRemove';

export const removeReleasedItems = (items) => {
    items.forEach((item, index) => {
        if (item.released) {
            arrayRemove(items, index);
        }
    });
};