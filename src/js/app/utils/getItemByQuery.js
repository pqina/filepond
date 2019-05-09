import { isEmpty } from '../../utils/isEmpty';
import { isInt } from '../../utils/isInt';

export const getItemByQuery = (items, query) => {
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
