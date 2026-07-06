import { defineCustomElement, h } from '../utils/dom.js';
import { CameraInputElement } from '../elements/FilePondCameraInput/index.js';
import {
    createSourceExtension,
    type SourceExtensionOptions,
} from './common/createSourceExtension.js';

export interface CameraSourceOptions extends SourceExtensionOptions {
    /** Use to adjust camera settings */
    mediaConstraints?: MediaStreamConstraints;

    /** Allows renaming the file before it's added to the file list, should return name without extension */
    filename?: ((blob: Blob) => string) | string;
}

// formats the file names in an iso like date
const digits = '2-digit';
const filenameDateFormatter = new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: digits,
    day: digits,
    hour: digits,
    minute: digits,
    second: digits,
    hour12: false,
});

export const CameraSource = createSourceExtension({
    name: 'CameraSource',
    props: {
        // icons and labels
        sourceLabel: 'camera',
        sourceIcon: 'camera',
        sourceIconError: 'cameraOff',
        sourceType: 'select',

        // use date time by default
        filename: () =>
            filenameDateFormatter.format(new Date()).replace(' ', '_').replaceAll(':', '-'),
    } as CameraSourceOptions,
    factory: ({ props }, { on, setExtensionSourceState }) => {
        // implement this function to return an input element which can be used for the entry source
        function createSourceElement() {
            defineCustomElement('camera-input', CameraInputElement);
            return h('camera-input');
        }

        // we need to ask permission to access the camera feed
        function handleOpenedDialog(dialog: HTMLDialogElement) {
            const { sourceIcon, sourceIconError, mediaConstraints, filename } = props;

            const cameraInput = dialog.querySelector('camera-input') as
                | CameraInputElement
                | undefined;

            if (!cameraInput) {
                return;
            }

            cameraInput.filename = filename;
            cameraInput
                .requestCameraAccess(mediaConstraints)
                .then(() => {
                    // all good, reset error state
                    setExtensionSourceState({
                        icon: sourceIcon,
                        title: undefined,
                    });
                })
                .catch((err) => {
                    // error state
                    setExtensionSourceState({
                        icon: sourceIconError,
                        title: err.message,
                    });
                });
        }

        // @ts-ignore
        const unsubOpenDialog = on('dialogOpened', handleOpenedDialog);

        return {
            createSourceElement,
            destroy() {
                unsubOpenDialog();
            },
        };
    },
});
