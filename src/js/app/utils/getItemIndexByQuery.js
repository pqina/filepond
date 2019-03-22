import { isEmpty } from '../../utils/isEmpty';
import { isString } from '../../utils/isString';

export const getItemIndexByQuery = (items, query) => {
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
