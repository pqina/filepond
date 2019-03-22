import { isEmpty } from '../../utils/isEmpty';
import { limit } from '../../utils/limit';
import { arrayInsert } from '../../utils/arrayInsert';

export const insertItem = (items, item, index) => {
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
