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

        // locale to use in camera input
        locale: undefined,

        // use date time by default
        filename: () =>
            filenameDateFormatter.format(new Date()).replace(' ', '_').replaceAll(':', '-'),
    } as CameraSourceOptions,
    factory: ({ props }, { on, setExtensionSourceState }) => {
        function createSourceTemplate(inputAttributes: {
            [key: string]: string | number | boolean;
        }) {
            // define custom element
            defineCustomElement('camera-input', CameraInputElement);

            // return template
            return [
                {
                    key: 'camera-input',
                    tag: 'camera-input',
                    attrs: {
                        part: 'camera-input',
                        ...inputAttributes,
                    },
                },
            ];
        }

        // we need to ask permission to access the camera feed
        function handleOpenedDialog(dialog: HTMLDialogElement) {
            const { sourceIcon, sourceIconError, mediaConstraints, filename, locale } = props;

            const cameraInput = dialog.querySelector('camera-input') as
                | CameraInputElement
                | undefined;

            if (!cameraInput) {
                return;
            }

            cameraInput.locale = locale;
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
            createSourceTemplate,
            destroy() {
                unsubOpenDialog();
            },
        };
    },
});
