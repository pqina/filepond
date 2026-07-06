import { h } from '../utils/dom.js';
import {
    createSourceExtension,
    type SourceExtensionOptions,
} from './common/createSourceExtension.js';

export interface URLInputSourceOptions extends SourceExtensionOptions {
    placeholder?: string;
}

export const URLInputSource = createSourceExtension({
    name: 'URLInputSource',
    props: {
        sourceIcon: 'link',
    } as URLInputSourceOptions,
    factory: ({ props }) => {
        function createSourceElement() {
            const { placeholder } = props;
            return h('input', { type: 'url', placeholder });
        }

        return {
            createSourceElement,
        };
    },
});
