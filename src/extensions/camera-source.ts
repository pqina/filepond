import {
    createSourceExtension,
    type SourceExtensionOptions,
} from './common/createSourceExtension.js';
import { CameraInput } from '../elements/components/CameraInput/index.js';
import type { NodeContext, NodeData } from '../elements/common/nodeTree.js';

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
    factory: ({ props }, { setExtensionSourceState }) => {
        /**
         * Called in onmount to request camera access
         * @param cameraInput
         */
        function requestCameraAccess(cameraInput: ReturnType<typeof CameraInput>) {
            const { mediaConstraints } = props;
            cameraInput
                .requestCameraAccess(mediaConstraints)
                .then(handleCameraOkay)
                .catch(handleCamerError);
        }

        function handleCameraOkay() {
            const { sourceIcon } = props;

            // all good, reset error state
            setExtensionSourceState({
                icon: sourceIcon,
                title: undefined,
            });
        }

        /**
         * This shows camera error icon in button
         * @param err
         */
        function handleCamerError(err: Error) {
            // something went wrong
            const { sourceIconError } = props;

            setExtensionSourceState({
                icon: sourceIconError,
                title: err.message,
            });
        }

        // creates the template to render when dialog is opened
        function createSourceTemplate(inputAttributes: {
            [key: string]: string | number | boolean;
        }) {
            return [
                {
                    key: 'camera-input',
                    component: CameraInput,
                    props: ({ filename }: NodeData, context: NodeContext) => {
                        // update labels when locale changes
                        const { capture, reset } = context.resources?.locale || {};

                        return {
                            ...inputAttributes,
                            filename,
                            labelReset: reset,
                            labelCapture: capture,
                            onmount: requestCameraAccess,
                            onerror: handleCamerError,
                        };
                    },
                },
            ];
        }

        return {
            createSourceTemplate,
        };
    },
});
