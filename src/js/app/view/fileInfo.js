import { createView, createRoute } from '../frame/index';
import { toNaturalFileSize } from '../../utils/toNaturalFileSize';
import { text } from '../../utils/text';
import { formatFilename } from '../../utils/formatFilename';
import { isInt } from '../../utils/isInt';
import { createElement } from '../../utils/createElement';
import { attr } from '../../utils/attr';
import { applyFilters } from '../../filter';

const create = ({ root, props }) => {
    // filename
    const fileName = createElement('span');
    fileName.className = 'filepond--file-info-main';
    // hide for screenreaders
    // the file is contained in a fieldset with legend that contains the filename
    // no need to read it twice
    attr(fileName, 'aria-hidden', 'true');
    root.appendChild(fileName);
    root.ref.fileName = fileName;

    // filesize
    const fileSize = createElement('span');
    fileSize.className = 'filepond--file-info-sub';
    root.appendChild(fileSize);
    root.ref.fileSize = fileSize;

    // set initial values
    text(fileSize, root.query('GET_LABEL_FILE_WAITING_FOR_SIZE'));
    text(fileName, formatFilename(root.query('GET_ITEM_NAME', props.id)));
};

const updateFile = ({ root, props }) => {
    text(
        root.ref.fileSize,
        toNaturalFileSize(root.query('GET_ITEM_SIZE', props.id), '.', root.query('GET_FILE_SIZE_BASE'))
    );
    text(
        root.ref.fileName,
        formatFilename(root.query('GET_ITEM_NAME', props.id))
    );
};

const updateFileSizeOnError = ({ root, props }) => {
    // if size is available don't fallback to unknown size message
    if (isInt(root.query('GET_ITEM_SIZE', props.id))) {
        return;
    }

    text(root.ref.fileSize, root.query('GET_LABEL_FILE_SIZE_NOT_AVAILABLE'));
};

export const fileInfo = createView({
    name: 'file-info',
    ignoreRect: true,
    ignoreRectUpdate: true,
    write: createRoute({
        DID_LOAD_ITEM: updateFile,
        DID_UPDATE_ITEM_META: updateFile,
        DID_THROW_ITEM_LOAD_ERROR: updateFileSizeOnError,
        DID_THROW_ITEM_INVALID: updateFileSizeOnError
    }),
    didCreateView: root => {
        applyFilters('CREATE_VIEW', { ...root, view: root });
    },
    create,
    mixins: {
        styles: ['translateX', 'translateY'],
        animations: {
            translateX: 'spring',
            translateY: 'spring'
        }
    }
});
