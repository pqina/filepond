import { createView, createRoute } from '../frame/index';
import { formatFilename } from '../../utils/formatFilename';
import { createElement } from '../../utils/createElement';
import { text } from '../../utils/text';
import { file } from './file';
import { applyFilters } from '../../filter';

/**
 * Creates the file view
 */
const create = ({ root, props }) => {

    // filename
    root.ref.fileName = createElement('legend');
    root.appendChild(root.ref.fileName);

    // file appended
    root.ref.file = root.appendChildView(
        root.createChildView(file, { id: props.id })
    );

    // data has moved to data.js
    root.ref.data = false;
};

/**
 * Data storage
 */
const didLoadItem = ({ root, props }) => {
    // updates the legend of the fieldset so screenreaders can better group buttons
    text(
        root.ref.fileName,
        formatFilename(root.query('GET_ITEM_NAME', props.id))
    );
};

export const fileWrapper = createView({
    create,
    ignoreRect: true,
    write: createRoute({
        DID_LOAD_ITEM: didLoadItem
    }),
    didCreateView: root => {
        applyFilters('CREATE_VIEW', { ...root, view: root });
    },
    tag: 'fieldset',
    name: 'file-wrapper'
});
